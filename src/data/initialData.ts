import { Category, Product, Preventista, StoreSettings } from '../types';

// =========================================================================
// CATÁLOGO EN BLANCO: El dueño del negocio crea desde cero sus propias
// categorías, productos y preventistas desde el panel de administración.
// Supabase es la ÚNICA fuente de verdad: estos valores solo se usan como
// defaults visuales hasta que llegan los datos reales desde la nube.
// =========================================================================
export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PREVENTISTAS: Preventista[] = [];

export const INITIAL_SETTINGS: StoreSettings = {
  companyName: 'Mi Distribuidora Mayorista',
  defaultWhatsApp: '',
  currencySymbol: '$',
  announcement: '',
  minOrderAmount: 0
};
