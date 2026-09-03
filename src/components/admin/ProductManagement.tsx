import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Species, ProductStatus } from '../../types';
import { formatCurrency } from '../../utils/whatsapp';
import { ProductFormModal } from './ProductFormModal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  ArrowUpDown,
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
  const [selectedSpecies, setSelectedSpecies] = useState<Species | 'all'>('all');
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
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.weight.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || p.categoryId === selectedCategory;

    const matchesSpecies =
      selectedSpecies === 'all' || p.species === selectedSpecies;

    const matchesStatus =
      selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesSpecies && matchesStatus;
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
          <div className="text-xs text-slate-400 mt-0.5">En el catálogo mayorista</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Disponibles para Venta
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {inStockCount}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Listos para despachar</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Sin Stock
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {outOfStockCount}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Ocultos o marcados sin stock</div>
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
              placeholder="Buscar por nombre, marca, peso o SKU..."
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
            <span>Filtros:</span>
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Species filter */}
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value as Species | 'all')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las Especies</option>
            <option value="Perro">🐶 Perro</option>
            <option value="Gato">🐱 Gato</option>
            <option value="Otros">🐾 Otros</option>
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

          {(searchTerm || selectedCategory !== 'all' || selectedSpecies !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedSpecies('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Centralized Price Update Note */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Actualización de precios centralizada:</strong> Cualquier cambio de precio o stock se refleja en tiempo real en todos los catálogos y enlaces de preventistas.
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría / Especie</th>
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
                            className="w-11 h-11 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 line-clamp-1">
                              {product.name}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              {product.brand && <span>{product.brand}</span>}
                              {product.sku && (
                                <span className="font-mono text-slate-400">
                                  SKU: {product.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Species */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800">
                            {cat?.name || 'General'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {product.species === 'Perro' && '🐶 Perro'}
                            {product.species === 'Gato' && '🐱 Gato'}
                            {product.species === 'Otros' && '🐾 Otros'}
                          </div>
                        </div>
                      </td>

                      {/* Weight/Variant */}
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
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveInlinePriceEdit(product.id);
                                if (e.key === 'Escape') setEditingPriceId(null);
                              }}
                              autoFocus
                              className="w-24 px-2 py-1 border border-emerald-500 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              onClick={() => saveInlinePriceEdit(product.id)}
                              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              title="Guardar"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => startInlinePriceEdit(product)}
                            className="group/price flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-emerald-50 hover:border hover:border-emerald-200 w-fit transition-all"
                            title="Haga clic para editar el precio rápidamente"
                          >
                            <span className="font-extrabold text-slate-900">
                              {formatCurrency(product.price, settings.currencySymbol)}
                            </span>
                            <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/price:opacity-100 transition-opacity" />
                            {isSaved && (
                              <span className="text-[10px] text-emerald-600 font-bold animate-fade-in">
                                ¡Actualizado!
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleProductStatus(product.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            product.status === 'Disponible'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                          title="Clic para alternar estado de stock"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.status === 'Disponible'
                                ? 'bg-emerald-600'
                                : 'bg-rose-600'
                            }`}
                          />
                          <span>{product.status}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`btn-edit-prod-${product.id}`}
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Editar ficha completa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-del-prod-${product.id}`}
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
      </div>

      {/* Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
      />
    </div>
  );
};
