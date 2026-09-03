import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, Eye, EyeOff, ShieldCheck, X, KeyRound, AlertCircle, ArrowRight, User } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin
}) => {
  const { loginAdmin } = useStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.trim().toLowerCase() !== 'admin') {
      setError('El usuario ingresado no es válido. Usuario por defecto: admin');
      return;
    }

    const success = loginAdmin(password);
    if (success) {
      setPassword('');
      setError('');
      onSuccessLogin();
    } else {
      setError('Contraseña incorrecta. (Clave inicial por defecto: 123456)');
    }
  };

  const handleFillDefaults = () => {
    setUsername('admin');
    setPassword('123456');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 z-10 animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-7 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 mx-auto flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-black tracking-tight text-white">
            Panel de Administración
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de catálogo, precios en tiempo real y preventistas
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Default credentials banner hint */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                Acceso inicial predeterminado:
              </div>
              <div className="text-[11px] text-amber-800">
                Usuario: <strong className="font-mono">admin</strong> | Clave: <strong className="font-mono">123456</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDefaults}
              className="text-[11px] font-bold px-2 py-1 bg-amber-200/70 hover:bg-amber-200 text-amber-950 rounded-lg whitespace-nowrap transition-colors"
            >
              Autocompletar
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Usuario Administrador
              </label>
              <input
                id="login-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Sesión persistente
            </span>
            <span className="text-[11px]">Acceso encriptado</span>
          </div>

          <button
            id="btn-submit-admin-login"
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98"
          >
            <span>Ingresar al Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
