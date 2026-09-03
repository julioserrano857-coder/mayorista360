import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Lock,
  Phone,
  Building2,
  Bell,
  Save,
  Check,
  RotateCcw,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  Database,
  Cloud,
  UploadCloud,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { cleanWhatsAppNumber } from '../../utils/whatsapp';
import { getSupabaseConfig } from '../../lib/supabase';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const SettingsManagement: React.FC = () => {
  const {
    settings,
    updateSettings,
    updateAdminPassword,
    resetAllDataToDefaults,
    isCloudConnected,
    isCloudSyncing,
    cloudStatusText,
    refreshFromCloud,
    syncLocalToCloud,
    saveCloudCredentials,
    exportBackupJson,
    importBackupJson
  } = useStore();

  // Company Settings
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [defaultWhatsApp, setDefaultWhatsApp] = useState(settings.defaultWhatsApp);
  const [announcement, setAnnouncement] = useState(settings.announcement || '');
  const [savedSettings, setSavedSettings] = useState(false);

  // Supabase Credentials State
  const initialCloudConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCloudConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(initialCloudConfig.key);
  const [cloudMsg, setCloudMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [isPushingCloud, setIsPushingCloud] = useState(false);

  // Password Change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName: companyName.trim(),
      defaultWhatsApp: cleanWhatsAppNumber(defaultWhatsApp),
      announcement: announcement.trim() || undefined
    });
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2000);
  };

  const handleSaveCloudConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloudMsg(null);
    setIsTestingCloud(true);

    try {
      const res = await saveCloudCredentials(supabaseUrl, supabaseKey);
      if (res.success) {
        setCloudMsg({ type: 'success', text: res.message });
      } else {
        setCloudMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setCloudMsg({ type: 'error', text: `Error de conexión: ${err?.message || 'Error desconocido'}` });
    } finally {
      setIsTestingCloud(false);
    }
  };

  const handlePushDataToCloud = async () => {
    setCloudMsg(null);
    setIsPushingCloud(true);
    try {
      const res = await syncLocalToCloud();
      if (res.success) {
        setCloudMsg({ type: 'success', text: res.message });
      } else {
        setCloudMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setCloudMsg({ type: 'error', text: `Error al subir datos: ${err?.message || 'Error desconocido'}` });
    } finally {
      setIsPushingCloud(false);
    }
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutrimayorista_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackupJson(content);
        if (ok) {
          alert('¡Respaldo importado y cargado con éxito!');
        } else {
          alert('Error: el archivo no tiene un formato de respaldo JSON válido.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 4 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }

    const ok = updateAdminPassword(newPassword);
    if (ok) {
      setPasswordMsg({ type: 'success', text: '¡Contraseña actualizada con éxito!' });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: 'Error al actualizar contraseña.' });
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        '¿Está seguro de restaurar el catálogo y configuración a los datos iniciales de fábrica? Esta acción reemplazará los productos actuales.'
      )
    ) {
      resetAllDataToDefaults();
      alert('Datos restaurados correctamente.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Supabase Cloud Database Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isCloudConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Base de Datos en la Nube (Supabase)</span>
                {isCloudConnected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Conectado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    Modo Local (Listo)
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {cloudStatusText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshFromCloud()}
              disabled={isCloudSyncing}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Recargar datos desde la nube"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refrescar</span>
            </button>
          </div>
        </div>

        {cloudMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 ${
              cloudMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {cloudMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{cloudMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveCloudConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project URL de Supabase
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Se encuentra en Supabase &gt; Project Settings &gt; API
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Anon / Public API Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Clave pública 'anon' de tu proyecto Supabase
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500 max-w-md">
              Scripts SQL listos en la carpeta <code className="text-slate-700 font-mono bg-slate-100 px-1.5 py-0.5 rounded">/supabase/schema.sql</code>.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isTestingCloud}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Cloud className="w-4 h-4" />
                <span>{isTestingCloud ? 'Probando conexión...' : 'Guardar y Probar Conexión'}</span>
              </button>

              <button
                type="button"
                onClick={handlePushDataToCloud}
                disabled={isPushingCloud || !supabaseUrl}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                title="Sube los productos y preventistas actuales de este navegador a Supabase"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isPushingCloud ? 'Subiendo...' : 'Subir Catálogo Actual a Supabase'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* JSON Backup & Restore Tools */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Respaldos Locales en Archivo JSON</span>
            <span className="text-[11px] text-slate-500 block">Descarga o restaura una copia completa de tus productos y precios.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Descargar Respaldo</span>
            </button>

            <label className="py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Cargar Respaldo</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 2. Company Config */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Datos Generales de la Empresa
            </h3>
            <p className="text-xs text-slate-500">
              Configura el nombre comercial y el número de atención central
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveCompanySettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de la Empresa / Distribuidora
              </label>
              <input
                id="settings-company-name"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="NutriMayorista Pet Food"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Central de la Empresa (Fallback)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="settings-default-whatsapp"
                  type="text"
                  required
                  value={defaultWhatsApp}
                  onChange={(e) => setDefaultWhatsApp(e.target.value)}
                  placeholder="5491134567890"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Se usará cuando el cliente no acceda con enlace de preventista específico.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              Barra de Anuncios Superior
            </label>
            <input
              id="settings-announcement"
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Ej: Envíos bonificados en pedidos superiores a $150.000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              id="btn-save-settings"
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              {savedSettings ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Configuración</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Progressive Web App (PWA) & Mobile Installation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Aplicación Web Progresiva (PWA Instalable)
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Activa
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Instala tanto el panel como los enlaces de preventistas como una aplicación nativa en celulares y computadoras
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <PWAInstallButton variant="primary" label="Instalar esta App en tu Dispositivo" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <span>🚀</span>
              <span>Sin Descargas de Tiendas</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Tus clientes y preventistas pueden instalar la app directamente desde Chrome, Safari o Edge con 1 toque sin pasar por Play Store o App Store.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Funcionamiento Offline</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Los productos y precios se guardan en el dispositivo para que el catálogo cargue de inmediato incluso con baja señal.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <span>📲</span>
              <span>Icono en Pantalla de Inicio</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Se abre en pantalla completa sin barra de navegación del navegador, brindando la experiencia de una app profesional.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Security & Password */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Seguridad y Contraseña del Administrador
            </h3>
            <p className="text-xs text-slate-500">
              Modifica la clave de acceso al panel de administración
            </p>
          </div>
        </div>

        {passwordMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {passwordMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nueva Contraseña <span className="text-rose-500">*</span>
              </label>
              <input
                id="settings-new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirmar Nueva Contraseña <span className="text-rose-500">*</span>
              </label>
              <input
                id="settings-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita la nueva contraseña"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Usuario de acceso: <strong className="font-mono text-slate-800">admin</strong>
            </div>
            <button
              id="btn-update-password"
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Actualizar Contraseña</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Danger Zone / Reset */}
      <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-rose-900">
            Restablecer Datos de Demostración
          </h4>
          <p className="text-xs text-rose-700/80 mt-0.5 max-w-lg">
            Si deseas reiniciar los productos, categorías y preventistas al catálogo de muestra inicial.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="py-2 px-3.5 rounded-xl bg-white border border-rose-300 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Catálogo Inicial</span>
        </button>
      </div>
    </div>
  );
};
