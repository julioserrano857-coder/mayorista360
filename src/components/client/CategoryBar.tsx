import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Layers } from 'lucide-react';

interface CategoryBarProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategoryId,
  onSelectCategory
}) => {
  const { categories, products } = useStore();

  // Sort categories by order priority
  const activeCategories = [...categories]
    .filter((c) => c.active)
    .sort((a, b) => a.order - b.order);

  // Compute count for each category
  const getProductCount = (catId: string) => {
    if (catId === 'all') return products.length;
    return products.filter((p) => p.categoryId === catId).length;
  };

  return (
    <div className="bg-white border-b border-slate-200/90 py-2.5 px-3 sm:px-4 z-20 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          id="cat-pill-all"
          onClick={() => onSelectCategory('all')}
          className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 touch-action-manipulation ${
            selectedCategoryId === 'all'
              ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/25 scale-[1.02]'
              : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 border border-slate-200/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Todos</span>
          <span
            className={`text-[10px] px-1.5 sm:px-2 py-0.2 rounded-full font-extrabold ${
              selectedCategoryId === 'all'
                ? 'bg-white/20 text-white backdrop-blur-xs'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {getProductCount('all')}
          </span>
        </button>

        {activeCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const count = getProductCount(cat.id);

          return (
            <button
              key={cat.id}
              id={`cat-pill-${cat.slug}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 touch-action-manipulation ${
                isSelected
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/25 scale-[1.02]'
                  : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 border border-slate-200/60'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 sm:px-2 py-0.2 rounded-full font-extrabold ${
                  isSelected
                    ? 'bg-white/20 text-white backdrop-blur-xs'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
