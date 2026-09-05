import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductStatus } from '../../types';
import { formatCurrency } from '../../utils/whatsapp';
import { ProductFormModal } from './ProductFormModal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  Package,
  Layers,
  Filter
} from 'lucide-react';

export const ProductManagement: React.FC = () => {
  const {
    products,
    categories,
    deleteProduct,
    updateProductPrice,
    toggleProductStatus,
    settings
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | 'all'>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Inline editing of price state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number | string>('');
  const [savedPriceId, setSavedPriceId] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.weight.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || p.categoryId === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      deleteProduct(id);
    }
  };

  const startInlinePriceEdit = (p: Product) => {
    setEditingPriceId(p.id);
    setTempPrice(p.price);
  };

  const saveInlinePriceEdit = (id: string) => {
    const num = typeof tempPrice === 'string' ? parseFloat(tempPrice) : tempPrice;
    if (!isNaN(num) && num >= 0) {
      updateProductPrice(id, num);
      setSavedPriceId(id);
      setTimeout(() => setSavedPriceId(null), 1500);
    }
    setEditingPriceId(null);
  };

  const inStockCount = products.filter((p) => p.status === 'Disponible').length;
  const outOfStockCount = products.filter((p) => p.status === 'Sin Stock').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Productos
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {products.length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Disponibles para Pedido
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {inStockCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Sin Stock
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {outOfStockCount}
          </div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="admin-search-products"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, marca o presentación..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Create Button */}
          <button
            id="btn-admin-create-product"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar:</span>
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las Categorías ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ProductStatus | 'all')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos los Estados</option>
            <option value="Disponible">🟢 Solo Disponibles</option>
            <option value="Sin Stock">🔴 Solo Sin Stock</option>
          </select>

          {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Products Table / Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600">
              <Package className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Catálogo en blanco (0 productos)
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Aún no tienes productos cargados. Puedes cargar tus propios artículos de cualquier rubro o bulto haciendo clic en "Nuevo Producto".
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Cargar Primer Producto</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Presentación</th>
                  <th className="py-3 px-4">
                    <span className="flex items-center gap-1">
                      Precio Mayorista
                      <span className="text-[10px] text-emerald-600 font-normal lowercase">(editable)</span>
                    </span>
                  </th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No se encontraron productos con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const cat = categories.find((c) => c.id === product.categoryId);
                    const isEditingThisPrice = editingPriceId === product.id;
                    const isSaved = savedPriceId === product.id;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Product details with image */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-11 h-11 rounded-lg object-contain p-1 bg-white shrink-0 border border-slate-200 shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 line-clamp-1">
                                {product.name}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                {product.brand && <span>{product.brand}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span>{cat?.name || 'Sin Categoría'}</span>
                          </div>
                        </td>

                        {/* Presentation / Weight */}
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                            {product.weight}
                          </span>
                        </td>

                        {/* Inline Editable Price */}
                        <td className="py-3 px-4">
                          {isEditingThisPrice ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400 font-bold">$</span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={tempPrice}
                                onChange={(e) => setTempPrice(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveInlinePriceEdit(product.id);
                                  if (e.key === 'Escape') setEditingPriceId(null);
                                }}
                                autoFocus
                                className="w-24 px-2 py-1 bg-white border border-emerald-500 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                              <button
                                onClick={() => saveInlinePriceEdit(product.id)}
                                className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                title="Guardar precio"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <button
                                onClick={() => startInlinePriceEdit(product)}
                                className="font-bold text-slate-900 hover:text-emerald-600 flex items-center gap-1 transition-colors text-left cursor-pointer"
                                title="Click para editar precio directamente"
                              >
                                <span>
                                  {formatCurrency(product.price, settings.currencySymbol)}
                                </span>
                                <Edit2 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                              {isSaved && (
                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded animate-fade-in">
                                  ¡Guardado!
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Status toggle */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleProductStatus(product.id)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                              product.status === 'Disponible'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.status === 'Disponible'
                                  ? 'bg-emerald-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span>{product.status}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              title="Editar detalles completos"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer info */}
        {products.length > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Mostrando {filteredProducts.length} de {products.length} productos
            </span>
            <span className="text-[11px] text-slate-400">
              Haz clic en el precio o estado para editar rápido
            </span>
          </div>
        )}
      </div>

      {/* Product Create/Edit Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
      />
    </div>
  );
};
