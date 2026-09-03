import React, { useState, useEffect, useRef } from 'react';
import { Product, Species, ProductStatus } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Save,
  Image,
  Tag,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  UploadCloud,
  Camera,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { processImageFile } from '../../utils/imageCompressor';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const SAMPLE_PET_IMAGES = [
  { label: 'Bolsa Alimento Perro', url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80' },
  { label: 'Croquetas & Bowl', url: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Alimento Gato Premium', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80' },
  { label: 'Pouch / Sobre Húmedo', url: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=600&auto=format&fit=crop&q=80' },
  { label: 'Snacks & Premios', url: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=600&auto=format&fit=crop&q=80' },
  { label: 'Medicamento / Pipeta', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80' },
  { label: 'Piedras Sanitarias', url: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Aves y Semillas', url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&auto=format&fit=crop&q=80' }
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit
}) => {
  const { categories, addProduct, updateProduct } = useStore();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [species, setSpecies] = useState<Species>('Perro');
  const [weight, setWeight] = useState('15 kg');
  const [price, setPrice] = useState<number | string>(50000);
  const [status, setStatus] = useState<ProductStatus>('Disponible');
  const [imageUrl, setImageUrl] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');

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

    if (productToEdit) {
      setName(productToEdit.name);
      setCategoryId(productToEdit.categoryId);
      setSpecies(productToEdit.species);
      setWeight(productToEdit.weight);
      setPrice(productToEdit.price);
      setStatus(productToEdit.status);
      setImageUrl(productToEdit.imageUrl);
      setBrand(productToEdit.brand || '');
      setDescription(productToEdit.description || '');
      setSku(productToEdit.sku || '');
      setShowAdvancedUrl(false);
    } else {
      setName('');
      setCategoryId(categories[0]?.id || '');
      setSpecies('Perro');
      setWeight('15 kg');
      setPrice(50000);
      setStatus('Disponible');
      setImageUrl('');
      setBrand('');
      setDescription('');
      setSku('');
      setShowAdvancedUrl(false);
    }
  }, [productToEdit, categories, isOpen]);

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
      const optimizedDataUrl = await processImageFile(file, 1000, 0.82);
      setImageUrl(optimizedDataUrl);
    } catch (err) {
      console.error('Error optimizando imagen:', err);
      setUploadError('Ocurrió un error al procesar la imagen seleccionada. Por favor intente con otra.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    const parsedPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;

    const payload = {
      name: name.trim(),
      categoryId,
      species,
      weight: weight.trim() || '15 kg',
      price: Math.max(0, parsedPrice),
      status,
      imageUrl: imageUrl.trim() || SAMPLE_PET_IMAGES[0].url,
      brand: brand.trim() || undefined,
      description: description.trim() || undefined,
      sku: sku.trim() || undefined
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
              Complete los datos mayoristas para el catálogo digital
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
                placeholder="Ej: Royal Canin Maxi Adult"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Marca / Fabricante
              </label>
              <input
                id="form-product-brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ej: Royal Canin"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Category, Species, Variant/Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoría Asignada <span className="text-rose-500">*</span>
              </label>
              <select
                id="form-product-category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Especie <span className="text-rose-500">*</span>
              </label>
              <select
                id="form-product-species"
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Perro">🐶 Perro</option>
                <option value="Gato">🐱 Gato</option>
                <option value="Otros">🐾 Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Variante / Peso <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-product-weight"
                type="text"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ej: 15 kg, 3 kg, Pack x 12"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 3: Price, Status, SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Precio Mayorista ($) <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-product-price"
                type="number"
                min="0"
                step="1"
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
                <option value="Disponible">🟢 Disponible</option>
                <option value="Sin Stock">🔴 Sin Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Código SKU (Opcional)
              </label>
              <input
                id="form-product-sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="RC-MAX-15"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 4: Product Image Upload (File picker + Drag & Drop) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Foto del Producto <span className="text-rose-500">*</span></span>
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
                      (e.target as HTMLImageElement).src = SAMPLE_PET_IMAGES[0].url;
                    }}
                  />
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="text-xs">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Foto cargada para el producto
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Optimizada para catálogo rápido y pedidos por WhatsApp.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isUploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>Cambiar Foto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      disabled={isUploading}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar Foto</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* When no image: Drag & Drop upload zone */
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-400'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-2.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
                    isDragging ? 'bg-emerald-100 text-emerald-700 scale-110' : 'bg-slate-200/80 text-slate-600'
                  }`}>
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {isUploading
                        ? 'Optimizando foto...'
                        : 'Haz clic para subir la foto o arrástrala aquí'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sube fotos desde tu computadora o la galería/cámara de tu celular (JPG, PNG, WebP)
                    </p>
                  </div>

                  <button
                    type="button"
                    className="mt-1 px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-slate-800 transition-all pointer-events-none"
                  >
                    Seleccionar Foto
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="mt-2 text-xs text-rose-600 font-semibold flex items-center gap-1.5 bg-rose-50 p-2 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Optional Collapsible URL / Presets alternative */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowAdvancedUrl(!showAdvancedUrl)}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-medium self-start flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LinkIcon className="w-3 h-3 text-slate-400" />
                <span>{showAdvancedUrl ? 'Ocultar opciones alternativas' : '¿Deseas usar una foto de muestra o enlace URL?'}</span>
              </button>

              {showAdvancedUrl && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    O ingresar enlace directo (opcional):
                  </label>
                  <input
                    id="form-product-image-url"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-500"
                  />

                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Fotos predeterminadas para pet shop:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_PET_IMAGES.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImageUrl(img.url)}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-white hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200"
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descripción / Notas para el cliente
            </label>
            <textarea
              id="form-product-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre presentación, beneficios, recomendaciones de uso..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
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
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98"
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
