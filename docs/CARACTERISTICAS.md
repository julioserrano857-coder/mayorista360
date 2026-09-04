# 📋 Características y Manual Funcional (CARACTERISTICAS.md)

Este documento detalla todas las funcionalidades implementadas en el sistema para clientes, preventistas y administradores.

---

## 🛍️ 1. Módulo del Catálogo Mayorista

- **Diseño Mobile-First**: Optimizado para pantallas táctiles de celulares y computadoras de escritorio.
- **Alternador de Vistas**:
  - **Cuadrícula (Grid)**: Tarjetas con imagen destacada, precio resaltado, peso y selector rápido de cantidad (+/-). En celulares se muestra en 2 columnas perfectas.
  - **Lista Rápida (List)**: Filas compactas diseñadas para agilizar la carga de pedidos recurrentes en comercios.
- **Filtros Simultáneos**:
  - Por especie: *Todos*, *Perros*, *Gatos*, *Otras Especies*.
  - Por categoría de producto: Pestañas horizontales con scroll táctil suave.
  - *Solo disponibles*: Oculta automáticamente los artículos sin stock.
- **Buscador en Vivo**: Filtra al instante por nombre, marca, peso o SKU.
- **Renderizado Progresivo**: Carga lotes de 24 productos iniciales con botón de carga incremental para mantener alta fluidez en celulares de gama media y baja.

---

## 🛒 2. Carrito de Compras & Envío por WhatsApp

- **Carrito Flotante en Móviles**: Botón inferior animado con conteo de bultos y monto total acumulado.
- **Drawer Lateral (Slide-over)**: Permite ajustar cantidades, eliminar productos o vaciar el pedido con un solo toque.
- **Código de Seguimiento de 4 Dígitos**:
  - Cada confirmación de pedido genera un código numérico aleatorio único de 4 dígitos (ej: `#8392`).
  - El código se almacena en la base de datos y se incluye al principio del mensaje de WhatsApp.
- **Formulario de Finalización**:
  - Campo opcional para ingresar el nombre del comercio / cliente (ej: *Pet Shop Patitas*).
  - Campo opcional de notas de entrega o aclaraciones de pago.
  - Acordeón de vista previa para leer el mensaje antes de enviarlo.
  - Al presionar **Enviar Pedido**, se abre WhatsApp con el mensaje pre-armado y se activa una animación de confeti con pantalla de confirmación.

---

## 📊 3. Módulo de Pedidos Recibidos (Admin)

- **Panel de KPIs de Ventas**:
  - Total de pedidos generados en el período seleccionado (*Histórico*, *Este Mes*, *Hoy*).
  - Total de ventas facturadas en moneda local.
  - Cantidad total de bultos / unidades solicitadas.
  - Preventistas activos con ventas registradas.
- **Desglose por Preventista**: Tarjetas con el total de pedidos y monto generado por cada preventista.
- **Buscador & Filtros Avanzados**:
  - Búsqueda por número de código de 4 dígitos (`#4821`), nombre de preventista, nombre de cliente o nombre de producto.
  - Filtro por estado: *Todos*, *Pendiente*, *Entregado*, *Cancelado*.
  - Filtro por preventista específico o ventas directas por canal central.
- **Ciclo de Vida de los Pedidos**:
  - Botón de 1 toque para **Marcar como Entregado**.
  - Opción de revertir a **Pendiente**.
  - Botón para **Limpiar Entregados** que archiva/elimina los pedidos completados para mantener el panel limpio y enfocado.
  - Botón para **Copiar Resumen** del pedido al portapapeles.

---

## 🏷️ 4. Gestión de Productos y Precios

- **Edición Rápida "In-Line"**: Modifica el precio de cualquier producto directamente sobre la tabla sin necesidad de abrir formularios extensos; al presionar *Enter* o hacer clic en el check, el nuevo precio se guarda y se propaga a todos los catálogos y enlaces de preventistas.
- **Alternador de Stock**: Cambia con 1 clic el estado de *Disponible* a *Sin Stock*.
- **Modal de Creación y Edición Completa**: Formulario con nombre, marca, categoría, especie, presentación/peso, precio, costo, SKU, estado, imagen y descripción detallada.

---

## 👥 5. Gestión de Preventistas & Enlaces Únicos

- **Alta y Edición**: Registro de nombre, zona de cobertura (ej: *Zona Norte*, *Microcentro*) y número de WhatsApp con código de país.
- **Generación de URLs Personalizadas**: Botón para copiar el enlace directo del preventista.
- **Códigos QR Dinámicos**: Modal con código QR listo para imprimir o escanear con la cámara del celular.

---

## ⚙️ 6. Configuración General y Seguridad

- **Personalización Comercial**: Edición del nombre de la empresa y número de WhatsApp de respaldo con sincronización reactiva en vivo.
- **Barra de Anuncios Superior**: Mensaje promocional visible en la cabecera (ej: *Envíos bonificados a partir de $150.000*).
- **Control de Acceso**: Modificación de la contraseña maestra del administrador.
- **Sincronización Supabase**: Configuración de URL y Anon Key con prueba de conexión integrada.
- **Herramientas de Respaldo**: Exportación e importación de archivos de respaldo `.json`.
