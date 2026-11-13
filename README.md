# TellezSoftware

Aplicación web de inventario y gestión para pequeños negocios. El frontend
está construido con React, TypeScript y Vite; se prepara para publicarse como
una única web en Cloudflare Pages.

## Ejecutar en localhost

Requiere Node.js 20.19+ o 22.12+.

```powershell
npm install
npm run dev
```

Vite muestra la dirección local en la terminal (habitualmente
`http://localhost:5173`). Para comprobar la compilación:

```powershell
npm run build
npm run lint
npm run preview
```

Para levantar también Pages Functions y la base D1 local:

```powershell
npm run dev:stack
```

La aplicación de Pages queda en `http://localhost:8788`. Esto usa Wrangler y
una base local guardada bajo `.wrangler/`; no crea ni modifica recursos
remotos de Cloudflare. `npm run dev` por sí solo sirve el modo visual local.

## Infraestructura Cloudflare

`wrangler.local.jsonc` es exclusivamente para desarrollo local. Su ID D1 de
ceros es intencional para el emulador local y **no** se usa al desplegar.
`wrangler.jsonc` es la configuración de Pages para producción y preview; al
principio contiene solo la configuración base para evitar desplegar con un UUID
provisional. El aprovisionamiento lo completará con los IDs que devuelva
Cloudflare.

Previsualiza qué se intentaría crear:

```powershell
npm run infra:plan
```

Requisitos para aprovisionar: estar autenticado en Wrangler con la cuenta
correcta (`npx wrangler login`) y tener permisos de crear/consultar D1 y R2.
Para verificar la cuenta y crear o reutilizar recursos, escribir la
configuración con IDs reales y aplicar migraciones remotas, ejecuta:

```powershell
npm run infra:provision
```

El script pide escribir `yes` antes de cambiar Cloudflare. Creará o reutilizará
dos D1 (`tellezsoftware-production` y `tellezsoftware-preview`) y dos buckets
R2 separados para producción y preview. Aplica la migración existente a las
dos bases. No borra recursos ni datos. El comando usa el nombre de Pages
`tellezsoftware`; se puede cambiar con `CLOUDFLARE_PAGES_PROJECT` si el nombre
real del proyecto es diferente. Después, revisa y guarda `wrangler.jsonc` con
el resto del código en GitHub para que los despliegues de Pages apliquen esos
bindings.

Comprueba que no hay IDs provisionales:

```powershell
npm run infra:check
```

Los IDs de D1 no son secretos y el config generado debe conservarse en Git.
No compartas tokens ni credenciales. GitHub Pages deberá construir con
`npm run build`, publicar `dist` y usar directorio raíz vacío. Pages Functions
requiere el sistema de build V2 para que Wrangler aplique el archivo de
configuración como fuente de bindings.

## Estado de este prototipo

- Panel adaptable con métricas de inventario y navegación.
- Listado de productos con búsqueda y filtros de stock.
- Formulario para agregar productos con SKU, perfil, unidad, variante,
  cantidad, stock mínimo, costo, precio y dato de serie opcional; edición y
  validación de SKU duplicado.
- Filtros de disponibilidad y registro local de entradas, salidas y
  correcciones de existencias con motivo e historial.
- Registro e inicio/cierre de sesión dentro de Pages; el alta crea un tenant
  con el perfil y moneda elegidos.
- En modo Pages autenticado, listado y alta de productos y ajustes de stock se
  consultan y guardan en D1; la pantalla de inventario recupera el historial.
- Interfaz inicial en español e inglés.
- Datos de demostración guardados en el almacenamiento local del navegador.
- Pages Functions para registro, inicio/cierre de sesión, sesión actual,
  productos paginados y ajustes auditables de existencias.
- Migración D1 inicial con usuarios, tenants, membresías, sesiones, productos y
  movimientos.

Al abrir `npm run dev`, Vite sirve el prototipo local y `localStorage` se usa
solo para datos de demostración. Al abrir Pages local con `npm run dev:stack`,
la interfaz de acceso y el inventario usan las Pages Functions y D1 local.
No mezcles ni introduzcas datos reales en el modo demo.

La autenticación aún no cuenta con verificación/recuperación por correo,
Turnstile ni administración global; tampoco se ha realizado una auditoría de
producción. El alta pública deja el correo sin verificar y lo informa en la
interfaz. En este repositorio aún no se han consultado/creado recursos remotos;
el aprovisionamiento documentado necesita autorización y autenticación de la
cuenta de Cloudflare.

El backend de Pages Functions no es un servicio desplegado aparte: se publica
en el mismo proyecto y origen de Cloudflare Pages. La lista paginada existe en
el API; la interfaz carga como máximo los primeros 100 productos por ahora.

## Endpoints locales iniciales

| Método | Ruta | Acceso |
|---|---|---|
| `POST` | `/api/auth/register` | Público; crea usuario y tenant |
| `POST` | `/api/auth/login` | Público con límite de intentos |
| `GET` | `/api/auth/me` | Sesión |
| `POST` | `/api/auth/logout` | Sesión + origen del sitio |
| `GET`, `POST` | `/api/products` | Sesión; listado paginado y alta |
| `GET` | `/api/inventory/movements` | Sesión; historial del tenant |
| `POST` | `/api/inventory/adjust` | Sesión + origen del sitio |

Las escrituras requieren JSON y origen coincidente; las consultas privadas
derivan el tenant de la sesión, no de un `tenant_id` enviado por el navegador.

## Despliegue

El frontend estático de Vite se genera en `dist/`. Pages Functions se publica
en el mismo proyecto y origen. Las operaciones protegidas se validan del lado
del servidor; D1/R2 se configuran mediante los bindings de Wrangler.
