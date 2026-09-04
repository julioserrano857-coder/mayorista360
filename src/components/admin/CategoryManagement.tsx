import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';
import { CategoryFormModal } from './CategoryFormModal';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  CheckCircle2,
  XCircle,
  Package
} from 'lucide-react';

export const CategoryManagement: React.FC = () => {
  const { categories, products, deleteCategory, updateCategory } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Sorted by order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDelete = (cat: Category) => {
    const productsInCat = products.filter((p) => p.categoryId === cat.id);
    if (productsInCat.length > 0) {
      if (
        !window.confirm(
          `Atención: Esta categoría contiene ${productsInCat.length} productos asignados. ¿Deseas eliminar la categoría de todos modos?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm(`¿Deseas eliminar la categoría "${cat.name}"?`)) {
        return;
      }
    }
    deleteCategory(cat.id);
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedCategories.length) return;

    const currentItem = sortedCategories[index];
    const targetItem = sortedCategories[targetIndex];

    updateCategory(currentItem.id, { order: targetItem.order });
    updateCategory(targetItem.id, { order: currentItem.order });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            Gestión de Categorías
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Crea, edita y ordena las secciones visibles en el catálogo de clientes
          </p>
        </div>

        <button
          id="btn-create-category"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Categories Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {sortedCategories.length === 0 ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600">
              <Layers className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              No tienes categorías creadas
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Crea tus propias categorías según tu negocio (ej: Bebidas, Golosinas, Cigarrillos, Alimentos, etc.) para organizar los productos.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primera Categoría</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3 px-4 w-20 text-center">Prioridad</th>
                <th className="py-3 px-4">Nombre de Categoría</th>
                <th className="py-3 px-4">Slug en URL</th>
                <th className="py-3 px-4 text-center">Productos</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedCategories.map((category, index) => {
                const productCount = products.filter(
                  (p) => p.categoryId === category.id
                ).length;

                return (
                  <tr key={category.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Order buttons & badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                          {category.order}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            disabled={index === 0}
                            onClick={() => handleMoveOrder(index, 'up')}
                            className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                            title="Subir prioridad"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            disabled={index === sortedCategories.length - 1}
                            onClick={() => handleMoveOrder(index, 'down')}
                            className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                            title="Bajar prioridad"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <span>{category.name}</span>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3 px-4">
                      <code className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                        {category.slug}
                      </code>
                    </td>

                    {/* Product count */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Package className="w-3 h-3 text-emerald-600" />
                        {productCount}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          updateCategory(category.id, { active: !category.active })
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${
                          category.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                        title="Clic para cambiar visibilidad"
                      >
                        {category.active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Activa</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-500" />
                            <span>Oculta</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`btn-edit-category-${category.id}`}
                          onClick={() => handleOpenEdit(category)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Editar categoría"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-category-${category.id}`}
                          onClick={() => handleDelete(category)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={editingCategory}
      />
    </div>
  );
};
