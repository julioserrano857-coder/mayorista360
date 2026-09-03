import React, { useState, useEffect } from 'react';
import { Preventista } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Save,
  UserCheck,
  Phone,
  MapPin,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { cleanWhatsAppNumber, generateSlug } from '../../utils/whatsapp';

interface PreventistaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  preventistaToEdit?: Preventista | null;
}

export const PreventistaFormModal: React.FC<PreventistaFormModalProps> = ({
  isOpen,
  onClose,
  preventistaToEdit
}) => {
  const { addPreventista, updatePreventista, getPreventistaShareUrl } = useStore();

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [zone, setZone] = useState('');
  const [active, setActive] = useState(true);
  const [createdPreventista, setCreatedPreventista] = useState<Preventista | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (preventistaToEdit) {
      setName(preventistaToEdit.name);
      setWhatsapp(preventistaToEdit.whatsapp);
      setZone(preventistaToEdit.zone || '');
      setActive(preventistaToEdit.active);
      setCreatedPreventista(null);
    } else {
      setName('');
      setWhatsapp('54911');
      setZone('');
      setActive(true);
      setCreatedPreventista(null);
    }
    setIsCopied(false);
  }, [preventistaToEdit, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setCreatedPreventista(null);
    setIsCopied(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) return;

    const cleanedPhone = cleanWhatsAppNumber(whatsapp);

    if (preventistaToEdit) {
      updatePreventista(preventistaToEdit.id, {
        name: name.trim(),
        whatsapp: cleanedPhone,
        zone: zone.trim() || undefined,
        active
      });
      handleClose();
    } else {
      const created = addPreventista({
        name: name.trim(),
        whatsapp: cleanedPhone,
        zone: zone.trim() || undefined,
        active
      });
      setCreatedPreventista(created);
    }
  };

  const previewSlug = generateSlug(name) || 'nombre_preventista';
  const previewUrl = getPreventistaShareUrl(previewSlug);

  const createdShareUrl = createdPreventista ? getPreventistaShareUrl(createdPreventista.slug) : '';

  const handleCopyCreatedUrl = () => {
    if (!createdShareUrl) return;
    navigator.clipboard.writeText(createdShareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 z-10 animate-scale-up">
        {createdPreventista ? (
          /* Success Screen with Generated Link */
          <div className="p-6 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-1.5">
                Preventista Registrado
              </span>
              <h3 className="text-lg font-black text-slate-900">
                ¡Enlace Creado con Éxito!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Preventista: <strong className="text-slate-800">{createdPreventista.name}</strong> • WhatsApp: +{createdPreventista.whatsapp}
              </p>
            </div>

            {/* Generated Link Display */}
            <div className="text-left bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-2 text-white">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Enlace Exclusivo del Preventista:</span>
                <span className="text-[10px] text-emerald-400 font-mono">100% aislado</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 break-all select-all">
                {createdShareUrl}
              </div>
              <p className="text-[11px] text-slate-400">
                Comparte este link con los clientes de este preventista. Todos sus pedidos llegarán a su WhatsApp.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              <button
                id="btn-copy-new-preventista-link"
                onClick={handleCopyCreatedUrl}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>¡Enlace Copiado al Portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Enlace del Preventista</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={createdShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                  <span>Abrir Catálogo</span>
                </a>

                <button
                  onClick={handleClose}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  Listo
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Creation / Edit Form */
          <>
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {preventistaToEdit ? 'Editar Preventista' : 'Nuevo Preventista'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Generador de enlaces y atención personalizada
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Preventista <span className="text-rose-500">*</span>
                </label>
                <input
                  id="form-preventista-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Juan Pérez / Mariana López"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Número de WhatsApp (con código de país) <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400">Ej: 5491123456789</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="form-preventista-whatsapp"
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="5491158941234"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Sin signos (+, -, espacios). Solo números con código de país.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Zona / Cobertura (Opcional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="form-preventista-zone"
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    placeholder="Ej: Zona Norte, Capital Federal, Interior..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Dynamic Link Preview */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enlace único que se creará:</span>
                </div>
                <code className="text-[11px] font-mono text-emerald-800 break-all block bg-white/80 p-2 rounded-lg border border-emerald-200">
                  {previewUrl}
                </code>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save-preventista-modal"
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{preventistaToEdit ? 'Guardar Cambios' : 'Crear Preventista y Generar Enlace'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
