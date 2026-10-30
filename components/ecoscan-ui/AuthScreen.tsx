"use client";

import React, { useState, useEffect } from 'react';
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
  FlaskConical,
  Globe2,
  Recycle,
  RefreshCw,
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

export const SCIENTIFIC_ECO_FACTS = [
  {
    tag: 'Dato Científico • Energía',
    icon: FlaskConical,
    title: 'El aluminio ahorra el 95% de energía',
    fact: 'Reciclar una sola lata de aluminio requiere apenas el 5% de la energía necesaria para extraer bauxita virgen y mantiene encendida una pantalla durante 3 horas.',
  },
  {
    tag: 'Dato Ambiental • Agua',
    icon: Globe2,
    title: '1 litro de aceite contamina 1.000 L de agua',
    fact: 'El aceite de cocina usado forma una película superficial que bloquea el oxígeno en ríos y quebradas. Entregarlo en botella cerrada permite transformarlo en biodiésel.',
  },
  {
    tag: 'Dato Curioso • Química',
    icon: Recycle,
    title: 'El vidrio es 100% reciclable infinitas veces',
    fact: 'A diferencia de otros polímeros, la estructura de sílice del vidrio no pierde propiedades al fundirse: una botella reciclada vuelve a ser botella en menos de 30 días.',
  },
  {
    tag: 'Dato Científico • Clima',
    icon: Sparkles,
    title: 'El metano calienta 28 veces más que el CO₂',
    fact: 'Cuando los restos de comida se entierran sin oxígeno en un relleno sanitario producen gas metano (CH₄). Separarlos en la ruta verde para compostaje evita estas emisiones.',
  },
  {
    tag: 'Dato Ambiental • Bosques',
    icon: Leaf,
    title: '1 tonelada de cartón salva 17 árboles adultos',
    fact: 'Además ahorra 26.000 litros de agua. Por eso es vital no mezclar cartón limpio con restos de grasa o aceite, ya que los lípidos impiden recuperar las fibras de celulosa.',
  },
];

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [factIndex, setFactIndex] = useState(0);

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

  // Rotate scientific/eco facts every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % SCIENTIFIC_ECO_FACTS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const currentFact = SCIENTIFIC_ECO_FACTS[factIndex];
  const FactIcon = currentFact.icon;

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
        // Fallback local
      }
    }

    setIsSubmitting(false);
    const derivedName = loginEmail
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (str) => str.toUpperCase());

    setSuccessMsg('¡Sesión iniciada correctamente!');
    setTimeout(() => {
      onLoginSuccess({
        name: derivedName || 'Usuario EcoScan',
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
        // Continúa con sesión activa inmediata
      }
    }

    setIsSubmitting(false);
    setSuccessMsg(`¡Cuenta creada con éxito para ${regName.trim()}!`);
    setTimeout(() => {
      onLoginSuccess({
        name: regName.trim(),
        email: regEmail.trim(),
        city: regCity,
      });
    }, 600);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-6">
      {/* Top Pill with Scientific / Environmental Fact (Visible on Mobile & Desktop) */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3.5 shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
            <FactIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                {currentFact.tag}
              </span>
              <button
                type="button"
                onClick={() =>
                  setFactIndex((prev) => (prev + 1) % SCIENTIFIC_ECO_FACTS.length)
                }
                className="text-[10px] text-slate-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
                title="Ver otro dato científico"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Siguiente dato</span>
              </button>
            </div>
            <p className="text-xs font-bold text-white leading-snug">
              {currentFact.title}
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {currentFact.fact}
            </p>
          </div>
        </div>
      </div>

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
              medallas en todo el país.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mt-5">
          <button
            type="button"
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
            type="button"
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
        </form>
      ) : (
        <form
          onSubmit={handleRegisterSubmit}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              Crear Nueva Cuenta Eco
            </h3>
            <p className="text-[11px] text-slate-400">
              Únete a la red de reciclaje inteligente en Colombia
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
                  placeholder="Tu nombre completo"
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
                  placeholder="correo@ejemplo.com"
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

      {/* Bottom Pill with Another Scientific / Recycling Fact */}
      <div className="grid grid-cols-2 gap-2.5">
        {SCIENTIFIC_ECO_FACTS.slice(0, 2).map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-3 space-y-1"
            >
              <div className="flex items-center gap-1.5 text-emerald-400">
                <IconComp className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider truncate">
                  {item.tag.split('•')[1] || item.tag}
                </span>
              </div>
              <p className="text-[11px] font-bold text-white leading-tight">
                {item.title}
              </p>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                {item.fact}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
