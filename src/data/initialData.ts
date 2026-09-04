import { Category, Product, Preventista, StoreSettings, AdminCredentials } from '../types';

// =========================================================================
// CATÁLOGO EN BLANCO: El usuario crea y gestiona 100% sus propias categorías
// y productos desde el panel de administración.
// =========================================================================
export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PREVENTISTAS: Preventista[] = [
  {
    id: 'prev-1',
    name: 'Ventas Central',
    slug: 'ventas-central',
    whatsapp: '5491155554444',
    active: true,
    zone: 'Atención General'
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  companyName: 'Mi Distribuidora Mayorista',
  defaultWhatsApp: '5491155554444',
  currencySymbol: '$',
  announcement: 'Catálogo de pedidos mayoristas en línea - Pedidos directos a WhatsApp',
  minOrderAmount: 0
};

export const INITIAL_ADMIN: AdminCredentials = {
  username: 'admin',
  passwordHash: 'admin123',
  lastUpdated: new Date().toISOString()
};

// =========================================================================
// DATOS DE MUESTRA (Opcionales para el botón de prueba en configuración)
// =========================================================================
export const DEMO_CATEGORIES: Category[] = [
  { id: 'demo-cat-1', name: 'Bebidas & Energizantes', slug: 'bebidas-energizantes', order: 1, active: true },
  { id: 'demo-cat-2', name: 'Golosinas & Kiosco', slug: 'golosinas-kiosco', order: 2, active: true },
  { id: 'demo-cat-3', name: 'Cigarrillos & Tabaco', slug: 'cigarrillos-tabaco', order: 3, active: true },
  { id: 'demo-cat-4', name: 'Alimentos & Mascotas', slug: 'alimentos-mascotas', order: 4, active: true },
  { id: 'demo-cat-5', name: 'Snacks & Galletitas', slug: 'snacks-galletitas', order: 5, active: true }
];

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-prod-1',
    name: 'Coca Cola Sabor Original 1.5L',
    categoryId: 'demo-cat-1',
    weight: 'Pack x 6 botellas',
    price: 14500,
    status: 'Disponible',
    brand: 'Coca Cola',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    description: 'Pack cerrado termoformado x 6 unidades de 1.5 Litros.',
    sku: 'CC-1500-6'
  },
  {
    id: 'demo-prod-2',
    name: 'Alfajor Guaymallén Triple Chocolate',
    categoryId: 'demo-cat-2',
    weight: 'Caja x 24 unidades',
    price: 9600,
    status: 'Disponible',
    brand: 'Guaymallén',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
    description: 'Caja expositora de 24 alfajores triples de chocolate con dulce de leche.',
    sku: 'GUAY-TRIP-24'
  },
  {
    id: 'demo-prod-3',
    name: 'Marlboro Red Box 20',
    categoryId: 'demo-cat-3',
    weight: 'Cartón x 10 paquetes',
    price: 36500,
    status: 'Disponible',
    brand: 'Marlboro',
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80',
    description: 'Cartón cerrado x 10 atados Box de 20 cigarrillos.',
    sku: 'MARL-RED-10'
  },
  {
    id: 'demo-prod-4',
    name: 'Dog Chow Adultos Medianos y Grandes',
    categoryId: 'demo-cat-4',
    weight: 'Bolsa 21 kg',
    price: 54200,
    status: 'Disponible',
    brand: 'Purina Dog Chow',
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80',
    description: 'Bolsa mayorista de 21 kg alimento balanceado para perros adultos.',
    sku: 'DC-CARNE-21'
  }
];
