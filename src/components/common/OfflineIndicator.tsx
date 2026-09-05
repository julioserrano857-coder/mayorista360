import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/usePWAInstall';
import { useStore } from '../../context/StoreContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { isCloudConfigured, isCloudConnected } = useStore();

  // Without internet: show a clear offline notice.
  if (!isOnline) {
    return (
      <div
        id="pwa-offline-banner"
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg animate-bounce"
      >
        <WifiOff className="w-4 h-4" />
        <span>Sin conexión a internet — no se pueden cargar ni guardar datos</span>
      </div>
    );
  }

  // Online but Supabase unreachable (e.g. credentials missing or service down).
  if (isCloudConfigured && !isCloudConnected) {
    return (
      <div
        id="pwa-offline-banner"
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg"
      >
        <WifiOff className="w-4 h-4" />
        <span>No se pudo conectar con la nube (Supabase)</span>
      </div>
    );
  }

  return null;
};
