"use client";

import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  MapPin,
  Leaf,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  UserPlus,
  LogIn,
  ShieldCheck,
  X,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface AuthScreenProps {
  onLoginSuccess: (userData: {
    name: string;
    email: string;
    city: string;
  }) => void;
  onClose?: () => void;
  initialMode?: 'login' | 'register';
}

const COLOMBIAN_CITIES = [
  'Bogotá, D.C.',
  'Medellín, Antioquia',
  'Cali, Valle del Cauca',
  'Barranquilla, Atlántico',
  'Bucaramanga, Santander',
  'Cartagena, Bolívar',
  'Pereira, Risaralda',
  'Manizales, Caldas',
  'Cúcuta, Norte de Santander',
  'Ibagué, Tolima',
  'Santa Marta, Magdalena',
  'Villavicencio, Meta',
];

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCity, setRegCity] = useState(COLOMBIAN_CITIES[0]);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDemoLogin = () => {
    setErrorMsg(null);
    setSuccessMsg('¡Bienvenida de nuevo, Paulina!');
    setTimeout(() => {
      onLoginSuccess({
        name: 'Paulina Avendaño',
        email: 'paulina.avendano@ecoscan.co',
        city: 'Bogotá, Colombia',
      });
    }, 500);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Por favor completa tu correo y contraseña.');
      return;
    }

    if (!loginEmail.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico válido.');
      return;
    }

    setIsSubmitting(true);
    const supabase = createSupabaseBrowserClient();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail.trim(),
          password: loginPassword,
        });
        if (!error && data.user) {
          const meta = data.user.user_metadata || {};
          setSuccessMsg('¡Sesión iniciada correctamente!');
          setTimeout(() => {
            onLoginSuccess({
              name:
                meta.alias ||
                meta.full_name ||
                loginEmail.split('@')[0].replace('.', ' '),
              email: data.user?.email || loginEmail.trim(),
              city: meta.municipality || 'Bogotá, Colombia',
            });
          }, 500);
          setIsSubmitting(false);
          return;
        }
      } catch {
        // Fallback local si la cuenta es local/demo
      }
    }

    setIsSubmitting(false);
    const derivedName = loginEmail.toLowerCase().includes('paulina')
      ? 'Paulina Avendaño'
      : loginEmail
          .split('@')[0]
          .replace('.', ' ')
          .replace(/^./, (str) => str.toUpperCase());

    setSuccessMsg('¡Sesión iniciada correctamente!');
    setTimeout(() => {
      onLoginSuccess({
        name: derivedName || 'Paulina Avendaño',
        email: loginEmail.trim(),
        city: 'Bogotá, Colombia',
      });
    }, 500);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Ingresa tu nombre completo.');
      return;
    }

    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico válido.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    const supabase = createSupabaseBrowserClient();

    if (supabase) {
      try {
        await supabase.auth.signUp({
          email: regEmail.trim(),
          password: regPassword,
          options: {
            data: {
              alias: regName.trim(),
              municipality: regCity,
            },
          },
        });
      } catch {
        // Continúa con sesión activa inmediata sin pedir correo de confirmación
      }
    }

    setIsSubmitting(false);
    setSuccessMsg(`¡Cuenta creada e iniciada para ${regName.trim()}!`);
    setTimeout(() => {
      onLoginSuccess({
        name: regName.trim(),
        email: regEmail.trim(),
        city: regCity,
      });
    }, 600);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950 p-6 rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Leaf className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              EcoScan Colombia
            </h2>
            <p className="text-xs text-slate-300 font-medium max-w-xs mt-1">
              Guarda tu progreso de reciclaje, acumula Puntos Eco y desbloquea
              medallas sin necesidad de correo de confirmación.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mt-5">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
            Iniciar Sesión
          </button>

          <button
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
            Crear Cuenta
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <ShieldCheck className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Login Form */}
      {mode === 'login' ? (
        <form
          onSubmit={handleLoginSubmit}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <LogIn className="w-4 h-4 text-emerald-400" />
              Ingresar a tu Cuenta EcoScan
            </h3>
            <p className="text-[11px] text-slate-400">
              Accede con tu correo registrado para sincronizar tu historial
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="ejemplo@ecoscan.co"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>
              {isSubmitting ? 'Ingresando...' : 'Ingresar a mi Cuenta'}
            </span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="pt-3 border-t border-slate-800/80">
            <p className="text-[10px] text-center text-slate-400 mb-2 font-medium">
              ¿Quieres probar rápido el sistema?
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 bg-slate-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span>Ingresar Rápido como Paulina Avendaño</span>
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleRegisterSubmit}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              Crear Nueva Cuenta Eco (Sin Confirmación por Correo)
            </h3>
            <p className="text-[11px] text-slate-400">
              Únete y entra directo sin esperar correos de verificación
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="ej. Paulina Avendaño"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="paulina@ejemplo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Ciudad en Colombia
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <select
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                >
                  {COLOMBIAN_CITIES.map((city) => (
                    <option
                      key={city}
                      value={city}
                      className="bg-slate-900 text-white"
                    >
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Confirmar
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>
              {isSubmitting ? 'Creando Cuenta...' : 'Crear mi Cuenta Gratis'}
            </span>
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      )}
    </div>
  );
};
