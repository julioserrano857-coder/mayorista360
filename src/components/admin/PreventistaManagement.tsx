import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Preventista } from '../../types';
import { PreventistaFormModal } from './PreventistaFormModal';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Phone,
  UserCheck,
  MapPin,
  QrCode,
  Share2,
  Sparkles,
  Building2,
  X
} from 'lucide-react';

export const PreventistaManagement: React.FC = () => {
  const { preventistas, deletePreventista, getPreventistaShareUrl, getClientCatalogUrl, settings } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreventista, setEditingPreventista] = useState<Preventista | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQrModal, setActiveQrModal] = useState<{ name: string; url: string } | null>(null);

  const handleOpenCreate = () => {
    setEditingPreventista(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Preventista) => {
    setEditingPreventista(p);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al preventista "${name}"?`)) {
      deletePreventista(id);
    }
  };

  const handleCopyLink = (preventista: Preventista) => {
    const url = getPreventistaShareUrl(preventista.slug);
    navigator.clipboard.writeText(url);
    setCopiedId(preventista.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generalUrl = getClientCatalogUrl();

  return (
    <div className="space-y-6">
      {/* Header & Explainer */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            Gestión de Preventistas y Generador de Enlaces
          </h3>
        </div>

        <button
          id="btn-create-preventista"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Preventista</span>
        </button>
      </div>

      {/* Fallback General Link Card */}
      <div className="bg-slate-900 text-slate-100 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">
                Enlace General de la Empresa (Sin preventista asignado)
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Por defecto
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Los pedidos enviados desde este enlace van al WhatsApp general: <strong>+{settings.defaultWhatsApp}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(generalUrl);
              setCopiedId('general');
              setTimeout(() => setCopiedId(null), 2000);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            {copiedId === 'general' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Enlace General</span>
              </>
            )}
          </button>

          <a
            href={generalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            title="Abrir como cliente"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Preventistas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {preventistas.map((prev) => {
          const shareUrl = getPreventistaShareUrl(prev.slug);
          const isCopied = copiedId === prev.id;

          return (
            <div
              key={prev.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:border-emerald-300 transition-all group"
            >
              <div>
                {/* Header with status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-sm border border-emerald-200">
                      {prev.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base leading-tight">
                        {prev.name}
                      </h4>
                      {prev.zone ? (
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {prev.zone}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Sin zona específica</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(prev)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Editar datos"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(prev.id, prev.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Eliminar preventista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono font-bold">+{prev.whatsapp}</span>
                  </div>
                  <a
                    href={`https://wa.me/${prev.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
                  >
                    <span>Abrir Chat</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Link generator box */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Enlace Único del Preventista:
                  </label>
                  <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] font-mono text-emerald-900 break-all select-all">
                    {shareUrl}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  id={`btn-copy-link-${prev.id}`}
                  onClick={() => handleCopyLink(prev)}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 ${
                    isCopied
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Enlace</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveQrModal({ name: prev.name, url: shareUrl })}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  title="Ver Código QR"
                >
                  <QrCode className="w-4 h-4" />
                </button>

                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  title="Abrir como cliente"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code Modal */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setActiveQrModal(null)}
          />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 z-10 shadow-2xl border border-slate-200 animate-scale-up">
            <button
              onClick={() => setActiveQrModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2 font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">
                Código QR de Preventista
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {activeQrModal.name}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  activeQrModal.url
                )}`}
                alt="QR Code"
                className="w-44 h-44 rounded-lg shadow-xs"
              />
            </div>

            <div className="text-[11px] text-slate-500 font-mono break-all p-2 bg-slate-100 rounded-lg">
              {activeQrModal.url}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(activeQrModal.url);
                alert('¡Enlace copiado al portapapeles!');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Copiar Enlace
            </button>
          </div>
        </div>
      )}

      {/* Preventista Modal */}
      <PreventistaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preventistaToEdit={editingPreventista}
      />
    </div>
  );
};
