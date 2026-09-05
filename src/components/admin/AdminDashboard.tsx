import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrdersManagement } from './OrdersManagement';
import { ProductManagement } from './ProductManagement';
import { CategoryManagement } from './CategoryManagement';
import { PreventistaManagement } from './PreventistaManagement';
import { SettingsManagement } from './SettingsManagement';
import {
  PackageCheck,
  Package,
  Layers,
  Users,
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToCatalog?: () => void;
  onGoToLanding?: () => void;
}

type AdminTab = 'orders' | 'products' | 'categories' | 'preventistas' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onGoToLanding }) => {
  const { logoutAdmin, settings, products, preventistas, categories, orders, newOrdersCount, markOrdersAsSeen } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pendiente').length;

  // Apenas el admin mira la pestaña de pedidos, los "nuevos" quedan vistos.
  useEffect(() => {
    if (activeTab === 'orders') {
      markOrdersAsSeen();
    }
  }, [activeTab, newOrdersCount, markOrdersAsSeen]);

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode; badge?: number; highlightBadge?: boolean }> = [
    {
      id: 'orders',
      label: 'Pedidos Recibidos',
      icon: <PackageCheck className="w-4 h-4" />,
      badge:
        newOrdersCount > 0
          ? newOrdersCount
          : pendingOrdersCount > 0
          ? pendingOrdersCount
          : orders.length,
      highlightBadge: newOrdersCount > 0 || pendingOrdersCount > 0
    },
    { id: 'products', label: 'Productos y Precios', icon: <Package className="w-4 h-4" />, badge: products.length },
    { id: 'categories', label: 'Categorías', icon: <Layers className="w-4 h-4" />, badge: categories.length },
    { id: 'preventistas', label: 'Preventistas y Links', icon: <Users className="w-4 h-4" />, badge: preventistas.length },
    { id: 'settings', label: 'Configuración y Clave', icon: <Settings className="w-4 h-4" /> }
  ];

  const handleLogout = () => {
    logoutAdmin();
    if (onGoToLanding) {
      onGoToLanding();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Admin Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                📦
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-white truncate">
                    Panel de Administración
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider shrink-0">
                    Mayorista
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight truncate">
                  {settings.companyName}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                id="btn-admin-logout"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pt-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 border-emerald-500 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        tab.highlightBadge
                          ? 'bg-amber-500 text-amber-950 font-black animate-pulse'
                          : isActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'orders' && <OrdersManagement />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
        {activeTab === 'preventistas' && <PreventistaManagement />}
        {activeTab === 'settings' && <SettingsManagement />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{settings.companyName} • Panel de Control Mayorista</span>
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Acceso seguro y actualización en tiempo real
          </span>
        </div>
      </footer>
    </div>
  );
};
