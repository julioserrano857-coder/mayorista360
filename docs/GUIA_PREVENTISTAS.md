# 📱 Guía del Sistema de Preventistas & WhatsApp (GUIA_PREVENTISTAS.md)

Este documento describe el funcionamiento de los enlaces únicos para preventistas, la atribución de pedidos y el formato de los mensajes de WhatsApp.

---

## 🔗 1. Cómo Funcionan los Enlaces de Preventista

Cada preventista registrado en el panel de administración obtiene una URL única:

```text
https://tu-dominio.com/?view=pedidos&ref=slug-del-preventista
```

### Ejemplos:
- Juan Pérez (Zona Norte): `https://tu-dominio.com/?view=pedidos&ref=juan_perez`
- Camila Gómez (Microcentro): `https://tu-dominio.com/?view=pedidos&ref=camila_gomez`

### Comportamiento del Enlace:
1. **Entrada Directa al Catálogo**: La presencia de `?view=pedidos` hace que el cliente vaya directamente al catálogo de compras sin pasar por la pantalla de login del administrador.
2. **Atribución en Memoria**: El parámetro `ref=juan_perez` activa el banner del preventista en la parte superior y en la cabecera.
3. **Persistencia de Sesión**: Aunque el cliente recargue la página, el preventista sigue asignado.
4. **Destino de WhatsApp**: Al presionar *Enviar Pedido*, el mensaje se envía directamente al número de WhatsApp de ese preventista.

---

## 🏢 2. Canal Central de Ventas (Fallback)

Si un cliente accede a la URL principal sin ningún parámetro de preventista (`https://tu-dominio.com/?view=pedidos`):
- El sistema muestra: **"Atención: Ventas Central"**.
- El pedido se envía al **WhatsApp Central de la Empresa** configurado en la sección de Configuración del panel de administración.

---

## 🔢 3. Código de Pedido de 4 Dígitos

Al momento de confirmar el pedido en el modal:
1. Se genera un código aleatorio de 4 dígitos (ej: `#7419`).
2. Se registra en la base de datos de pedidos recibidos con estado `Pendiente`.
3. Se incluye en el encabezado del mensaje de WhatsApp.

Esto permite al preventista y al comercio referenciar el pedido fácilmente (ej: *"Hola Juan, te acabo de mandar el pedido #7419"*).

---

## 💬 4. Estructura del Mensaje de WhatsApp

El mensaje generado tiene el siguiente formato optimizado para fácil lectura:

```text
🛒 *NUEVO PEDIDO MAYORISTA - NutriMayorista*
🔢 *Código de Pedido:* #4821
👤 *Destinatario:* Juan Pérez (Zona Norte)
🏢 *Comercio / Cliente:* Pet Shop Patitas
📅 *Fecha:* 04/09/2026 11:45

📋 *DETALLE DEL PEDIDO:*
• 3x Dog Chow Adultos Carne y Pollo 21 kg ($54.200 c/u) = $162.600
• 2x Pro Plan Gato Sterilized 7.5 kg ($48.900 c/u) = $97.800

📦 *Resumen:*
• *Total de Bultos:* 5 unidades
• *MONTO TOTAL:* $260.400

📝 *Aclaraciones / Observaciones:*
Entregar en horario de la tarde después de las 14hs.

---
_Generado desde Catálogo Digital NutriMayorista_
```

---

## 📲 5. Instalación de la App (PWA) para Preventistas

Los preventistas pueden instalar el catálogo en su celular:
1. Abrir su enlace personalizado en Chrome (Android) o Safari (iOS).
2. Tocar el botón **Instalar App** presente en la cabecera o banner.
3. El ícono se añade a la pantalla de inicio del celular y se abre a pantalla completa.
