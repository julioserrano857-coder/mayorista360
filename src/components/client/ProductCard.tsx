import React, { useState, memo } from 'react';
import { Product, Category } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/whatsapp';
import { Plus, Minus, Check, ShoppingBag, AlertCircle, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  category?: Category;
  layoutMode?: 'grid' | 'list';
  onQuickView?: (product: Product) => void;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
  product,
  category: propCategory,
  layoutMode = 'grid',
  onQuickView
}) => {
  const { settings, categories, addToCart, cart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Find category name if not passed as prop
  const category = propCategory || categories.find((c) => c.id === product.categoryId);

  // Check if product is already in cart
  const cartItem = cart.find((item) => item.product.id === product.id);
  const isOutOfStock = product.status === 'Sin Stock';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleIncrement = () => {
    setQuantity((q) => q + 1);
  };

  const handleDecrement = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const getSpeciesBadge = (species: Product['species']) => {
    switch (species) {
      case 'Perro':
        return { label: 'Perro', icon: '🐶', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'Gato':
        return { label: 'Gato', icon: '🐱', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Otros', icon: '🐾', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
  };

  const spBadge = getSpeciesBadge(product.species);

  /* ---------------------------------------------------- */
  /* LIST VIEW MODE (Ideal for rapid mobile orders)       */
  /* ---------------------------------------------------- */
  if (layoutMode === 'list') {
    return (
      <div
        id={`product-list-item-${product.id}`}
        className={`group bg-white rounded-2xl border transition-all p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
          isOutOfStock
            ? 'border-slate-200 bg-slate-50/70 opacity-75'
            : 'border-slate-200/90 hover:border-sky-400 hover:shadow-md'
        }`}
      >
        {/* Left: Thumbnail & Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/70">
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                isOutOfStock ? 'grayscale-[60%]' : ''
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80';
              }}
            />
            {cartItem && (
              <span className="absolute bottom-0 inset-x-0 bg-orange-600/90 backdrop-blur-xs text-white text-[9px] font-black text-center py-0.5">
                {cartItem.quantity} en pedido
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-1 text-[10px]">
              {product.brand && (
                <span className="font-extrabold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 tracking-wider">
                  {product.brand}
                </span>
              )}
              <span className="font-black text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {product.weight}
              </span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold border ${spBadge.bg}`}>
                <span>{spBadge.icon}</span>
                <span>{spBadge.label}</span>
              </span>
              {product.sku && (
                <span className="font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 hidden sm:inline-block">
                  Cód: {product.sku}
                </span>
              )}
              {isOutOfStock && (
                <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <AlertCircle className="w-2.5 h-2.5" /> Sin stock
                </span>
              )}
            </div>

            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-1 sm:line-clamp-2">
              {product.name}
            </h4>

            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xs sm:text-sm font-black text-slate-950">
                {formatCurrency(product.price, settings.currencySymbol)}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                / bulto cerrado
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quantity Stepper & Add CTA */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {isOutOfStock ? (
            <span className="text-xs text-slate-400 font-semibold italic py-1.5 px-3 bg-slate-100 rounded-xl">
              Sin stock disponible
            </span>
          ) : (
            <>
              {/* Stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white active:scale-95 transition-all touch-action-manipulation"
                  aria-label="Disminuir"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-8 sm:w-9 text-center bg-transparent text-xs font-bold text-slate-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white active:scale-95 transition-all touch-action-manipulation"
                  aria-label="Aumentar"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 touch-action-manipulation ${
                  justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>¡Listo!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------- */
  /* GRID VIEW MODE (Responsive 2-col mobile / 3-4 on PC) */
  /* ---------------------------------------------------- */
  return (
    <div
      id={`product-card-${product.id}`}
      className={`group relative bg-white rounded-2xl sm:rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        isOutOfStock
          ? 'border-slate-200 opacity-85 bg-slate-50/60'
          : 'border-slate-200/90 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/10'
      }`}
    >
      {/* Image Container - Square Aspect for Clean Mobile 2-Col Grid */}
      <div className="relative aspect-square w-full bg-slate-100/90 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isOutOfStock ? 'grayscale-[60%]' : ''
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-start justify-between gap-1 pointer-events-none">
          <div className="flex flex-col gap-1 items-start">
            <span
              className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold border backdrop-blur-md shadow-2xs ${spBadge.bg}`}
            >
              <span>{spBadge.icon}</span>
              <span className="hidden xs:inline">{spBadge.label}</span>
            </span>

            {product.brand && (
              <span className="hidden xs:inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md">
                {product.brand}
              </span>
            )}
          </div>

          {/* Status Badge */}
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-rose-600 text-white shadow-xs">
              <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Agotado</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
              Disponible
            </span>
          )}
        </div>

        {/* Quick View Button */}
        {onQuickView && (
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="absolute bottom-2 right-2 p-1.5 sm:p-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 shadow-md opacity-0 group-hover:opacity-100 transition-all backdrop-blur-xs active:scale-95"
            title="Vista rápida"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}

        {/* Already in cart badge */}
        {cartItem && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-orange-600 text-white text-[10px] sm:text-[11px] font-extrabold shadow-sm backdrop-blur-xs">
            {cartItem.quantity} en pedido
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Weight Tags (Technical Spec Header) */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1 gap-1">
            <span className="font-extrabold uppercase tracking-wider text-slate-600 truncate">
              {product.brand || category?.name || 'Distribución'}
            </span>
            <span className="shrink-0 font-black bg-amber-50 text-amber-950 px-1.5 py-0.5 rounded border border-amber-200 text-[10px] sm:text-[11px]">
              {product.weight}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 mb-1 group-hover:text-sky-700 transition-colors">
            {product.name}
          </h3>

          {/* SKU / Code if present */}
          {product.sku && (
            <div className="text-[10px] font-mono text-slate-500 mb-1 hidden xs:block">
              Cód: {product.sku}
            </div>
          )}

          {product.description && (
            <p className="text-[11px] text-slate-500 line-clamp-1 mb-2 hidden sm:block">
              {product.description}
            </p>
          )}
        </div>

        {/* Price and Actions */}
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold leading-none mb-0.5">
                Mayorista
              </span>
              <span className="text-sm sm:text-lg font-black text-slate-950 tracking-tight">
                {formatCurrency(product.price, settings.currencySymbol)}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500">
              x bulto
            </span>
          </div>

          {/* Controls */}
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2 px-2 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-semibold cursor-not-allowed border border-slate-200 text-center"
            >
              Sin stock
            </button>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white active:scale-95 transition-all touch-action-manipulation"
                  aria-label="Disminuir"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-6 sm:w-8 text-center bg-transparent text-xs font-bold text-slate-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white active:scale-95 transition-all touch-action-manipulation"
                  aria-label="Aumentar"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Add Button */}
              <button
                id={`btn-add-product-${product.id}`}
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 py-1.5 sm:py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs active:scale-95 touch-action-manipulation ${
                  justAdded
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white shadow-orange-500/20'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="hidden xs:inline">Listo</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardComponent);
