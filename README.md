# TellezSoftware

Sitio corporativo de TellezSoftware: contenedor de las aplicaciones que
desarrollamos. Es una página **estática**, sin inicio de sesión, sin base de
datos y sin cookies.

Sitio publicado: <https://tellezsoftware.pages.dev>

## Contenido del repositorio

| Ruta | Qué es |
| --- | --- |
| `site/` | Sitio corporativo de TellezSoftware (HTML + CSS y un script mínimo de animaciones, sin compilación) |
| `site/aplicaciones/` | Lista completa de aplicaciones: gratis, de pago y de clientes |
| `site/og/` | Una imagen de vista previa 1200×630 por cada página pública |
| `site/cotizacion/` | Cotizador: paquetes con precio, pedido personalizado y resumen |
| `site/demos/portafolio/` | Demo de portafolio: ejemplo publicado de lo que se entrega |

En la demo, los logos de los proyectos son marcas ficticias dibujadas para el
ejemplo y la foto de perfil viene de StockSnap con licencia CC0 (se puede
cambiar por la del cliente).
| `wrangler.jsonc` | Proyecto de Cloudflare Pages que publica `site/` |
| `TELLEZSOFTWARE.png` | Logo fuente de la marca |

El producto **Noubora Catalog** ya no vive aquí: tiene su propio repositorio
([EdgardSk8/NeuboraCatalog](https://github.com/EdgardSk8/NeuboraCatalog)) y se
publica en <https://nouboracatalog.pages.dev>.

## Estructura de marca

```
TellezSoftware        ← empresa (este sitio, sin login)
   └── Noubora Catalog   ← producto (aplicación aparte, con su propio dominio)
       └── (próximos productos)
```

Regla: **el contenedor presenta, el producto vende.** Precios, registro y
términos de uso de la aplicación viven en el producto, no aquí.

## Ver el sitio en local

Es estático, así que no necesita compilación. Para ver los cambios **sin
recargar la página a mano**:

```powershell
npx browser-sync start --server site --files "site/**/*" --port 8789 --no-open --no-notify --no-ui
```

Queda en `http://localhost:8789` y se actualiza solo: los cambios de CSS se
aplican sin recargar y los de HTML recargan la página. Para verlo desde el
celular, abre `http://IP-DE-TU-PC:8789` (browser-sync también escucha en la red
local).

En Windows, `iniciar-servidor.bat` ofrece las dos formas con un menú: la opción
1 levanta ese servidor en vivo y la opción 2 levanta `wrangler pages dev`, que
usa el mismo runtime de Cloudflare pero no recarga.

```powershell
npx wrangler pages dev --port 8789
```

Cualquier servidor estático funciona igual (`npx serve site`,
`python -m http.server --directory site`), pero esos no recargan solos.

## Vista previa al compartir e iconos

La tipografía del sitio es **Sora** (títulos y marca) + **Manrope** (texto),
servida desde `site/fonts/`.

Cada página pública tiene su propia imagen 1200×630 en `site/og/` y sus etiquetas
`og:image` / `twitter:image`. Los iconos web y de instalación están en la raíz de
`site/` (`favicon.ico`, `favicon.svg`, 16/32, `apple-touch-icon.png`, 192/512,
maskable, `site.webmanifest` y `browserconfig.xml`). Las reglas completas están en
[`../REGLAS-BASICAS-OBLIGATORIAS.md`](../REGLAS-BASICAS-OBLIGATORIAS.md) y el
análisis de diseño en [`../DISENO-COMPARATIVO.md`](../DISENO-COMPARATIVO.md).

## Publicar

Automático: cada push a `main` compila en Cloudflare Pages con el proyecto
`tellezsoftware` (comando de compilación vacío, directorio de salida `site`).

Manual, si hace falta publicar sin pasar por Git:

```powershell
npx wrangler pages deploy
```

Configuración del proyecto en Cloudflare Pages:

| Ajuste | Valor |
| --- | --- |
| Nombre del proyecto | `tellezsoftware` |
| Repositorio | `EdgardSk8/TellezSoftware` |
| Rama de producción | `main` |
| Directorio raíz | *(vacío)* |
| Comando de compilación | *(vacío)* |
| Directorio de salida | `site` |

## Recursos de Cloudflare que se conservan

El catálogo se mudó a su propio repositorio y hoy usa sus propios recursos
(D1 y R2 `nouboracatalog`). Los antiguos, creados cuando el catálogo vivía aquí,
siguen existiendo en la cuenta:

| Recurso | Nombre | Para qué |
| --- | --- | --- |
| D1 | `tellezsoftware` (prod) y `tellezsoftware-preview` | Base de datos del catálogo antiguo |
| R2 | `tellezsoftware-files-production` y `tellezsoftware-files-preview` | Fotos de producto del catálogo antiguo |
| Pages | `nouboracatalog` → <https://nouboracatalog.pages.dev> | Aplicación publicada |

El proyecto de Pages `tellezsoftware` es **este sitio corporativo**. La
aplicación se publica desde `NeuboraCatalog` con
`npx wrangler pages deploy dist --project-name nouboracatalog`.

## Agregar contenido

**Una aplicación gratis**: copia un `<article class="app ui-surface">` dentro de
`.app-grid` en `site/aplicaciones/index.html`. Cambia el icono, el título, la
descripción y el estado («En desarrollo» o «Disponible»); cuando exista, agrega
el enlace en la tarjeta. El inicio solo muestra un aviso con enlace a esa
página, así que la lista puede crecer sin límite.

**Una aplicación de pago**: la tarjeta destacada es
`<article class="product ui-surface">`, en el grupo «De pago». Duplícala para
agregar otra y ajusta nombre, funciones y botones.

**Una aplicación de clientes**: usa la misma tarjeta `<article class="product
ui-surface">` dentro de la sección `#clientes`, pero con
`<span class="product-mark product-mark--logo">` y el logo del cliente en
`site/aplicaciones/` (por ejemplo, `tellezstorenic.png`). La clase
`product-mark--logo` pinta la ficha de blanco y ajusta la imagen con
`object-fit: contain`; conviene un PNG o WebP cuadrado con fondo transparente.

**Un servicio**: copia un `<article class="service">` dentro de `.service-grid`
y cambia el icono, el título y la descripción.

**Un paquete de cotización**: cada tarjeta de `site/cotizacion/index.html` es un
`<article class="package ui-surface" data-package="Nombre" data-price="4900">`.
El nombre y el precio salen de esos atributos; el resumen, el total y el correo
se arman solos en `site/cotizacion/cotizacion.js`. El pedido personalizado
también entra al total con el presupuesto que escriba el cliente.

Los acentos de las tarjetas (verde, magenta y rojo) los asigna el CSS solo, en
ciclos de tres, así que no hay que elegir colores a mano.

## Enlaces a la aplicación

Los enlaces al producto (tarjeta de Noubora Catalog, pie de página y botón del
menú móvil) apuntan a `https://nouboracatalog.pages.dev`. Cuando el producto
tenga dominio propio hay que actualizarlos en `site/index.html`,
`site/en/index.html`, `site/aplicaciones/index.html` y
`site/cotizacion/index.html`.
