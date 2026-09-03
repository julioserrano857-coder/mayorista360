import React, { useState, useMemo, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/client/Header';
import { PreventistaBanner } from './components/client/PreventistaBanner';
import { CategoryBar } from './components/client/CategoryBar';
import { ProductCard } from './components/client/ProductCard';
import { CartDrawer } from './components/client/CartDrawer';
import { CheckoutModal } from './components/client/CheckoutModal';
import { ProductQuickViewModal } from './components/client/ProductQuickViewModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LandingPage } from './components/landing/LandingPage';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { Species, Product } from './types';
import { formatCurrency } from './utils/whatsapp';
import {
  ShoppingBag,
  Package,
  Search,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Truck,
  Building2,
  SlidersHorizontal,
  Layers,
  LayoutGrid,
  List,
  ArrowRight
} from 'lucide-react';

function MainApp() {
  const {
    products,
    categories,
    settings,
    activePreventista,
    cartCount,
    cartTotal,
    isAdminAuthenticated
  } = useStore();

  // Navigation & View Mode State: 'landing' (default portal & login) | 'catalog' (client store) | 'admin' (control panel)
  const [viewMode, setViewMode] = useState<'landing' | 'catalog' | 'admin'>(() => {
    // If incoming link has customer view params, go directly to client catalog
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search.includes('view=pedidos') || search.includes('ref=') || search.includes('catalogo') || search.includes('pedido') || search.includes('cliente')) {
        return 'catalog';
      }
    }
    return 'landing';
  });

  // Listen to popstate or url changes
  useEffect(() => {
    const handleUrlChange = () => {
      const search = window.location.search;
      if (search.includes('view=pedidos') || search.includes('ref=') || search.includes('catalogo') || search.includes('pedido') || search.includes('cliente')) {
        setViewMode('catalog');
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Client Catalog Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState<Species | 'Todos'>('Todos');
  const [stockFilterOnly, setStockFilterOnly] = useState(false);

  // View Mode: 'grid' (2-column on mobile, 3-4 on PC) | 'list' (compact rapid wholesale rows)
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  // Progressive rendering batch count for instant initial load on phones
  const [visibleCount, setVisibleCount] = useState(24);

  // Modals & Drawers State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Scroll to top on viewMode change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewMode]);

  // Reset visibleCount on filter or search change to keep DOM render instantaneous
  useEffect(() => {
    setVisibleCount(24);
  }, [searchTerm, selectedCategoryId, selectedSpecies, stockFilterOnly]);

  // Filtered Products Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search term
      const matchesSearch =
        searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.weight.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategoryId === 'all' || product.categoryId === selectedCategoryId;

      // Species filter
      const matchesSpecies =
        selectedSpecies === 'Todos' || product.species === selectedSpecies;

      // Stock filter
      const matchesStock = !stockFilterOnly || product.status === 'Disponible';

      return matchesSearch && matchesCategory && matchesSpecies && matchesStock;
    });
  }, [products, searchTerm, selectedCategoryId, selectedSpecies, stockFilterOnly]);

  // Slice for progressive rendering
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // 1. Login Page View (Simple dedicated login screen to enter the admin panel)
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onLoginSuccess={() => setViewMode('admin')}
        />
        <OfflineIndicator />
      </>
    );
  }

  // 2. Admin Dashboard View (When authenticated and in admin mode)
  if (viewMode === 'admin') {
    if (!isAdminAuthenticated) {
      // If session lost, revert to login page
      return (
        <>
          <LandingPage
            onLoginSuccess={() => setViewMode('admin')}
          />
          <OfflineIndicator />
        </>
      );
    }

    return (
      <>
        <AdminDashboard
          onBackToCatalog={() => setViewMode('catalog')}
          onGoToLanding={() => setViewMode('landing')}
        />
        <OfflineIndicator />
      </>
    );
  }

  // 3. Client Wholesale Catalog View (100% pure ordering catalog, zero admin buttons)
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* 1. Global Header (Pure Client) */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedSpecies={selectedSpecies}
        onSpeciesChange={setSelectedSpecies}
        onOpenCart={() => setIsCartOpen(true)}
        stockFilterOnly={stockFilterOnly}
        onToggleStockFilter={() => setStockFilterOnly(!stockFilterOnly)}
      />

      {/* 2. Preventista / Channel Announcement Banner */}
      <PreventistaBanner />

      {/* 3. Category Filter Scrollbar */}
      <CategoryBar
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* 4. Main Catalog Content */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 ${cartCount > 0 ? 'pb-24 sm:pb-8' : ''}`}>
        {/* Results summary bar with View Switcher */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 mb-4 sm:mb-6">
          <div className="text-xs text-slate-600">
            Mostrando <strong>{Math.min(visibleCount, filteredProducts.length)}</strong> de{' '}
            <strong>{filteredProducts.length}</strong> productos
            {searchTerm && <span> para "{searchTerm}"</span>}
            {(searchTerm || selectedCategoryId !== 'all' || selectedSpecies !== 'Todos' || stockFilterOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategoryId('all');
                  setSelectedSpecies('Todos');
                  setStockFilterOnly(false);
                }}
                className="ml-2 text-sky-600 hover:text-sky-700 font-bold hover:underline cursor-pointer touch-action-manipulation"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* View mode toggle (Cuadrícula 2-col vs Lista Rápida) */}
          <div className="flex items-center gap-1 self-start xs:self-auto bg-slate-200/80 p-1 rounded-xl border border-slate-200">
            <button
              id="btn-view-grid"
              type="button"
              onClick={() => setLayoutMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all touch-action-manipulation cursor-pointer ${
                layoutMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vista en cuadrícula (2 columnas en celular)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cuadrícula</span>
            </button>
            <button
              id="btn-view-list"
              type="button"
              onClick={() => setLayoutMode('list')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all touch-action-manipulation cursor-pointer ${
                layoutMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vista en lista rápida (pedidos exprés)"
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista Rápida</span>
            </button>
          </div>
        </div>

        {/* Products Render (Grid or List) */}
        {filteredProducts.length > 0 ? (
          <>
            {layoutMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
                {visibleProducts.map((product) => {
                  const category = categories.find((c) => c.id === product.categoryId);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      category={category}
                      layoutMode="grid"
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2.5">
                {visibleProducts.map((product) => {
                  const category = categories.find((c) => c.id === product.categoryId);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      category={category}
                      layoutMode="list"
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  );
                })}
              </div>
            )}

            {/* Load More Button for Progressive Speed */}
            {filteredProducts.length > visibleCount && (
              <div className="mt-8 text-center">
                <button
                  id="btn-load-more-products"
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                  className="px-6 py-3 rounded-2xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-extrabold shadow-sm hover:shadow transition-all touch-action-manipulation active:scale-95 cursor-pointer"
                >
                  Cargar más productos ({filteredProducts.length - visibleCount} restantes)
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty Search or Filter State */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No encontramos productos coincidentes
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Prueba cambiando los términos de búsqueda o limpiando los filtros seleccionados.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategoryId('all');
                setSelectedSpecies('Todos');
                setStockFilterOnly(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs touch-action-manipulation cursor-pointer"
            >
              Ver todos los productos
            </button>
          </div>
        )}
      </main>

      {/* Floating Bottom Cart on Mobile */}
      {cartCount > 0 && (
        <div className="sm:hidden fixed bottom-3 inset-x-3 z-40 animate-fade-in-up">
          <button
            id="mobile-floating-cart-btn"
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 active:scale-[0.98] text-white rounded-2xl shadow-xl shadow-orange-500/35 flex items-center justify-between font-extrabold text-sm backdrop-blur-md border border-white/25 transition-transform touch-action-manipulation cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-white text-orange-600 text-xs flex items-center justify-center font-black shadow-xs">
                {cartCount}
              </span>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-orange-100 font-bold leading-none">Mi Pedido</div>
                <div className="text-xs font-black">Ver y Enviar Pedido</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-base">
                {formatCurrency(cartTotal, settings.currencySymbol)}
              </span>
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* 5. Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-10 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-2xl">🐾</span>
              <span className="font-extrabold text-base text-slate-900">
                {settings.companyName}
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-sm">
              Distribución mayorista directa de alimentos, medicamentos, snacks y accesorios para mascotas. Venta exclusiva a pet shops, veterinarias y forrajerías.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              Canales de Atención
            </h4>
            <div className="space-y-2 text-slate-500">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-600" />
                <span>Atención Central: +{settings.defaultWhatsApp}</span>
              </div>
              {activePreventista && (
                <div className="flex items-center gap-2 text-emerald-900 font-semibold bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Preventista asignado: {activePreventista.name}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              Información de Pedidos Mayoristas
            </h4>
            <div className="space-y-2 text-slate-500 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Envíos directos y programados a veterinarias y pet shops</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Venta exclusiva a comercios por bulto cerrado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Confirmación y procesamiento directo por WhatsApp</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <span>© {new Date().getFullYear()} {settings.companyName}. Todos los derechos reservados.</span>
          <span className="font-medium text-slate-500">Catálogo Digital Mayorista con Pedidos por WhatsApp</span>
        </div>
      </footer>

      {/* Cart Slide-over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* WhatsApp Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
