import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  buildWhatsAppOrderMessage,
  generateWhatsAppLink
} from '../../utils/whatsapp';
import {
  X,
  Send,
  UserCheck,
  Building2,
  Copy,
  Check,
  ExternalLink,
  ShoppingBag,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessOrder?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccessOrder
}) => {
  const { cart, settings, activePreventista, clearCart, addOrder } = useStore();

  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');

  if (!isOpen) return null;

  // Recipient: Active preventista's direct WhatsApp OR default company WhatsApp
  const targetPhone = activePreventista?.whatsapp || settings.defaultWhatsApp;
  const targetName = activePreventista?.name || settings.companyName || 'Ventas Central';

  // Preview message before submit
  const previewMessage = buildWhatsAppOrderMessage({
    items: cart,
    notes: notes.trim() || undefined,
    orderCode: '----'
  });

  const handleSendOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Anti doble envío: un clic = un pedido
    if (isSubmitting) return;

    // Safety: el carrito no puede estar vacío
    if (cart.length === 0) {
      alert('Tu pedido está vacío. Agregá productos antes de enviar.');
      return;
    }

    // Safety: if there is no destination WhatsApp number configured, block the order
    if (!targetPhone) {
      alert('Todavía no se configuró un WhatsApp de destino. Avisale al dueño para que lo cargue en Configuración.');
      return;
    }

    setIsSubmitting(true);

    // 1. Guardar el pedido en el sistema / base de datos Supabase
    const savedOrder = addOrder({
      clientName: clientName.trim() || undefined,
      notes: notes.trim() || undefined,
      items: cart,
      preventistaId: activePreventista?.id,
      preventistaName: activePreventista?.name || 'Central Directa',
      preventistaWhatsapp: targetPhone
    });

    setSubmittedCode(savedOrder.code);

    // 2. Construir el mensaje prehecho de WhatsApp con el código de 4 dígitos
    const finalOrderMessage = buildWhatsAppOrderMessage({
      items: cart,
      notes: notes.trim() || undefined,
      orderCode: savedOrder.code
    });

    setSubmittedMessage(finalOrderMessage);

    const waLink = generateWhatsAppLink(targetPhone, finalOrderMessage);
    setGeneratedLink(waLink);
    setIsSubmitted(true);

    // Celebratory feedback
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    // Open direct WhatsApp chat
    window.open(waLink, '_blank', 'noopener,noreferrer');

    if (onSuccessOrder) {
      onSuccessOrder();
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(submittedMessage || previewMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinishAndClear = () => {
    clearCart();
    setClientName('');
    setNotes('');
    setIsSubmitted(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 z-10 animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-bold shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  Enviar Pedido a WhatsApp
                </h3>
                <p className="text-xs text-emerald-100 font-medium">
                  {activePreventista ? `Directo al WhatsApp de ${activePreventista.name}` : 'Directo al WhatsApp de la empresa'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors touch-action-manipulation cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isSubmitted ? (
          /* Post-submission confirmation */
          <div className="p-5 sm:p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div>
              <h4 className="text-lg font-extrabold text-slate-900">
                ¡Pedido registrado con éxito!
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Se abrió WhatsApp para enviar el pedido a <strong>{targetName}</strong> (+{targetPhone}).
              </p>
            </div>

            {/* 4-digit code highlight box */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 block mb-1">
                Código de seguimiento asignado
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-emerald-700">
                #{submittedCode}
              </div>
              <p className="text-[11px] text-emerald-800 font-medium mt-1">
                Guarda este número para consultar tu pedido o informar al preventista
              </p>
            </div>

            {/* Reminder on confirmation screen */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs flex items-start gap-2.5 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Recordatorio:</strong>
                Revisa la ventana de WhatsApp y presiona el botón de <strong>Enviar</strong> para que el preventista reciba el pedido con su código <strong>#{submittedCode}</strong>.
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="font-bold text-slate-800">
                ¿No se abrió WhatsApp automáticamente?
              </div>
              <p className="text-slate-500">
                Puedes abrir el chat directamente o copiar el mensaje:
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 touch-action-manipulation"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir WhatsApp de nuevo
                </a>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 touch-action-manipulation cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '¡Copiado!' : 'Copiar Pedido'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                id="btn-confirm-order-sent-clear"
                type="button"
                onClick={handleFinishAndClear}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all touch-action-manipulation cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Listo, pedido enviado (Iniciar nuevo pedido)</span>
              </button>

              <button
                id="btn-review-modify-order"
                type="button"
                onClick={() => {
                  setIsSubmitting(false);
                  setIsSubmitted(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors touch-action-manipulation cursor-pointer"
              >
                Modificar o revisar productos del pedido
              </button>
            </div>
          </div>
        ) : (
          /* Fast WhatsApp Checkout */
          <form onSubmit={handleSendOrder} className="p-4 sm:p-5 space-y-3.5">
            {/* Direct Preventista info indicator */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  {activePreventista ? <UserCheck className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                    {activePreventista ? 'Preventista Asignado' : 'Central de Pedidos'}
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{targetName}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-medium">WhatsApp Directo</div>
                <div className="font-mono font-bold text-emerald-800 text-xs">+{targetPhone}</div>
              </div>
            </div>

            {/* KEY REMINDER BANNER */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs flex items-start gap-2.5 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold block text-amber-950">
                  Recordatorio para finalizar:
                </strong>
                Al presionar el botón verde, se registrará el pedido con un código de 4 dígitos y se abrirá WhatsApp con el mensaje armado.
              </div>
            </div>

            {/* Order Items List (Product Names Only) */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  Productos en tu pedido ({cart.length})
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {cart.reduce((acc, curr) => acc + curr.quantity, 0)} unidades
                </span>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs text-slate-700 divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.product.id} className="pt-1.5 first:pt-0 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-900 leading-snug">
                      <strong className="text-emerald-700 font-extrabold">{item.quantity}x</strong>{' '}
                      {item.product.name}
                      {item.product.weight && (
                        <span className="text-slate-500 text-[11px] ml-1">({item.product.weight})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Client / Business Name (Optional) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tu nombre o Nombre de tu comercio (opcional)
              </label>
              <input
                id="input-order-client-name"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Almacén El Centro / Juan Pérez"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs text-slate-900 focus:outline-none focus:border-emerald-600 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Campo opcional de Nota o Aclaración */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Nota o aclaración (opcional)
              </label>
              <input
                id="input-order-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Entregar por la mañana, pagar contra entrega, etc."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs text-slate-900 focus:outline-none focus:border-emerald-600 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Message Preview Accordion */}
            <details className="text-xs text-slate-600 bg-slate-100/80 rounded-xl p-2.5">
              <summary className="font-bold text-slate-700 cursor-pointer flex items-center justify-between select-none touch-action-manipulation">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                  Ver mensaje prehecho que se enviará
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold underline">Ver</span>
              </summary>
              <pre className="mt-2 p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] font-mono text-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {previewMessage}
              </pre>
            </details>

            {/* Action Buttons */}
            <div className="pt-1 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors order-2 sm:order-1 touch-action-manipulation cursor-pointer"
              >
                Seguir comprando
              </button>
              <button
                id="btn-confirm-send-whatsapp"
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 order-1 sm:order-2 touch-action-manipulation cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Pedido por WhatsApp</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
