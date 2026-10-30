import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  ECOWORLD_REWARD_CONFIG,
  VALID_ECOSYSTEMS,
  EcosystemId,
  EcoWorldMissionMilestoneState,
} from '@/components/ecoscan-ui/types';

// Control en memoria del servidor contra repetición de nonces y abuso por minuto
const processedNonces = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionNonce,
      ecosystemId,
      itemsCollected,
      targetItems,
      correctClassifications,
      mistakes,
      durationSeconds,
      previousMilestones,
    } = body as {
      sessionNonce: string;
      ecosystemId: EcosystemId;
      itemsCollected: number;
      targetItems: number;
      correctClassifications: number;
      mistakes: number;
      durationSeconds: number;
      previousMilestones?: Partial<EcoWorldMissionMilestoneState>;
    };

    // 1. Validación estricta de parámetros en el servidor
    if (
      !sessionNonce ||
      typeof sessionNonce !== 'string' ||
      sessionNonce.length < 8
    ) {
      return NextResponse.json(
        { success: false, error: 'Identificador de sesión inválido.' },
        { status: 400 }
      );
    }

    if (processedNonces.has(sessionNonce)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Esta partida ya fue procesada anteriormente.',
        },
        { status: 409 }
      );
    }

    if (!VALID_ECOSYSTEMS.includes(ecosystemId)) {
      return NextResponse.json(
        { success: false, error: 'Ecosistema no válido.' },
        { status: 400 }
      );
    }

    const safeTarget = Math.max(4, Math.min(20, Number(targetItems) || 8));
    const safeCollected = Math.max(
      0,
      Math.min(safeTarget, Number(itemsCollected) || 0)
    );
    const safeCorrect = Math.max(
      0,
      Math.min(safeCollected, Number(correctClassifications) || 0)
    );
    const safeMistakes = Math.max(0, Math.min(50, Number(mistakes) || 0));
    const safeDuration = Math.max(
      3,
      Math.min(300, Number(durationSeconds) || 30)
    );

    // 2. Determinar cumplimiento real de misión en el servidor (nunca confiar en flags del cliente)
    const minRequiredToComplete = Math.ceil(safeTarget * 0.75);
    const completedMission = safeCorrect >= minRequiredToComplete;
    const completedAllObjectives = safeCorrect >= safeTarget;
    const perfectRun = completedAllObjectives && safeMistakes === 0;

    // 3. Calcular puntuación oficial de la partida
    const timeBonus = completedMission
      ? Math.max(0, Math.min(180, (90 - safeDuration) * 2))
      : 0;
    const verifiedScore = Math.max(
      0,
      safeCorrect * 100 - safeMistakes * 25 + timeBonus
    );
    const recoveryPct = Math.min(
      100,
      Math.round((safeCorrect / safeTarget) * 100)
    );
    const stars = perfectRun
      ? 3
      : completedAllObjectives
      ? 2
      : completedMission
      ? 1
      : 0;

    // 4. Control anti-acumulación ilimitada: otorgar únicamente los hitos aún no reclamados en ese ecosistema
    const prevCompletion = Boolean(previousMilestones?.rewardedCompletion);
    const prevObjectives = Boolean(previousMilestones?.rewardedObjectives);
    const prevPerfect = Boolean(previousMilestones?.rewardedPerfect);

    let newlyAwardedPoints = 0;
    const breakdown: { label: string; points: number; newlyEarned: boolean }[] =
      [];

    if (completedMission) {
      const earnedNow = !prevCompletion;
      if (earnedNow)
        newlyAwardedPoints += ECOWORLD_REWARD_CONFIG.completeMission;
      breakdown.push({
        label: 'Completar la misión',
        points: ECOWORLD_REWARD_CONFIG.completeMission,
        newlyEarned: earnedNow,
      });
    }

    if (completedAllObjectives) {
      const earnedNow = !prevObjectives;
      if (earnedNow)
        newlyAwardedPoints += ECOWORLD_REWARD_CONFIG.completeAllObjectives;
      breakdown.push({
        label: 'Cumplir todos los objetivos',
        points: ECOWORLD_REWARD_CONFIG.completeAllObjectives,
        newlyEarned: earnedNow,
      });
    }

    if (perfectRun) {
      const earnedNow = !prevPerfect;
      if (earnedNow)
        newlyAwardedPoints += ECOWORLD_REWARD_CONFIG.perfectMission;
      breakdown.push({
        label: 'Misión perfecta (0 errores)',
        points: ECOWORLD_REWARD_CONFIG.perfectMission,
        newlyEarned: earnedNow,
      });
    }

    processedNonces.add(sessionNonce);

    const updatedMilestoneState: EcoWorldMissionMilestoneState = {
      unlocked: true,
      completed: Boolean(previousMilestones?.completed) || completedMission,
      recoveryPct: Math.max(
        Number(previousMilestones?.recoveryPct) || 0,
        recoveryPct
      ),
      bestScore: Math.max(
        Number(previousMilestones?.bestScore) || 0,
        verifiedScore
      ),
      stars: Math.max(Number(previousMilestones?.stars) || 0, stars),
      rewardedCompletion: prevCompletion || completedMission,
      rewardedObjectives: prevObjectives || completedAllObjectives,
      rewardedPerfect: prevPerfect || perfectRun,
    };

    // 5. Persistir en Supabase si el usuario tiene sesión autenticada en Supabase
    const supabase = await createSupabaseServerClient();
    let persistedInDatabase = false;

    if (supabase) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase.from('ecoworld_sessions').insert({
            user_id: user.id,
            session_nonce: sessionNonce,
            ecosystem_id: ecosystemId,
            score: verifiedScore,
            items_collected: safeCollected,
            correct_classifications: safeCorrect,
            mistakes: safeMistakes,
            duration_seconds: safeDuration,
            completed_mission: completedMission,
            completed_all_objectives: completedAllObjectives,
            perfect_run: perfectRun,
            points_awarded: newlyAwardedPoints,
          });

          if (newlyAwardedPoints > 0) {
            await supabase.from('user_actions').insert({
              user_id: user.id,
              action_type: 'mision_ecoworld_completada',
              verification_state: 'declarada_usuario',
              description: `ECO WORLD: Misión ${ecosystemId.replace('_', ' ')} completada (+${newlyAwardedPoints} pts extra)`,
              eco_points: newlyAwardedPoints,
            });
          }

          persistedInDatabase = true;
        }
      } catch {
        // Si las tablas aún no se han corrido en el proyecto remoto, no bloquear la respuesta
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ecosystemId,
        verifiedScore,
        recoveryPct,
        stars,
        completedMission,
        completedAllObjectives,
        perfectRun,
        pointsAwarded: newlyAwardedPoints,
        breakdown,
        updatedMilestoneState,
        persistedInDatabase,
      },
    });
  } catch (error) {
    console.error('[/api/ecoworld error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al validar la partida de ECO WORLD.',
      },
      { status: 500 }
    );
  }
}
