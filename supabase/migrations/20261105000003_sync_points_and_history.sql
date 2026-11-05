-- ==============================================================================
-- EcoScan Colombia — Migración de Sincronización Permanente de Puntos e Historial
-- Asegura que los Puntos Eco (escaneo + Eco World) y el Historial de escaneos
-- se almacenen permanentemente por usuario autenticado con control anti-duplicados
-- y políticas RLS completas.
-- ==============================================================================

-- 1. Columnas de puntos acumulados en public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  ADD COLUMN IF NOT EXISTS scan_points INTEGER NOT NULL DEFAULT 0 CHECK (scan_points >= 0),
  ADD COLUMN IF NOT EXISTS ecoworld_points INTEGER NOT NULL DEFAULT 0 CHECK (ecoworld_points >= 0),
  ADD COLUMN IF NOT EXISTS scanned_count INTEGER NOT NULL DEFAULT 0 CHECK (scanned_count >= 0);

-- Permitir que el usuario autenticado cree su propio perfil si aún no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users insert own profile'
  ) THEN
    CREATE POLICY "Users insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. Ampliar public.scan_history para almacenar imagen, puntos, huella única y análisis completo
ALTER TABLE public.scan_history
  ADD COLUMN IF NOT EXISTS scan_fingerprint TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS eco_points INTEGER NOT NULL DEFAULT 15 CHECK (eco_points >= 0),
  ADD COLUMN IF NOT EXISTS analysis_payload JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Índice único por usuario y huella de escaneo para impedir puntos o registros duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_scan_history_user_fingerprint
  ON public.scan_history(user_id, scan_fingerprint)
  WHERE scan_fingerprint IS NOT NULL;

-- Permitir que el usuario actualice o elimine sus propios registros de historial
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'scan_history' AND policyname = 'Users update own scan_history'
  ) THEN
    CREATE POLICY "Users update own scan_history"
      ON public.scan_history FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
