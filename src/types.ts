export type ProductStatus = 'Disponible' | 'Sin Stock';

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  weight: string; // Presentation/unit e.g. 'Caja x 24', 'Pack x 6', '15 kg'
  price: number;
  status: ProductStatus;
  imageUrl: string;
  brand?: string;
  description?: string;
}

export interface Preventista {
  id: string;
  name: string;
  slug: string;
  whatsapp: string; // international format e.g. "5491123456789"
  active: boolean;
  zone?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreSettings {
  companyName: string;
  defaultWhatsApp: string; // fallback WhatsApp number e.g. "5491155554444"
  currencySymbol: string;
  announcement?: string;
  minOrderAmount?: number;
}

export interface CheckoutForm {
  clientName: string;
  address: string;
  notes?: string;
}

export interface AdminCredentials {
  username: string;
  passwordHash: string;
  lastUpdated?: string;
}

export type OrderStatus = 'Pendiente' | 'Entregado' | 'Cancelado';

export interface OrderItem {
  productId: string;
  productName: string;
  weight: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  code: string; // 4-digit code e.g. "4821"
  createdAt: string; // ISO string
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
