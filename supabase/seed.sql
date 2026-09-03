-- ==============================================================================
-- DATOS SEMILLA (SEED DATA) PARA NUTRIMAYORISTA PET FOOD
-- ==============================================================================
-- Instrucciones:
-- Corre este script en el SQL Editor de Supabase LUEGO de haber corrido schema.sql.
-- Esto precargará tus categorías, preventistas iniciales y productos con fotos.
-- ==============================================================================

-- 1. Insertar Categorías
INSERT INTO public.categories (id, name, slug, "order", active)
VALUES
  ('cat-1', 'Alimento Seco', 'alimento-seco', 1, true),
  ('cat-2', 'Alimento Húmedo', 'alimento-humedo', 2, true),
  ('cat-3', 'Snacks & Premios', 'snacks-premios', 3, true),
  ('cat-4', 'Medicamentos & Salud', 'medicamentos-salud', 4, true),
  ('cat-5', 'Accesorios & Higiene', 'accesorios-higiene', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar Configuración
INSERT INTO public.store_settings (id, company_name, default_whatsapp, currency_symbol, announcement, min_order_amount)
VALUES
  ('default_settings', 'NutriMayorista Pet Food', '5491134567890', '$', '📦 Envíos mayoristas bonificados en pedidos superiores a $150.000 | Entregas en 24/48hs', 0)
ON CONFLICT (id) DO NOTHING;

-- 3. Insertar Preventistas Iniciales
INSERT INTO public.preventistas (id, name, slug, whatsapp, active, zone)
VALUES
  ('prev-1', 'Juan Pérez', 'juan_perez', '5491158941234', true, 'Zona Norte y San Isidro'),
  ('prev-2', 'Mariana López', 'mariana_lopez', '5491167429812', true, 'CABA y Alrededores'),
  ('prev-3', 'Carlos Gómez', 'carlos_gomez', '5493415129988', true, 'Zona Sur e Interior')
ON CONFLICT (id) DO NOTHING;

-- 4. Insertar Productos de Ejemplo
INSERT INTO public.products (id, name, category_id, species, weight, price, status, image_url, brand, description, sku)
VALUES
  ('prod-1', 'Royal Canin Maxi Adult', 'cat-1', 'Perro', '15 kg', 68500, 'Disponible', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80', 'Royal Canin', 'Nutrición específica para perros adultos de razas grandes (26 a 44 kg). Bolsa mayorista reforzada.', 'RC-MAXI-15'),
  ('prod-2', 'Purina Pro Plan Adult OptiHealth', 'cat-1', 'Perro', '20 kg', 74200, 'Disponible', 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&auto=format&fit=crop&q=80', 'Pro Plan', 'Fórmula completa y equilibrada para perros adultos de raza mediana con carne fresca como primer ingrediente.', 'PP-ADULT-20'),
  ('prod-3', 'Vitalcan Balanced Puppy Razas Medianas', 'cat-1', 'Perro', '15 kg', 45900, 'Disponible', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80', 'Vitalcan', 'Para cachorros hasta 12 meses. Promueve el desarrollo osteoarticular y defensas naturales.', 'VC-PUPPY-15'),
  ('prod-4', 'Pedigree Adulto Carne y Vegetales', 'cat-1', 'Perro', '21 kg', 36800, 'Disponible', 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80', 'Pedigree', 'Nutrición completa y balanceada para perros adultos con fibras naturales.', 'PED-ADULT-21'),
  ('prod-5', 'Cat Chow Adultos Pescado y Pollo', 'cat-1', 'Gato', '8 kg', 29400, 'Disponible', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&auto=format&fit=crop&q=80', 'Purina Cat Chow', 'Proteínas de alta calidad con Defense Plus para fortalecer el sistema inmunológico.', 'CC-ADULT-8'),
  ('prod-6', 'Whiskas Adulto Carne', 'cat-1', 'Gato', '10 kg', 31200, 'Disponible', 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=600&auto=format&fit=crop&q=80', 'Whiskas', 'Croquetas con relleno cremoso que aseguran el bienestar urinario y dental.', 'WH-CARNE-10'),
  ('prod-7', 'Royal Canin Mother & Babycat Mousse', 'cat-2', 'Gato', 'Pack x 12 (195g)', 28900, 'Disponible', 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=600&auto=format&fit=crop&q=80', 'Royal Canin', 'Caja cerrada x 12 latas. Textura ultra suave tipo mousse para gatas gestantes y gatitos de 1 a 4 meses.', 'RC-BABY-P12'),
  ('prod-8', 'Pedigree Pouch Carne en Salsa', 'cat-2', 'Perro', 'Pack x 24 (100g)', 19800, 'Disponible', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80', 'Pedigree', 'Display cerrado de 24 sobres individuales listos para góndola.', 'PED-POUCH-P24'),
  ('prod-9', 'Dentastix Perros Medianos', 'cat-3', 'Perro', 'Caja x 28 un.', 22400, 'Disponible', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=80', 'Pedigree', 'Snack dental científicamente probado para reducir la formación de sarro hasta un 80%.', 'DEN-MED-28'),
  ('prod-10', 'Antiparasitario Bravecto Perros 10-20 kg', 'cat-4', 'Perro', '1 Comprimido', 38900, 'Disponible', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&auto=format&fit=crop&q=80', 'MSD Salud Animal', 'Protección sistémica continua de 12 semanas contra pulgas y garrapatas.', 'BRV-1020-1')
ON CONFLICT (id) DO NOTHING;
