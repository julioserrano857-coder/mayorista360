# Catálogo Mayorista de Mascotas & Sistema de Preventistas (PWA)

Sistema web y aplicación progresiva (PWA) para distribución mayorista de alimentos y accesorios para mascotas. Permite a comercios (pet shops, veterinarias, forrajerías) armar pedidos por bulto cerrado y enviarlos directamente por WhatsApp al preventista asignado o a la central de ventas, con generación de código de seguimiento de 4 dígitos y panel de control administrativo.

---

## 🚀 Características Principales

### 1. 🛍️ Catálogo Digital Mayorista (Clientes)
- **Modos de Visualización**:
  - *Cuadrícula*: Vista de 2 columnas en celulares y 3-4 columnas en computadoras.
  - *Lista Rápida*: Vista compacta optimizada para compras rápidas por bulto cerrado.
- **Buscador Inteligente en Tiempo Real**: Filtrado simultáneo por nombre, marca, presentación/peso, descripción y SKU.
- **Filtros Dinámicos**: Por especie (🐶 Perros, 🐱 Gatos, 🦜 Otras Especies), por categoría y filtro de *Solo Disponibles* (con stock).
- **Control de Cantidades y Stock**: Validación inmediata que previene agregar productos sin stock.
- **Modal de Vista Rápida**: Detalle del producto con ingredientes, análisis garantizado y peso.

### 2. 📲 Enrutamiento por Preventistas & WhatsApp
- **Enlaces Únicos por Preventista**: Cada preventista cuenta con una URL personalizada (ej: `?view=pedidos&ref=juan_perez`) y código QR descargable.
- **Atribución Automática**: Los pedidos realizados a través del enlace de un preventista se dirigen automáticamente a su número de WhatsApp con su nombre como destinatario.
- **Canal Central de Respaldo (Fallback)**: Si el cliente ingresa sin preventista asignado, el pedido va directo al WhatsApp de la administración central.
- **Código de Seguimiento de 4 Dígitos**: Cada pedido genera un número único (ej: `#4821`) que viaja en el texto del mensaje de WhatsApp y se registra en el panel.
- **Mensaje Limpio y Profesional**: Mensaje preformateado con los productos, cantidades, peso, cliente y notas especiales.

### 3. 🛡️ Panel de Administración Mayorista (`/admin`)
- **Acceso Protegido**: Autenticación por contraseña configurable (clave por defecto: `123456`).
- **Gestión de Pedidos Recibidos**:
  - Métricas de ventas (ingresos totales, bultos vendidos, pedidos pendientes y entregados).
  - Rendimiento y ventas desglosadas por preventista.
  - Buscador de pedidos por código de 4 dígitos, cliente o preventista.
  - Ciclo de vida: cambiar estado (*Pendiente*, *Entregado*, *Cancelado*) y botón para limpiar entregados.
- **Gestión de Productos y Precios**:
  - Edición rápida de precios "in-line" directamente desde la tabla con actualización centralizada en tiempo real.
  - Creación, modificación y borrado de productos con categorías, especies, SKU y fotos.
  - Alternador rápido de disponibilidad de stock (*Disponible* / *Sin Stock*).
- **Gestión de Categorías**:
  - Reordenamiento visual de categorías para definir su prioridad en el catálogo.
  - Creación y desactivación de categorías.
- **Gestión de Preventistas**:
  - Alta, baja y edición de preventistas (nombre, zona, número de WhatsApp).
  - Generador de enlaces únicos y visor de Códigos QR.
- **Configuración y Seguridad**:
  - Cambio de nombre de empresa, WhatsApp central y barra de anuncios superior con sincronización en vivo.
  - Cambio de contraseña de administrador.
  - Conexión con Supabase y herramientas de respaldo JSON (exportar e importar).

### 4. 📱 PWA (Progressive Web App) & Modo Offline
- **Instalable sin Tiendas**: Botones de instalación directa para Chrome, Safari (iOS) y Edge.
- **Persistencia Híbrida**: Funcionamiento offline-first con `localStorage` y sincronización bidireccional con Supabase PostgreSQL.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 18+ con TypeScript
- **Bundler & Dev Server**: Vite
- **Estilos**: Tailwind CSS con diseño adaptativo y mobile-first
- **Iconografía**: `lucide-react`
- **Base de Datos & Nube**: Supabase (PostgreSQL + REST API) y `localStorage`
- **PWA**: Service Worker y Web App Manifest (`manifest.json`)
- **Efectos & UX**: `canvas-confetti`

---

## 📂 Estructura del Proyecto

```text
├── docs/                      # Documentación detallada en Markdown
│   ├── ARQUITECTURA.md        # Arquitectura del frontend y flujo de estado
│   ├── CARACTERISTICAS.md     # Desglose funcional detallado
│   ├── BASE_DE_DATOS.md       # Esquemas de Supabase y modelos de datos
│   └── GUIA_PREVENTISTAS.md   # Guía del sistema de enlaces y WhatsApp
├── public/                    # Íconos, favicon y manifest PWA
├── src/
│   ├── components/
│   │   ├── admin/             # Panel de administración y modales de edición
│   │   ├── client/            # Catálogo, carrito, banner y modal de checkout
│   │   ├── common/            # Botón PWA e indicador de conectividad
│   │   └── landing/           # Pantalla de inicio de sesión administrativo
│   ├── context/               # StoreContext (única fuente de verdad)
│   ├── data/                  # Datos iniciales / catálogo semilla
│   ├── lib/                   # Cliente Supabase y funciones de conversión
│   ├── types.ts               # Definición de tipos e interfaces TypeScript
│   ├── utils/                 # Generación de URLs de WhatsApp y formato de moneda
│   ├── App.tsx                # Enrutamiento de vistas y renderizado principal
│   └── main.tsx               # Punto de entrada de la aplicación
├── supabase/                  # Scripts SQL de creación de tablas y políticas RLS
├── AGENTS.md                  # Reglas y directivas para asistentes de IA y arneses
├── README.md                  # Este documento
├── metadata.json              # Metadatos de la aplicación
└── package.json               # Dependencias y scripts
```

---

## 💻 Inicio Rápido

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## 🔑 Credenciales por Defecto

- **Usuario**: `admin`
- **Contraseña inicial**: `123456`
