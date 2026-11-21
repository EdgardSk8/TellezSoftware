# TellezSoftware

Sitio corporativo de TellezSoftware: contenedor de las aplicaciones que
desarrollamos. Es una página **estática**, sin inicio de sesión, sin base de
datos y sin cookies.

Sitio publicado: <https://tellezsoftware.pages.dev>

## Contenido del repositorio

| Ruta | Qué es |
| --- | --- |
| `site/` | Sitio corporativo de TellezSoftware (HTML + CSS y un script mínimo de animaciones, sin compilación) |
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

Es estático, así que no necesita dependencias instaladas:

```powershell
npx wrangler pages dev --port 8789
```

En Windows, `iniciar-servidor.bat` hace lo mismo con un menú: la opción 1
levanta el servidor solo para este equipo y la opción 2 también para la red
Wi-Fi, mostrando la IP local para abrirlo desde el celular.

Queda en `http://localhost:8789`. Para exponerlo a la red local agrega
`--ip 0.0.0.0`. Cualquier servidor estático funciona igual (`npx serve site`,
`python -m http.server --directory site`).

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
`.app-grid`, en el grupo «Gratis» de `site/index.html` y `site/en/index.html`.
Cambia el icono, el título, la descripción y el estado («En desarrollo» o
«Disponible»); cuando exista, agrega el enlace en la tarjeta.

**Una aplicación de pago**: la tarjeta destacada es
`<article class="product ui-surface">`, en el grupo «De pago». Duplícala para
agregar otra y ajusta nombre, funciones y botones.

**Un servicio**: copia un `<article class="service">` dentro de `.service-grid`
y cambia el icono, el título y la descripción.

Los acentos de las tarjetas (verde, magenta y rojo) los asigna el CSS solo, en
ciclos de tres, así que no hay que elegir colores a mano.

## Enlaces a la aplicación

Los botones "Ver Noubora Catalog" apuntan a `https://nouboracatalog.pages.dev`.
Cuando el producto tenga dominio propio hay que actualizarlos en
`site/index.html` y `site/en/index.html` (hay un comentario en el HTML justo
donde van).
