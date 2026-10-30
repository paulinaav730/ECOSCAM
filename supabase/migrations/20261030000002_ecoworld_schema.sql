-- ==============================================================================
-- EcoScan Colombia — Migración ECO WORLD (Videojuego Educativo 2D Integrado)
-- Agrega tablas de progreso de ecosistemas, sesiones verificadas y recompensas
-- sin modificar ni eliminar ninguna tabla existente de ECOSCAM.
-- ==============================================================================

-- 1. Ampliar los tipos de acción permitidos en public.user_actions (de forma segura)
DO $$
BEGIN
  ALTER TABLE public.user_actions DROP CONSTRAINT IF EXISTS user_actions_action_type_check;
  ALTER TABLE public.user_actions ADD CONSTRAINT user_actions_action_type_check
    CHECK (action_type IN (
      'residuo_consultado',
      'separacion_declarada',
      'reutilizacion_declarada',
      'entrega_posconsumo_declarada',
      'entrega_verificada',
      'mision_ecoworld_completada'
    ));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 2. TABLA: ecoworld_progress (Estado de recuperación de los 4 ecosistemas por usuario)
CREATE TABLE IF NOT EXISTS public.ecoworld_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_ecoworld_points INTEGER NOT NULL DEFAULT 0 CHECK (total_ecoworld_points >= 0),
  missions_completed INTEGER NOT NULL DEFAULT 0 CHECK (missions_completed >= 0),
  unlocked_ecosystems TEXT[] NOT NULL DEFAULT ARRAY['parque_olvidado'],
  ecosystem_states JSONB NOT NULL DEFAULT '{
    "parque_olvidado": {"unlocked": true, "completed": false, "recoveryPct": 0, "bestScore": 0, "stars": 0, "rewardedCompletion": false, "rewardedObjectives": false, "rewardedPerfect": false},
    "rio_contaminado": {"unlocked": false, "completed": false, "recoveryPct": 0, "bestScore": 0, "stars": 0, "rewardedCompletion": false, "rewardedObjectives": false, "rewardedPerfect": false},
    "bosque_perdido": {"unlocked": false, "completed": false, "recoveryPct": 0, "bestScore": 0, "stars": 0, "rewardedCompletion": false, "rewardedObjectives": false, "rewardedPerfect": false},
    "ciudad_verde": {"unlocked": false, "completed": false, "recoveryPct": 0, "bestScore": 0, "stars": 0, "rewardedCompletion": false, "rewardedObjectives": false, "rewardedPerfect": false}
  }'::jsonb,
  unlocked_game_badges TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA: ecoworld_sessions (Historial de partidas validadas en servidor con control anti-duplicación)
CREATE TABLE IF NOT EXISTS public.ecoworld_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_nonce TEXT UNIQUE NOT NULL,
  ecosystem_id TEXT NOT NULL CHECK (ecosystem_id IN (
    'parque_olvidado',
    'rio_contaminado',
    'bosque_perdido',
    'ciudad_verde'
  )),
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  items_collected INTEGER NOT NULL DEFAULT 0 CHECK (items_collected >= 0),
  correct_classifications INTEGER NOT NULL DEFAULT 0 CHECK (correct_classifications >= 0),
  mistakes INTEGER NOT NULL DEFAULT 0 CHECK (mistakes >= 0),
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  completed_mission BOOLEAN NOT NULL DEFAULT FALSE,
  completed_all_objectives BOOLEAN NOT NULL DEFAULT FALSE,
  perfect_run BOOLEAN NOT NULL DEFAULT FALSE,
  points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0 AND points_awarded <= 15),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ecoworld_sessions_user_date ON public.ecoworld_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ecoworld_sessions_ecosystem ON public.ecoworld_sessions(user_id, ecosystem_id);

-- 4. POLÍTICAS ROW LEVEL SECURITY (RLS)
ALTER TABLE public.ecoworld_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecoworld_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own ecoworld_progress"
  ON public.ecoworld_progress FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own ecoworld_progress"
  ON public.ecoworld_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own ecoworld_progress"
  ON public.ecoworld_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own ecoworld_sessions"
  ON public.ecoworld_sessions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own ecoworld_sessions"
  ON public.ecoworld_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
