# 🚀 Plan de Automatización — Mayorista360
### Pedidos por WhatsApp con IA + Stock automático + Boletas

> **Estado:** Idea aprobada por Franco (2026-09-05) — **NO implementar todavía**.
> Se activa cuando el negocio funcione con el flujo manual y el volumen lo justifique.
> Este documento es la hoja de ruta para no perder la visión y para anticiparle al dueño del mayorista qué implica.

---

## 1. La visión (en criollo)

El preventista manda su pedido por WhatsApp al número de la empresa. Una **IA lo atiende**: lee el pedido, lo arma, **lo confirma con el preventista**, lo registra, **descuenta el stock** y si un producto llega a 0 **lo pausa solo** (desaparece del catálogo). En el panel, los pedidos entran **agrupados por preventista** con su **boleta lista para imprimir** y mandar con el reparto.

El dueño no copia más pedidos a mano: solo repone stock cuando llega mercadería y revisa lo que la IA marca como dudoso.

---

## 2. Lo que YA tenemos (base sobre la que se construye)

| Pieza | Estado |
|---|---|
| Catálogo público con links por preventista (`?view=pedidos&ref=slug`) | ✅ Funcionando |
| Pedidos guardados con `preventistaId/name/whatsapp` | ✅ Funcionando |
| Panel admin: pedidos, productos, categorías, preventistas, configuración | ✅ Funcionando |
| Login seguro (Supabase Auth, email+clave, RLS) | ✅ Funcionando |
| Anti-fantasma: pedidos Pendiente >7 días se limpian solos | ✅ Funcionando |
| `min_order_amount` en la base (sin UI todavía) | 🟡 Listo para activar |

---

## 3. Fases de implementación (en orden)

Cada fase termina con algo **usable y probado**. Nunca avanzamos a la siguiente sin aprobar la anterior.

### Fase 0 — Validar el negocio a mano (ahora, sin código)
- [ ] Cargar el catálogo completo (productos reales con foto y precio)
- [ ] Sumar 2-3 preventistas reales con sus links
- [ ] Operar el ciclo completo a mano: preventista pide → dueño recibe el WhatsApp → prepara → entrega
- **Listo cuando:** los preventistas piden seguido por el link y el dueño confirma que el modelo funciona.
- **Por qué:** no invertimos en automatizar algo que todavía no demostró que el negocio anda.

### Fase 1 — Stock con cantidad
**Objetivo:** el producto pasa de "Disponible / Sin Stock" (sí/no) a "quedan X".
- [ ] Columna `stock` (número entero) en productos + migración SQL
- [ ] Campo "Cantidad en stock" en el formulario de producto
- [ ] En el catálogo: badge "Quedan X" cuando el stock es bajo; si llega a 0 → no se puede pedir (como hoy con Sin Stock)
- [ ] Botón **"Reponer / +"** en el panel (el dueño suma cuando llega mercadería: "llegaron 100 → +100")
- [ ] Regla de negocio: al **marcar un pedido como Entregado**, el stock se descuenta solo (cierra el ciclo aunque el pedido haya entrado a mano)
- **Listo cuando:** Franco carga stock, un pedido se entrega y el número baja solo; si llega a 0, el producto se pausa.

### Fase 2 — Panel organizado + boletas imprimibles
**Objetivo:** el dueño ve los pedidos ordenados y los imprime sin copiar nada.
- [ ] Vista de pedidos **agrupada por preventista** (secciones plegables: "Pedidos de Juan — $xxx.xxx", "Pedidos de María — $xxx.xxx")
- [ ] Totales por preventista y por día
- [ ] **Boleta imprimible** por pedido: vista limpia (nombre del preventista, productos, cantidades, precios, total, fecha, código) con botón "Imprimir"
- [ ] Impresión limpia en papel (CSS print: solo la boleta, sin botones ni menús)
- **Listo cuando:** Franco agrupa los pedidos del día y imprime la boleta de uno real.

### Fase 3 — Número de WhatsApp conectado (Zernio)
**Objetivo:** la empresa tiene un WhatsApp que el sistema puede recibir y contestar.
- [ ] Requisito del dueño: **número de WhatsApp dedicado** (el de la empresa) + cuenta en Zernio (costo por mensaje)
- [ ] Sumar al repo una capa serverless (API en Vercel) para recibir webhooks y enviar mensajes — hoy la app es solo frontend, esto es lo nuevo
- [ ] Verificación del webhook, evitar mensajes duplicados, reintentos
- [ ] Responder mensajes de prueba desde el sistema
- **Listo cuando:** un WhatsApp externo manda un mensaje y el sistema lo recibe y puede contestar.
- **Aclaración para el dueño:** esto tiene costo mensual (Zernio + WhatsApp Business), chico por mensaje pero no gratis.

### Fase 4 — La IA que arma y confirma pedidos
**Objetivo:** el preventista pide por WhatsApp y la IA arma el pedido **siempre confirmándolo** antes de registrarlo.
- [ ] Elegir el modelo de IA (decisión de Franco; costo por uso)
- [ ] La IA puede: buscar productos por nombre (con sinónimos), armar el pedido, mostrar el resumen con precios del sistema (nunca inventa precios)
- [ ] Si algo es ambiguo ("dame lo de siempre", producto que no existe) → la IA **pregunta**, no adivina
- [ ] Patrón anti-respuestas dobles: espera 15 segundos por si el preventista manda todo junto, y responde una sola vez
- [ ] **Regla dura:** la IA SIEMPRE lee el pedido completo al preventista y espera su "sí" antes de registrarlo (modo asistida)
- **Listo cuando:** un preventista de prueba hace un pedido por WhatsApp y la IA lo arma y confirma (con un humano mirando).

### Fase 5 — Automatización total + reglas del dueño
**Objetivo:** el ciclo se cierra solo.
- [ ] Al confirmar el pedido: se crea → se descuenta stock → si algún producto queda en 0, se pausa y no aparece más en el catálogo
- [ ] Los pedidos entran al panel **en vivo** (sin apretar "recargar")
- [ ] Reglas configurables por el dueño:
  - **Horario de corte** (ej: pedidos hasta las 18hs → entrega al día siguiente)
  - **Mínimo de pedido** (ya está en la base, se activa la UI)
  - Aviso de agotados y sugerencia de reemplazo ("no queda Arroz 1kg, ¿te mando el de 5kg?")
- [ ] Autonomía graduada: la IA arranca confirmando siempre; después, si Franco lo decide, confirma sola y solo pregunta cuando hay dudas
- **Listo cuando:** pedido real → IA confirma → stock descuenta → panel agrupado → boleta lista, sin que el dueño toque nada.

---

## 4. Lo que le toca al DUEÑO (requisitos operativos)

| Tarea | Frecuencia | ¿Cuándo empieza? |
|---|---|---|
| Número de WhatsApp dedicado + cuenta Zernio (costo) | 1 vez + mensual | Fase 3 |
| Cargar el stock inicial de cada producto | 1 vez | Fase 1 |
| Reponer stock cuando llega mercadería (botón +) | Cada entrega de mercadería | Fase 1 |
| Definir horario de corte y mínimo de pedido | 1 vez (se puede cambiar) | Fase 5 |
| Revisar pedidos que la IA marca como dudosos | Diario | Fase 4 en adelante |

## 5. Decisiones pendientes (no urgentes)
- [ ] Modelo de IA a usar y costo máximo mensual aceptable
- [ ] Nivel de autonomía final de la IA (¿confirmar sola o siempre con el preventista?)
- [ ] ¿Boleta con logo y datos de la empresa? (se configura en el panel)
- [ ] Realtime vs recarga periódica en el panel (decisión técnica chica)

## 6. Lo que NO incluye (para que el dueño sepa)
- ❌ **Facturación electrónica / AFIP** — es otro sistema aparte. La boleta de Mayorista360 es comprobante interno para el reparto.
- ❌ Pagos online — el cobro sigue como hoy (contra entrega / como acuerde el dueño).
- ❌ App nativa — la web actual (PWA) alcanza; se puede instalar en el celu.

## 7. Riesgos y cómo los mitigamos
| Riesgo | Mitigación |
|---|---|
| El preventista escribe "como se le canta" y la IA no entiende | La IA SIEMPRE confirma el pedido antes de registrarlo; si hay dudas, pregunta |
| Stock desactualizado (el dueño no repone) | Descuento automático al entregar + botón Reponer + revisión semanal |
| Costo por mensaje se va de presupuesto | Umbral de costo mensual definido por Franco; alerta si se acerca |
| Servicio de WhatsApp caído | El link actual del catálogo sigue funcionando siempre (modo manual intacto) |

---

*Documento vivo: se actualiza cuando Franco decide arrancar una fase o cambia una decisión.*
