import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Filter,
  User,
  ShoppingBag,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  PackageCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Users
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';

export const OrdersManagement: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    clearDeliveredOrders,
    preventistas,
    settings
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | OrderStatus>('Todos');
  const [preventistaFilter, setPreventistaFilter] = useState<string>('Todos');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Formatting helpers
  const formatCurrency = (val: number) => {
    const value = Math.round(val * 100) / 100;
    const hasCents = Math.abs(value % 1) > 0.001;
    const fractionDigits = hasCents ? 2 : 0;
    return `${settings.currencySymbol || '$'}${value.toLocaleString('es-AR', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    })}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Date check helpers
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const isCurrentMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = order.code.toLowerCase().includes(q);
        const matchesClient = (order.clientName || '').toLowerCase().includes(q);
        const matchesPrev = (order.preventistaName || '').toLowerCase().includes(q);
        const matchesItems = order.items.some((it) =>
          it.productName.toLowerCase().includes(q)
        );
        if (!matchesCode && !matchesClient && !matchesPrev && !matchesItems) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'Todos' && order.status !== statusFilter) {
        return false;
      }

      // 3. Preventista filter
      if (preventistaFilter !== 'Todos') {
        if (preventistaFilter === 'central') {
          if (order.preventistaId) return false;
        } else {
          if (order.preventistaId !== preventistaFilter) return false;
        }
      }

      // 4. Date filter
      if (dateFilter === 'today' && !isToday(order.createdAt)) {
        return false;
      }
      if (dateFilter === 'month' && !isCurrentMonth(order.createdAt)) {
        return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, preventistaFilter, dateFilter]);

  // General KPIs (Calculated based on active date filter if selected, or overall)
  const stats = useMemo(() => {
    const baseOrders = orders.filter((o) => {
      if (dateFilter === 'today') return isToday(o.createdAt);
      if (dateFilter === 'month') return isCurrentMonth(o.createdAt);
      return true;
    });

    const totalOrdersCount = baseOrders.length;
    const pendingCount = baseOrders.filter((o) => o.status === 'Pendiente').length;
    const deliveredCount = baseOrders.filter((o) => o.status === 'Entregado').length;
    const totalRevenue = baseOrders
      .filter((o) => o.status !== 'Cancelado')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const totalUnitsSold = baseOrders
      .filter((o) => o.status !== 'Cancelado')
      .reduce((sum, o) => sum + o.totalUnits, 0);

    // Sales by preventista
    const salesByPreventista: Record<
      string,
      { name: string; totalAmount: number; totalOrders: number; totalUnits: number }
    > = {};

    baseOrders
      .filter((o) => o.status !== 'Cancelado')
      .forEach((o) => {
        const key = o.preventistaId || 'central';
        const name = o.preventistaName || 'Central Directa';
        if (!salesByPreventista[key]) {
          salesByPreventista[key] = { name, totalAmount: 0, totalOrders: 0, totalUnits: 0 };
        }
        salesByPreventista[key].totalAmount += o.totalAmount;
        salesByPreventista[key].totalOrders += 1;
        salesByPreventista[key].totalUnits += o.totalUnits;
      });

    return {
      totalOrdersCount,
      pendingCount,
      deliveredCount,
      totalRevenue,
      totalUnitsSold,
      salesByPreventista: Object.values(salesByPreventista).sort(
        (a, b) => b.totalAmount - a.totalAmount
      )
    };
  }, [orders, dateFilter]);

  const handleCopyOrderText = (order: Order) => {
    const lines = [
      `📦 PEDIDO #${order.code}`,
      `📅 Fecha: ${formatDate(order.createdAt)}`,
      `👤 Preventista: ${order.preventistaName}`,
      order.clientName ? `🏪 Cliente: ${order.clientName}` : '',
      `📋 ESTADO: ${order.status}`,
      `\n🛍️ PRODUCTOS:`,
      ...order.items.map(
        (it) => `• ${it.quantity}x ${it.productName}${it.weight ? ` (${it.weight})` : ''} - ${formatCurrency(it.subtotal)}`
      ),
      `\n📊 Total bultos: ${order.totalUnits}`,
      `💰 Total: ${formatCurrency(order.totalAmount)}`,
      order.notes ? `\n📝 Nota: ${order.notes}` : ''
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pendiente
          </span>
        );
      case 'Entregado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Entregado
          </span>
        );
      case 'Cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Title & Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
            <PackageCheck className="w-4 h-4" />
            Gestión de Pedidos & Ventas
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Registro de Pedidos Recibidos
          </h2>
        </div>

        {/* Date Filter & Clear Delivered button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateFilter === 'month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Este Mes
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoy
            </button>
          </div>

          {stats.deliveredCount > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Borrar los pedidos marcados como Entregado para limpiar la vista"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar entregados ({stats.deliveredCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation modal for clearing delivered */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                ¿Eliminar {stats.deliveredCount} pedidos entregados?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Esto removerá de la lista los pedidos que ya fueron entregados para mantener tu panel despejado.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  clearDeliveredOrders();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
              >
                Sí, limpiar entregados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Pedidos</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.totalOrdersCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <span>{stats.pendingCount} pendientes</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">{stats.deliveredCount} entregados</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Ventas Totales</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 truncate">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {dateFilter === 'today' ? 'Vendido hoy' : dateFilter === 'month' ? 'Vendido este mes' : 'Ventas acumuladas'}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Bultos / Unidades</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.totalUnitsSold}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Unidades solicitadas en pedidos
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Preventistas Activos</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.salesByPreventista.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Con ventas en el período
          </div>
        </div>
      </div>

      {/* Sales by Preventista Section */}
      {stats.salesByPreventista.length > 0 && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              Rendimiento y Ventas por Preventista ({dateFilter === 'today' ? 'Hoy' : dateFilter === 'month' ? 'Este Mes' : 'Total'})
            </h3>
            <span className="text-[11px] text-slate-500">
              {stats.salesByPreventista.length} preventistas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.salesByPreventista.map((prev, idx) => (
              <div
                key={idx}
                className="bg-slate-50/90 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{prev.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {prev.totalOrders} pedidos • {prev.totalUnits} bultos
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-700">
                    {formatCurrency(prev.totalAmount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input (4-digit code, client, preventista, product) */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="input-search-orders"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código (#4821), preventista, cliente o producto..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer py-1"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Pendiente">Solo Pendientes</option>
              <option value="Entregado">Solo Entregados</option>
              <option value="Cancelado">Solo Cancelados</option>
            </select>
          </div>

          {/* Preventista filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={preventistaFilter}
              onChange={(e) => setPreventistaFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer py-1"
            >
              <option value="Todos">Todos los Preventistas</option>
              <option value="central">Central Directa</option>
              {preventistas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <PackageCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              No se encontraron pedidos
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || statusFilter !== 'Todos' || preventistaFilter !== 'Todos' || dateFilter !== 'all'
                ? 'Prueba modificando los filtros o el código de búsqueda para ver más resultados.'
                : 'Cuando los clientes finalicen compras desde el catálogo, aparecerán aquí con su código de 4 dígitos.'}
            </p>
          </div>
          {(searchQuery || statusFilter !== 'Todos' || preventistaFilter !== 'Todos' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('Todos');
                setPreventistaFilter('Todos');
                setDateFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Limpiar todos los filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  order.status === 'Pendiente'
                    ? 'border-amber-200/90 hover:border-amber-300'
                    : order.status === 'Entregado'
                    ? 'border-slate-200 opacity-90'
                    : 'border-rose-200 opacity-75'
                }`}
              >
                {/* Order Summary Bar */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Code, Date, Preventista, Client */}
                  <div className="flex items-start gap-3.5">
                    {/* 4-digit code badge */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-2.5 text-center shrink-0 min-w-[72px] shadow-sm">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest">
                        CÓDIGO
                      </span>
                      <span className="text-lg font-mono font-black tracking-wider text-emerald-400">
                        #{order.code}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(order.status)}

                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          <User className="w-3 h-3 text-emerald-700" />
                          {order.preventistaName}
                        </span>

                        {order.clientName && (
                          <span className="text-xs text-slate-600 font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100">
                            Cliente: {order.clientName}
                          </span>
                        )}
                      </div>

                      {order.notes && (
                        <p className="text-xs text-slate-500 italic line-clamp-1 pt-0.5">
                          Nota: "{order.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Totals, Actions & Status toggle */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <div className="text-[11px] text-slate-500 font-medium">
                        {order.totalUnits} bultos ({order.items.length} productos)
                      </div>
                      <div className="text-base sm:text-lg font-black text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </div>

                    {/* Status Changer Quick Buttons */}
                    <div className="flex items-center gap-1.5">
                      {order.status !== 'Entregado' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Entregado')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          title="Marcar como entregado"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Marcar Entregado</span>
                        </button>
                      )}

                      {order.status === 'Entregado' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Pendiente')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                          title="Volver a poner en pendiente"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Pasar a Pendiente</span>
                        </button>
                      )}

                      {(order.status === 'Pendiente' || order.status === 'Entregado') && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Cancelar el pedido #${order.code}?`)) {
                              updateOrderStatus(order.id, 'Cancelado');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
                          title="Cancelar pedido"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancelar</span>
                        </button>
                      )}

                      {order.status === 'Cancelado' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Pendiente')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                          title="Reactivar pedido cancelado"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reactivar</span>
                        </button>
                      )}

                      {/* Copy Details */}
                      <button
                        onClick={() => handleCopyOrderText(order)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                        title="Copiar resumen del pedido"
                      >
                        {copiedOrderId === order.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* Expand / Collapse items button */}
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title={isExpanded ? 'Ocultar productos' : 'Ver productos del pedido'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {/* Delete single order */}
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar el pedido #${order.code}?`)) {
                            deleteOrder(order.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Products Accordion */}
                {isExpanded && (
                  <div className="bg-slate-50/80 p-4 sm:p-5 border-t border-slate-200 animate-fade-in space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                        Detalle de Productos ({order.items.length})
                      </span>
                      {order.preventistaWhatsapp && (
                        <a
                          href={`https://wa.me/${order.preventistaWhatsapp}?text=${encodeURIComponent(
                            `Hola! Te consulto sobre el pedido #${order.code}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-[11px] underline"
                        >
                          <Phone className="w-3 h-3" />
                          Chat con {order.preventistaName}
                        </a>
                      )}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                          <tr>
                            <th className="py-2 px-3">Cant.</th>
                            <th className="py-2 px-3">Producto</th>
                            <th className="py-2 px-3 text-right">Precio Unit.</th>
                            <th className="py-2 px-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {order.items.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-bold text-emerald-700">
                                {item.quantity}x
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-semibold text-slate-900">{item.productName}</span>
                                {item.weight && (
                                  <span className="text-slate-500 text-[11px] ml-1.5 font-normal">
                                    ({item.weight})
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-600">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                {formatCurrency(item.subtotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                          <tr>
                            <td colSpan={2} className="py-2.5 px-3 text-slate-700">
                              Total del Pedido ({order.totalUnits} bultos)
                            </td>
                            <td colSpan={2} className="py-2.5 px-3 text-right text-sm text-emerald-800 font-black">
                              {formatCurrency(order.totalAmount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {order.notes && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                        <span className="font-bold shrink-0">Nota del Cliente:</span>
                        <span>{order.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
