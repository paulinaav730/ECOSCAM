"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Shield,
  User,
} from "lucide-react";
import { COLOMBIAN_MUNICIPALITIES } from "@/lib/data/verified-environmental-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ProfileUpdateSchema } from "@/lib/validations/schemas";
import { useEcoScan } from "@/components/providers/ecoscan-provider";

export default function ProfileAndAuthPage() {
  const {
    municipality,
    setMunicipality,
    userProfile,
    setUserProfile,
    supabaseConfigured,
  } = useEcoScan();

  const [authMode, setAuthMode] = useState<"login" | "register" | "recover">(
    "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alias, setAlias] = useState(userProfile?.alias || "");
  const [publicProfile, setPublicProfile] = useState(
    userProfile?.publicProfile ?? false
  );
  const [shareAnonymousStats, setShareAnonymousStats] = useState(
    userProfile?.shareAnonymousStats ?? false
  );
  const [storeImages, setStoreImages] = useState(
    userProfile?.storeImages ?? false
  );

  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg(null);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatusMsg({
        type: "error",
        text: "Supabase Auth no está configurado todavía en este entorno (.env.local). Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para habilitar cuentas en la nube.",
      });
      return;
    }

    setLoading(true);
    try {
      if (authMode === "register") {
        const resolvedAlias = alias.trim() || email.split("@")[0] || "Usuario";
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              alias: resolvedAlias,
              preferred_municipality: municipality,
            },
          },
        });
        if (error) throw error;

        // Si Supabase aún no devolvió sesión en signUp, iniciar sesión inmediatamente sin pedir correo de confirmación
        if (!data.session) {
          await supabase.auth.signInWithPassword({
            email,
            password,
          });
        }

        if (data.user) {
          setUserProfile({
            id: data.user.id,
            email: data.user.email || email,
            alias: resolvedAlias,
            role: "user",
            preferredMunicipality: municipality,
            publicProfile: false,
            shareAnonymousStats: false,
            storeImages: false,
          });
          setStatusMsg({
            type: "success",
            text: "¡Cuenta creada y sesión iniciada automáticamente! No necesitas confirmar tu correo electrónico.",
          });
        }
      } else if (authMode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setUserProfile({
            id: data.user.id,
            email: data.user.email || email,
            alias:
              data.user.user_metadata?.alias ||
              email.split("@")[0] ||
              "Usuario",
            role: "user",
            preferredMunicipality: municipality,
            publicProfile: false,
            shareAnonymousStats: false,
            storeImages: false,
          });
          setStatusMsg({
            type: "success",
            text: "Has iniciado sesión correctamente.",
          });
        }
      } else if (authMode === "recover") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setStatusMsg({
          type: "success",
          text: "Se envió un enlace de recuperación de contraseña a tu correo electrónico.",
        });
      }
    } catch (err) {
      setStatusMsg({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Error en la operación de autenticación.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUserProfile(null);
    setStatusMsg({
      type: "success",
      text: "Sesión cerrada correctamente.",
    });
  }

  async function handleSavePreferences(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg(null);

    const parsed = ProfileUpdateSchema.safeParse({
      alias: alias.trim() || "Explorador EcoScan",
      preferredMunicipality: municipality,
      publicProfile,
      shareAnonymousStats,
      storeImages,
    });

    if (!parsed.success) {
      setStatusMsg({
        type: "error",
        text:
          parsed.error.issues[0]?.message ||
          "Revisa los datos de tus preferencias.",
      });
      return;
    }

    setMunicipality(parsed.data.preferredMunicipality);

    if (userProfile) {
      const supabase = createSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase
          .from("profiles")
          .update({
            alias: parsed.data.alias,
            preferred_municipality: parsed.data.preferredMunicipality,
            privacy_settings: {
              publicProfile: parsed.data.publicProfile,
              shareAnonymousStats: parsed.data.shareAnonymousStats,
              storeImages: parsed.data.storeImages,
            },
          })
          .eq("id", userProfile.id);

        if (error) {
          setStatusMsg({
            type: "error",
            text: `Error al guardar en base de datos: ${error.message}`,
          });
          return;
        }
      }
      setUserProfile({
        ...userProfile,
        alias: parsed.data.alias,
        preferredMunicipality: parsed.data.preferredMunicipality,
        publicProfile: parsed.data.publicProfile,
        shareAnonymousStats: parsed.data.shareAnonymousStats,
        storeImages: parsed.data.storeImages,
      });
    }

    setStatusMsg({
      type: "success",
      text: `Preferencias de municipio (${municipality}) y privacidad actualizadas correctamente.`,
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
          <User className="h-4 w-4" />
          Autenticación Supabase Auth y Privacidad
        </span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
          Perfil, Cuenta y Preferencias
        </h1>
        <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-300">
          El catálogo y el buscador de EcoScan son públicos y no te obligan a
          crear una cuenta. Inicia sesión cuando desees sincronizar tu historial
          entre sesiones y administrar tus preferencias en la nube.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`rounded-2xl border p-4 text-xs flex items-start gap-2.5 ${
            statusMsg.type === "success"
              ? "border-[#22C55E]/30 bg-[#22C55E]/10 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E] mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Columna 1: Autenticación con Supabase */}
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-6 lg:col-span-6 space-y-5">
          {userProfile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="rounded-full bg-[#22C55E]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#22C55E]">
                    Sesión Activa • Rol: {userProfile.role}
                  </span>
                  <h2 className="mt-2 text-lg font-bold text-white">
                    {userProfile.alias}
                  </h2>
                  <p className="text-xs text-slate-400">{userProfile.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
              <p className="text-xs text-slate-300">
                Tu historial de consultas y acciones declaradas está protegido
                mediante políticas Row Level Security (RLS) asociadas a tu
                identificador de usuario.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#2DD4BF]" />
                  <span>
                    {authMode === "login"
                      ? "Iniciar sesión"
                      : authMode === "register"
                      ? "Crear cuenta en EcoScan"
                      : "Recuperar contraseña"}
                  </span>
                </h2>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                    supabaseConfigured
                      ? "bg-[#22C55E]/15 text-[#22C55E]"
                      : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {supabaseConfigured
                    ? "Supabase Conectado"
                    : "Modo Local (Sin variables Supabase)"}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    authMode === "login"
                      ? "bg-[#22C55E] text-[#0E1227]"
                      : "bg-[#0E1227] text-slate-300"
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    authMode === "register"
                      ? "bg-[#22C55E] text-[#0E1227]"
                      : "bg-[#0E1227] text-slate-300"
                  }`}
                >
                  Registrarse
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("recover")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    authMode === "recover"
                      ? "bg-[#2DD4BF] text-[#0E1227]"
                      : "bg-[#0E1227] text-slate-300"
                  }`}
                >
                  Recuperar clave
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {authMode === "register" && (
                  <div>
                    <label
                      htmlFor="auth-alias"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Nombre o alias opcional
                    </label>
                    <input
                      id="auth-alias"
                      type="text"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      placeholder="Ej. Camila Ambiental"
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0E1227] px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Correo electrónico
                  </label>
                  <div className="relative mt-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="auth-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu-correo@ejemplo.com"
                      className="w-full rounded-xl border border-white/15 bg-[#0E1227] py-2.5 pl-9 pr-3 text-xs text-white"
                    />
                  </div>
                </div>

                {authMode !== "recover" && (
                  <div>
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Contraseña
                    </label>
                    <div className="relative mt-1">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="auth-password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full rounded-xl border border-white/15 bg-[#0E1227] py-2.5 pl-9 pr-3 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#22C55E] to-[#10B981] px-4 py-2.5 text-xs font-bold text-[#0E1227] shadow-glow disabled:opacity-50"
                >
                  {loading
                    ? "Procesando..."
                    : authMode === "login"
                    ? "Iniciar sesión"
                    : authMode === "register"
                    ? "Crear cuenta"
                    : "Enviar enlace de recuperación"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Columna 2: Preferencias de Ciudad y Privacidad */}
        <div className="rounded-2xl border border-white/10 bg-[#131832] p-6 lg:col-span-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#22C55E]" />
            <span>Preferencias de Municipio y Privacidad</span>
          </h2>

          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div>
              <label
                htmlFor="pref-municipality"
                className="block text-xs font-medium text-slate-300"
              >
                Municipio preferido para contextualizar reglas y rutas
              </label>
              <div className="relative mt-1">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2DD4BF]" />
                <select
                  id="pref-municipality"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0E1227] py-2.5 pl-9 pr-3 text-xs text-white"
                >
                  {COLOMBIAN_MUNICIPALITIES.map((muni) => (
                    <option key={muni} value={muni}>
                      {muni}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-[#0E1227] p-4 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={(e) => setPublicProfile(e.target.checked)}
                  className="mt-0.5 rounded border-white/20"
                />
                <span>
                  <strong className="text-white block">
                    Mantener mi progreso privado (Recomendado)
                  </strong>
                  <span className="text-slate-400">
                    Puedes consultar tu progreso y retos sin compartir
                    públicamente tu información personal.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storeImages}
                  onChange={(e) => setStoreImages(e.target.checked)}
                  className="mt-0.5 rounded border-white/20"
                />
                <span>
                  <strong className="text-white block">
                    Consentimiento de almacenamiento de fotografías
                  </strong>
                  <span className="text-slate-400">
                    Por defecto está DESACTIVADO: las fotografías del escáner se
                    analizan en memoria y no se guardan permanentemente.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareAnonymousStats}
                  onChange={(e) => setShareAnonymousStats(e.target.checked)}
                  className="mt-0.5 rounded border-white/20"
                />
                <span>
                  <strong className="text-white block">
                    Aportar estadísticas agregadas anónimas
                  </strong>
                  <span className="text-slate-400">
                    Ayuda a identificar qué residuos generan más dudas en{" "}
                    {municipality}.
                  </span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl border border-[#2DD4BF]/40 bg-[#2DD4BF]/15 px-4 py-2.5 text-xs font-bold text-[#2DD4BF] hover:bg-[#2DD4BF]/25"
            >
              Guardar preferencias
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
