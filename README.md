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
producción. El alta pública local deja el correo sin verificar y lo informa en
la interfaz. No hay recursos remotos D1/R2, secretos ni despliegues de
Cloudflare configurados.

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

## Despliegue futuro

El frontend estático de Vite se genera en `dist/`. El proyecto de Pages deberá
construirlo con `npm run build` y publicar esa carpeta. Las operaciones que
requieren confianza (sesiones, permisos, tenant y escrituras) deberán
implementarse en Pages Functions y validarse del lado del servidor; no se
deben resolver confiando en el navegador.
