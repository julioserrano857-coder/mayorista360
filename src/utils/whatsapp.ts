import { CartItem } from '../types';

/**
 * Formats a number as a currency string (e.g. $ 68.500)
 */
export function formatCurrency(amount: number, symbol = '$'): string {
  return `${symbol} ${amount.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

/**
 * Cleans and validates WhatsApp phone numbers (removes spaces, symbols, plus signs)
 */
export function cleanWhatsAppNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Generates slug from name (e.g., "Juan Pérez" -> "juan_perez")
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Constructs the exact WhatsApp order message containing simply the ordered products:
 * 
 * ¡Hola! Quiero realizar el siguiente pedido:
 * 
 * - [Cantidad]x [Nombre del Producto] ([Peso/Variante])
 */
export function buildWhatsAppOrderMessage({
  items,
  clientName,
  notes,
  orderCode
}: {
  items: CartItem[];
  clientName?: string;
  notes?: string;
  orderCode?: string;
  // Kept as optional backwards-compatibility parameters
  address?: string;
  total?: number;
  currencySymbol?: string;
}): string {
  const itemsText = items
    .map((item) => {
      const weightClean = item.product.weight?.trim();
      const alreadyHasWeight =
        weightClean &&
        item.product.name.toLowerCase().includes(weightClean.toLowerCase());
      const weightLabel =
        weightClean && !alreadyHasWeight ? ` (${weightClean})` : '';

      return `- ${item.quantity}x ${item.product.name}${weightLabel}`;
    })
    .join('\n');

  const codeHeader = orderCode ? `📦 *PEDIDO #${orderCode}*\n\n` : '';

  let message = `${codeHeader}¡Hola! Quiero realizar el siguiente pedido:\n\n${itemsText}`;

  if (clientName && clientName.trim().length > 0) {
    message = `${codeHeader}¡Hola! Soy ${clientName.trim()}, quiero realizar el siguiente pedido:\n\n${itemsText}`;
  }

  if (notes && notes.trim().length > 0) {
    message += `\n\nNota: ${notes.trim()}`;
  }

  return message;
}

/**
 * Builds the full wa.me URL
 */
export function generateWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = cleanWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
