import React from 'react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/whatsapp';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  UserCheck,
  Building2,
  ShieldCheck
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedCheckout
}) => {
  const {
    cart,
    cartCount,
    cartTotal,
    settings,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    activePreventista
  } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                  Pedido Mayorista
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {cartCount} {cartCount === 1 ? 'producto' : 'productos'} seleccionados
                </p>
              </div>
            </div>

            <button
              id="btn-close-cart"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Assigned Recipient Box */}
          <div className="px-4 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {activePreventista ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-slate-700">
                    Preventista: <strong>{activePreventista.name}</strong>
                  </span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-slate-700">
                    Atención: <strong>Central de Distribución</strong>
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Directo
            </span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Tu pedido está vacío
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mb-5">
                  Explora el catálogo mayorista y añade productos para armar tu cotización por WhatsApp.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  Ver Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="pt-3 first:pt-0 flex items-start gap-3 group"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-sm">
                        {item.product.weight}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatCurrency(item.product.price, settings.currencySymbol)} c/u
                      </span>
                    </div>

                    {/* Quantity controls & Line Total */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 active:scale-95 transition-all"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartQuantity(
                              item.product.id,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-8 text-center bg-transparent text-xs font-bold text-slate-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 active:scale-95 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {formatCurrency(
                          item.product.price * item.quantity,
                          settings.currencySymbol
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Actions */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/95 space-y-3 pb-safe">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Subtotal ({cartCount} unidades)</span>
                <button
                  onClick={clearCart}
                  className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 hover:underline cursor-pointer touch-action-manipulation"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vaciar pedido
                </button>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Estimado
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {formatCurrency(cartTotal, settings.currencySymbol)}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-md">
                  Precios Mayoristas
                </span>
              </div>

              {/* WhatsApp direct notice */}
              <div className="text-[11px] text-slate-600 bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between">
                <span>Destino: <strong>{activePreventista ? activePreventista.name : 'Central de Preventas'}</strong></span>
                <span className="font-mono font-bold text-emerald-800">+{activePreventista?.whatsapp || settings.defaultWhatsApp}</span>
              </div>

              <button
                id="btn-drawer-proceed-checkout"
                onClick={onProceedCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer touch-action-manipulation"
              >
                <span>Finalizar y Enviar al Preventista</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
