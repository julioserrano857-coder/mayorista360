import { Category, Product, Preventista, StoreSettings, AdminCredentials } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Alimento Seco', slug: 'alimento-seco', order: 1, active: true },
  { id: 'cat-2', name: 'Alimento Húmedo', slug: 'alimento-humedo', order: 2, active: true },
  { id: 'cat-3', name: 'Snacks & Premios', slug: 'snacks-premios', order: 3, active: true },
  { id: 'cat-4', name: 'Medicamentos & Salud', slug: 'medicamentos-salud', order: 4, active: true },
  { id: 'cat-5', name: 'Accesorios & Higiene', slug: 'accesorios-higiene', order: 5, active: true },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Alimento Seco - Perros
  {
    id: 'prod-1',
    name: 'Royal Canin Maxi Adult',
    categoryId: 'cat-1',
    species: 'Perro',
    weight: '15 kg',
    price: 68500,
    status: 'Disponible',
    brand: 'Royal Canin',
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80',
    description: 'Nutrición específica para perros adultos de razas grandes (26 a 44 kg). Bolsa mayorista reforzada.',
    sku: 'RC-MAXI-15'
  },
  {
    id: 'prod-2',
    name: 'Purina Pro Plan Adult OptiHealth',
    categoryId: 'cat-1',
    species: 'Perro',
    weight: '20 kg',
    price: 74200,
    status: 'Disponible',
    brand: 'Pro Plan',
    imageUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&auto=format&fit=crop&q=80',
    description: 'Fórmula completa y equilibrada para perros adultos de raza mediana con carne fresca como primer ingrediente.',
    sku: 'PP-ADULT-20'
  },
  {
    id: 'prod-3',
    name: 'Vitalcan Balanced Puppy Razas Medianas',
    categoryId: 'cat-1',
    species: 'Perro',
    weight: '15 kg',
    price: 45900,
    status: 'Disponible',
    brand: 'Vitalcan',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80',
    description: 'Para cachorros hasta 12 meses. Promueve el desarrollo osteoarticular y defensas naturales.',
    sku: 'VC-PUPPY-15'
  },
  {
    id: 'prod-4',
    name: 'Pedigree Adulto Carne y Vegetales',
    categoryId: 'cat-1',
    species: 'Perro',
    weight: '21 kg',
    price: 36800,
    status: 'Disponible',
    brand: 'Pedigree',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80',
    description: 'Nutrición esencial de alto volumen comercial para petshops y forrajerías.',
    sku: 'PED-CARNE-21'
  },
  {
    id: 'prod-5',
    name: 'Eukanuba Adult Large Breed',
    categoryId: 'cat-1',
    species: 'Perro',
    weight: '15 kg',
    price: 71500,
    status: 'Sin Stock',
    brand: 'Eukanuba',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
    description: 'Fórmula super premium rica en glucosamina y sulfato de condroitina para articulaciones.',
    sku: 'EUK-LGB-15'
  },

  // Alimento Seco - Gatos
  {
    id: 'prod-6',
    name: 'Royal Canin Fit 32 Felino',
    categoryId: 'cat-1',
    species: 'Gato',
    weight: '7.5 kg',
    price: 49800,
    status: 'Disponible',
    brand: 'Royal Canin',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    description: 'Para gatos adultos moderadamente activos con acceso al exterior. Control de bolas de pelo.',
    sku: 'RC-FIT32-75'
  },
  {
    id: 'prod-7',
    name: 'Purina Cat Chow Adultos Pescado y Pollo',
    categoryId: 'cat-1',
    species: 'Gato',
    weight: '15 kg',
    price: 39500,
    status: 'Disponible',
    brand: 'Cat Chow',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop&q=80',
    description: 'Bolsa mayorista de 15kg con Defense Plus. Excelente rotación en góndola.',
    sku: 'CC-PESC-15'
  },
  {
    id: 'prod-8',
    name: 'Pro Plan Cat Urinary Care',
    categoryId: 'cat-1',
    species: 'Gato',
    weight: '7.5 kg',
    price: 54000,
    status: 'Disponible',
    brand: 'Pro Plan',
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop&q=80',
    description: 'Ayuda a mantener la salud del tracto urinario inferior reduciendo el pH de la orina.',
    sku: 'PP-URIN-75'
  },

  // Alimento Húmedo
  {
    id: 'prod-9',
    name: 'Felix Pouch Filetes de Pescado (Caja x 24 u)',
    categoryId: 'cat-2',
    species: 'Gato',
    weight: 'Caja x 24 un (85g c/u)',
    price: 18600,
    status: 'Disponible',
    brand: 'Purina Felix',
    imageUrl: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=600&auto=format&fit=crop&q=80',
    description: 'Alimento húmedo completo con trocitos jugosos en salsa. Presentación display mayorista.',
    sku: 'FLX-POUCH-24'
  },
  {
    id: 'prod-10',
    name: 'Pedigree Pouch Cachorro Carne (Caja x 24 u)',
    categoryId: 'cat-2',
    species: 'Perro',
    weight: 'Caja x 24 un (100g c/u)',
    price: 19900,
    status: 'Disponible',
    brand: 'Pedigree',
    imageUrl: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=600&auto=format&fit=crop&q=80',
    description: 'Pouch sellado para cachorros. Gran palatabilidad e hidratación.',
    sku: 'PED-POUCH-24'
  },
  {
    id: 'prod-11',
    name: 'Lata Monello Dog Trozos en Salsa (Pack x 12 u)',
    categoryId: 'cat-2',
    species: 'Perro',
    weight: 'Pack x 12 un (280g c/u)',
    price: 24500,
    status: 'Disponible',
    brand: 'Monello',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80',
    description: 'Lata conserva premium con alto porcentaje de carne y minerales quelados.',
    sku: 'MON-LATA-12'
  },

  // Snacks & Premios
  {
    id: 'prod-12',
    name: 'Dentastix Pedigree Perros Medianos (Display x 18 sobres)',
    categoryId: 'cat-3',
    species: 'Perro',
    weight: 'Display x 18 sobres',
    price: 28900,
    status: 'Disponible',
    brand: 'Pedigree',
    imageUrl: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=600&auto=format&fit=crop&q=80',
    description: 'Snack dental de uso diario. Reduce la formación de sarro hasta un 80%. Display comercial.',
    sku: 'DEN-MED-18'
  },
  {
    id: 'prod-13',
    name: 'Snack Catnip Golosina Crocante Gatos (Pack x 10 u)',
    categoryId: 'cat-3',
    species: 'Gato',
    weight: 'Pack x 10 un (60g c/u)',
    price: 14200,
    status: 'Disponible',
    brand: 'Whiskas Temptations',
    imageUrl: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600&auto=format&fit=crop&q=80',
    description: 'Almohadillas crujientes por fuera con relleno suave por dentro y sabor irresistible.',
    sku: 'WHS-SNK-10'
  },
  {
    id: 'prod-14',
    name: 'Huesos de Cuero Prensado 4-5" (Bolsa x 50 u)',
    categoryId: 'cat-3',
    species: 'Perro',
    weight: 'Bolsa x 50 u',
    price: 31000,
    status: 'Disponible',
    brand: 'K-Nino',
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&auto=format&fit=crop&q=80',
    description: 'Huesos naturales masticables de alta resistencia para entretenimiento y limpieza dental.',
    sku: 'HUE-PRN-50'
  },

  // Medicamentos & Salud
  {
    id: 'prod-15',
    name: 'Pipetas Antipulgas y Garrapatas Canino 10-20kg (Caja x 10 u)',
    categoryId: 'cat-4',
    species: 'Perro',
    weight: 'Caja x 10 pipetas',
    price: 42000,
    status: 'Disponible',
    brand: 'Frontline Plus',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    description: 'Antiparasitario externo de rápida acción y protección mensual contra pulgas y garrapatas.',
    sku: 'FRL-PIP-10'
  },
  {
    id: 'prod-16',
    name: 'Comprimidos Antiparasitarios Nexgard 10-25kg (Pack x 6 u)',
    categoryId: 'cat-4',
    species: 'Perro',
    weight: 'Display x 6 masticables',
    price: 63500,
    status: 'Disponible',
    brand: 'NexGard',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    description: 'Comprimido masticable con sabor a carne de máxima demanda en veterinarias.',
    sku: 'NEX-MED-6'
  },
  {
    id: 'prod-17',
    name: 'Antiparasitario Interno Total Gatos (Caja x 20 comprimidos)',
    categoryId: 'cat-4',
    species: 'Gato',
    weight: 'Caja x 20 comp',
    price: 27500,
    status: 'Disponible',
    brand: 'Basken',
    imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80',
    description: 'Espectro total contra nematodos y cestodos felinos.',
    sku: 'BSK-FEL-20'
  },

  // Accesorios & Higiene
  {
    id: 'prod-18',
    name: 'Piedras Sanitarias Absorbentes Aglomerantes (Bolsa x 20 kg)',
    categoryId: 'cat-5',
    species: 'Gato',
    weight: 'Bolsa x 20 kg',
    price: 15800,
    status: 'Disponible',
    brand: 'Sanicat Bentonita',
    imageUrl: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&auto=format&fit=crop&q=80',
    description: 'Arena aglomerante de bentonita natural con control ultra de olores.',
    sku: 'ARE-BEN-20'
  },
  {
    id: 'prod-19',
    name: 'Alimento Completo para Aves y Loros (Bolsa x 10 kg)',
    categoryId: 'cat-1',
    species: 'Otros',
    weight: 'Bolsa x 10 kg',
    price: 18900,
    status: 'Disponible',
    brand: 'NutriBird',
    imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&auto=format&fit=crop&q=80',
    description: 'Mezcla balanceada de semillas seleccionadas, frutas deshidratadas y extrusionados para aves y loros.',
    sku: 'AVE-LOR-10'
  },
  {
    id: 'prod-20',
    name: 'Viruta de Madera Prensada para Roedores y Conejos',
    categoryId: 'cat-5',
    species: 'Otros',
    weight: 'Fardo x 5 kg',
    price: 9400,
    status: 'Disponible',
    brand: 'Hámster & Co',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
    description: 'Lecho higiénico natural de madera libre de polvo para conejos, cobayos y hámsters.',
    sku: 'VIR-ROED-5'
  }
];

export const INITIAL_PREVENTISTAS: Preventista[] = [
  {
    id: 'prev-1',
    name: 'Juan Pérez',
    slug: 'juan_perez',
    whatsapp: '5491158941234',
    active: true,
    zone: 'Zona Norte y San Isidro'
  },
  {
    id: 'prev-2',
    name: 'Mariana López',
    slug: 'mariana_lopez',
    whatsapp: '5491167429812',
    active: true,
    zone: 'CABA y Alrededores'
  },
  {
    id: 'prev-3',
    name: 'Carlos Gómez',
    slug: 'carlos_gomez',
    whatsapp: '5493415129988',
    active: true,
    zone: 'Zona Sur e Interior'
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  companyName: 'NutriMayorista Pet Food',
  defaultWhatsApp: '5491134567890',
  currencySymbol: '$',
  announcement: '📦 Envíos mayoristas bonificados en pedidos superiores a $150.000 | Entregas en 24/48hs',
  minOrderAmount: 0
};

export const INITIAL_ADMIN: AdminCredentials = {
  username: 'admin',
  passwordHash: '123456',
  lastUpdated: new Date().toISOString()
};
