import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  Search,
  Phone,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { formatCurrency } from '../../utils/whatsapp';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenCart: () => void;
  stockFilterOnly: boolean;
  onToggleStockFilter: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  onOpenCart,
  stockFilterOnly,
  onToggleStockFilter
}) => {
  const { settings, activePreventista, cartCount, cartTotal } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Notice Banner */}
      {settings.announcement && (
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white px-4 py-1.5 text-xs sm:text-sm text-center font-semibold flex items-center justify-center gap-2 shadow-xs">
          <span>{settings.announcement}</span>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Brand (Client Pure View) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-bold text-xl ring-2 ring-white">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-xl text-slate-900 tracking-tight leading-none">
                  {settings.companyName}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] sm:text-[10px] font-extrabold bg-amber-500/10 text-amber-700 border border-amber-200 uppercase tracking-wider">
                  Mayorista
                </span>
              </div>

              {/* Compact & Always Visible Preventista Indicator */}
              <div className="mt-1 flex items-center">
                {activePreventista ? (
                  <span
                    id="header-preventista-badge"
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-[11px] shadow-2xs"
                    title={`Preventista asignado: ${activePreventista.name} (+${activePreventista.whatsapp})`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="font-medium text-emerald-700">Preventista:</span>
                    <strong className="font-black text-emerald-950 truncate max-w-[140px] sm:max-w-none">
                      {activePreventista.name}
                    </strong>
                  </span>
                ) : (
                  <span
                    id="header-preventista-badge"
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span className="text-slate-500">Atención:</span>
                    <strong className="font-bold text-slate-900">Ventas Central</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="search-products-desktop"
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nombre, marca o presentación..."
                className="w-full pl-10 pr-9 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 rounded-xl border border-slate-200/80 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none transition-all placeholder:text-slate-400 shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct WhatsApp info */}
            {activePreventista && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-mono">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>+{activePreventista.whatsapp}</span>
              </div>
            )}

            {/* In-Stock Filter Toggle */}
            <button
              id="btn-filter-stock-only"
              type="button"
              onClick={onToggleStockFilter}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 border transition-all touch-action-manipulation cursor-pointer shrink-0 ${
                stockFilterOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Filtrar solo artículos disponibles"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Solo disponibles</span>
              <span className="sm:hidden">En stock</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton variant="header" label="Instalar App" />

            {/* Cart Button */}
            <button
              id="header-btn-cart"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden xs:inline">Pedido</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center bg-white text-orange-700 font-extrabold text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] shadow-2xs">
                  {cartCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="hidden md:inline-block text-white/90 font-medium border-l border-white/30 pl-2">
                  {formatCurrency(cartTotal, settings.currencySymbol)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-products-mobile"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar productos en el catálogo..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-100 focus:bg-white text-base sm:text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none transition-all placeholder:text-slate-400 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 touch-action-manipulation cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
