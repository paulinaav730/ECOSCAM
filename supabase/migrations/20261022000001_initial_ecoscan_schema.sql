-- ==============================================================================
-- EcoScan Colombia — Migración Inicial de Base de Datos (PostgreSQL / Supabase)
-- Referencia Normativa: Resolución 2184 de 2019 (MinAmbiente) y Programas Posconsumo
-- ==============================================================================

-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==============================================================================
-- 1. TABLA: profiles (Vinculada a auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alias TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  preferred_municipality TEXT NOT NULL DEFAULT 'Medellín',
  preferences JSONB NOT NULL DEFAULT '{"notifications": true, "SaveScanHistory": true, "theme": "dark"}'::jsonb,
  privacy_settings JSONB NOT NULL DEFAULT '{"publicProfile": false, "shareAnonymousStats": false, "storeImages": false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_municipality ON public.profiles(preferred_municipality);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Función auxiliar segura en servidor/BD para comprobar rol de administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Trigger automático para crear perfil al registrarse un usuario en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, alias, preferred_municipality)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'alias', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'preferred_municipality', 'Medellín')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 2. TABLA: sources (Fuentes normativas y técnicas verificadas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sources (
  id TEXT PRIMARY KEY,
  entity_name TEXT NOT NULL,
  resource_title TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('normativa_nacional', 'programa_posconsumo', 'operador_aseo', 'guia_tecnica')),
  geographic_scope TEXT NOT NULL DEFAULT 'Nacional (Colombia)',
  consulted_at DATE NOT NULL DEFAULT CURRENT_DATE,
  reviewed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABLA: waste_items (Catálogo de residuos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.waste_items (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  synonyms TEXT[] NOT NULL DEFAULT '{}',
  main_category TEXT NOT NULL CHECK (main_category IN (
    'aprovechable',
    'organico_aprovechable',
    'no_aprovechable',
    'posconsumo_especial',
    'requiere_verificacion'
  )),
  container_color TEXT NOT NULL CHECK (container_color IN (
    'blanco',
    'verde',
    'negro',
    'punto_posconsumo',
    'verificacion'
  )),
  primary_material TEXT NOT NULL,
  secondary_materials TEXT[] NOT NULL DEFAULT '{}',
  default_condition TEXT NOT NULL DEFAULT 'limpio_seco',
  requires_special_management BOOLEAN NOT NULL DEFAULT FALSE,
  preparation_instructions TEXT[] NOT NULL DEFAULT '{}',
  warnings TEXT[] NOT NULL DEFAULT '{}',
  why_explanation TEXT NOT NULL,
  circular_alternatives JSONB NOT NULL DEFAULT '[]'::jsonb,
  special_management_details JSONB,
  source_id TEXT REFERENCES public.sources(id) ON DELETE SET NULL,
  geographic_scope TEXT NOT NULL DEFAULT 'Nacional (Resolución 2184 de 2019)',
  publication_status TEXT NOT NULL DEFAULT 'verificado' CHECK (publication_status IN ('verificado', 'pendiente', 'desactualizado', 'borrador')),
  reviewed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waste_items_main_category ON public.waste_items(main_category);
CREATE INDEX IF NOT EXISTS idx_waste_items_primary_material ON public.waste_items(primary_material);
CREATE INDEX IF NOT EXISTS idx_waste_items_publication_status ON public.waste_items(publication_status);
CREATE INDEX IF NOT EXISTS idx_waste_items_name_trgm ON public.waste_items USING gin (name gin_trgm_ops);

-- ==============================================================================
-- 4. TABLA: classification_rules (Motor de reglas ambientales determinístico)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.classification_rules (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  conditions JSONB NOT NULL,
  target_category TEXT NOT NULL CHECK (target_category IN (
    'aprovechable',
    'organico_aprovechable',
    'no_aprovechable',
    'posconsumo_especial',
    'requiere_verificacion'
  )),
  container_color TEXT NOT NULL CHECK (container_color IN (
    'blanco',
    'verde',
    'negro',
    'punto_posconsumo',
    'verificacion'
  )),
  recommendation TEXT NOT NULL,
  preparation_steps TEXT[] NOT NULL DEFAULT '{}',
  explanation TEXT NOT NULL,
  mistakes_to_avoid TEXT[] NOT NULL DEFAULT '{}',
  source_id TEXT REFERENCES public.sources(id) ON DELETE SET NULL,
  geographic_scope TEXT NOT NULL DEFAULT 'Nacional (Colombia)',
  validation_status TEXT NOT NULL DEFAULT 'verificado' CHECK (validation_status IN ('verificado', 'pendiente', 'desactualizado')),
  reviewed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classification_rules_priority ON public.classification_rules(priority ASC);
CREATE INDEX IF NOT EXISTS idx_classification_rules_validation ON public.classification_rules(validation_status);

-- ==============================================================================
-- 5. TABLA: collection_points (Puntos de recolección verificables)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.collection_points (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  entity_operator TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  municipality TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Antioquia',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  schedule TEXT,
  contact_info TEXT,
  official_url TEXT,
  delivery_requirements TEXT[] NOT NULL DEFAULT '{}',
  source_id TEXT REFERENCES public.sources(id) ON DELETE SET NULL,
  verification_status TEXT NOT NULL DEFAULT 'pendiente_verificacion_geografica' CHECK (verification_status IN (
    'verificado',
    'referencia_institucional',
    'pendiente_verificacion_geografica',
    'desactualizado'
  )),
  last_verified_at DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collection_points_municipality ON public.collection_points(municipality);
CREATE INDEX IF NOT EXISTS idx_collection_points_status ON public.collection_points(verification_status);

-- ==============================================================================
-- 6. TABLA: collection_point_materials (Relación N:M puntos y tipos de residuos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.collection_point_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_point_id TEXT NOT NULL REFERENCES public.collection_points(id) ON DELETE CASCADE,
  waste_category TEXT NOT NULL,
  material_name TEXT NOT NULL,
  acceptance_conditions TEXT,
  UNIQUE(collection_point_id, material_name)
);

CREATE INDEX IF NOT EXISTS idx_cp_materials_point ON public.collection_point_materials(collection_point_id);
CREATE INDEX IF NOT EXISTS idx_cp_materials_material ON public.collection_point_materials(material_name);

-- ==============================================================================
-- 7. TABLA: scan_history (Historial de consultas y escaneos por usuario)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  waste_item_id TEXT REFERENCES public.waste_items(id) ON DELETE SET NULL,
  identified_object TEXT NOT NULL,
  probable_material TEXT NOT NULL,
  secondary_materials TEXT[] NOT NULL DEFAULT '{}',
  condition_state TEXT NOT NULL DEFAULT 'limpio_seco',
  result_category TEXT NOT NULL,
  container_color TEXT NOT NULL,
  confidence_level NUMERIC(4,2) NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),
  rule_applied_id TEXT REFERENCES public.classification_rules(id) ON DELETE SET NULL,
  recommendation TEXT NOT NULL,
  municipality TEXT NOT NULL DEFAULT 'Medellín',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_history_user_date ON public.scan_history(user_id, created_at DESC);

-- ==============================================================================
-- 8. TABLA: user_actions (Trazabilidad en 3 niveles: consulta, declaración, verificada)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  waste_item_id TEXT REFERENCES public.waste_items(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'residuo_consultado',
    'separacion_declarada',
    'reutilizacion_declarada',
    'entrega_posconsumo_declarada',
    'entrega_verificada'
  )),
  verification_state TEXT NOT NULL DEFAULT 'declarada_usuario' CHECK (verification_state IN (
    'consulta_informativa',
    'declarada_usuario',
    'verificada_entidad'
  )),
  description TEXT NOT NULL,
  eco_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_actions_user_date ON public.user_actions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_actions_verification ON public.user_actions(verification_state);

-- ==============================================================================
-- 9. TABLA: challenges (Retos de hábitos sostenibles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('separacion', 'posconsumo', 'prevencion', 'reutilizacion', 'aprendizaje')),
  fulfillment_criteria JSONB NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 1 CHECK (target_count >= 1),
  eco_points_reward INTEGER NOT NULL DEFAULT 25,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'finalizado')),
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE
);

-- ==============================================================================
-- 10. TABLA: user_challenges (Progreso de retos por usuario)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_challenges (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0),
  status TEXT NOT NULL DEFAULT 'en_progreso' CHECK (status IN ('en_progreso', 'completado')),
  participated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, challenge_id)
);

-- ==============================================================================
-- 11. TABLA: feedback_reports (Reportes de error y sugerencias de usuarios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.feedback_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  waste_item_id TEXT REFERENCES public.waste_items(id) ON DELETE SET NULL,
  collection_point_id TEXT REFERENCES public.collection_points(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'correccion_clasificacion',
    'actualizacion_punto',
    'nuevo_residuo',
    'error_ia',
    'otro'
  )),
  content TEXT NOT NULL,
  municipality TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_revision', 'resuelto', 'descartado')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_reports_status ON public.feedback_reports(status, created_at DESC);

-- ==============================================================================
-- 12. TABLA: educational_articles (Módulo Aprende y Descubre)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.educational_articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_takeaways TEXT[] NOT NULL DEFAULT '{}',
  content_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  biomimicry_insight TEXT,
  source_id TEXT REFERENCES public.sources(id) ON DELETE SET NULL,
  validation_status TEXT NOT NULL DEFAULT 'verificado' CHECK (validation_status IN ('verificado', 'pendiente', 'desactualizado')),
  reviewed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 13. POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_point_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_articles ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para catálogos verificados
CREATE POLICY "Public read sources" ON public.sources FOR SELECT USING (true);
CREATE POLICY "Public read verified waste_items" ON public.waste_items FOR SELECT USING (publication_status != 'borrador' OR public.is_admin());
CREATE POLICY "Public read classification_rules" ON public.classification_rules FOR SELECT USING (true);
CREATE POLICY "Public read collection_points" ON public.collection_points FOR SELECT USING (true);
CREATE POLICY "Public read collection_point_materials" ON public.collection_point_materials FOR SELECT USING (true);
CREATE POLICY "Public read active challenges" ON public.challenges FOR SELECT USING (status = 'activo' OR public.is_admin());
CREATE POLICY "Public read educational_articles" ON public.educational_articles FOR SELECT USING (true);

-- Políticas de administración (solo administradores verificados en base de datos)
CREATE POLICY "Admin full access sources" ON public.sources FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full access waste_items" ON public.waste_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full access classification_rules" ON public.classification_rules FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full access collection_points" ON public.collection_points FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full access collection_point_materials" ON public.collection_point_materials FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full access challenges" ON public.challenges FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full access educational_articles" ON public.educational_articles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Políticas para datos personales (profiles)
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
-- Importante: El usuario puede actualizar su alias y municipio, pero NO su columna role
CREATE POLICY "Users update own profile non-role" ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Políticas para scan_history
CREATE POLICY "Users read own scan_history" ON public.scan_history FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users insert own scan_history" ON public.scan_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own scan_history" ON public.scan_history FOR DELETE USING (auth.uid() = user_id);

-- Políticas para user_actions
CREATE POLICY "Users read own actions" ON public.user_actions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users insert own actions" ON public.user_actions FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND verification_state IN ('consulta_informativa', 'declarada_usuario')
);

-- Políticas para user_challenges
CREATE POLICY "Users read own challenges" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users insert own challenges" ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own challenges" ON public.user_challenges FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para feedback_reports
CREATE POLICY "Anyone can create feedback_report" ON public.feedback_reports FOR INSERT WITH CHECK (
  user_id IS NULL OR auth.uid() = user_id
);
CREATE POLICY "Users read own feedback or admin reads all" ON public.feedback_reports FOR SELECT USING (
  (user_id IS NOT NULL AND auth.uid() = user_id) OR public.is_admin()
);
CREATE POLICY "Admin updates feedback_reports" ON public.feedback_reports FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
