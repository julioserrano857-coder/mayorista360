-- ==============================================================================
-- MIGRACIÓN 2026-09-05 — Autenticación real (Supabase Auth) + RLS por rol
-- ------------------------------------------------------------------------------
-- Modelo pedido por Franco:
--   * El CATÁLOGO es PÚBLICO: cualquiera lee productos/categorías/preventistas/
--     configuración SIN registrarse (la gente pide por WhatsApp, no crea cuenta).
--   * El PANEL es PRIVADO: el dueño entra con email+clave contra Supabase Auth
--     (JWT real). Las escrituras y la lectura de pedidos exigen ese JWT.
--   * Los pedidos los crea el cliente ANÓNIMO (checkout sin registro).
--
-- Esta migración reemplaza el login viejo (tabla admin_auth con clave en texto
-- plano + RPC admin_login) y las políticas "Gestión total ... USING (true)" que
-- dejaban la base editable con la anon key pública.
-- ==============================================================================

-- 1) Helper: ¿la sesión actual es el dueño/admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT auth.jwt() ->> 'email' = 'julioserrano857@gmail.com';
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- 2) Sacar las políticas viejas (lectura total + gestión total con la anon key)
DROP POLICY IF EXISTS "Lectura pública de categorías" ON public.categories;
DROP POLICY IF EXISTS "Lectura pública de productos" ON public.products;
DROP POLICY IF EXISTS "Lectura pública de preventistas" ON public.preventistas;
DROP POLICY IF EXISTS "Lectura pública de configuración" ON public.store_settings;
DROP POLICY IF EXISTS "Lectura pública de pedidos" ON public.orders;
DROP POLICY IF EXISTS "Gestión total de categorías" ON public.categories;
DROP POLICY IF EXISTS "Gestión total de productos" ON public.products;
DROP POLICY IF EXISTS "Gestión total de preventistas" ON public.preventistas;
DROP POLICY IF EXISTS "Gestión total de configuración" ON public.store_settings;
DROP POLICY IF EXISTS "Gestión total de pedidos" ON public.orders;

-- 3) Políticas nuevas
-- Catálogo: cualquier visitante LEE (sin registro). Escribir/borrar: solo el admin.
CREATE POLICY "cat_select_public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "cat_insert_admin" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "cat_update_admin" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "cat_delete_admin" ON public.categories FOR DELETE USING (public.is_admin());

CREATE POLICY "prod_select_public" ON public.products FOR SELECT USING (true);
CREATE POLICY "prod_insert_admin" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "prod_update_admin" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "prod_delete_admin" ON public.products FOR DELETE USING (public.is_admin());

CREATE POLICY "prev_select_public" ON public.preventistas FOR SELECT USING (true);
CREATE POLICY "prev_insert_admin" ON public.preventistas FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "prev_update_admin" ON public.preventistas FOR UPDATE USING (public.is_admin());
CREATE POLICY "prev_delete_admin" ON public.preventistas FOR DELETE USING (public.is_admin());

-- Configuración: el catálogo muestra nombre/anuncio (lectura pública); solo admin escribe.
CREATE POLICY "set_select_public" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "set_insert_admin" ON public.store_settings FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "set_update_admin" ON public.store_settings FOR UPDATE USING (public.is_admin());
CREATE POLICY "set_delete_admin" ON public.store_settings FOR DELETE USING (public.is_admin());

-- Pedidos: el cliente ANÓNIMO puede crear su pedido (checkout sin registro);
-- verlos/borrarlos/cambiarlos: solo el admin (protege los datos de los clientes).
CREATE POLICY "ord_select_admin" ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "ord_insert_public" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "ord_update_admin" ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "ord_delete_admin" ON public.orders FOR DELETE USING (public.is_admin());

-- 4) Permisos de tabla coherentes con las políticas
REVOKE ALL ON public.categories, public.products, public.preventistas, public.store_settings, public.orders FROM anon;
GRANT SELECT ON public.categories, public.products, public.preventistas, public.store_settings, public.orders TO anon;
GRANT INSERT ON public.orders TO anon;
GRANT ALL ON public.categories, public.products, public.preventistas, public.store_settings, public.orders TO authenticated;

-- 5) Limpieza del login viejo (clave en texto plano) — reemplazado por Supabase Auth
DROP TABLE IF EXISTS public.admin_auth;
DROP FUNCTION IF EXISTS public.admin_login(TEXT);
DROP FUNCTION IF EXISTS public.admin_change_password(TEXT, TEXT);
