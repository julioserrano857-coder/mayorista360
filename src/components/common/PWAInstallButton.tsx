import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'subtle' | 'compact' | 'header';
  label?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
  label
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed in standalone mode, do not render
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      // Show guided instructions for iOS or desktop browsers
      setShowGuide(true);
    }
  };

  const getButtonContent = () => {
    if (variant === 'header') {
      return (
        <button
          id="btn-pwa-install-header"
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-800 text-white text-xs font-bold border border-emerald-500/40 shadow-xs transition-all active:scale-95 cursor-pointer ${className}`}
          title="Instalar como Aplicación en tu teléfono o PC"
        >
          <Download className="w-3.5 h-3.5 text-emerald-200" />
          <span>{label || 'Instalar App'}</span>
        </button>
      );
    }

    if (variant === 'compact') {
      return (
        <button
          id="btn-pwa-install-compact"
          onClick={handleClick}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-colors cursor-pointer ${className}`}
          title="Instalar App"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
          <span>{label || 'Instalar'}</span>
        </button>
      );
    }

    if (variant === 'subtle') {
      return (
        <button
          id="btn-pwa-install-subtle"
          onClick={handleClick}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>{label || 'Instalar en tu Pantalla de Inicio'}</span>
        </button>
      );
    }

    // Default primary
    return (
      <button
        id="btn-pwa-install-primary"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-98 cursor-pointer ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>{label || 'Instalar Aplicación (PWA)'}</span>
      </button>
    );
  };

  return (
    <>
      {getButtonContent()}

      {/* Guide Modal for iOS or manual install */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 text-slate-900 relative">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 font-bold">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900">
              Instalar esta aplicación
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Accede al catálogo mayorista sin abrir el navegador, directo desde tu pantalla de inicio como una aplicación nativa.
            </p>

            {isIOS ? (
              <div className="mt-4 space-y-2.5 bg-slate-50 p-3.5 rounded-xl text-xs text-slate-700 border border-slate-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span>
                    1. En la barra de Safari, toca el botón <strong>Compartir</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <PlusSquare className="w-3.5 h-3.5 text-slate-700" />
                  </div>
                  <span>
                    2. Desliza hacia abajo y selecciona <strong>"Agregar a pantalla de inicio"</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <span>
                    3. Toca <strong>"Agregar"</strong> arriba a la derecha. ¡Listo!
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5 bg-slate-50 p-3.5 rounded-xl text-xs text-slate-700 border border-slate-100">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600">1.</span>
                  <span>
                    Toca los <strong>3 puntos del menú</strong> en tu navegador (Chrome / Edge / Samsung Internet).
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600">2.</span>
                  <span>
                    Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
