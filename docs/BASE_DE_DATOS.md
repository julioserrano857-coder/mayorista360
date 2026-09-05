# 🗄️ Estructura de Base de Datos y Modelos (BASE_DE_DATOS.md)

Este documento describe las tablas de base de datos en Supabase (PostgreSQL), los esquemas de datos locales en `localStorage` y las interfaces de TypeScript.

---

## 📐 1. Tipos de TypeScript (`/src/types.ts`)

```typescript
export type ProductStatus = 'Disponible' | 'Sin Stock';
export type OrderStatus = 'Pendiente' | 'Entregado' | 'Cancelado';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  categoryId: string;
  weight: string; // Ej: "Caja x 24", "Pack x 12"
  price: number;
  status: ProductStatus;
  imageUrl: string;
  sku?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  active: boolean;
}

export interface Preventista {
  id: string;
  name: string;
  slug: string;
  whatsapp: string; // Número limpio (ej: "5491134567890")
  zone?: string;
  active: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  weight?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  code: string; // Código de 4 dígitos (ej: "4821")
  createdAt: string;
  preventistaId?: string;
  preventistaName: string;
  preventistaWhatsapp?: string;
  clientName?: string;
  notes?: string;
  items: OrderItem[];
  totalAmount: number;
  totalUnits: number;
  status: OrderStatus;
}

export interface StoreSettings {
  companyName: string;
  defaultWhatsApp: string;
  announcement?: string;
  currencySymbol: string;
}
```

---

## 🗃️ 2. Esquema SQL para Supabase (`/supabase/schema.sql`)

Para crear las tablas en Supabase, se ejecuta el siguiente script en el SQL Editor de Supabase:

```sql
-- 1. Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Productos
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  weight TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Disponible',
  image_url TEXT,
  sku TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Preventistas
CREATE TABLE IF NOT EXISTS public.preventistas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  zone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Configuración de Tienda
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  company_name TEXT NOT NULL,
  default_whatsapp TEXT NOT NULL,
  announcement TEXT,
  currency_symbol TEXT DEFAULT '$',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Pedidos Recibidos
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  preventista_id TEXT REFERENCES public.preventistas(id) ON DELETE SET NULL,
  preventista_name TEXT NOT NULL,
  preventista_whatsapp TEXT,
  client_name TEXT,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_units INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pendiente'
);

-- Habilitar Row Level Security (RLS) con lectura/escritura pública para modo anónimo (anon)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo en categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en preventistas" ON public.preventistas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
```

---

## 💾 3. Almacenamiento en el Dispositivo (solo excepciones aprobadas)

Supabase es la **única fuente de verdad** para productos, categorías, preventistas, configuración y pedidos. El navegador NO guarda datos del catálogo. Únicas excepciones en el dispositivo:

| Clave | Dónde | Contenido |
|---|---|---|
| `mayorista360_cart_v1` | localStorage | Carrito en curso (borrador, expira a las 24 h) |
| `mayorista360_cart_timestamp_v1` | localStorage | Timestamp de expiración del carrito |
| `mayorista360_admin_session_v1` | sessionStorage | Sesión del admin mientras la pestaña esté abierta |
