# LUCYNE

Tienda con Next.js 16, React 19, Tailwind CSS 4, Motion y Supabase.
Incluye catálogo público, filtros, favoritos locales y administración de
productos, fotografías y variantes.

## Ejecutar en Windows / Visual Studio Code

Desde PowerShell en la carpeta del proyecto:

~~~powershell
cd D:\GitHub\Lucyne
npm ci
~~~

Si todavía no tienes .env.local, copia el ejemplo:

~~~powershell
Copy-Item .env.example .env.local
~~~

**Si ya tienes .env.local, conserva ese archivo; no lo reemplaces.**
Completa estas variables con los datos de tu propio proyecto:

~~~dotenv
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICABLE
NEXT_PUBLIC_WHATSAPP_NUMBER=
~~~

Usa la clave publicable de Supabase, nunca una clave secreta o service_role.
.env.local queda excluido de Git. El ejemplo versionado no contiene credenciales.

WhatsApp es opcional: código de país + número, sin espacios ni signo +.
La portada y la ficha usan la misma variable. Reinicia el servidor tras
cambiar las variables; para producción vuelve a compilar.

~~~powershell
npm run dev
~~~

Abre http://localhost:3000.

## Base de datos

En un proyecto Supabase nuevo, aplica los scripts en este orden:

1. supabase/migrations/001_catalogo.sql
2. supabase/migrations/002_administradores.sql
3. supabase/migrations/003_product_images_storage.sql
4. supabase/migrations/004_manage_product_images.sql

Si ya los aplicaste y tus productos funcionan, no necesitas ejecutarlos otra vez
para esta corrección.

Crea el usuario administrador en Supabase Auth e incorpora su UUID en
public.admin_users.user_id. El acceso se comprueba en el servidor y en las
acciones administrativas; las tablas y el almacenamiento usan las políticas
de los scripts anteriores.

## Estilos

Tailwind se procesa con @tailwindcss/postcss desde postcss.config.mjs.
Los archivos .module.css los procesa Next.js de forma nativa.
No agregues una regla general *.css con @tailwindcss/turbopack: hace que
los módulos pierdan sus clases en esta configuración.

Si tras actualizar ves estilos antiguos, detén el servidor con Ctrl+C y ejecuta:

~~~powershell
if (Test-Path .next) { Remove-Item .next -Recurse -Force }
npm run dev
~~~

Después recarga el navegador con Ctrl+F5. .next es salida de compilación.

## Rutas principales

| Ruta | Función |
| --- | --- |
| / | Portada y colecciones |
| /catalogo | Productos publicados y filtros |
| /catalogo/ID | Fotografías, tallas, colores y consulta |
| /favoritos | Prendas guardadas en este navegador |
| /login | Acceso administrativo |
| /admin | Resumen y gestión del catálogo |

Los favoritos no se sincronizan entre dispositivos. Guardar una prenda no
reserva stock. La disponibilidad actual es por variante (disponible/agotada),
no un inventario de unidades.

## Verificación

~~~powershell
npm run lint
npm run build
npm start
~~~

La compilación necesita las variables de Supabase configuradas. Las fuentes
Geist de next/font/google también necesitan conexión durante la primera
compilación. npm start requiere que npm run build termine correctamente.

En tu entorno comprueba: navegación de escritorio/móvil, filtros, favoritos,
acceso administrativo, creación/edición y subida/gestión de fotografías.
Las comprobaciones realizadas con una API simulada no sustituyen la
verificación de las políticas y los datos de tu Supabase real.
