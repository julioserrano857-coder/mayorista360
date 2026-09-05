# 🏗️ Arquitectura del Sistema (ARQUITECTURA.md)

Este documento detalla la estructura interna, el manejo del estado global, el enrutamiento y la interacción de componentes en la aplicación.

---

## 🧩 1. Árbol de Componentes y Flujo de Vistas

La aplicación se ejecuta como una Single Page Application (SPA) gestionada principalmente por `App.tsx` y dividida en 3 vistas principales según el estado `viewMode`:

```text
App (StoreProvider)
│
├── [viewMode === 'landing']
│   ├── LandingPage (Login de Administrador)
│   └── OfflineIndicator
│
├── [viewMode === 'admin' && isAdminAuthenticated]
│   ├── AdminDashboard
│   │   ├── OrdersManagement (KPIs, lista de pedidos, buscador, filtro por fecha)
│   │   ├── ProductManagement (Lista, edición in-line de precio, modal crear/editar)
│   │   ├── CategoryManagement (Ordenamiento, visibilidad, modal crear/editar)
│   │   ├── PreventistaManagement (Links únicos, QR, modal crear/editar)
│   │   └── SettingsManagement (Empresa, WhatsApp central, anuncio, clave, Supabase)
│   └── OfflineIndicator
│
└── [viewMode === 'catalog'] (Vista de cliente)
    ├── Header (Búsqueda, selector de stock, badge preventista, botón PWA, botón carrito)
    ├── PreventistaBanner (Canal actual o preventista asignado + WhatsApp)
    ├── CategoryBar (Barra desplazable de categorías)
    ├── ProductCard (Cuadrícula o lista rápida de productos + agregado al carrito)
    ├── ProductQuickViewModal (Vista detallada del producto)
    ├── CartDrawer (Slide-over con desglose de bultos y total)
    ├── CheckoutModal (Formulario de pedido, generación de código de 4 dígitos y WhatsApp)
    └── OfflineIndicator
```

---

## ⚡ 2. Manejo de Estado Centralizado (`StoreContext`)

`StoreContext.tsx` es la **única fuente de verdad** de la aplicación. Gestiona:

1. **`products`**: Lista completa de productos (precios, stock, categorías, peso, SKU).
2. **`categories`**: Categorías ordenadas por prioridad de visualización.
3. **`preventistas`**: Preventistas activos con sus números de WhatsApp y slugs únicos.
4. **`settings`**: Configuración general (nombre comercial, WhatsApp central, anuncio superior, símbolo de moneda).
5. **`orders`**: Registro de pedidos recibidos con código de 4 dígitos, preventista asignado, cliente y estado.
6. **`cart`**: Carrito de compras del cliente (con caducidad automática de 24 horas).
7. **`activePreventista`**: Preventista detectado automáticamente a partir del parámetro `?ref=<slug>` en la URL.

### Reactividad y Sincronización Automática
- Al actualizar `settings`, los componentes suscritos a través de `useStore()` se re-renderizan inmediatamente.
- Un efecto secundario en `App.tsx` actualiza en vivo el `document.title` de la pestaña del navegador para reflejar el nombre de la empresa y del preventista.

---

## 🌐 3. Estrategia de Persistencia Híbrida (Offline-First + Supabase)

1. **Lectura Inmediata (Local First)**:
   Al iniciar, el sistema lee de `localStorage` para garantizar una carga instantánea de 0ms sin bloqueos de red ni pantallas de carga lentas.
2. **Sincronización en la Nube (Supabase)**:
   Si las credenciales de Supabase están configuradas (en variables de entorno o desde el panel de administración):
   - Al abrir la app se realiza un `refreshFromCloud()` en segundo plano.
   - Cada operación de alta, baja o modificación de productos, precios o pedidos actualiza `localStorage` y envía la mutación a Supabase de forma asíncrona.
3. **Respaldos Portables**:
   El panel administrativo permite descargar un archivo `.json` con el estado completo del negocio o restaurarlo en cualquier momento.
