import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Category,
  Product,
  Preventista,
  StoreSettings,
  CartItem,
  ProductStatus,
  Order,
  OrderStatus,
  OrderItem
} from '../types';
import { INITIAL_SETTINGS } from '../data/initialData';
import { generateSlug, cleanWhatsAppNumber } from '../utils/whatsapp';
import {
  supabaseClient,
  isSupabaseConfigured,
  toDbProduct,
  fromDbProduct,
  toDbCategory,
  fromDbCategory,
  toDbPreventista,
  fromDbPreventista,
  toDbSettings,
  fromDbSettings,
  toDbOrder,
  fromDbOrder
} from '../lib/supabase';

interface StoreContextType {
  // Catalog Data (single source of truth: Supabase)
  products: Product[];
  categories: Category[];
  preventistas: Preventista[];
  settings: StoreSettings;
  activePreventista: Preventista | null;
  activeRef: string | null;

  // Cart (kept in the device ONLY as a draft so a reload doesn't lose it)
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Orders Management
  orders: Order[];
  addOrder: (orderData: {
    clientName?: string;
    notes?: string;
    items: CartItem[];
    preventistaId?: string;
    preventistaName?: string;
    preventistaWhatsapp?: string;
    totalAmount?: number;
    totalUnits?: number;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  clearDeliveredOrders: () => void;

  // Product Management
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateProductPrice: (id: string, newPrice: number) => void;
  toggleProductStatus: (id: string) => void;

  // Category Management
  addCategory: (category: Omit<Category, 'id' | 'slug'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (orderedIds: string[]) => void;

  // Preventista Management
  addPreventista: (preventista: Omit<Preventista, 'id' | 'slug'>) => Preventista;
  updatePreventista: (id: string, updates: Partial<Preventista>) => void;
  deletePreventista: (id: string) => void;
  getPreventistaShareUrl: (slug: string) => string;
  getClientCatalogUrl: () => string;

  // Settings & Security
  updateSettings: (updates: Partial<StoreSettings>) => void;
  updateAdminPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isAdminAuthenticated: boolean;
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  resetAllDataToDefaults: () => Promise<void>;
  clearAllCatalogData: () => Promise<void>;

  // Cloud Sync Status (Supabase = source of truth)
  isCloudConfigured: boolean;
  isCloudConnected: boolean;
  isCloudSyncing: boolean;
  isInitialLoading: boolean;
  cloudStatusText: string;
  refreshFromCloud: () => Promise<boolean>;
  exportBackupJson: () => string;
  importBackupJson: (jsonString: string) => Promise<boolean>;
}

// Cart draft lives in localStorage (the ONLY approved local exception) and expires after 24h.
const CART_STORAGE_KEY = 'mayorista360_cart_v1';
const CART_TIMESTAMP_KEY = 'mayorista360_cart_timestamp_v1';
const SESSION_STORAGE_KEY = 'mayorista360_admin_session_v1';
const CART_EXPIRATION_MS = 24 * 60 * 60 * 1000;

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function readCartFromDevice(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    const timestamp = localStorage.getItem(CART_TIMESTAMP_KEY);
    if (saved && timestamp) {
      const savedTime = parseInt(timestamp, 10);
      if (!isNaN(savedTime) && Date.now() - savedTime > CART_EXPIRATION_MS) {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(CART_TIMESTAMP_KEY);
        return [];
      }
    }
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function readSessionFromDevice(): boolean {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // All catalog data starts EMPTY; it is loaded from Supabase on mount.
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [preventistas, setPreventistas] = useState<Preventista[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(readSessionFromDevice);

  // Cart: only persisted locally as a draft so a page reload doesn't lose the order.
  const [cart, setCart] = useState<CartItem[]>(readCartFromDevice);

  const [activeRef, setActiveRef] = useState<string | null>(null);

  // Cloud synchronization status
  const isCloudConfigured = isSupabaseConfigured();
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [cloudStatusText, setCloudStatusText] = useState<string>(() =>
    isSupabaseConfigured() ? 'Conectando con Supabase...' : 'Supabase no configurado (definir VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY)'
  );

  // Parse URL query parameter 'ref' on load and when URL changes
  useEffect(() => {
    const parseRef = () => {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      setActiveRef(ref ? ref.trim() : null);
    };
    parseRef();
    window.addEventListener('popstate', parseRef);
    return () => window.removeEventListener('popstate', parseRef);
  }, []);

  // Persist cart draft on device (approved exception) — session persists per browser session
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      if (cart.length > 0) {
        localStorage.setItem(CART_TIMESTAMP_KEY, String(Date.now()));
      } else {
        localStorage.removeItem(CART_TIMESTAMP_KEY);
      }
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, String(isAdminAuthenticated));
    } catch {
      // ignore
    }
  }, [isAdminAuthenticated]);

  // ===================================================================
  // SUPABASE: single source of truth. Pull everything on mount.
  // ===================================================================
  const refreshFromCloud = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setIsCloudConnected(false);
      setCloudStatusText('Supabase no configurado (definir VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY)');
      setIsInitialLoading(false);
      return false;
    }

    setIsCloudSyncing(true);
    setCloudStatusText('Sincronizando con Supabase...');

    try {
      const [dbCats, dbProds, dbPrevs, dbSettings, dbOrders] = await Promise.all([
        supabaseClient.query('categories', { order: 'order.asc' }),
        supabaseClient.query('products'),
        supabaseClient.query('preventistas'),
        supabaseClient.query('store_settings', { filter: 'id=eq.default_settings' }),
        supabaseClient.query('orders', { order: 'created_at.desc' })
      ]);

      setCategories(Array.isArray(dbCats) ? dbCats.map(fromDbCategory) : []);
      setProducts(Array.isArray(dbProds) ? dbProds.map(fromDbProduct) : []);
      setPreventistas(Array.isArray(dbPrevs) ? dbPrevs.map(fromDbPreventista) : []);
      setOrders(Array.isArray(dbOrders) ? dbOrders.map(fromDbOrder) : []);

      if (Array.isArray(dbSettings) && dbSettings.length > 0) {
        setSettings(fromDbSettings(dbSettings[0]));
      } else {
        setSettings(INITIAL_SETTINGS);
      }

      setIsCloudConnected(true);
      setCloudStatusText('☁️ Conectado a Supabase');
      return true;
    } catch (err) {
      console.warn('[Cloud Sync Error]', err);
      setIsCloudConnected(false);
      setCloudStatusText('⚠️ Sin conexión: no se pudo cargar desde Supabase. Revisá tu internet.');
      return false;
    } finally {
      setIsCloudSyncing(false);
      setIsInitialLoading(false);
    }
  }, []);

  // Initial load: Supabase is the source of truth
  useEffect(() => {
    refreshFromCloud();
  }, [refreshFromCloud]);

  // Auto-clean "ghost" orders: pending orders older than 7 days that were
  // never confirmed (the client tapped send but the preventista never
  // forwarded/received it). Runs whenever the admin opens the panel.
  useEffect(() => {
    if (!isAdminAuthenticated || !isSupabaseConfigured()) return;

    const cleanup = async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      try {
        const ok = await supabaseClient.deleteWhere('orders', {
          status: 'eq.Pendiente',
          created_at: `lt.${sevenDaysAgo}`
        });
        if (ok) {
          // Remove them from local state too
          setOrders((prev) => prev.filter((o) => o.status !== 'Pendiente' || new Date(o.createdAt) >= new Date(sevenDaysAgo)));
        }
      } catch (err) {
        console.warn('[Auto-clean ghost orders]', err);
      }
    };

    cleanup();
  }, [isAdminAuthenticated]);

  const handleWriteError = (context: string, err: any) => {
    console.warn(`[Supabase Write Error] ${context}`, err);
    setIsCloudConnected(false);
    setCloudStatusText('⚠️ Sin conexión: el cambio no se guardó en la nube. Revisá tu internet.');
  };

  // Resolve Active Preventista from slug or name
  const activePreventista = useMemo(() => {
    if (!activeRef) return null;
    const cleanRef = activeRef.toLowerCase().trim();
    const found = preventistas.find(
      (p) =>
        p.active &&
        (p.slug.toLowerCase() === cleanRef ||
          p.name.toLowerCase().includes(cleanRef) ||
          cleanRef === generateSlug(p.name))
    );
    return found || null;
  }, [activeRef, preventistas]);

  // Keep cart item product data in sync with catalog (from Supabase)
  // Only run after the first cloud load completes, so we never wipe the
  // saved cart just because products haven't arrived yet.
  useEffect(() => {
    if (isInitialLoading) return;
    setCart((prevCart) => {
      let changed = false;
      const updated = prevCart
        .map((item) => {
          const freshProduct = products.find((p) => p.id === item.product.id);
          if (!freshProduct) {
            changed = true;
            return null;
          }
          if (
            freshProduct.price !== item.product.price ||
            freshProduct.status !== item.product.status ||
            freshProduct.name !== item.product.name ||
            freshProduct.weight !== item.product.weight
          ) {
            changed = true;
            return {
              ...item,
              product: freshProduct
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      return changed ? updated : prevCart;
    });
  }, [products, isInitialLoading]);

  // Cart Computations
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);

  // Cart Methods
  const addToCart = (product: Product, quantity = 1) => {
    if (product.status === 'Sin Stock') return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity: Math.max(1, quantity) }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_TIMESTAMP_KEY);
    } catch {
      // ignore
    }
  };

  // ===================================================================
  // PRODUCT METHODS (write through to Supabase — source of truth)
  // ===================================================================
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`
    };
    setProducts((prev) => [newProduct, ...prev]);
    if (isSupabaseConfigured()) {
      supabaseClient.upsert('products', toDbProduct(newProduct)).catch((err) => {
        handleWriteError('addProduct', err);
        setProducts((prev) => prev.filter((p) => p.id !== newProduct.id));
      });
    }
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    let updatedObj: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedObj = { ...p, ...updates };
          return updatedObj;
        }
        return p;
      })
    );
    if (updatedObj && isSupabaseConfigured()) {
      supabaseClient.upsert('products', toDbProduct(updatedObj)).catch((err) => handleWriteError('updateProduct', err));
    }
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    removeFromCart(id);
    if (isSupabaseConfigured()) {
      supabaseClient.delete('products', 'id', id).catch((err) => handleWriteError('deleteProduct', err));
    }
  };

  const updateProductPrice = (id: string, newPrice: number) => {
    const validPrice = Math.max(0, newPrice);
    let updatedObj: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedObj = { ...p, price: validPrice };
          return updatedObj;
        }
        return p;
      })
    );
    if (updatedObj && isSupabaseConfigured()) {
      supabaseClient.upsert('products', toDbProduct(updatedObj)).catch((err) => handleWriteError('updateProductPrice', err));
    }
  };

  const toggleProductStatus = (id: string) => {
    let updatedObj: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus: ProductStatus = p.status === 'Disponible' ? 'Sin Stock' : 'Disponible';
          updatedObj = { ...p, status: nextStatus };
          return updatedObj;
        }
        return p;
      })
    );
    if (updatedObj && isSupabaseConfigured()) {
      supabaseClient.upsert('products', toDbProduct(updatedObj)).catch((err) => handleWriteError('toggleProductStatus', err));
    }
  };

  // ===================================================================
  // CATEGORY METHODS
  // ===================================================================
  const addCategory = (catData: Omit<Category, 'id' | 'slug'>): Category => {
    const slug = generateSlug(catData.name) || `cat-${Date.now()}`;
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
      slug
    };
    setCategories((prev) => [...prev, newCat]);
    if (isSupabaseConfigured()) {
      supabaseClient.upsert('categories', toDbCategory(newCat)).catch((err) => {
        handleWriteError('addCategory', err);
        setCategories((prev) => prev.filter((c) => c.id !== newCat.id));
      });
    }
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    let updatedObj: Category | null = null;
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          const updatedName = updates.name !== undefined ? updates.name : cat.name;
          const updatedSlug = updates.name ? generateSlug(updates.name) : cat.slug;
          updatedObj = { ...cat, ...updates, slug: updatedSlug };
          return updatedObj;
        }
        return cat;
      })
    );
    if (updatedObj && isSupabaseConfigured()) {
      supabaseClient.upsert('categories', toDbCategory(updatedObj)).catch((err) => handleWriteError('updateCategory', err));
    }
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (isSupabaseConfigured()) {
      supabaseClient.delete('categories', 'id', id).catch((err) => handleWriteError('deleteCategory', err));
    }
  };

  const reorderCategories = (orderedIds: string[]) => {
    let reordered: Category[] = [];
    setCategories((prev) => {
      const map = new Map<string, Category>();
      prev.forEach((c) => map.set(c.id, c));
      reordered = orderedIds
        .map((id, index) => {
          const item = map.get(id);
          return item ? { ...item, order: index + 1 } : null;
        })
        .filter((cat): cat is Category => cat !== null);
      return reordered;
    });
    if (isSupabaseConfigured() && reordered.length > 0) {
      supabaseClient.upsert('categories', reordered.map(toDbCategory)).catch((err) => handleWriteError('reorderCategories', err));
    }
  };

  // ===================================================================
  // PREVENTISTA METHODS
  // ===================================================================
  const addPreventista = (prevData: Omit<Preventista, 'id' | 'slug'>): Preventista => {
    const slug = generateSlug(prevData.name) || `prev-${Date.now()}`;
    const newPrev: Preventista = {
      ...prevData,
      whatsapp: cleanWhatsAppNumber(prevData.whatsapp),
      id: `prev-${Date.now()}`,
      slug
    };
    setPreventistas((prev) => [...prev, newPrev]);
    if (isSupabaseConfigured()) {
      supabaseClient.upsert('preventistas', toDbPreventista(newPrev)).catch((err) => {
        handleWriteError('addPreventista', err);
        setPreventistas((prev) => prev.filter((p) => p.id !== newPrev.id));
      });
    }
    return newPrev;
  };

  const updatePreventista = (id: string, updates: Partial<Preventista>) => {
    let updatedObj: Preventista | null = null;
    setPreventistas((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newName = updates.name !== undefined ? updates.name : p.name;
          const newSlug = updates.name ? generateSlug(updates.name) : p.slug;
          const newWa = updates.whatsapp !== undefined ? cleanWhatsAppNumber(updates.whatsapp) : p.whatsapp;
          updatedObj = { ...p, ...updates, slug: newSlug, whatsapp: newWa };
          return updatedObj;
        }
        return p;
      })
    );
    if (updatedObj && isSupabaseConfigured()) {
      supabaseClient.upsert('preventistas', toDbPreventista(updatedObj)).catch((err) => handleWriteError('updatePreventista', err));
    }
  };

  const deletePreventista = (id: string) => {
    setPreventistas((prev) => prev.filter((p) => p.id !== id));
    if (isSupabaseConfigured()) {
      supabaseClient.delete('preventistas', 'id', id).catch((err) => handleWriteError('deletePreventista', err));
    }
  };

  const getPreventistaShareUrl = (slug: string) => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?view=pedidos&ref=${encodeURIComponent(slug)}`;
  };

  const getClientCatalogUrl = () => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?view=pedidos`;
  };

  // ===================================================================
  // SETTINGS & SECURITY
  // ===================================================================
  const updateSettings = (updates: Partial<StoreSettings>) => {
    let newSettings: StoreSettings = settings;
    setSettings((prev) => {
      newSettings = {
        ...prev,
        ...updates,
        defaultWhatsApp: updates.defaultWhatsApp ? cleanWhatsAppNumber(updates.defaultWhatsApp) : prev.defaultWhatsApp
      };
      return newSettings;
    });
    if (isSupabaseConfigured()) {
      supabaseClient.upsert('store_settings', toDbSettings(newSettings)).catch((err) => handleWriteError('updateSettings', err));
    }
  };

  const updateAdminPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!newPassword || newPassword.trim().length < 4) return false;
    if (!isSupabaseConfigured()) return false;
    try {
      const ok = await supabaseClient.rpc('admin_change_password', {
        current_pwd: currentPassword.trim(),
        new_pwd: newPassword.trim()
      });
      return ok === true;
    } catch (err) {
      handleWriteError('updateAdminPassword', err);
      return false;
    }
  };

  const loginAdmin = async (password: string): Promise<boolean> => {
    const trimmed = password.trim();
    if (!trimmed) return false;

    if (!isSupabaseConfigured()) {
      setCloudStatusText('Supabase no configurado: no se puede iniciar sesión. Definí VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
      return false;
    }

    try {
      const ok = await supabaseClient.rpc('admin_login', { pwd: trimmed });
      if (ok === true) {
        setIsAdminAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      handleWriteError('loginAdmin', err);
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // ===================================================================
  // ORDERS METHODS
  // ===================================================================
  const addOrder = (orderData: {
    clientName?: string;
    notes?: string;
    items: CartItem[];
    preventistaId?: string;
    preventistaName?: string;
    preventistaWhatsapp?: string;
    totalAmount?: number;
    totalUnits?: number;
  }): Order => {
    // Generate unique 4-digit numeric code e.g. 4821
    let code = Math.floor(1000 + Math.random() * 9000).toString();
    const existingCodes = new Set(orders.filter((o) => o.status === 'Pendiente').map((o) => o.code));
    let attempts = 0;
    while (existingCodes.has(code) && attempts < 30) {
      code = Math.floor(1000 + Math.random() * 9000).toString();
      attempts++;
    }

    const orderItems: OrderItem[] = orderData.items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      weight: item.product.weight,
      quantity: item.quantity,
      unitPrice: item.product.price,
      subtotal: item.product.price * item.quantity
    }));

    const calculatedTotal = orderItems.reduce((sum, it) => sum + it.subtotal, 0);
    const calculatedUnits = orderItems.reduce((sum, it) => sum + it.quantity, 0);

    const newOrder: Order = {
      id: `ord-${Date.now()}-${code}`,
      code,
      createdAt: new Date().toISOString(),
      preventistaId: orderData.preventistaId,
      preventistaName: orderData.preventistaName || 'Central Directa',
      preventistaWhatsapp: orderData.preventistaWhatsapp,
      clientName: orderData.clientName?.trim() || undefined,
      notes: orderData.notes?.trim() || undefined,
      items: orderItems,
      totalAmount: orderData.totalAmount ?? calculatedTotal,
      totalUnits: orderData.totalUnits ?? calculatedUnits,
      status: 'Pendiente'
    };

    setOrders((prev) => [newOrder, ...prev]);
    if (isSupabaseConfigured()) {
      supabaseClient.upsert('orders', toDbOrder(newOrder)).catch((err) => handleWriteError('addOrder', err));
    }
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    let updatedObj: Order | null = null;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          updatedObj = { ...o, status };
          return updatedObj;
        }
        return o;
      })
    );
    if (updatedObj && isSupabaseConfigured()) {
      supabaseClient.upsert('orders', toDbOrder(updatedObj)).catch((err) => handleWriteError('updateOrderStatus', err));
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (isSupabaseConfigured()) {
      supabaseClient.delete('orders', 'id', orderId).catch((err) => handleWriteError('deleteOrder', err));
    }
  };

  const clearDeliveredOrders = () => {
    const deliveredIds = orders.filter((o) => o.status === 'Entregado').map((o) => o.id);
    setOrders((prev) => prev.filter((o) => o.status !== 'Entregado'));
    if (isSupabaseConfigured()) {
      deliveredIds.forEach((id) => {
        supabaseClient.delete('orders', 'id', id).catch(() => {});
      });
    }
  };

  // ===================================================================
  // DANGER ZONE: wipe everything (starts the owner from scratch)
  // ===================================================================
  const clearAllCatalogData = async () => {
    // Empty the catalog tables in Supabase, then clear local in-memory state.
    if (isSupabaseConfigured()) {
      try {
        await Promise.all([
          supabaseClient.deleteAll('products'),
          supabaseClient.deleteAll('categories'),
          supabaseClient.deleteAll('preventistas'),
          supabaseClient.deleteAll('orders')
        ]);
      } catch (err) {
        handleWriteError('clearAllCatalogData', err);
        return;
      }
    }
    setProducts([]);
    setCategories([]);
    setPreventistas([]);
    setOrders([]);
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_TIMESTAMP_KEY);
    } catch {
      // ignore
    }
  };

  const resetAllDataToDefaults = async () => {
    await clearAllCatalogData();
    setSettings(INITIAL_SETTINGS);
    if (isSupabaseConfigured()) {
      try {
        await supabaseClient.upsert('store_settings', toDbSettings(INITIAL_SETTINGS));
      } catch (err) {
        handleWriteError('resetSettings', err);
      }
    }
  };

  // ===================================================================
  // BACKUP (JSON): export reads current Supabase-backed state; import writes it to Supabase
  // ===================================================================
  const exportBackupJson = (): string => {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      products,
      categories,
      preventistas,
      settings,
      orders
    };
    return JSON.stringify(backup, null, 2);
  };

  const importBackupJson = async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString);
      if (!isSupabaseConfigured()) {
        setCloudStatusText('Supabase no configurado: no se puede importar el respaldo.');
        return false;
      }

      const nextProducts: Product[] = Array.isArray(data.products) ? data.products : products;
      const nextCategories: Category[] = Array.isArray(data.categories) ? data.categories : categories;
      const nextPreventistas: Preventista[] = Array.isArray(data.preventistas) ? data.preventistas : preventistas;
      const nextOrders: Order[] = Array.isArray(data.orders) ? data.orders : orders;
      const nextSettings: StoreSettings = data.settings && typeof data.settings === 'object' ? data.settings : settings;

      // Replace cloud data with the backup contents (delete then upsert)
      setIsCloudSyncing(true);
      setCloudStatusText('Importando respaldo a Supabase...');
      await Promise.all([
        supabaseClient.deleteAll('products'),
        supabaseClient.deleteAll('categories'),
        supabaseClient.deleteAll('preventistas'),
        supabaseClient.deleteAll('orders')
      ]);
      await Promise.all([
        nextProducts.length > 0 ? supabaseClient.upsert('products', nextProducts.map(toDbProduct)) : Promise.resolve(true),
        nextCategories.length > 0 ? supabaseClient.upsert('categories', nextCategories.map(toDbCategory)) : Promise.resolve(true),
        nextPreventistas.length > 0 ? supabaseClient.upsert('preventistas', nextPreventistas.map(toDbPreventista)) : Promise.resolve(true),
        nextOrders.length > 0 ? supabaseClient.upsert('orders', nextOrders.map(toDbOrder)) : Promise.resolve(true),
        supabaseClient.upsert('store_settings', toDbSettings(nextSettings))
      ]);

      setProducts(nextProducts);
      setCategories(nextCategories);
      setPreventistas(nextPreventistas);
      setOrders(nextOrders);
      setSettings(nextSettings);
      setIsCloudConnected(true);
      setCloudStatusText('☁️ Respaldo importado y sincronizado');
      return true;
    } catch (err) {
      console.warn('[Import Backup Error]', err);
      setCloudStatusText('⚠️ Error al importar el respaldo.');
      return false;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        preventistas,
        settings,
        activePreventista,
        activeRef,
        cart,
        cartCount,
        cartTotal,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        clearDeliveredOrders,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductPrice,
        toggleProductStatus,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        addPreventista,
        updatePreventista,
        deletePreventista,
        getPreventistaShareUrl,
        getClientCatalogUrl,
        updateSettings,
        updateAdminPassword,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        resetAllDataToDefaults,
        clearAllCatalogData,
        isCloudConfigured,
        isCloudConnected,
        isCloudSyncing,
        isInitialLoading,
        cloudStatusText,
        refreshFromCloud,
        exportBackupJson,
        importBackupJson
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
