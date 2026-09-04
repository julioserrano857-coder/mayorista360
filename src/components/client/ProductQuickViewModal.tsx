import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/whatsapp';
import { X, Plus, Minus, ShoppingBag, Check, AlertCircle, ShieldCheck, Truck } from 'lucide-react';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose
}) => {
  const { settings, categories, addToCart, cart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const category = categories.find((c) => c.id === product.categoryId);
  const isOutOfStock = product.status === 'Sin Stock';
  const cartItem = cart.find((i) => i.product.id === product.id);

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 z-10 animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80';
              }}
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-md">
                  Sin Stock
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {category?.name && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {category.name}
                  </span>
                )}
                {product.brand && (
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                    {product.brand}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight mb-2">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                <span>Presentación: <strong className="text-slate-800">{product.weight}</strong></span>
                {product.sku && (
                  <>
                    <span>•</span>
                    <span>SKU: <strong className="font-mono text-slate-800">{product.sku}</strong></span>
                  </>
                )}
              </div>

              {product.description && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {product.description}
                </p>
              )}

              <div className="space-y-1.5 py-2 border-y border-slate-100 text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Garantía de calidad y fecha de vencimiento óptima</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Distribución mayorista directa con stock verificado</span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3">
                <span className="text-xs uppercase font-bold text-slate-400 block">
                  Precio Mayorista por Unidad
                </span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(product.price, settings.currencySymbol)}
                </span>
              </div>

              {isOutOfStock ? (
                <div className="p-3 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold text-center border border-slate-200">
                  Producto actualmente sin stock disponible
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white active:scale-95 touch-action-manipulation cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-10 text-center bg-transparent text-sm font-bold text-slate-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white active:scale-95 touch-action-manipulation cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 touch-action-manipulation cursor-pointer ${
                      justAdded
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>¡Agregado al pedido!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Agregar al Pedido</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
