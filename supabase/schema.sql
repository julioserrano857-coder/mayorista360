-- ==============================================================================
-- SCHEMA SUPABASE: NutriMayorista Pet Food (Catálogo y Preventistas)
-- ==============================================================================
-- Instrucciones:
-- 1. Ve a tu proyecto en Supabase (https://supabase.com)
-- 2. Entra al menú "SQL Editor" en la barra lateral izquierda
-- 3. Crea una "New query", pega todo el contenido de este archivo y presiona "RUN"
-- ==============================================================================

-- Habilitar extensión para UUIDs si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: CATEGORÍAS (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    "order" INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA: PRODUCTOS (products)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    species VARCHAR(50) NOT NULL DEFAULT 'Perro', -- 'Perro', 'Gato', 'Otros'
    weight VARCHAR(100) NOT NULL,                 -- ej: '15 kg', '20 kg', 'Pack x 12'
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Disponible', -- 'Disponible', 'Sin Stock'
    image_url TEXT NOT NULL DEFAULT '',
    brand VARCHAR(150),
    description TEXT,
    sku VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: PREVENTISTAS (preventistas)
CREATE TABLE IF NOT EXISTS public.preventistas (
    id TEXT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    whatsapp VARCHAR(50) NOT NULL, -- ej: '5491158941234' (solo números con código país)
    active BOOLEAN NOT NULL DEFAULT true,
    zone VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: CONFIGURACIÓN DE LA TIENDA (store_settings)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default_settings',
    company_name VARCHAR(200) NOT NULL DEFAULT 'NutriMayorista Pet Food',
    default_whatsapp VARCHAR(50) NOT NULL DEFAULT '5491134567890',
    currency_symbol VARCHAR(10) NOT NULL DEFAULT '$',
    announcement TEXT DEFAULT '📦 Envíos mayoristas bonificados en pedidos superiores a $150.000 | Entregas en 24/48hs',
    min_order_amount NUMERIC(12, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: PEDIDOS (orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    code VARCHAR(10) NOT NULL, -- ej: '4821'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    preventista_id TEXT,
    preventista_name VARCHAR(150) NOT NULL DEFAULT 'Central Directa',
    preventista_whatsapp VARCHAR(50),
    client_name VARCHAR(150),
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_units INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Pendiente' -- 'Pendiente', 'Entregado', 'Cancelado'
);

-- ==============================================================================
-- ÍNDICES PARA BÚSQUEDA RÁPIDA (Optimizados para catálogos con miles de productos)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_preventistas_slug ON public.preventistas(slug);
CREATE INDEX IF NOT EXISTS idx_orders_code ON public.orders(code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
-- Permite lectura pública a clientes/preventistas y control completo con tu clave
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Políticas de LECTURA PÚBLICA (para que el catálogo cargue instantáneamente)
CREATE POLICY "Lectura pública de categorías" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Lectura pública de productos" ON public.products FOR SELECT USING (true);
CREATE POLICY "Lectura pública de preventistas" ON public.preventistas FOR SELECT USING (true);
CREATE POLICY "Lectura pública de configuración" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Lectura pública de pedidos" ON public.orders FOR SELECT USING (true);

-- Políticas de ESCRITURA (insert, update, delete permitidas para el admin / anon con clave de tu app)
CREATE POLICY "Gestión total de categorías" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Gestión total de productos" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Gestión total de preventistas" ON public.preventistas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Gestión total de configuración" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Gestión total de pedidos" ON public.orders FOR ALL USING (true) WITH CHECK (true);
