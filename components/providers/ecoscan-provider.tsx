"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  createSupabaseBrowserClient,
  isSupabaseClientConfigured,
} from "@/lib/supabase/client";
import {
  ActionVerificationState,
  ScanHistoryRecord,
  UserActionRecord,
} from "@/types/ecoscan";

interface UserSessionProfile {
  id: string;
  email: string;
  alias: string;
  role: "user" | "admin";
  preferredMunicipality: string;
  publicProfile: boolean;
  shareAnonymousStats: boolean;
  storeImages: boolean;
}

interface EcoScanContextValue {
  municipality: string;
  setMunicipality: (muni: string) => void;
  scanHistory: ScanHistoryRecord[];
  userActions: UserActionRecord[];
  addScanRecord: (
    record: Omit<ScanHistoryRecord, "id" | "createdAt">
  ) => Promise<void>;
  registerUserAction: (params: {
    wasteItemId?: string | null;
    actionType: UserActionRecord["actionType"];
    verificationState: ActionVerificationState;
    description: string;
    ecoPoints: number;
  }) => Promise<void>;
  clearLocalHistory: () => Promise<void>;
  userProfile: UserSessionProfile | null;
  setUserProfile: React.Dispatch<
    React.SetStateAction<UserSessionProfile | null>
  >;
  supabaseConfigured: boolean;
  isLoadingAuth: boolean;
  reportModalTarget: {
    open: boolean;
    wasteItemId?: string | null;
    collectionPointId?: string | null;
    contextLabel?: string;
  };
  openReportModal: (params?: {
    wasteItemId?: string | null;
    collectionPointId?: string | null;
    contextLabel?: string;
  }) => void;
  closeReportModal: () => void;
}

const EcoScanContext = createContext<EcoScanContextValue | undefined>(
  undefined
);

const STORAGE_KEYS = {
  MUNICIPALITY: "ecoscan_municipality_v1",
  HISTORY: "ecoscan_scan_history_v1",
  ACTIONS: "ecoscan_user_actions_v1",
};

export function EcoScanProvider({ children }: { children: React.ReactNode }) {
  const [municipality, setMunicipalityState] = useState<string>("Medellín");
  const [scanHistory, setScanHistory] = useState<ScanHistoryRecord[]>([]);
  const [userActions, setUserActions] = useState<UserActionRecord[]>([]);
  const [userProfile, setUserProfile] = useState<UserSessionProfile | null>(
    null
  );
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [reportModalTarget, setReportModalTarget] = useState<{
    open: boolean;
    wasteItemId?: string | null;
    collectionPointId?: string | null;
    contextLabel?: string;
  }>({ open: false });

  const supabaseConfigured = isSupabaseClientConfigured();

  // Cargar estado inicial desde localStorage y sincronizar con Supabase si está configurado
  useEffect(() => {
    try {
      const savedMuni = localStorage.getItem(STORAGE_KEYS.MUNICIPALITY);
      if (savedMuni) setMunicipalityState(savedMuni);

      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (savedHistory) setScanHistory(JSON.parse(savedHistory));

      const savedActions = localStorage.getItem(STORAGE_KEYS.ACTIONS);
      if (savedActions) setUserActions(JSON.parse(savedActions));
    } catch {
      // Ignorar errores de almacenamiento del navegador
    }

    async function syncSupabaseSession() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setIsLoadingAuth(false);
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          const resolvedMuni =
            profile?.preferred_municipality || "Medellín";
          setMunicipalityState(resolvedMuni);

          setUserProfile({
            id: user.id,
            email: user.email || "",
            alias:
              profile?.alias ||
              user.email?.split("@")[0] ||
              "Usuario EcoScan",
            role: profile?.role === "admin" ? "admin" : "user",
            preferredMunicipality: resolvedMuni,
            publicProfile: Boolean(profile?.privacy_settings?.publicProfile),
            shareAnonymousStats: Boolean(
              profile?.privacy_settings?.shareAnonymousStats
            ),
            storeImages: Boolean(profile?.privacy_settings?.storeImages),
          });

          // Cargar historial persistido en Supabase
          const { data: dbHistory } = await supabase
            .from("scan_history")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(40);

          if (dbHistory && dbHistory.length > 0) {
            setScanHistory(
              dbHistory.map((row) => ({
                id: row.id,
                userId: row.user_id,
                wasteItemId: row.waste_item_id,
                identifiedObject: row.identified_object,
                probableMaterial: row.probable_material,
                secondaryMaterials: row.secondary_materials || [],
                conditionState: row.condition_state,
                resultCategory: row.result_category,
                containerColor: row.container_color,
                confidenceLevel: Number(row.confidence_level),
                ruleAppliedId: row.rule_applied_id,
                recommendation: row.recommendation,
                municipality: row.municipality,
                createdAt: row.created_at,
              }))
            );
          }

          const { data: dbActions } = await supabase
            .from("user_actions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50);

          if (dbActions && dbActions.length > 0) {
            setUserActions(
              dbActions.map((row) => ({
                id: row.id,
                userId: row.user_id,
                wasteItemId: row.waste_item_id,
                actionType: row.action_type,
                verificationState: row.verification_state,
                description: row.description,
                ecoPoints: Number(row.eco_points),
                createdAt: row.created_at,
              }))
            );
          }
        }
      } catch (err) {
        console.warn("[EcoScan Session Sync]:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    }

    syncSupabaseSession();
  }, []);

  const setMunicipality = useCallback(
    (muni: string) => {
      setMunicipalityState(muni);
      try {
        localStorage.setItem(STORAGE_KEYS.MUNICIPALITY, muni);
      } catch {
        // Ignore
      }
      if (userProfile) {
        const supabase = createSupabaseBrowserClient();
        if (supabase) {
          supabase
            .from("profiles")
            .update({ preferred_municipality: muni })
            .eq("id", userProfile.id)
            .then();
        }
      }
    },
    [userProfile]
  );

  const addScanRecord = useCallback(
    async (record: Omit<ScanHistoryRecord, "id" | "createdAt">) => {
      const newEntry: ScanHistoryRecord = {
        ...record,
        id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };

      setScanHistory((prev) => {
        const next = [newEntry, ...prev].slice(0, 50);
        try {
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(next));
        } catch {
          // Ignore
        }
        return next;
      });

      // Registrar también como Estado 1: Residuo consultado (NUNCA como reciclaje verificado)
      const consultAction: UserActionRecord = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: userProfile?.id || "local-session",
        wasteItemId: record.wasteItemId ?? null,
        actionType: "residuo_consultado",
        verificationState: "consulta_informativa",
        description: `Consulta informativa: ${record.identifiedObject} (${record.municipality})`,
        ecoPoints: 5,
        createdAt: new Date().toISOString(),
      };

      setUserActions((prev) => {
        const next = [consultAction, ...prev].slice(0, 60);
        try {
          localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(next));
        } catch {
          // Ignore
        }
        return next;
      });

      if (userProfile) {
        const supabase = createSupabaseBrowserClient();
        if (supabase) {
          await supabase.from("scan_history").insert({
            user_id: userProfile.id,
            waste_item_id: record.wasteItemId ?? null,
            identified_object: record.identifiedObject,
            probable_material: record.probableMaterial,
            secondary_materials: record.secondaryMaterials,
            condition_state: record.conditionState,
            result_category: record.resultCategory,
            container_color: record.containerColor,
            confidence_level: record.confidenceLevel,
            rule_applied_id: record.ruleAppliedId,
            recommendation: record.recommendation,
            municipality: record.municipality,
          });

          await supabase.from("user_actions").insert({
            user_id: userProfile.id,
            waste_item_id: record.wasteItemId ?? null,
            action_type: "residuo_consultado",
            verification_state: "consulta_informativa",
            description: consultAction.description,
            eco_points: 5,
          });
        }
      }
    },
    [userProfile]
  );

  const registerUserAction = useCallback(
    async (params: {
      wasteItemId?: string | null;
      actionType: UserActionRecord["actionType"];
      verificationState: ActionVerificationState;
      description: string;
      ecoPoints: number;
    }) => {
      const newAction: UserActionRecord = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: userProfile?.id || "local-session",
        wasteItemId: params.wasteItemId ?? null,
        actionType: params.actionType,
        verificationState: params.verificationState,
        description: params.description,
        ecoPoints: params.ecoPoints,
        createdAt: new Date().toISOString(),
      };

      setUserActions((prev) => {
        const next = [newAction, ...prev].slice(0, 60);
        try {
          localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(next));
        } catch {
          // Ignore
        }
        return next;
      });

      if (userProfile) {
        const supabase = createSupabaseBrowserClient();
        if (supabase) {
          await supabase.from("user_actions").insert({
            user_id: userProfile.id,
            waste_item_id: params.wasteItemId ?? null,
            action_type: params.actionType,
            verification_state: params.verificationState,
            description: params.description,
            eco_points: params.ecoPoints,
          });
        }
      }
    },
    [userProfile]
  );

  const clearLocalHistory = useCallback(async () => {
    setScanHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch {
      // Ignore
    }
    if (userProfile) {
      const supabase = createSupabaseBrowserClient();
      if (supabase) {
        await supabase
          .from("scan_history")
          .delete()
          .eq("user_id", userProfile.id);
      }
    }
  }, [userProfile]);

  const openReportModal = useCallback(
    (params?: {
      wasteItemId?: string | null;
      collectionPointId?: string | null;
      contextLabel?: string;
    }) => {
      setReportModalTarget({
        open: true,
        wasteItemId: params?.wasteItemId ?? null,
        collectionPointId: params?.collectionPointId ?? null,
        contextLabel: params?.contextLabel,
      });
    },
    []
  );

  const closeReportModal = useCallback(() => {
    setReportModalTarget({ open: false });
  }, []);

  return (
    <EcoScanContext.Provider
      value={{
        municipality,
        setMunicipality,
        scanHistory,
        userActions,
        addScanRecord,
        registerUserAction,
        clearLocalHistory,
        userProfile,
        setUserProfile,
        supabaseConfigured,
        isLoadingAuth,
        reportModalTarget,
        openReportModal,
        closeReportModal,
      }}
    >
      {children}
    </EcoScanContext.Provider>
  );
}

export function useEcoScan() {
  const ctx = useContext(EcoScanContext);
  if (!ctx) {
    throw new Error("useEcoScan debe utilizarse dentro de <EcoScanProvider>");
  }
  return ctx;
}
