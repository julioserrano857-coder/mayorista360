// Cliente y sincronizador con Supabase (TypeScript)
// Supabase es la ÚNICA fuente de verdad. Las credenciales se configuran
// SOLO por variables de entorno (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY),
// nunca desde la UI ni localStorage.

import { Product, Category, Preventista, StoreSettings, Order } from '../types';

export const getSupabaseConfig = () => {
  const url = ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
  const key = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();

  return {
    url,
    key,
    isCustom: false
  };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(
    url &&
    key &&
    url !== 'https://xyzcompany.supabase.co' &&
    url.startsWith('http')
  );
};

// Converters between App Domain types and Database schema
export const toDbProduct = (p: Product) => ({
  id: p.id,
  name: p.name,
  category_id: p.categoryId,
  weight: p.weight,
  price: Number(p.price) || 0,
  status: p.status,
  image_url: p.imageUrl || '',
  brand: p.brand || null,
  description: p.description || null,
  sku: p.sku || null,
  updated_at: new Date().toISOString()
});

export const fromDbProduct = (row: any): Product => ({
  id: String(row.id),
  name: String(row.name || ''),
  categoryId: String(row.category_id || ''),
  weight: String(row.weight || ''),
  price: Number(row.price) || 0,
  status: row.status === 'Sin Stock' ? 'Sin Stock' : 'Disponible',
  imageUrl: String(row.image_url || ''),
  brand: row.brand ? String(row.brand) : undefined,
  description: row.description ? String(row.description) : undefined,
  sku: row.sku ? String(row.sku) : undefined
});

export const toDbCategory = (c: Category) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  order: c.order || 0,
  active: c.active ?? true
});

export const fromDbCategory = (row: any): Category => ({
  id: String(row.id),
  name: String(row.name || ''),
  slug: String(row.slug || ''),
  order: Number(row.order) || 0,
  active: Boolean(row.active ?? true)
});

export const toDbPreventista = (p: Preventista) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  whatsapp: p.whatsapp,
  active: p.active ?? true,
  zone: p.zone || null
});

export const fromDbPreventista = (row: any): Preventista => ({
  id: String(row.id),
  name: String(row.name || ''),
  slug: String(row.slug || ''),
  whatsapp: String(row.whatsapp || ''),
  active: Boolean(row.active ?? true),
  zone: row.zone ? String(row.zone) : undefined
});

export const toDbSettings = (s: StoreSettings) => ({
  id: 'default_settings',
  company_name: s.companyName,
  default_whatsapp: s.defaultWhatsApp,
  currency_symbol: s.currencySymbol,
  announcement: s.announcement || null,
  min_order_amount: s.minOrderAmount || 0,
  updated_at: new Date().toISOString()
});

export const fromDbSettings = (row: any): StoreSettings => ({
  companyName: String(row.company_name || 'Mi Distribuidora Mayorista'),
  defaultWhatsApp: String(row.default_whatsapp || ''),
  currencySymbol: String(row.currency_symbol || '$'),
  announcement: row.announcement ? String(row.announcement) : undefined,
  minOrderAmount: Number(row.min_order_amount) || 0
});

export const toDbOrder = (o: Order) => ({
  id: o.id,
  code: o.code,
  created_at: o.createdAt,
  preventista_id: o.preventistaId || null,
  preventista_name: o.preventistaName || 'Central Directa',
  preventista_whatsapp: o.preventistaWhatsapp || null,
  client_name: o.clientName || null,
  notes: o.notes || null,
  items: o.items || [],
  total_amount: o.totalAmount,
  total_units: o.totalUnits,
  status: o.status || 'Pendiente'
});

export const fromDbOrder = (row: any): Order => ({
  id: String(row.id),
  code: String(row.code || ''),
  createdAt: String(row.created_at || new Date().toISOString()),
  preventistaId: row.preventista_id ? String(row.preventista_id) : undefined,
  preventistaName: String(row.preventista_name || 'Central Directa'),
  preventistaWhatsapp: row.preventista_whatsapp ? String(row.preventista_whatsapp) : undefined,
  clientName: row.client_name ? String(row.client_name) : undefined,
  notes: row.notes ? String(row.notes) : undefined,
  items: Array.isArray(row.items) ? row.items : [],
  totalAmount: Number(row.total_amount) || 0,
  totalUnits: Number(row.total_units) || 0,
  status: (row.status as any) || 'Pendiente'
});

// Cliente REST ligero (Supabase = única fuente de verdad)
export const supabaseClient = {
  isConfigured: isSupabaseConfigured,

  async query<T = any>(table: string, options: { select?: string; filter?: string; order?: string } = {}): Promise<T[]> {
    if (!isSupabaseConfigured()) return [];
    const { url, key } = getSupabaseConfig();
    try {
      let reqUrl = `${url}/rest/v1/${table}?select=${encodeURIComponent(options.select || '*')}`;
      if (options.filter) reqUrl += `&${options.filter}`;
      if (options.order) reqUrl += `&order=${encodeURIComponent(options.order)}`;

      const response = await fetch(reqUrl, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        console.warn(`[Supabase REST Error] ${table}:`, response.status, response.statusText);
        return [];
      }
      return await response.json();
    } catch (err) {
      console.warn(`[Supabase Fetch Error] ${table}:`, err);
      throw err;
    }
  },

  async upsert(table: string, data: any | any[]): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { url, key } = getSupabaseConfig();
    try {
      const response = await fetch(`${url}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (err) {
      console.warn(`[Supabase Upsert Error] ${table}:`, err);
      throw err;
    }
  },

  async delete(table: string, matchColumn: string, matchValue: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { url, key } = getSupabaseConfig();
    try {
      const response = await fetch(`${url}/rest/v1/${table}?${matchColumn}=eq.${encodeURIComponent(matchValue)}`, {
        method: 'DELETE',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      return response.ok;
    } catch (err) {
      console.warn(`[Supabase Delete Error] ${table}:`, err);
      throw err;
    }
  },

  // Delete rows matching multiple filters, e.g. deleteWhere('orders', { status: 'eq.Pendiente', created_at: 'lt.2026-08-29T...' })
  async deleteWhere(table: string, filters: Record<string, string>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { url, key } = getSupabaseConfig();
    try {
      const query = Object.entries(filters)
        .map(([col, op]) => `${col}=${op}`)
        .join('&');
      const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
        method: 'DELETE',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      return response.ok;
    } catch (err) {
      console.warn(`[Supabase DeleteWhere Error] ${table}:`, err);
      throw err;
    }
  },

  async deleteAll(table: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { url, key } = getSupabaseConfig();
    try {
      const response = await fetch(`${url}/rest/v1/${table}?id=neq.____all____`, {
        method: 'DELETE',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      return response.ok;
    } catch (err) {
      console.warn(`[Supabase DeleteAll Error] ${table}:`, err);
      throw err;
    }
  },

  async rpc(fn: string, body: Record<string, unknown> = {}): Promise<any> {
    if (!isSupabaseConfigured()) return null;
    const { url, key } = getSupabaseConfig();
    try {
      const response = await fetch(`${url}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        console.warn(`[Supabase RPC Error] ${fn}:`, response.status, response.statusText);
        return null;
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (err) {
      console.warn(`[Supabase RPC Fetch Error] ${fn}:`, err);
      throw err;
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const { url, key } = getSupabaseConfig();
    if (!url || !key) {
      return { success: false, message: 'Supabase no está configurado. Definí VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en las variables de entorno del deploy.' };
    }
    try {
      const response = await fetch(`${url}/rest/v1/categories?select=id&limit=1`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      if (response.ok) {
        return { success: true, message: '¡Conexión exitosa con la base de datos de Supabase!' };
      } else if (response.status === 401 || response.status === 403) {
        return { success: false, message: 'Error de autenticación. Verifica que la API Key anónima sea correcta.' };
      } else if (response.status === 404) {
        return { success: false, message: 'No se encontró la tabla categories. ¿Corriste el schema.sql en Supabase?' };
      } else {
        return { success: false, message: `Respuesta de Supabase: ${response.status} ${response.statusText}` };
      }
    } catch (err: any) {
      return { success: false, message: `No se pudo conectar: ${err?.message || 'Error de red o CORS'}` };
    }
  }
};
