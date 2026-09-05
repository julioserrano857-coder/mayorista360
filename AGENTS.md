# 🤖 Directivas de Asistentes & Arquitectura (AGENTS.md)

Este archivo define el contexto de arquitectura, convenciones y directivas para cualquier asistente de IA o arnés de desarrollo que continúe el trabajo en este repositorio.

---

## 📌 Resumen del Proyecto
- **Propósito**: Catálogo mayorista multirrubro de distribución con generación de pedidos directos a WhatsApp según el preventista asignado o canal central, y panel administrativo completo.
- **Frontend**: React 18+ (SPA), TypeScript, Vite, Tailwind CSS, `lucide-react`.
- **Estado Global**: `StoreContext.tsx` (`useStore()`) como única fuente de verdad y sincronizador de reactividad.
- **Persistencia**: LocalStorage (offline-first) + sincronización opcional con Supabase (PostgreSQL).

---

## 🏛️ Reglas Arquitectónicas Clave

1. **Única Fuente de Verdad (`StoreContext`)**:
   - Todo cambio en `settings` (nombre de empresa, teléfono de WhatsApp central, anuncio), `products`, `categories`, `preventistas` u `orders` **debe** realizarse mediante los métodos expuestos en `useStore()`.
   - No mantener copias desfasadas de estado sin sincronizar en los componentes secundarios.
   - Cualquier modificación en la configuración de la empresa actualiza inmediatamente `document.title`, cabecera, pie de página, pantalla de login y modal de pedidos.

2. **Flujo de Vistas (`viewMode` en `App.tsx`)**:
   - `landing`: Pantalla de inicio de sesión administrativo con validación de credenciales.
   - `admin`: Panel de control mayorista accesible únicamente con sesión activa (`isAdminAuthenticated === true`).
   - `catalog`: Catálogo de pedidos para clientes, accesible cuando la URL contiene parámetros como `?view=pedidos`, `?ref=...`, o links de preventistas.

3. **Sistema de Preventistas & Atribución de Pedidos**:
   - La URL del preventista sigue el formato: `?view=pedidos&ref=<slug_del_preventista>`.
   - `StoreContext` resuelve `activePreventista` de forma reactiva al analizar el parámetro `ref`.
   - Al finalizar el pedido en `CheckoutModal`:
     1. Se crea un pedido con un **código único de 4 dígitos** (ej: `#4821`).
     2. Se persiste en la colección `orders` (local y Supabase si está conectado).
     3. Se arma el mensaje preformateado de WhatsApp y se abre `wa.me/<numero>?text=...`.

4. **Gestión de Precios & Stock Centralizada**:
   - `updateProductPrice(id, newPrice)` y `toggleProductStatus(id)` actualizan en tiempo real todas las vistas y el carrito.
   - Los productos con estado `Sin Stock` se bloquean para evitar ser añadidos al carrito.

5. **PWA & Offline-First**:
   - La aplicación funciona sin conexión a internet leyendo datos de `localStorage`.
   - En caso de conectar Supabase, las operaciones de escritura se sincronizan en segundo plano sin bloquear la experiencia de usuario.

---

## 📁 Archivos Clave del Código
- `/src/context/StoreContext.tsx`: Núcleo de estado, sincronización y mutaciones.
- `/src/components/admin/OrdersManagement.tsx`: Panel de pedidos recibidos, métricas KPI, buscador y ciclo de vida de pedidos.
- `/src/components/admin/ProductManagement.tsx`: Tabla de productos con edición in-line de precios.
- `/src/components/admin/PreventistaManagement.tsx`: Generador de enlaces únicos y códigos QR.
- `/src/components/client/CheckoutModal.tsx`: Generador del pedido a WhatsApp con código de 4 dígitos y recordatorio visual.
- `/src/utils/whatsapp.ts`: Lógica de formateo de moneda, slugs y texto del pedido.
- `/src/lib/supabase.ts`: Adaptadores y cliente REST para sincronizar con PostgreSQL en Supabase.
- `/docs/`: Documentación complementaria en Markdown.
