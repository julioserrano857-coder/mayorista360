import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { useStore } from '../../context/StoreContext';
import { X, Save, Layers } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit
}) => {
  const { addCategory, updateCategory, categories } = useStore();

  const [name, setName] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setOrder(categoryToEdit.order);
      setActive(categoryToEdit.active);
    } else {
      setName('');
      setOrder(categories.length + 1);
      setActive(true);
    }
  }, [categoryToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, {
        name: name.trim(),
        order: Number(order) || 1,
        active
      });
    } else {
      addCategory({
        name: name.trim(),
        order: Number(order) || 1,
        active
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 z-10 animate-scale-up">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {categoryToEdit ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <p className="text-xs text-slate-400">
                Organice los productos del catálogo mayorista
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre de la Categoría <span className="text-rose-500">*</span>
            </label>
            <input
              id="form-category-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Alimento Seco, Snacks, Accesorios..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Orden / Prioridad <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-category-order"
                type="number"
                min="1"
                required
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">1 = Primer lugar</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Visibilidad
              </label>
              <select
                id="form-category-active"
                value={active ? 'true' : 'false'}
                onChange={(e) => setActive(e.target.value === 'true')}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="true">🟢 Activa</option>
                <option value="false">⚪ Oculta</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Cancelar
            </button>
            <button
              id="btn-save-category-modal"
              type="submit"
              className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{categoryToEdit ? 'Guardar Cambios' : 'Crear Categoría'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
