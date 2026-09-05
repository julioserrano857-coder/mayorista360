import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  User,
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LandingPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const {
    settings,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    isCloudConfigured
  } = useStore();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Por favor ingresa la contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const isSuccess = await loginAdmin(password);
      if (isSuccess) {
        setPassword('');
        onLoginSuccess();
      } else {
        setError('Contraseña incorrecta. (Clave por defecto: 123456)');
      }
    } catch {
      setError('No se pudo conectar. Revisá tu internet e intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-sky-500 selection:text-white">
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Login Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-3xl shadow-xl shadow-sky-500/20 ring-4 ring-white/10 mx-auto mb-4">
            📦
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {settings.companyName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Portal de Acceso Administrativo
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {isAdminAuthenticated ? (
            /* If already authenticated */
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Sesión Activa</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ya has iniciado sesión como administrador.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  id="btn-login-direct-admin"
                  onClick={onLoginSuccess}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Ir al Panel de Administración</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={logoutAdmin}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-rose-300 hover:text-rose-200 text-xs font-bold transition-colors border border-slate-700/60"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {!isCloudConfigured && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-amber-100">Supabase no configurado.</strong>
                    <span>
                      Para usar el sistema hay que definir las variables de entorno{' '}
                      <code className="bg-amber-950/60 px-1 rounded">VITE_SUPABASE_URL</code> y{' '}
                      <code className="bg-amber-950/60 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> en el deploy.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pb-4 border-b border-slate-800 text-slate-300">
                <Lock className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Iniciar Sesión</span>
              </div>

              {/* Username Input */}
              <div>
                <label 
                  htmlFor="login-username"
                  className="block text-xs font-bold text-slate-300 mb-1.5"
                >
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Usuario"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label 
                  htmlFor="login-password"
                  className="block text-xs font-bold text-slate-300 mb-1.5"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="••••••••"
                    autoFocus
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error ? (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-slate-400 text-right">
                    Clave por defecto: <code className="text-sky-300 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">123456</code>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-login"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* PWA Install Button */}
        <div className="mt-4 flex justify-center">
          <PWAInstallButton variant="subtle" label="Instalar Aplicación en este Dispositivo" />
        </div>

        {/* Subtle Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Panel de Administración Seguro</span>
        </div>
      </div>
    </div>
  );
};
