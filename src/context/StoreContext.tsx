import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Category,
  Product,
  Preventista,
  StoreSettings,
  AdminCredentials,
  CartItem,
  ProductStatus,
  Order,
  OrderStatus,
  OrderItem
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PREVENTISTAS,
  INITIAL_SETTINGS,
  INITIAL_ADMIN
} from '../data/initialData';
import { generateSlug, cleanWhatsAppNumber } from '../utils/whatsapp';
import {
  supabaseClient,
  isSupabaseConfigured,
  setCustomSupabaseConfig,
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
  // Catalog Data
  products: Product[];
  categories: Category[];
  preventistas: Preventista[];
  settings: StoreSettings;
  activePreventista: Preventista | null;
  activeRef: string | null;

  // Cart
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
  updateAdminPassword: (newPassword: string) => boolean;
  isAdminAuthenticated: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  resetAllDataToDefaults: () => void;

  // Cloud Sync & Persistence (Supabase + LocalStorage)
  isCloudConnected: boolean;
  isCloudSyncing: boolean;
  cloudStatusText: string;
  refreshFromCloud: () => Promise<boolean>;
  syncLocalToCloud: () => Promise<{ success: boolean; message: string }>;
  saveCloudCredentials: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  exportBackupJson: () => string;
  importBackupJson: (jsonString: string) => boolean;
}

const STORAGE_KEYS = {
  PRODUCTS: 'nutrimayorista_products_v1',
  CATEGORIES: 'nutrimayorista_categories_v1',
  PREVENTISTAS: 'nutrimayorista_preventistas_v1',
  SETTINGS: 'nutrimayorista_settings_v1',
  ADMIN_AUTH: 'nutrimayorista_admin_auth_v1',
  ADMIN_SESSION: 'nutrimayorista_admin_session_v1',
  CART: 'nutrimayorista_cart_v1',
  CART_TIMESTAMP: 'nutrimayorista_cart_timestamp_v1',
  ORDERS: 'nutrimayorista_orders_v1'
};

// Carrito expira automáticamente tras 24 horas de inactividad
const CART_EXPIRATION_MS = 24 * 60 * 60 * 1000;

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize States from localStorage or default seed data
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [preventistas, setPreventistas] = useState<Preventista[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREVENTISTAS);
      return saved ? JSON.parse(saved) : INITIAL_PREVENTISTAS;
    } catch {
      return INITIAL_PREVENTISTAS;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [adminCreds, setAdminCreds] = useState<AdminCredentials>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
      return saved ? JSON.parse(saved) : INITIAL_ADMIN;
    } catch {
      return INITIAL_ADMIN;
    }
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      const session = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      return session === 'true';
    } catch {
      return false;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      const timestamp = localStorage.getItem(STORAGE_KEYS.CART_TIMESTAMP);

      if (saved && timestamp) {
        const savedTime = parseInt(timestamp, 10);
        if (!isNaN(savedTime) && Date.now() - savedTime > CART_EXPIRATION_MS) {
          localStorage.removeItem(STORAGE_KEYS.CART);
          localStorage.removeItem(STORAGE_KEYS.CART_TIMESTAMP);
          return [];
        }
      }

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeRef, setActiveRef] = useState<string | null>(null);

  // Cloud synchronization status
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [cloudStatusText, setCloudStatusText] = useState<string>('Modo Local (Offline-Ready)');

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

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREVENTISTAS, JSON.stringify(preventistas));
  }, [preventistas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(adminCreds));
  }, [adminCreds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, String(isAdminAuthenticated));
  }, [isAdminAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    if (cart.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CART_TIMESTAMP, String(Date.now()));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CART_TIMESTAMP);
    }
  }, [cart]);

  // Load from Supabase on mount if configured
  const refreshFromCloud = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setIsCloudConnected(false);
      setCloudStatusText('Modo Local (Listo para conectar)');
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

      let hasCloudData = false;

      if (Array.isArray(dbCats) && dbCats.length > 0) {
        setCategories(dbCats.map(fromDbCategory));
        hasCloudData = true;
      }

      if (Array.isArray(dbProds) && dbProds.length > 0) {
        setProducts(dbProds.map(fromDbProduct));
        hasCloudData = true;
      }

      if (Array.isArray(dbPrevs) && dbPrevs.length > 0) {
        setPreventistas(dbPrevs.map(fromDbPreventista));
        hasCloudData = true;
      }

      if (Array.isArray(dbSettings) && dbSettings.length > 0) {
        setSettings(fromDbSettings(dbSettings[0]));
        hasCloudData = true;
      }

      if (Array.isArray(dbOrders) && dbOrders.length > 0) {
        setOrders(dbOrders.map(fromDbOrder));
        hasCloudData = true;
      }

      setIsCloudConnected(true);
      setCloudStatusText(hasCloudData ? '☁️ Conectado y Sincronizado' : '☁️ Conectado a Supabase (tablas vacías)');
      return true;
    } catch (err: any) {
      console.warn('[Cloud Sync Error]', err);
      setIsCloudConnected(false);
      setCloudStatusText('Error al conectar con Supabase (usando datos locales)');
      return false;
    } finally {
      setIsCloudSyncing(false);
    }
  }, []);

  useEffect(() => {
    refreshFromCloud();
  }, [refreshFromCloud]);

  // Push all local data to Supabase (Useful when first initializing or restoring)
  const syncLocalToCloud = async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase no está configurado aún.' };
    }

    setIsCloudSyncing(true);
    setCloudStatusText('Subiendo datos a Supabase...');

    try {
      const catRows = categories.map(toDbCategory);
      const prodRows = products.map(toDbProduct);
      const prevRows = preventistas.map(toDbPreventista);
      const setRow = toDbSettings(settings);
      const orderRows = orders.map(toDbOrder);

      const [okCats, okProds, okPrevs, okSettings, okOrders] = await Promise.all([
        supabaseClient.upsert('categories', catRows),
        supabaseClient.upsert('products', prodRows),
        supabaseClient.upsert('preventistas', prevRows),
        supabaseClient.upsert('store_settings', setRow),
        orderRows.length > 0 ? supabaseClient.upsert('orders', orderRows) : Promise.resolve(true)
      ]);

      if (okCats && okProds && okPrevs && okSettings && okOrders) {
        setIsCloudConnected(true);
        setCloudStatusText('☁️ Catálogo y pedidos sincronizados con Supabase');
        return { success: true, message: '¡Datos y pedidos subidos y sincronizados correctamente en Supabase!' };
      } else {
        return {
          success: false,
          message: 'Algunas tablas no pudieron actualizarse. Verifica las políticas RLS y tablas en Supabase.'
        };
      }
    } catch (err: any) {
      return { success: false, message: `Error al sincronizar: ${err?.message || 'Error de red'}` };
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Configure custom credentials from UI
  const saveCloudCredentials = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
    const trimmedUrl = url.trim();
    const trimmedKey = key.trim();

    if (!trimmedUrl && !trimmedKey) {
      setCustomSupabaseConfig('', '');
      setIsCloudConnected(false);
      setCloudStatusText('Modo Local');
      return { success: true, message: 'Credenciales eliminadas. El sistema volvió al modo local.' };
    }

    const test = await supabaseClient.testConnection(trimmedUrl, trimmedKey);
    if (!test.success) {
      return test;
    }

    setCustomSupabaseConfig(trimmedUrl, trimmedKey);
    await refreshFromCloud();
    return { success: true, message: '¡Conectado exitosamente con tu base de datos de Supabase!' };
  };

  // JSON Backup / Restore
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

  const importBackupJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.products)) setProducts(data.products);
      if (Array.isArray(data.categories)) setCategories(data.categories);
      if (Array.isArray(data.preventistas)) setPreventistas(data.preventistas);
      if (Array.isArray(data.orders)) setOrders(data.orders);
      if (data.settings && typeof data.settings === 'object') setSettings(data.settings);
      return true;
    } catch {
      return false;
    }
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

  // Keep cart item product data in sync
  useEffect(() => {
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
  }, [products]);

  // Cart Computations
  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  // Cart Methods
  const addToCart = (product: Product, quantity = 1) => {
    if (product.status === 'Sin Stock') return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
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
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.CART);
      localStorage.removeItem(STORAGE_KEYS.CART_TIMESTAMP);
    } catch {
      // ignore
    }
  };

  // Product Methods (with background Supabase sync)
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`
    };
    setProducts((prev) => [newProduct, ...prev]);

    if (isSupabaseConfigured()) {
      supabaseClient.upsert('products', toDbProduct(newProduct)).catch((err) => {
        console.warn('[Supabase Sync Product]', err);
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
      supabaseClient.upsert('products', toDbProduct(updatedObj)).catch((err) => {
        console.warn('[Supabase Update Product]', err);
      });
    }
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    removeFromCart(id);

    if (isSupabaseConfigured()) {
      supabaseClient.delete('products', 'id', id).catch((err) => {
        console.warn('[Supabase Delete Product]', err);
      });
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
      supabaseClient.upsert('products', toDbProduct(updatedObj)).catch((err) => {
        console.warn('[Supabase Price Update]', err);
      });
    }
  };

  const toggleProductStatus = (id: string) => {
    let updatedObj: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus: ProductStatus =
            p.status === 'Disponible' ? 'Sin Stock' : 'Disponible';
          updatedObj = { ...p, status: nextStatus };
          return updatedObj;
        }
        return p;
      })
    );

    if (updatedObj && isSupabaseConfigured()) {
      supabaseClient.upsert('products', toDbProduct(updatedObj)).catch((err) => {
        console.warn('[Supabase Status Toggle]', err);
      });
    }
  };

  // Category Methods (with background Supabase sync)
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
        console.warn('[Supabase Add Category]', err);
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
      supabaseClient.upsert('categories', toDbCategory(updatedObj)).catch((err) => {
        console.warn('[Supabase Update Category]', err);
      });
    }
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));

    if (isSupabaseConfigured()) {
      supabaseClient.delete('categories', 'id', id).catch((err) => {
        console.warn('[Supabase Delete Category]', err);
      });
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
      supabaseClient.upsert('categories', reordered.map(toDbCategory)).catch((err) => {
        console.warn('[Supabase Reorder Categories]', err);
      });
    }
  };

  // Preventista Methods (with background Supabase sync)
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
        console.warn('[Supabase Add Preventista]', err);
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
          const newWa =
            updates.whatsapp !== undefined
              ? cleanWhatsAppNumber(updates.whatsapp)
              : p.whatsapp;
          updatedObj = { ...p, ...updates, slug: newSlug, whatsapp: newWa };
          return updatedObj;
        }
        return p;
      })
    );

    if (updatedObj && isSupabaseConfigured()) {
      supabaseClient.upsert('preventistas', toDbPreventista(updatedObj)).catch((err) => {
        console.warn('[Supabase Update Preventista]', err);
      });
    }
  };

  const deletePreventista = (id: string) => {
    setPreventistas((prev) => prev.filter((p) => p.id !== id));

    if (isSupabaseConfigured()) {
      supabaseClient.delete('preventistas', 'id', id).catch((err) => {
        console.warn('[Supabase Delete Preventista]', err);
      });
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

  // Settings & Security
  const updateSettings = (updates: Partial<StoreSettings>) => {
    let newSettings: StoreSettings = settings;
    setSettings((prev) => {
      newSettings = {
        ...prev,
        ...updates,
        defaultWhatsApp: updates.defaultWhatsApp
          ? cleanWhatsAppNumber(updates.defaultWhatsApp)
          : prev.defaultWhatsApp
      };
      return newSettings;
    });

    if (isSupabaseConfigured()) {
      supabaseClient.upsert('store_settings', toDbSettings(newSettings)).catch((err) => {
        console.warn('[Supabase Settings Update]', err);
      });
    }
  };

  const updateAdminPassword = (newPassword: string): boolean => {
    if (!newPassword || newPassword.trim().length < 4) return false;
    setAdminCreds({
      username: 'admin',
      passwordHash: newPassword.trim(),
      lastUpdated: new Date().toISOString()
    });
    return true;
  };

  const loginAdmin = (password: string): boolean => {
    const trimmed = password.trim();
    if (trimmed === adminCreds.passwordHash || (adminCreds.passwordHash === '123456' && trimmed === 'admin123')) {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
  };

  // Orders Methods (with Supabase sync & localStorage)
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
      supabaseClient.upsert('orders', toDbOrder(newOrder)).catch((err) => {
        console.warn('[Supabase Insert Order]', err);
      });
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
      supabaseClient.upsert('orders', toDbOrder(updatedObj)).catch((err) => {
        console.warn('[Supabase Update Order Status]', err);
      });
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (isSupabaseConfigured()) {
      supabaseClient.delete('orders', 'id', orderId).catch((err) => {
        console.warn('[Supabase Delete Order]', err);
      });
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

  const resetAllDataToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setPreventistas(INITIAL_PREVENTISTAS);
    setSettings(INITIAL_SETTINGS);
    setAdminCreds(INITIAL_ADMIN);
    setCart([]);
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
        isCloudConnected,
        isCloudSyncing,
        cloudStatusText,
        refreshFromCloud,
        syncLocalToCloud,
        saveCloudCredentials,
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
