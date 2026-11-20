# TellezSoftware

Sitio corporativo de TellezSoftware: contenedor de las aplicaciones que
desarrollamos. Es una página **estática**, sin inicio de sesión, sin base de
datos y sin cookies.

Sitio publicado: <https://tellezsoftware-web.pages.dev>

## Contenido del repositorio

| Ruta | Qué es |
| --- | --- |
| `site/` | Sitio corporativo de TellezSoftware (HTML + CSS, sin compilación) |
| `wrangler.jsonc` | Proyecto de Cloudflare Pages que publica `site/` |
| `TELLEZSOFTWARE.png` | Logo fuente de la marca |

El producto **Noubora Catalog** ya no vive aquí: tiene su propio repositorio
([EdgardSk8/NeuboraCatalog](https://github.com/EdgardSk8/NeuboraCatalog)) y se
publica en <https://tellezsoftware.pages.dev>.

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

Queda en `http://localhost:8789`. Para exponerlo a la red local agrega
`--ip 0.0.0.0`. Cualquier servidor estático funciona igual (`npx serve site`,
`python -m http.server --directory site`).

## Publicar

Automático: cada push a `main` compila en Cloudflare Pages con el proyecto
`tellezsoftware-web` (comando de compilación vacío, directorio de salida `site`).

Manual, si hace falta publicar sin pasar por Git:

```powershell
npx wrangler pages deploy
```

Configuración del proyecto en Cloudflare Pages:

| Ajuste | Valor |
| --- | --- |
| Nombre del proyecto | `tellezsoftware-web` |
| Repositorio | `EdgardSk8/TellezSoftware` |
| Rama de producción | `main` |
| Directorio raíz | *(vacío)* |
| Comando de compilación | *(vacío)* |
| Directorio de salida | `site` |

## Recursos de Cloudflare que se conservan

El catálogo se mudó a su propio repositorio, pero sus recursos siguen creados
en la cuenta para cuando se retome el producto:

| Recurso | Nombre | Para qué |
| --- | --- | --- |
| D1 | `tellezsoftware` (prod) y `tellezsoftware-preview` | Base de datos del catálogo |
| R2 | `tellezsoftware-files-production` y `tellezsoftware-files-preview` | Fotos de producto |
| Pages | `tellezsoftware` → <https://tellezsoftware.pages.dev> | Aplicación publicada |

El proyecto de Pages `tellezsoftware` conserva sus variables de entorno, sus
bindings a D1/R2 y su dominio. Sus despliegues automáticos están pausados: la
aplicación se publica desde `NeuboraCatalog` con
`npx wrangler pages deploy dist --project-name tellezsoftware`.

## Agregar un producto nuevo

1. Copia el bloque `<article class="product">` en `site/index.html` y en
   `site/en/index.html`.
2. Cambia nombre, descripción, funciones y el enlace al producto.
3. Si tiene su propio dominio, apunta los botones ahí.
4. Borra o actualiza el bloque "Más productos en camino" cuando ya haya más de
   uno publicado.

## Enlaces a la aplicación

Los botones "Ver Noubora Catalog" apuntan hoy a `https://tellezsoftware.pages.dev`.
Cuando el producto tenga dominio propio hay que actualizarlos en
`site/index.html` y `site/en/index.html` (hay un comentario en el HTML justo
donde van).
