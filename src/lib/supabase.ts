// Cliente y sincronizador con Supabase (TypeScript)
// Soporta tanto variables de entorno (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
// como configuración manual desde el panel de administración con fallback en localStorage.

import { Product, Category, Preventista, StoreSettings } from '../types';

const STORAGE_SUPABASE_URL = 'nutrimayorista_supabase_url';
const STORAGE_SUPABASE_KEY = 'nutrimayorista_supabase_anon_key';

export const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  let localUrl = '';
  let localKey = '';
  try {
    localUrl = localStorage.getItem(STORAGE_SUPABASE_URL) || '';
    localKey = localStorage.getItem(STORAGE_SUPABASE_KEY) || '';
  } catch {
    // ignore
  }

  const url = (localUrl || envUrl).trim();
  const key = (localKey || envKey).trim();

  return {
    url,
    key,
    isCustom: Boolean(localUrl || localKey)
  };
};

export const setCustomSupabaseConfig = (url: string, key: string) => {
  try {
    if (!url.trim() && !key.trim()) {
      localStorage.removeItem(STORAGE_SUPABASE_URL);
      localStorage.removeItem(STORAGE_SUPABASE_KEY);
    } else {
      localStorage.setItem(STORAGE_SUPABASE_URL, url.trim());
      localStorage.setItem(STORAGE_SUPABASE_KEY, key.trim());
    }
  } catch {
    // ignore
  }
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
  species: p.species,
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
  species: (row.species === 'Perro' || row.species === 'Gato' || row.species === 'Otros') ? row.species : 'Perro',
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
  companyName: String(row.company_name || 'NutriMayorista Pet Food'),
  defaultWhatsApp: String(row.default_whatsapp || '5491134567890'),
  currencySymbol: String(row.currency_symbol || '$'),
  announcement: row.announcement ? String(row.announcement) : undefined,
  minOrderAmount: Number(row.min_order_amount) || 0
});

// Cliente REST ligero
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
      return [];
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
      return false;
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
      return false;
    }
  },

  async testConnection(customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string }> {
    const url = customUrl || getSupabaseConfig().url;
    const key = customKey || getSupabaseConfig().key;

    if (!url || !key) {
      return { success: false, message: 'Falta ingresar la URL o la API Key anónima.' };
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
