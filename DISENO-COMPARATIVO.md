# Diseño comparativo — TellezSoftware, Noubora Catalog, Credibas y Tellez Store Nic

Análisis de los cuatro productos para encontrar el patrón visual que ya comparten
y definir un sistema único de diseño («estilo Tellez»).

Fecha: 2026-11-23

Reglas operativas obligatorias para proyectos nuevos o modificados:
[`../REGLAS-BASICAS-OBLIGATORIAS.md`](../REGLAS-BASICAS-OBLIGATORIAS.md).

Fuentes revisadas:

| Producto | Archivos de diseño |
|---|---|
| TellezSoftware | `site/styles.css`, `site/aplicaciones/index.html` |
| Noubora Catalog | `DISENO.md`, `src/App.css`, `src/index.css`, `src/LandingPage.css` |
| Credibas | `src/client/styles/tokens.css`, `base.css`, `pages.css`, `index.html` |
| Tellez Store Nic | `css/base/estilos.css`, `css/base/estilos-home.css`, `TEMA-NAVIDAD.md` |

Rutas relativas a `Proyectos/`; TellezSoftware es la raíz de este documento.

---

## 1. Resumen en una tabla

| | TellezSoftware | Noubora Catalog | Credibas | Tellez Store Nic |
|---|---|---|---|---|
| Rol | Sitio corporativo | App de inventario/catálogo | App de créditos | Tienda en línea |
| Tema actual | Claro | Claro | Claro **oro** (`data-theme="gold"`) | Claro cálido |
| Fondo | `#f6fdfa` | `#f5faf8` | `#f2f6ef` | `#F5EEDE` |
| Acento | Verde `#1db973` | Verde `#1db973` | Oro `#d4af37` | Coral `#E6513F` |
| Texto | `#293a33` | Verde oscuro | `#17211f` | `#22252A` |
| Tipografía | Segoe UI / sistema | Segoe UI / sistema | Sora + Manrope + mono | Inter |
| Escala máx. de texto | Hero fluido | 22 px (interfaz) | 64 px (hero) | ~34 px |
| Radios | 6 / 10 / 14 / 18 / 999 | 6 / 10 / 14 / 18 / 26 / 999 | 5 / 7 / 10 / 14 / 18 / 999 | 8 / 14 / 20 / 28 / 999 |
| Contenedor | 1080 px | 1120 px | 1120 / 1280 px | 1120 px |
| Cabecera | 56 px sticky + blur | 56 px | 56 px topbar | 60 px sticky + blur |
| Botón primario | 36 px, radio 11, verde | 36 px, radio 11, verde | 34 px, radio 7, oro | 36 px, radio 10, **negro** |
| Sombras | Tintadas verdes, muy suaves | Muy suaves | Negras, profundas | Tintadas crema |
| Modo oscuro | No | No | Sí (tokens base) | No |
| Vista previa al compartir | Sí: 5 páginas | Sí: rutas públicas | Sí: rutas públicas | Sí: 6 páginas |

---

## 2. El ADN que ya comparten (tu sello)

Estos valores se repiten en 2, 3 o 4 productos. Son la base real de tu estilo:

1. **Fondo pastel muy claro + tarjetas blancas.** Nunca fondo blanco puro de página:
   siempre hay un tinte (`#f6fdfa`, `#f5faf8`, `#f2f6ef`, `#F5EEDE`).
2. **Contenedor de 1080–1120 px** centrado en los cuatro productos.
3. **Misma familia de radios:** control 6, compacto 10, tarjeta 14, panel 18 y
   píldora 999. TellezSoftware y Noubora coinciden exacto; Credibas usa
   5/7/10/14/18 y la tienda 8/14/20/28 sobre la misma idea.
4. **Sombras difusas, casi invisibles**, con el color de la tinta y no negro puro
   (`#26392d3d`, `rgba(34,37,42,.05)`, `rgba(0,0,0,.24)` solo en el modo oscuro).
5. **Escala tipográfica compacta** para interfaz: 10–22 px, con etiquetas de
   10–11.5 px en mayúsculas, `letter-spacing` 0.05–0.12em y forma de píldora.
6. **Scrollbar propio de 4 px**, redondeado y con color de marca/tinte. Presente
   en los cuatro.
7. **Micro-movimiento:** hover con `translateY(-1px)` o `-2px`, transiciones de
   0.12–0.5 s y `prefers-reduced-motion` respetado (Noubora, TellezSoftware,
   Credibas y la capa navideña de la tienda).
8. **Cabecera sticky de 56–60 px con `backdrop-filter: blur(14px)`** y fondo
   translúcido en TellezSoftware y la tienda (siempre) y en Credibas (al hacer
   scroll); Noubora usa barra opaca de 56 px.
9. **Controles de 34–36 px** en escritorio; el objetivo táctil de 44 px ya lo
   eleva Noubora. Los radios de botón van de 7 a 11 px: misma idea, cifra distinta.
10. **Foco visible de 2 px** con `outline-offset: 2px` (Credibas y Noubora lo
    documentan explícitamente; TellezSoftware y la tienda lo heredan del navegador).

Ese conjunto —fondo tintado, tarjeta blanca, radio suave, sombra difusa, texto
compacto y movimiento corto— es lo que hace que los proyectos «se sientan» tuyos.
La paleta y la tipografía son lo que hoy los separa.

---

## 3. Ficha por producto

### 3.1 TellezSoftware

- **Superficies:** `--ui-bg #f6fdfa`, `--ui-surface #ffffff`, `--ui-surface-2 #fcfefd`,
  tinta `#293a33`, títulos `#24352c`, texto suave `#7c8b82`, borde `#e0eee7`.
- **Marca:** `#1db973` (hover `#179158`, profundo `#106a40`, suave `#ecfaf3`,
  texto sobre marca `#0b2318`).
- **Acentos rotativos:** magenta `#b91db1`, rojo `#b9251d` (heredados de Noubora).
- **Tipografía:** `"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial`;
  cuerpo 15 px/1.6.
- **Radios:** 6 / 10 / 14 / 18 / 999; botón 11; botón grande 14.
- **Sombras:** `0 1px 2px #26392d08`, tarjeta `0 18px 50px -28px #26392d3d`,
  botón `0 10px 24px -14px #106a4066`.
- **Movimiento:** 0.16 / 0.2 / 0.4 s, `ease`, escalonado 60 ms.
- **Layout:** `.wrap` 1080 px; cabecera sticky 56 px, `rgba(246,253,250,.88)` + blur 14 px.
- **Componentes:** `.btn` 36 px/radio 11/13 px 700; `.product` con `.product-mark`
  de 46 px (ahora también con logo real para aplicaciones de clientes).

### 3.2 Noubora Catalog

- **Superficies:** fondo `#f5faf8`, tarjetas blancas con degradado
  `#ffffff → #fcfefd` y tinte de acento en la esquina superior derecha.
- **Marca:** verde `#1db973` (fuerte `#179158`, profundo `#106a40`, suave `#ecfaf3`);
  acentos magenta `#b91db1` y rojo `#b9251d` alternados por `:nth-child`.
- **Tipografía:** Segoe UI/sistema; escala 10 / 11 / 11.5 / 12 / 13 / 14 / 16 / 18 / 20 / 22 px;
  interlineado 1.2 títulos, 1.45 cuerpo, 1.5 lectura.
- **Radios:** 6 / 10 / 14 / 18 / 26 / 999; botones 11 / 14.
- **Espacio:** 2 / 4 / 6 / 8 / 10 / 12 / 16 / 24 px (24 px es el techo).
- **Controles:** 30 / 32 / 36 / 38 / 42 / 44 px; barra superior 56 px.
- **Movimiento:** elevación máxima 2 px, transiciones 0.16–0.5 s.
- **Documentación:** `DISENO.md` ya fija reglas de accesibilidad, foco, scroll fino,
  breakpoints e iconos. Es el sistema más formalizado de los cuatro.

### 3.3 Credibas

- **Dos temas:**
  - Base (oscuro): fondo `#16211f`, superficies `#1b2725` / `#20302c` / `#263833`,
    acento menta `#35d6a0`, texto `#f0f4f2`.
  - Activo (`data-theme="gold"`): fondo `#f2f6ef`, superficie `#ffffff`, tinta
    `#17211f`, acento oro `#d4af37`, acento tinta `#7a5e12`, hover `#c9a227`.
- **Tipografía:** Sora (display) + Manrope (texto) + SFMono/Cascadia (datos);
  escala 11–64 px; `--text-hero: clamp(2.4rem, 5vw, 4rem)`.
- **Radios:** 5 / 7 / 10 / 14 / 18 / 999.
- **Sombras:** negras y profundas (`rgba(0,0,0,.24)`, `.65`, `.8`) porque nacen
  del tema oscuro; en el tema oro se suavizan.
- **Layout:** contenedor 1120 px (ancho 1280), sidebar 218 px, topbar 56 px.
- **Movimiento:** `cubic-bezier(0.22, 1, 0.36, 1)`, 120 / 200 / 420 ms.
- **Componentes:** `.btn` 34 px, radio 7 px, 650.
- **Hero:** `h1` 600, `letter-spacing -0.045em`, `line-height 1.02`, padding
  superior `clamp(4.5rem, 9vw, 8rem)`.
- Es el único producto con modo oscuro real y tokens duplicados por tema.

### 3.4 Tellez Store Nic

- **Superficies:** `--primario #F5EEDE` (crema), claro `#F9F3E6`, medio `#EFE6D4`,
  hondo `#E2D5B9`, complementario `#DEE5F5`, superficie `#FFFFFF`.
- **Marca:** coral `--acento #E6513F`; **el botón primario no usa el coral**, usa
  tinta `#22252A` (hover `#2E3239`) con texto crema.
- **Tipografía:** Inter (webfont propia), 15 px/1.5; títulos 600, `letter-spacing -0.01em`.
- **Radios:** 8 / 14 / 20 / 28 / 999; botón 10 px.
- **Sombras:** `0 10px 24px rgba(34,37,42,.05)` y `0 18px 38px rgba(34,37,42,.10)`.
- **Layout:** contenedor 1120 px, padding 16 px; cabecera sticky 60 px con velo
  `rgba(236,226,206,.94)` y blur 14 px.
- **Fondo:** degradado fijo `#F9F3E6 → #F5EEDE (42%) → #EFE6D4`.
- **Capa navideña desactivable** (`css/base/navidad.css` + `window.TEMA_NAVIDAD`):
  buena práctica, no cambia estructura ni medidas base.
- **Nomenclatura:** BEM en español (`marca__logo`, `seccion__titulo`, `card-producto`).

---

## 4. Diferencias que rompen la unidad

| Dimensión | TellezSoftware | Noubora | Credibas | Store | Efecto |
|---|---|---|---|---|---|
| Tipografía | Segoe UI | Segoe UI | Sora + Manrope | Inter | Tres voces distintas; el texto no «suena» igual de un producto a otro |
| Color de marca | Verde menta | Verde menta | Oro en el tema activo; menta en el oscuro | Crema + coral | Dos productos verdes, uno dorado, uno cálido: no hay color paraguas |
| Uso del acento | Botones y acentos | Acento + 3 colores rotativos | Acento único + estados | Coral semántico (descuentos, favoritos); botón negro | El botón principal cambia de color y de peso visual |
| Radios de tarjeta | 14 | 14 | 14 | 16 | La tienda se ve más «blanda» |
| Radio máximo | 18 | 26 | 18 | 28 | Sin criterio único para bloques hero |
| Botón | 11 px, 700, 36 px | 11/14 px | 7 px, 650, 34 px | 10 px, 600 | Peso, forma y altura distintos en la misma página |
| Altura de cabecera | 56 | 56 | 56 | 60 | Salto de 4 px al navegar entre productos |
| Sombras | Tintadas verdes | Muy suaves | Negras profundas | Tintadas crema | Credibas parece de otra familia |
| Texto secundario | `#7c8b82` | — | `rgba(23,33,31,.72)` | `rgba(34,37,42,.58)` | La tienda tiene el gris más claro (riesgo de contraste) |
| Iconos | SVG inline 1.7–2 px | Lucide (`lucide-react`) | Lucide (`lucide-react`) | Subconjunto Bootstrap Icons | Tres lenguajes de icono |
| Nomenclatura CSS | `ui-*` + inglés | `ui-*` + inglés | inglés | BEM español | Difícil compartir componentes entre repos |
| Modo oscuro | No | No | Sí | No | Solo Credibas puede cambiar de tema |
| Escala de texto | Marketing fluida | Techo 22 px | Hero hasta 64 px | Hero ~34 px | Los héroes no comparten regla |

### Lo que **no** hay que unificar

- **La paleta de cada marca.** Credibas es oro/negro; la tienda es crema/coral;
  TellezSoftware y Noubora son menta. Eso es identidad, no inconsistencia.
- **El modo oscuro de Credibas.** Es una capacidad válida; debe ser un *tema* del
  mismo sistema, no un sistema aparte.
- **La densidad.** Noubora es una app de gestión y necesita 14 px; el sitio
  corporativo puede respirar con 15–16 px.

---

## 5. Propuesta: un solo sistema, varios temas

### 5.1 Principio

> Mismo esqueleto (espacio, radios, sombras, tipografía, movimiento, componentes)
> y un tema de color por producto.

Así el usuario reconoce «software de Tellez» aunque cambie el color, y tú mantienes
un solo lugar donde ajustar medidas.

### 5.2 Tokens base (contrato único)

Copiar en cada proyecto (`src/styles/tokens.css` o `css/base/tokens.css`).
Los valores son los actuales de TellezSoftware/Noubora, que ya son los más completos.

```css
:root {
  /* Superficies y texto */
  --ui-bg: #f6fdfa;
  --ui-surface: #ffffff;
  --ui-surface-2: #fcfefd;
  --ui-ink: #293a33;
  --ui-heading: #24352c;
  --ui-muted: #7c8b82;
  --ui-border: #e0eee7;
  --ui-border-strong: #cfe3d9;

  /* Marca (cambia por tema) */
  --ui-primary: #1db973;
  --ui-primary-hover: #179158;
  --ui-primary-deep: #106a40;
  --ui-primary-soft: #ecfaf3;
  --ui-on-primary: #0b2318;

  /* Acentos decorativos opcionales */
  --ui-accent-2: #b91db1;
  --ui-accent-3: #b9251d;

  /* Tipografía */
  --ui-font-display: 'Sora', 'Inter', 'Segoe UI', system-ui, sans-serif;
  --ui-font-sans: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  --ui-font-mono: 'Cascadia Code', ui-monospace, 'SFMono-Regular', Consolas, monospace;

  --ui-text-2xs: 10px;
  --ui-text-xs: 11px;
  --ui-text-sm: 12px;
  --ui-text-md: 13px;
  --ui-text-base: 14px;
  --ui-text-lg: 16px;
  --ui-text-xl: 18px;
  --ui-text-2xl: 20px;
  --ui-text-3xl: 22px;
  --ui-text-hero: clamp(2.4rem, 5vw, 4rem);
  --ui-leading-title: 1.2;
  --ui-leading-body: 1.45;
  --ui-leading-reading: 1.5;

  /* Espacio (escala cerrada) */
  --ui-space-1: 2px;
  --ui-space-2: 4px;
  --ui-space-3: 6px;
  --ui-space-4: 8px;
  --ui-space-5: 10px;
  --ui-space-6: 12px;
  --ui-space-7: 16px;
  --ui-space-8: 24px;
  --ui-space-9: 32px;
  --ui-section: clamp(32px, 6vw, 64px);

  /* Radios */
  --ui-radius-control: 6px;
  --ui-radius-compact: 10px;
  --ui-radius-card: 14px;
  --ui-radius-panel: 18px;
  --ui-radius-hero: 26px;
  --ui-radius-pill: 999px;
  --ui-radius-btn: 11px;
  --ui-radius-btn-lg: 14px;

  /* Sombras tintadas con la tinta, nunca negro puro */
  --ui-shadow-xs: 0 1px 2px rgb(38 57 45 / 3%);
  --ui-shadow-card: 0 18px 50px -28px rgb(38 57 45 / 24%);
  --ui-shadow-panel: 0 24px 60px -36px rgb(38 57 45 / 28%);
  --ui-shadow-btn: 0 10px 24px -14px rgb(16 106 64 / 40%);

  /* Layout */
  --ui-container: 1120px;
  --ui-header-h: 56px;

  /* Movimiento */
  --ui-fast: 120ms;
  --ui-base: 200ms;
  --ui-slow: 420ms;
  --ui-stagger: 60ms;
  --ui-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
```

### 5.3 Temas por producto (solo cambian valores)

| Token | TellezSoftware / Noubora | Credibas (oro) | Tellez Store Nic |
|---|---|---|---|
| `--ui-bg` | `#f6fdfa` | `#f2f6ef` | `#F5EEDE` |
| `--ui-surface` | `#ffffff` | `#ffffff` | `#FFFFFF` |
| `--ui-ink` | `#293a33` | `#17211f` | `#22252A` |
| `--ui-primary` | `#1db973` | `#d4af37` | `#E6513F` |
| `--ui-primary-hover` | `#179158` | `#c9a227` | `#2E3239` (botón) / `#CC4434` (acento) |
| `--ui-primary-deep` | `#106a40` | `#7a5e12` | `#8F3326` |
| `--ui-primary-soft` | `#ecfaf3` | `rgba(212,175,55,.16)` | `#FBEDE9` |
| `--ui-on-primary` | `#0b2318` | `#17211f` | `#F5EEDE` |

Uso: TellezSoftware/Credibas pueden importar `tokens.css` y luego
`theme-tellezsoftware.css` o `theme-credibas-gold.css` con solo este bloque.

### 5.4 Tipografía unificada

Recomendación: **Inter para todo el texto de interfaz y Sora para títulos de
marketing**, con Segoe UI como respaldo inmediato. Ya son las fuentes de la tienda
y de Credibas; en TellezSoftware y Noubora se adoptan por fases.

- Inter resuelve el cuerpo a 14–16 px y las mayúsculas pequeñas sin perder
  claridad; Sora da el toque de marca en héroes y `h1`.
- Mantener Segoe UI como `fallback` evita el salto visual mientras carga.
- Añadir Tokens de rol para marketing (`--ui-text-hero`) porque la escala de
  10–22 px es para interfaces, no para portadas.
- Regla: títulos 600, `letter-spacing -0.045em` en héroes y `-0.01em` en títulos
  de tarjeta (así ya lo hace Credibas y se acerca la tienda).

### 5.5 Componentes sello

| Componente | Especificación única |
|---|---|
| Cabecera | 56 px, sticky, superficie translúcida (88–94 %), `backdrop-filter: blur(14px)`, borde inferior 1 px |
| Botón base | 36 px de alto, radio 11 px, 13 px/700, `gap` 6–8 px, hover `translateY(-1px)` + sombra de botón, activo `scale(.97)` |
| Botón grande | 44 px, radio 14 px |
| Tarjeta | Radio 14 px, padding 16–18 px, borde 1 px, sombra de tarjeta, hover `translateY(-2px)` máximo |
| Badge/píldora | 10–11 px, 800, mayúsculas, `letter-spacing .05em`, fondo suave de marca, punto de 6 px |
| Scrollbar | 4 px, track transparente, thumb de marca redondeado |
| Foco | `outline: 2px solid var(--ui-primary); outline-offset: 2px` |
| Iconos | Una sola familia: **Lucide** (trazo 1.75), 16 px en línea / 18–22 px sueltos; en sitios estáticos, el mismo SVG copiado de Lucide en lugar de otra librería |
| Modales | Radio 18 px, padding 16 px (12 en móvil), título 18 px |

### 5.6 Movimiento

- Una sola curva: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Duraciones: 120 ms micro, 200 ms base, 420 ms entrada de superficie.
- Aparición escalonada: `--ui-stagger` 60 ms (ya usado en TellezSoftware).
- Hover: `translateY(-1px)` en botones, `-2px` en tarjetas. Nada más.
- Siempre respetar `@media (prefers-reduced-motion: reduce)`.

### 5.7 Accesibilidad mínima común

- Área táctil de 44 × 44 px en acciones principales.
- Campos a 16 px en móvil (evita el zoom de iOS); Noubora ya lo documenta.
- Texto secundario: subir el alfa de la tienda de `.58` a `.68` para pasar
  contraste sobre crema.
- No comunicar estados solo con color: icono + texto (regla ya escrita en
  `NouboraCatalog/DISENO.md`).
- Foco visible en todos los interactivos, también en la tienda.

---

## 6. Plan de migración sugerido

| Fase | Trabajo | Riesgo |
|---|---|---|
| 1 | Crear `tokens.css` con el contrato de la sección 5.2 en TellezSoftware (ya casi lo es) | Bajo |
| 2 | TellezSoftware: sustituir valores sueltos por tokens y añadir `--ui-text-hero` | Bajo |
| 3 | Noubora: reemplazar hex repetidos (`#1db973`, `#b91db1`, `#b9251d`) por tokens y unificar tipografía | Medio |
| 4 | Store: envolver sus tokens españoles en alias semánticos (`--primario: var(--ui-bg)`, etc.), normalizar radios (16→14, 20→18, 28→26, botón 10→11), cabecera 60→56 y subir contraste del texto suave | Medio (mucho CSS) |
| 5 | Credibas: mapear `tokens.css` a los nombres `--ui-*`, mover el tema oro a `theme-credibas-gold.css`, normalizar radios 5/7→6/10 y suavizar sombras en modo claro | Medio |
| 6 | Verificación visual en 375 / 768 / 1280 px de las 4 portadas y de la página de aplicaciones | Bajo |

Sugerencia de orden real: **1 → 2 → 6** (deja TellezSoftware impecable y sirve de
referencia), luego 4 (la tienda es la que más se aleja), después 3 y 5.

---

## 7. Checklist para proyectos nuevos

- [ ] Fondo tintado + superficies blancas.
- [ ] Contenedor 1120 px (máx. 1080–1120).
- [ ] Escala de espacio 2/4/6/8/10/12/16/24/32.
- [ ] Radios 6/10/14/18/26/999; botón 11.
- [ ] Un tema de color declarado con los 8 tokens de la sección 5.3.
- [ ] Tipografía: Inter (texto) + Sora (display) + mono (datos).
- [ ] Sombras tintadas con la tinta, nunca `#000` en modo claro.
- [ ] Cabecera 56 px sticky con blur 14 px.
- [ ] Scrollbar 4 px, foco 2 px, `prefers-reduced-motion`.
- [ ] Badges 10–11 px mayúsculas con tracking.
- [ ] Una sola familia de iconos.
- [ ] Estados con icono + texto, no solo color.
- [ ] `og:image` propio de 1200×630 en **cada** página pública, no uno por aplicación (ver sección 8).

---

## 8. Vista previa al compartir (Open Graph)

### 8.1 Cómo se llama la técnica

- **Protocolo Open Graph** (Meta/Facebook): las etiquetas `<meta property="og:*">`.
  La imagen es **`og:image`** y el conjunto se conoce como *social preview*,
  «vista previa al compartir» o «tarjeta de enlace».
- **X/Twitter** usa su propio estándar encima: **Twitter Cards**
  (`twitter:card` + `twitter:image`). Si no existe `twitter:image`, X usa `og:image`.
- Lo leen WhatsApp, Facebook, Messenger, LinkedIn, Telegram, Discord, Slack y
  Outlook. Sin `og:image`, el enlace se comparte como texto plano o con una
  imagen aleatoria de la página.

La imagen de Noubora (`og-image.png`, 1200×630) está en el formato correcto:
**1200×630 px = 1.91:1**, el tamaño recomendado para tarjeta grande.

### 8.2 Reglas técnicas

| Regla | Valor |
|---|---|
| Tamaño | 1200 × 630 px (1.91:1). Mínimo recomendado 600 × 315 |
| Peso | ≤ 300 KB ideal (WhatsApp comprime fuerte); máximo 5 MB |
| Formato | PNG o JPG; WebP no lo aceptan todas las redes |
| URL | **Absoluta** y HTTPS (`https://dominio.com/og/precios.png`); las relativas fallan |
| Nombre | `/og/<slug>.png` por página; `og-image.png` como respaldo |
| Caché | Las redes guardan la imagen: al cambiarla, usa `?v=2` o un nombre nuevo |
| Alt | `og:image:alt` con una frase de lo que muestra |
| Páginas | **Una imagen por cada página pública** (cada pestaña/ruta), no una por aplicación |

### 8.3 Regla: una imagen por página, no por aplicación

La imagen debe ser **por cada página pública** (cada pestaña o ruta que se pueda
compartir), no una sola por aplicación. Cada página lleva sus propios
`og:image`, `og:title`, `og:description` y `og:url`.

Convención sugerida:

| Página | Archivo |
|---|---|
| Inicio | `/og/inicio.png` |
| Aplicaciones / catálogo | `/og/aplicaciones.png` |
| Cotización / precios | `/og/precios.png` |
| Contacto | `/og/contacto.png` |
| Legal | `/og/legal.png` |
| Respaldo (404, internas) | `/og-image.png` |

Todas de 1200×630 y con el nombre de la página visible en la imagen, para que se
distingan al compartir. Las páginas privadas o de utilidad —login, carrito,
perfil, admin, 404— no necesitan una propia: usan la de respaldo o ninguna.

### 8.4 Cómo se implementa según el tipo de sitio

- **Sitio multipágina estático** (TellezSoftware, tienda): cada archivo HTML
  lleva sus etiquetas. Es lo más simple: una imagen y un bloque de metas por
  archivo.
- **Plantilla compartida** (`producto.html` de la tienda, `/catalogo/:slug` de
  Noubora): un solo HTML sirve a muchos ítems. Para tener una imagen por
  producto hay que generar el HTML por ítem o inyectar las metas en el edge
  (Cloudflare Pages Function/Worker). Mientras no exista, se usa una genérica.
- **SPA** (Noubora, Credibas): todas las rutas devuelven el mismo `index.html`,
  así que **hoy todas las pestañas comparten la misma imagen**. Cambiar las
  metas con JavaScript **no sirve** para las previsualizaciones: WhatsApp,
  Facebook, LinkedIn y X no ejecutan JS, leen el HTML crudo. Las opciones reales
  son prerender/SSG en build (un HTML por ruta) o un Worker que inyecte las
  etiquetas según la ruta.
- **Prueba**: Facebook Sharing Debugger, LinkedIn Post Inspector y X Card
  Validator; en WhatsApp, enviarse el enlace a uno mismo. Probar siempre con la
  URL final publicada.

### 8.5 Estado implementado (2026-11-23)

| Producto | Cobertura | Dónde |
|---|---|---|
| TellezSoftware | 5 de 5 páginas | `site/og/inicio.png`, `aplicaciones.png`, `cotizacion.png`, `en.png`, `portafolio.png` |
| Noubora Catalog | Rutas públicas | `index.html` y `privacidad.html`; shells generadas en build para `/bienvenida`, `/terminos` y `/terms` (`scripts/generate-og-pages.mjs`) |
| Credibas | Rutas públicas | `index.html` y shells de `scripts/vite-plugin-seo.mjs` para `/funcionalidades`, `/precios`, `/contacto`, `/terminos`, `/privacidad` |
| Tellez Nic Store | 6 páginas públicas | `og/inicio.png`, `producto.png`, `ayuda.png`, `quienes-somos.png`, `terminos.png`, `trabaja-con-nosotros.png` |

- Todas son 1200×630, PNG, de 25–39 KB, con URL absoluta y `?v=1`.
- Cada página pública lleva `og:image`, `og:image:width/height/alt`, `twitter:card` y `twitter:image`.
- Las páginas privadas (login, carrito, perfil, admin, 404) quedan fuera, como manda la regla.
- Iconos completos en TellezSoftware, Noubora y la tienda (ico, svg, 16/32, apple-touch 180,
  192/512, maskable, manifest y browserconfig). Credibas ya los tenía.

Pendiente (requiere generación dinámica, no HTML estático):

- `producto.html?p=…` de la tienda: una imagen por producto.
- `/catalogo/:slug` de Noubora: una imagen por negocio.

Ambas necesitan un Worker/SSR que lea el producto o negocio e inyecte las metas; hoy usan
la imagen genérica de su plantilla.

### 8.6 Plantilla mínima para webs futuras

Copiar en el `<head>` de **cada página pública** y cambiar solo los valores:

```html
<!-- Vista previa al compartir: Open Graph + X -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Nombre del producto" />
<meta property="og:locale" content="es_NI" />
<meta property="og:url" content="https://dominio.com/ruta" />
<meta property="og:title" content="Título de la página" />
<meta property="og:description" content="Descripción de una línea." />
<meta property="og:image" content="https://dominio.com/og/precios.png?v=1" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Qué muestra la imagen" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://dominio.com/og/precios.png?v=1" />
```

Versión corta (mínimo que ya funciona en WhatsApp, Facebook, LinkedIn y X):

```html
<meta property="og:title" content="Título de la página" />
<meta property="og:description" content="Descripción de una línea." />
<meta property="og:url" content="https://dominio.com/ruta" />
<meta property="og:image" content="https://dominio.com/og/precios.png?v=1" />
<meta name="twitter:card" content="summary_large_image" />
```

### 8.7 Estado y siguientes pasos

> **Implementado el 2026-11-23** en los cuatro proyectos.

- **TellezSoftware:** 5 de 5 páginas públicas con imagen propia.
- **Tellez Nic Store:** 6 de 6 páginas públicas con imagen propia; las privadas
  (login, carrito, perfil, admin, 404) usan la de respaldo o ninguna.
- **Noubora y Credibas:** shells HTML generadas en build para sus rutas públicas,
  con título, descripción, canonical e imagen propios por ruta.

Queda pendiente, porque no es HTML estático:

1. `producto.html?p=…` de la tienda: una imagen por producto, generada en el edge
   (Worker/SSR) con los datos del producto.
2. `/catalogo/:slug` de Noubora: una imagen por negocio, con su nombre y logo.
3. Al cambiar cualquier imagen, subir `?v=2` (o cambiar el nombre) para romper la
   caché de WhatsApp, Facebook y LinkedIn.

Convención definitiva: `/og/<slug>.png` por página y `/og-image.png` como respaldo.

## 9. Conclusión

Ya tienes un estilo reconocible; lo que falta es **un contrato**. TellezSoftware y
Noubora comparten prácticamente el mismo sistema (mismos verdes, mismos radios,
mismas sombras). Credibas demuestra que el sistema aguanta un tema completamente
distinto (oro/negro) y la tienda demuestra que aguanta un tema cálido (crema/coral).
El paso que falta es dejar de copiar valores entre proyectos y pasar a importar un
`tokens.css` común con un tema por producto:

> **Mismo esqueleto. Distinto color. Un solo estilo Tellez.**
