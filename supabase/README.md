# 🗄️ Guía de Conexión con Supabase

Esta carpeta contiene los scripts SQL listos para crear la base de datos de **Mayorista360** en Supabase.

---

## 🚀 Pasos para inicializar Supabase:

### 1. Crear tu proyecto en Supabase
1. Ingresa a [https://supabase.com](https://supabase.com) e inicia sesión (con tu cuenta de GitHub o email).
2. Haz clic en **"New Project"**.
3. Elige un nombre para tu proyecto (ej: `mayorista360-db`) y una contraseña para la base de datos.
4. Selecciona la región más cercana (ej: `South America (São Paulo)`).
5. Haz clic en **"Create new project"** (tarda aproximadamente 1 a 2 minutos).

---

### 2. Crear las Tablas (Schema)
1. En el menú lateral izquierdo de Supabase, entra en **SQL Editor** (ícono de terminal `>_`).
2. Haz clic en **"New query"**.
3. Abre el archivo `supabase/schema.sql` de este proyecto, copia todo su contenido y pégalo en el editor.
4. Presiona el botón verde **"Run"** (o `Ctrl + Enter` / `Cmd + Enter`).
5. ¡Listo! Verás el mensaje `Success: No rows returned`. Ya están creadas las tablas `categories`, `products`, `preventistas` y `store_settings` con sus índices y políticas de seguridad.

---

### 3. Cargar los Datos Semilla (Opcional)
1. En el mismo **SQL Editor**, crea otra "New query".
2. Copia y pega el contenido del archivo `supabase/seed.sql`.
3. Presiona **"Run"**.
4. Nota: este proyecto arranca con el catálogo **en blanco** a propósito; el dueño carga sus productos, preventistas y categorías desde el Panel de Administración. `seed.sql` hoy no inserta nada.

---

### 4. Conectar la App con Supabase
1. En Supabase, ve a **Project Settings** (ícono de engranaje abajo a la izquierda) -> **API**.
2. Copia los dos valores:
   - **Project URL** (ej: `https://xyzcompany.supabase.co`)
   - **Project API Keys** -> clave `anon` / `public` (ej: `eyJhbGciOi...`)
3. En tu archivo `.env` o en las variables de entorno de tu hosting:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_publica
   ```
4. El cliente de Supabase ya está preparado en `src/lib/supabase.ts` para sincronizar automáticamente en cuanto definas esas dos variables. Si no están configuradas, la aplicación sigue funcionando normalmente con almacenamiento local.
