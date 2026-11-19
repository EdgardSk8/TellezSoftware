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
npm test
npm run preview
```

Para levantar Pages Functions con D1 y R2 simulados localmente:

```powershell
npm run dev:stack
```

La aplicación de Pages queda en `http://localhost:8788`. `dev:stack` migra D1
con `--local` y Pages Functions corre en el emulador local predeterminado de
Wrangler; D1 y R2 persisten bajo `.wrangler/`. No se usa `--remote`, por lo que
las solicitudes de desarrollo no modifican recursos remotos. Wrangler Pages
requiere el `wrangler.jsonc` raíz para `pages dev`; `wrangler.local.jsonc` no se
pasa como configuración personalizada. `npm run dev` por sí solo sirve el modo
visual con datos de demostración en el navegador.

Para abrir la aplicación desde el celular u otro equipo de la misma red:

```powershell
npm run dev:stack:lan
```

`dev:lan` agrega `--ip 0.0.0.0` para escuchar en todas las interfaces y Wrangler
imprime la IP local (por ejemplo `http://192.168.1.20:8788`). Úsalo solo en
redes de confianza. La cookie de sesión es `__Host-…; Secure`, así que sobre
HTTP los navegadores la descartan: la landing y el catálogo se ven sin problema,
pero para iniciar sesión desde otro dispositivo hay que servir HTTPS agregando
`--local-protocol https` (el certificado es autofirmado y hay que aceptarlo).

Rutas públicas del frontend: `/` muestra la landing de presentación cuando no
hay sesión y el panel cuando ya iniciaste sesión; `/ingresar` es la pantalla de
inicio de sesión y registro; `/terminos` y `/catalogo/{slug}` conservan su
comportamiento. `/bienvenida` abre la landing aunque tengas una sesión activa,
lo que facilita revisarla durante el desarrollo. En la configuración inicial,
«Volver al inicio» cierra la sesión y regresa a `/ingresar`.

## Inicio de sesión con Google

La aplicación admite «Continuar con Google» además del correo y la contraseña.

1. En **Google Cloud Console** crea un cliente OAuth de tipo **Web application** y
   registra exactamente estas redirect URIs (sin comodines):
   - `http://localhost:8788/api/auth/google/callback`
   - `http://192.168.x.x:8788/api/auth/google/callback` si vas a probar desde el
     teléfono en la red local
   - `https://tellezsoftware.pages.dev/api/auth/google/callback` en producción
2. **Local:** copia `.dev.vars.example` a `.dev.vars` y completa
   `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`. El archivo ya está en
   `.gitignore`; `wrangler pages dev` lo carga automáticamente.
3. **Producción:** guarda ambos valores como secretos del proyecto de Pages:

   ```powershell
   npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name tellezsoftware
   npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name tellezsoftware
   ```

El flujo usa `state` de un solo uso y PKCE (S256), guardados en una cookie
`HttpOnly` de 10 minutos. Al volver de Google se valida el state, se canjea el
código, se exige `email_verified` y se guarda el `sub` de Google en
`oauth_accounts` (migración `0008_google_oauth.sql`); el correo nunca se usa como
identificador. Si el correo ya existe con contraseña no se fusiona la cuenta: se
muestra «cuenta existente» y se pide iniciar sesión con el método original. Las
cuentas nuevas con Google entran al flujo de configuración como cualquier
registro. La sesión propia sigue siendo la cookie `__Host-tellez-session`.

> Sobre HTTP en la red local la cookie de sesión (`Secure`) no persiste, así que
> para probar el inicio de sesión desde el celular hay que servir HTTPS con
> `--local-protocol https`.

> Las contraseñas se derivan con PBKDF2-SHA256 a 100.000 iteraciones porque el
> runtime de Workers rechaza valores mayores (`NotSupportedError`). Si un hash
> guardado supera ese límite (por ejemplo, de una base local antigua) la
> verificación falla de forma controlada en producción; el emulador local sigue
> aceptándolo.

Configuración actual del proyecto de Google: cliente **Web application** en el
proyecto `My First Project` (`gentle-shell-463320-v5`) con estos orígenes y
redirect URIs:

- Origen JS: `https://tellezsoftware.pages.dev`
- Redirect: `https://tellezsoftware.pages.dev/api/auth/google/callback`
- Redirect: `http://localhost:8788/api/auth/google/callback`

Google no acepta IPs privadas (`192.168.x.x`) como redirect URI, así que el
inicio de sesión con Google solo se prueba desde `localhost` o desde el dominio
público. La app queda en modo **Prueba** mientras no exista una política de
privacidad publicada; en ese modo solo entran las cuentas de *Usuarios de
prueba* (hasta 100). Para abrirla a cualquier cuenta hay que publicarla desde
**Google Auth Platform → Público → Publicar app** después de añadir la política
de privacidad en **Información de la marca**.

## Marca, iconos e imagen para compartir

`TELLEZSOFTWARE.png` (raíz del repositorio) es el logo fuente. Los archivos que
se publican viven en `public/` y Vite los copia a `dist/`:

- `logo.png`: marca usada en la interfaz (landing, inicio de sesión, barra
  lateral, configuración, carga y términos). Conserva la transparencia del PNG
  original para que se apoye directamente sobre el fondo de cada pantalla.
- `favicon-32.png`, `icon-192.png`, `icon-512.png` y `apple-touch-icon.png`:
  pestaña del navegador y acceso desde el teléfono. El favicon es transparente;
  los iconos de aplicación llevan fondo blanco porque iOS y Android pintan negro
  o el fondo del lanzador detrás de la transparencia.
- `icon-maskable-512.png`: icono adaptable de Android.
- `og-image.png`: tarjeta 1200×630 para la vista previa al compartir el enlace.
- `site.webmanifest`: nombre, colores y modo `standalone` para instalar la web
  como aplicación.
- `sw.js`: service worker mínimo, sin caché, que habilita la instalación como
  app sin servir contenido viejo.

`index.html` declara los iconos, el manifiesto y las etiquetas Open Graph y
Twitter. Las URLs de `og:image` son absolutas y apuntan a
`https://tellezsoftware.pages.dev`; cámbialas si el dominio de producción es
otro. Las imágenes se regeneran redimensionando el logo original a 32, 180, 192,
256 y 512 px (y 1200×630 para la tarjeta social).

La paleta de la aplicación usa tres colores:

- Principal `#00C885` (botones, enlaces, estados activos y acentos).
- Secundario morado `#8500C8` y carmesí `#C80043` (iconos alternos, degradados,
  avisos y errores).
- Sobre el verde principal el texto va en `#06281D` para conservar contraste AA;
  el verde oscuro `#007A56` se usa para texto verde sobre fondos claros.
  Las variables están en `:root` (`--brand`, `--brand-deep`, `--accent-purple`,
  `--accent-crimson`) y en `.landing-page` (`--lp-green`, `--lp-accent`,
  `--lp-accent-2`).

## Infraestructura Cloudflare

`wrangler.jsonc` contiene los bindings D1 `DB` y R2 `FILES` de producción y
preview. En `dev:stack`, el nombre de esos bindings solo configura el emulador:
no activa acceso remoto. Los recursos remotos y las migraciones D1 iniciales se
aprovisionaron y verificaron con Wrangler. La rama remota `preview` ya se
desplegó manualmente con
Wrangler y respondió correctamente; producción aún no se ha desplegado con esta
configuración. La URL de preview es pública y solo debe usarse con datos de
prueba: https://preview.tellezsoftware.pages.dev

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

El script pide escribir `yes` antes de cambiar Cloudflare. Con la configuración
actual reutiliza la D1 de producción `tellezsoftware`, crea/reutiliza una D1 de
preview (`tellezsoftware-preview`) y dos buckets R2 separados para producción y
preview. También aplica la migración existente en ambas bases. No borra recursos
ni datos. El comando usa el nombre de Pages `tellezsoftware`; se puede cambiar
con `CLOUDFLARE_PAGES_PROJECT` si el nombre real es diferente. El aprovisionamiento
actual ya se ejecutó y verificó; revisa y guarda `wrangler.jsonc` en GitHub para
que los despliegues conectados a Git usen los bindings.

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

- Landing de presentación en `/` (y en `/bienvenida`) con hero, funciones,
  comparación, pasos, catálogo público, rubros y preguntas frecuentes; todos los
  llamados a la acción llevan a `/ingresar`.
- Panel adaptable con métricas de inventario y navegación.
- Listado de productos con búsqueda y filtros de stock.
- Formulario de producto adaptado a la categoría: sugiere categorías y unidades
  pertinentes y cambia el detalle solicitado (por ejemplo, talla para ropa o
  volumen para bebidas); el control de serie aparece para productos que lo usan.
- Selector de negocios en la barra lateral, con un inventario D1 separado por
  negocio. El registro y la preparación de nuevos espacios usan cuatro grupos:
  ropa y calzado, ferretería y repuestos, alimentos y bebidas, y tienda general.
  Los espacios existentes se conservan; no se mezclan ni eliminan sus inventarios.
- Filtros de disponibilidad y registro local de entradas, salidas y
  correcciones de existencias con motivo e historial.
- Registro e inicio/cierre de sesión dentro de Pages. El alta pide solo los
  datos necesarios para crear la cuenta; después del ingreso, el propietario
  configura el tipo de negocio y la moneda en «Configurar cuenta», con una
  explicación de para qué sirve cada dato. La moneda no se cambia si ya hay
  productos registrados.
- En modo Pages autenticado, listado y alta de productos y ajustes de stock se
  consultan y guardan en D1; la pantalla de inventario recupera el historial.
- Edición persistente y archivado/restauración reversible de productos;
  la cantidad solo cambia mediante ajustes auditables de inventario.
- Listado paginado por cursor, con búsqueda, filtros de archivo y controles de
  navegación desde la interfaz.
- Gestión de hasta cinco imágenes por producto: conversión en navegador a WebP,
  límite de 150 KiB por archivo y validación de formato, tamaño y dimensiones
  en Pages Functions antes de guardarlo en R2.
- Catálogo público por negocio en `/catalogo/{slug}`; solo muestra productos
  con existencia mayor que cero y no devuelve SKU, costo, serial ni cantidad.
- Imágenes R2 privadas por defecto: el panel requiere sesión del tenant y el
  catálogo solo sirve imágenes asociadas a productos con existencia disponible.
- Scrollbar delgada verde y estilos base del catálogo público.
- Interfaz inicial en español e inglés.
- Datos de demostración guardados en el almacenamiento local del navegador.
- Pages Functions para registro, inicio/cierre de sesión, sesión actual,
  productos paginados, ajustes auditables de existencias e imágenes.
- Migraciones D1 versionadas para usuarios, tenants, membresías, sesiones,
  productos, movimientos, metadata de imágenes, archivado y aceptación de
  términos (`0004`) y tipo de negocio (`0005`).

Al abrir `npm run dev`, Vite sirve el prototipo local y `localStorage` se usa
solo para datos de demostración. Al abrir Pages local con `npm run dev:stack`,
la interfaz de acceso y el inventario usan las Pages Functions y D1 local.
No mezcles ni introduzcas datos reales en el modo demo.

El catálogo considera publicable un producto con existencia mayor que cero
(`quantity > 0`); no existe aún un estado de publicación independiente. La
imagen se convierte en el navegador; si no se puede producir un WebP de hasta
150 KiB, se cancela la carga. El servidor valida firma WebP y dimensiones
(máximo 2000 × 2000 px y 4 megapíxeles). El límite actual es de cinco imágenes
por producto; la primera imagen en el orden de carga es la portada. Las
pruebas de esta implementación se hicieron en localhost, con D1 y R2
emulados, sin escribir en los buckets remotos.

Las pruebas unitarias (`npm test`) usan el ejecutor integrado de Node y cubren
la estructura WebP, las dimensiones y los límites de tamaño. Para la prueba
API de extremo a extremo, deja `npm run dev:stack` en ejecución y configura
`LOCAL_TEST_EMAIL` y `LOCAL_TEST_PASSWORD` con una cuenta de prueba local:

```powershell
$env:LOCAL_TEST_EMAIL = "edgard@localhost.test"
$env:LOCAL_TEST_PASSWORD = "<contraseña local>"
npm run test:local:api
```

La prueba crea un producto local, verifica edición, autorización y publicación
en catálogo, recorre dos páginas por cursor, elimina su objeto R2 y archiva los
productos de prueba al terminar.
No se ejecuta en `npm test` porque necesita un servidor Pages local activo.

La autenticación aún no cuenta con verificación/recuperación por correo,
Turnstile ni administración global; tampoco se ha realizado una auditoría de
producción. El alta pública deja el correo sin verificar y lo informa en la
interfaz. Los recursos remotos D1 y R2 están configurados. Pages tiene un
despliegue público de preview con los bindings actualizados; producción aún no
se ha desplegado con esta configuración.

La página pública `/terminos` presenta condiciones bilingües para el piloto.
Las cuentas nuevas deben aceptar la versión vigente y la aceptación se guarda
en D1. Es un documento inicial, no asesoría legal ni una garantía contra
reclamaciones; no reemplaza el aviso de privacidad ni la revisión legal y de
identidad del operador que siguen pendientes antes de abrir el servicio al
público.

El backend de Pages Functions no es un servicio desplegado aparte: se publica
en el mismo proyecto y origen de Cloudflare Pages. El API y la interfaz usan
paginación por cursor; la interfaz no necesita cargar la lista completa.

## Endpoints locales iniciales

| Método | Ruta | Acceso |
|---|---|---|
| `POST` | `/api/auth/register` | Público; crea usuario y tenant |
| `POST` | `/api/auth/login` | Público con límite de intentos |
| `GET` | `/api/auth/me` | Sesión |
| `POST` | `/api/auth/logout` | Sesión + origen del sitio |
| `GET`, `POST` | `/api/products` | Sesión; listado paginado y alta |
| `PATCH` | `/api/products/{id}` | Sesión de owner/manager; edición y archivado/restauración |
| `GET`, `POST` | `/api/products/{id}/images` | Sesión; listar y cargar WebP del tenant |
| `GET`, `DELETE` | `/api/products/{id}/images/{imageId}` | Sesión; consultar o borrar imagen propia |
| `GET` | `/api/catalog/{slug}` | Público; solo productos con existencia |
| `GET` | `/api/catalog/{slug}/images/{imageId}` | Público; solo imagen de producto disponible |
| `GET` | `/api/inventory/movements` | Sesión; historial del tenant |
| `POST` | `/api/inventory/adjust` | Sesión + origen del sitio |

Las escrituras requieren JSON y origen coincidente; las consultas privadas
derivan el tenant de la sesión, no de un `tenant_id` enviado por el navegador.
Las cargas WebP usan un cuerpo binario y también requieren sesión, rol permitido
y origen coincidente. R2 no tiene acceso público directo.

## Despliegue

El frontend estático de Vite se genera en `dist/`. Pages Functions se publica
en el mismo proyecto y origen. Las operaciones protegidas se validan del lado
del servidor; D1/R2 se configuran mediante los bindings de Wrangler.
