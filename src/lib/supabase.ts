// Cliente y sincronizador con Supabase (TypeScript)
// Supabase es la ÚNICA fuente de verdad. Las credenciales se configuran
// SOLO por variables de entorno (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY),
// nunca desde la UI ni localStorage.
//
// Modelo de seguridad (2026-09-05):
// - El CATÁLOGO es público: cualquier visitante lee products/categories/
//   preventistas/store_settings sin registrarse (RLS: SELECT USING true).
// - El PANEL es privado: el admin entra con email + contraseña contra
//   Supabase Auth y obtiene un JWT real. Las escrituras (y la lectura de
//   pedidos) requieren ese JWT (RLS: is_admin()).
// - La sesión vive en sessionStorage como JSON {accessToken, ...}: un
//   'true' a secas ya no basta para abrir el panel.

import { Product, Category, Preventista, StoreSettings, Order } from '../types';

export const ADMIN_EMAIL = 'julioserrano857@gmail.com';

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

// ============================================================================
// SESIÓN DE ADMINISTRADOR (Supabase Auth — JWT real, no un flag trucho)
// ============================================================================

const SESSION_STORAGE_KEY = 'mayorista360_admin_session_v1';

export interface AdminSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
  email: string;
}

function readSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.accessToken !== 'string' || !parsed.expiresAt) return null;
    return parsed as AdminSession;
  } catch {
    return null;
  }
}

function persistSession(session: AdminSession | null) {
  try {
    if (session) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

/** Devuelve la sesión si existe y no expiró (con 1 min de margen). */
export function getSession(): AdminSession | null {
  const session = readSession();
  if (!session) return null;
  if (Date.now() >= session.expiresAt - 60_000) return null;
  return session;
}

export const isAdminSessionActive = (): boolean => getSession() !== null;

interface ApiError extends Error {
  status?: number;
  code?: string;
}

/** Lee el body de un error HTTP de Supabase y lo convierte en un Error legible. */
async function toApiError(response: Response, fallback: string): Promise<ApiError> {
  let message = fallback;
  let code: string | undefined;
  try {
    const body = await response.json();
    if (body && typeof body === 'object') {
      message =
        body.error_description ||
        body.msg ||
        body.message ||
        (typeof body.error === 'string' ? body.error : '') ||
        fallback;
      code = body.error_code || body.code || undefined;
    }
  } catch {
    // body no era JSON
  }
  const err = new Error(message) as ApiError;
  err.status = response.status;
  err.code = code;
  return err;
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const { key } = getSupabaseConfig();
  return {
    apikey: key,
    'Content-Type': 'application/json',
    ...extra
  };
}

function authUrl(path: string): string {
  const { url } = getSupabaseConfig();
  return `${url}/auth/v1${path}`;
}

/** Operaciones de Supabase Auth (única cuenta: el admin/dueno). */
export const auth = {
  async signIn(email: string, password: string): Promise<AdminSession> {
    const { key } = getSupabaseConfig();
    const response = await fetch(authUrl('/token?grant_type=password'), {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password })
    });
    if (!response.ok) {
      throw await toApiError(response, 'No se pudo iniciar sesión. Revisá tus datos.');
    }
    const data = await response.json();
    const session: AdminSession = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
      email: data.user?.email || email.trim().toLowerCase()
    };
    persistSession(session);
    return session;
  },

  async signOut(): Promise<void> {
    const session = getSession();
    if (session) {
      try {
        const { key } = getSupabaseConfig();
        await fetch(authUrl('/logout'), {
          method: 'POST',
          headers: { apikey: key, Authorization: `Bearer ${session.accessToken}` }
        });
      } catch {
        // aunque falle la revocación, limpiamos la sesión local
      }
    }
    persistSession(null);
  },

  /** Valida la contraseña actual haciendo un sign-in y mantiene la sesión previa. */
  async verifyPassword(email: string, password: string): Promise<boolean> {
    const { key } = getSupabaseConfig();
    const response = await fetch(authUrl('/token?grant_type=password'), {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password })
    });
    return response.ok;
  },

  async changePassword(newPassword: string): Promise<boolean> {
    const session = getSession();
    if (!session) throw new Error('No hay sesión activa.');
    const response = await fetch(authUrl('/user'), {
      method: 'PUT',
      headers: { ...authHeaders(), Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify({ password: newPassword })
    });
    if (!response.ok) {
      throw await toApiError(response, 'No se pudo cambiar la contraseña.');
    }
    return true;
  }
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
  description: row.description ? String(row.description) : undefined
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

// ============================================================================
// Cliente REST ligero (Supabase = única fuente de verdad)
// - Sin sesión admin -> usa la anon key (catálogo público).
// - Con sesión admin -> usa el JWT del admin (escrituras y pedidos).
// - Cualquier respuesta HTTP no-OK LANZA un Error legible (nada de silencios).
// ============================================================================

function restHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const { key } = getSupabaseConfig();
  const session = getSession();
  const token = session ? session.accessToken : key;
  return {
    apikey: key,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

export const supabaseClient = {
  isConfigured: isSupabaseConfigured,

  async query<T = any>(table: string, options: { select?: string; filter?: string; order?: string } = {}): Promise<T[]> {
    if (!isSupabaseConfigured()) return [];
    const { url } = getSupabaseConfig();
    try {
      let reqUrl = `${url}/rest/v1/${table}?select=${encodeURIComponent(options.select || '*')}`;
      if (options.filter) reqUrl += `&${options.filter}`;
      if (options.order) reqUrl += `&order=${encodeURIComponent(options.order)}`;

      const response = await fetch(reqUrl, {
        headers: restHeaders()
      });
      if (!response.ok) {
        throw await toApiError(response, `Error al leer ${table} (${response.status}).`);
      }
      if (response.status === 204) return [];
      return await response.json();
    } catch (err) {
      console.warn(`[Supabase Query Error] ${table}:`, err);
      throw err;
    }
  },

  async upsert(table: string, data: any | any[]): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { url } = getSupabaseConfig();
    try {
      const response = await fetch(`${url}/rest/v1/${table}`, {
        method: 'POST',
        headers: restHeaders({ Prefer: 'resolution=merge-duplicates' }),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw await toApiError(response, `No se pudo guardar en ${table} (${response.status}).`);
      }
      return true;
    } catch (err) {
      console.warn(`[Supabase Upsert Error] ${table}:`, err);
      throw err;
    }
  },

  // INSERT puro: POST sin "resolution=merge-duplicates". No requiere permiso
  // UPDATE (los roles anónimos solo tienen INSERT en algunas tablas, p.ej.
  // orders al crear un pedido desde el catálogo público).
  async insert(table: string, data: any | any[]): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { url } = getSupabaseConfig();
    try {
      const response = await fetch(`${url}/rest/v1/${table}`, {
        method: 'POST',
        headers: restHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw await toApiError(response, `No se pudo insertar en ${table} (${response.status}).`);
      }
      return true;
    } catch (err) {
      console.warn(`[Supabase Insert Error] ${table}:`, err);
      throw err;
    }
  },

  async delete(table: string, matchColumn: string, matchValue: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { url } = getSupabaseConfig();
    try {
      const response = await fetch(`${url}/rest/v1/${table}?${matchColumn}=eq.${encodeURIComponent(matchValue)}`, {
        method: 'DELETE',
        headers: restHeaders()
      });
      if (!response.ok) {
        throw await toApiError(response, `No se pudo borrar de ${table} (${response.status}).`);
      }
      return true;
    } catch (err) {
      console.warn(`[Supabase Delete Error] ${table}:`, err);
      throw err;
    }
  },

  // Delete rows matching multiple filters, e.g. deleteWhere('orders', { status: 'eq.Pendiente', created_at: 'lt.2026-08-29T...' })
  async deleteWhere(table: string, filters: Record<string, string>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { url } = getSupabaseConfig();
    try {
      const query = Object.entries(filters)
        .map(([col, op]) => `${col}=${op}`)
        .join('&');
      const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
        method: 'DELETE',
        headers: restHeaders()
      });
      if (!response.ok) {
        throw await toApiError(response, `No se pudo borrar de ${table} (${response.status}).`);
      }
      return true;
    } catch (err) {
      console.warn(`[Supabase DeleteWhere Error] ${table}:`, err);
      throw err;
    }
  },

  async deleteAll(table: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { url } = getSupabaseConfig();
    try {
      const response = await fetch(`${url}/rest/v1/${table}?id=neq.____all____`, {
        method: 'DELETE',
        headers: restHeaders()
      });
      if (!response.ok) {
        throw await toApiError(response, `No se pudo vaciar ${table} (${response.status}).`);
      }
      return true;
    } catch (err) {
      console.warn(`[Supabase DeleteAll Error] ${table}:`, err);
      throw err;
    }
  },

  async rpc(fn: string, body: Record<string, unknown> = {}): Promise<any> {
    if (!isSupabaseConfigured()) return null;
    const { url } = getSupabaseConfig();
    try {
      const response = await fetch(`${url}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers: restHeaders(),
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        throw await toApiError(response, `Error en ${fn} (${response.status}).`);
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (err) {
      console.warn(`[Supabase RPC Error] ${fn}:`, err);
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
