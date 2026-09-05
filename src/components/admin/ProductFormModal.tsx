import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductStatus } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Save,
  Image,
  DollarSign,
  Package,
  Layers,
  UploadCloud,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Loader2,
  Plus
} from 'lucide-react';
import { processImageFile } from '../../utils/imageCompressor';
import { PLACEHOLDER_IMG } from '../../utils/productImages';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const DEFAULT_IMAGE = PLACEHOLDER_IMG;

const SUGGESTED_PRESENTATIONS = [
  'Unidad',
  'Pack x 6',
  'Pack x 12',
  'Caja x 24',
  'Display x 20',
  'Cartón x 10',
  'Bolsa 15 kg',
  'Bolsa 21 kg',
  'Fardo x 6'
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit
}) => {
  const { categories, addProduct, updateProduct, addCategory } = useStore();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [weight, setWeight] = useState('Unidad');
  const [price, setPrice] = useState<number | string>(1000);
  const [status, setStatus] = useState<ProductStatus>('Disponible');
  const [imageUrl, setImageUrl] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');

  // Quick inline category creation if needed
  const [isCreatingQuickCat, setIsCreatingQuickCat] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvancedUrl, setShowAdvancedUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUploadError(null);
    setIsUploading(false);
    setIsDragging(false);
    setIsCreatingQuickCat(false);
    setQuickCatName('');

    if (productToEdit) {
      setName(productToEdit.name);
      setCategoryId(productToEdit.categoryId);
      setWeight(productToEdit.weight || 'Unidad');
      setPrice(productToEdit.price);
      setStatus(productToEdit.status);
      setImageUrl(productToEdit.imageUrl || '');
      setBrand(productToEdit.brand || '');
      setDescription(productToEdit.description || '');
      setShowAdvancedUrl(false);
    } else {
      setName('');
      setCategoryId(categories[0]?.id || '');
      setWeight('Unidad');
      setPrice(1000);
      setStatus('Disponible');
      setImageUrl('');
      setBrand('');
      setDescription('');
      setShowAdvancedUrl(false);
    }
  }, [productToEdit, categories, isOpen]);

  // Handle Quick Category Create
  const handleCreateQuickCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCatName.trim()) return;
    const newCat = addCategory({
      name: quickCatName.trim(),
      order: categories.length + 1,
      active: true
    });
    setCategoryId(newCat.id);
    setQuickCatName('');
    setIsCreatingQuickCat(false);
  };

  // Image Upload File Processing
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor seleccione un archivo de imagen válido (JPG, PNG, WebP o GIF).');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const compressedDataUrl = await processImageFile(file, 800, 0.85);

      setImageUrl(compressedDataUrl);
      setIsUploading(false);
    } catch (err: any) {
      console.error('[Image Upload Error]', err);
      setUploadError(err?.message || 'Error al procesar la imagen seleccionada.');
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }

    const finalPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(finalPrice) || finalPrice < 0) return;

    const payload = {
      name: name.trim(),
      categoryId: categoryId || (categories[0]?.id ?? 'cat-default'),
      weight: weight.trim() || 'Unidad',
      price: finalPrice,
      status,
      imageUrl: imageUrl.trim(),
      brand: brand.trim() || undefined,
      description: description.trim() || undefined
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, payload);
    } else {
      addProduct(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 z-10 animate-scale-up my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-white">
              {productToEdit ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h3>
            <p className="text-xs text-slate-400">
              Completa los datos del artículo para el catálogo de pedidos mayorista
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Notice if no categories exist */}
          {categories.length === 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>No tienes categorías creadas todavía</span>
              </div>
              <p className="text-amber-800">
                Puedes escribir el nombre de una categoría abajo para crearla automáticamente y asignársela a este producto.
              </p>
              {!isCreatingQuickCat ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingQuickCat(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Categoría Ahora</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={quickCatName}
                    onChange={(e) => setQuickCatName(e.target.value)}
                    placeholder="Ej: Bebidas, Golosinas, Alimentos..."
                    className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateQuickCategory}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                  >
                    Guardar Categoría
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Row 1: Name and Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre del Producto <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-product-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Coca Cola 1.5L, Arroz 1kg, Marlboro 20, etc."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Marca / Fabricante (Opcional)
              </label>
              <input
                id="form-product-brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ej: Arcor, Coca Cola, etc."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Category and Presentation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Categoría en Catálogo <span className="text-rose-500">*</span>
                </label>
                {!isCreatingQuickCat && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingQuickCat(true)}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Nueva</span>
                  </button>
                )}
              </div>

              {isCreatingQuickCat ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={quickCatName}
                    onChange={(e) => setQuickCatName(e.target.value)}
                    placeholder="Nombre nueva categoría..."
                    className="w-full px-3 py-2 rounded-xl border border-emerald-500 text-xs font-bold focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateQuickCategory}
                    className="px-2.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shrink-0"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingQuickCat(false)}
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <select
                  id="form-product-category"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {categories.length === 0 && (
                    <option value="">Sin categorías creadas</option>
                  )}
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Presentación / Unidad / Bulto <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-product-weight"
                type="text"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ej: Unidad, Pack x 6, Caja x 24, Bulto..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {SUGGESTED_PRESENTATIONS.slice(0, 5).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeight(w)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Price, Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Precio ($) <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-product-price"
                type="number"
                min="0"
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estado de Stock <span className="text-rose-500">*</span>
              </label>
              <select
                id="form-product-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Disponible">🟢 Disponible (se muestra en el catálogo)</option>
                <option value="Sin Stock">🔴 Pausado (no aparece en el catálogo)</option>
              </select>
            </div>
          </div>

          {/* Row 4: Product Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Foto del Producto</span>
              </span>
              {imageUrl && (
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Foto lista
                </span>
              )}
            </label>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {imageUrl ? (
              /* When image is present: Preview + Actions */
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-28 h-28 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-2xs">
                  <img
                    src={imageUrl}
                    alt="Foto del producto"
                    className="w-full h-full object-contain p-1.5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                    }}
                  />
                </div>

                <div className="flex-1 w-full flex flex-col justify-between gap-2 text-center sm:text-left">
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-900 block truncate">
                      {name || 'Producto'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Imagen cargada y optimizada para el catálogo
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cambiar Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty Dropzone with Drag & Drop and Camera */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                    : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
                }`}
              >
                {isUploading ? (
                  <div className="py-4 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-700">
                      Comprimiendo y optimizando foto...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      Sube o toma una foto del producto
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Arrastra una imagen aquí o haz clic para abrir la galería / cámara
                    </p>
                  </div>
                )}
              </div>
            )}

            {uploadError && (
              <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5 bg-rose-50 p-2 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Optional URL Toggle */}
            <div className="mt-1.5 text-right">
              <button
                type="button"
                onClick={() => setShowAdvancedUrl(!showAdvancedUrl)}
                className="text-[11px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{showAdvancedUrl ? 'Ocultar URL' : 'O pegar link web de imagen'}</span>
              </button>
            </div>

            {showAdvancedUrl && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Enlace directo de la imagen (URL):
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Row 5: Description / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descripción / Notas para el Cliente (Opcional)
            </label>
            <textarea
              id="form-product-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre presentación, condiciones de venta o características..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-save-product-modal"
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>{productToEdit ? 'Guardar Cambios' : 'Crear Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
