# Arquitectura visual reutilizable

Guía para trasladar a otra website la estructura de tamaños, espaciado y controles usada en este ERP. Se documentan medidas y comportamientos; la paleta del proyecto queda fuera y debe definirse aparte para el sitio nuevo.

## 1. Principios de composición

- Usar una escala corta de espaciado en múltiplos de 4 u 8 px. Los valores observados con más frecuencia son 4, 6, 8, 10, 12, 14, 16 y 24 px.
- Preferir `gap` en layouts flex/grid y reservar `margin` para separar bloques o crear espacio exterior. Evitar márgenes acumulados en componentes anidados.
- Reiniciar márgenes de títulos, párrafos y controles cuando el contenedor administra el espaciado (`margin: 0`); así el ritmo depende del `gap` del padre.
- Mantener alineación vertical centrada en barras de filtros, grupos de acciones e inputs. En formularios, alinear etiquetas y controles por columna.
- Las tarjetas y paneles usan padding interior uniforme, normalmente 10–16 px; los bloques de página pueden crecer a 20–24 px. En móvil reducir a 10–12 px.
- Usar radios discretos y consistentes (aprox. 6–10 px para paneles; 4–6 px para controles compactos). La forma es parte de la arquitectura, aunque el color se personalice.

## 2. Tokens de tamaño recomendados

Crear tokens independientes de los colores para poder trasladar el sistema:

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;

  --font-xs: 10px;
  --font-sm: 12px;
  --font-base: 14px;
  --font-lg: 16px;
  --font-xl: 18px;

  --control-height: 36px;
  --control-height-compact: 30px;
  --control-radius: 6px;
  --panel-radius: 10px;
}
```

La hoja del ERP define tipografías de 10, 12, 14, 16 y 18 px, además de espacios de 8, 12 y 16 px. Algunos módulos compactos usan controles de 26–32 px. El valor de 36 px es una base recomendada para un nuevo sitio; debe comprobarse junto a la tipografía y la densidad elegidas.

## 3. Layout y separación

### Página y paneles

- Estructura de página: encabezado, barra de herramientas/filtros, contenido principal y estados auxiliares.
- Separación entre secciones: 12–16 px; entre controles cercanos: 6–10 px.
- Barra de herramientas: `display:flex`, `align-items:center`, `flex-wrap:wrap`, con `gap: 8–12px`.
- Panel/tarjeta: padding 12–16 px, contenido en columna y `gap: 8–12px`.
- Los encabezados no deben empujar el layout con márgenes por defecto: usar `margin: 0` y definir una separación explícita de 2–8 px respecto al subtítulo o contenido.
- En formularios de creación/edición mantener aire suficiente alrededor de cada grupo.

### Formularios

- Cada campo se compone de etiqueta, control y, si aplica, texto de ayuda/validación.
- Separación etiqueta-control: 4–6 px. Separación vertical entre campos: 10–14 px.
- Agrupar campos relacionados en filas responsive; cada columna debe poder encogerse (`min-width: 0`) y en móvil pasar a una columna.
- Evitar fijar ancho rígido a todos los inputs. Usar `width: 100%` dentro de su columna y límites de ancho solo en barras de filtros de escritorio.

## 4. Inputs, áreas de texto y botones de opción

- Tamaño de texto normal: 14 px. En filtros compactos: 12 px. Algunos formularios densos usan 12.5 px.
- Control normal: alto objetivo 34–38 px; padding horizontal 8–12 px. Mantener el mismo alto entre input, selector y botón de la misma fila.
- Control compacto: alto 26–32 px, padding horizontal 6–8 px y texto 12–13 px. Usarlo para filtros secundarios y formularios muy densos; no mezclar variantes dentro de la misma fila.
- `textarea`: ancho completo, padding equivalente al input y altura según contenido (mínimo sugerido 80 px), permitiendo resize vertical si el flujo lo necesita.
- Checkbox/radio: conservar el área de interacción del navegador/framework y alinear con el texto usando `gap: 6–8px`; no reducir solo para que quepa más contenido.
- En grupos con prefijo/sufijo (moneda, unidades, búsqueda), compartir altura y borde entre piezas para que funcionen como un solo control.
- Estados foco, error, deshabilitado y lectura deben cambiar borde/indicador y conservar dimensiones para evitar saltos del formulario.

Ejemplo base:

```css
.control {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: var(--control-height);
  padding: 7px 10px;
  font: inherit;
  font-size: var(--font-base);
  border-radius: var(--control-radius);
}

.control--compact {
  min-height: var(--control-height-compact);
  padding: 4px 8px;
  font-size: var(--font-sm);
}
```

## 5. Selectores nativos y enriquecidos

- Selectores nativos: ancho completo en formularios, altura igual a inputs y espacio derecho suficiente para que la flecha no tape el texto.
- Select2 u otro selector enriquecido: el contenedor, el texto visible y la flecha deben compartir altura y alineación con los inputs adyacentes.
- En el patrón compacto observado, Select2 single se lleva a unos 30–32 px: texto con `line-height` igual a la altura interior y padding lateral alrededor de 8–10 px; flecha centrada en esa misma caja.
- Menús de opciones con altura máxima relativa a la ventana (`max-height: 40vh`) y desplazamiento vertical, para no desbordarse en pantallas pequeñas.
- En modales, limitar el dropdown al modal como padre de posicionamiento para evitar que quede detrás de la capa modal.
- Si hay búsqueda interna, conservar una caja de búsqueda legible, con foco visible y sin cambiar el ancho del selector al abrirse.
- En móvil, permitir que filtros y selectores ocupen el ancho disponible; evitar mínimos de ancho que provoquen scroll horizontal.

## 6. Iconos con aviso, estado y notificación

La arquitectura de icono es independiente de su color:

- Usar un icono reconocible y consistente de una sola familia (el ERP utiliza Phosphor Icons). Ejemplos de semántica: campana para notificaciones, triángulo/círculo de alerta para advertencias, círculo con “i” para información.
- Alinear icono y texto con `inline-flex`, `align-items:center` y `gap: 6–8px`.
- Tamaño usual de icono junto a texto: 16–18 px; icono aislado en acción: 18–22 px. Mantener área pulsable de al menos 32–36 px, aunque el glifo sea menor.
- Para un contador sobre una campana, hacer el botón `position: relative`; ubicar el contador arriba a la derecha con posición absoluta. El contador debe tener mínimo 16 px de alto, forma de píldora/círculo, texto corto y no participar en el flujo del layout.
- No comunicar severidad solo con color: acompañar la marca con icono y/o texto (“Advertencia”, “Error”, “Información”) y, cuando proceda, `aria-live="polite"` o un nombre accesible para el botón.
- Los avisos temporales (toasts) siguen la misma estructura: icono, título, mensaje y cierre opcional. El bloque observado usa padding aproximado de 10×14 px y separación interna de 8 px.
- Reservar el mismo espacio de icono en estados distintos para que reemplazar éxito por error no desplace el texto.

### Ayuda flotante de pedidos (`#ayudaPedidos`)

El bloque usa un botón informativo circular y un panel emergente anclado a su esquina superior derecha. `#ayudaPedidos` es el panel; el botón hermano lo controla.

- El contenedor `.admin-ayuda` es relativo y no crece ni se encoge en la fila (`flex: 0 0 auto`), para que el panel se posicione respecto a este control.
- El botón `.admin-ayuda__boton` mide **38 × 38 px**, es circular, usa `inline-flex` centrado y no tiene padding interno. El área de clic corresponde al círculo completo.
- El glifo es `bi bi-info-circle`, de aproximadamente **16 px**, con `line-height: 1`. Se oculta a lectores de pantalla porque el botón ya tiene `aria-label`.
- En `:hover` y `aria-expanded="true"`, el botón conserva su tamaño y cambia solo su tratamiento visual. En `:active` se reduce brevemente con `transform: scale(.96)`.
- En `:focus-visible`, muestra un contorno de **2 px** separado **2 px** del círculo. Mantener este indicador de teclado visible al adaptar los colores.
- El panel `.admin-ayuda__panel` se posiciona en absoluto bajo el botón: `top: calc(100% + 8px)`, `right: 0`, con `z-index: 55`. Así no desplaza el contenido alrededor.
- Ancho: `min(300px, calc(100vw - 32px))`. Padding **12 px vertical × 14 px horizontal**, borde y radio de **14 px**. El contenido no debe forzar el ancho del panel.
- La flecha es el pseudo-elemento `::before`: cuadrado de **10 × 10 px**, situado **6 px** por encima del panel (`top: -6px`) y a **13 px** del borde derecho. Solo se dibujan los bordes superior e izquierdo y se rota **45°**, formando el pico que apunta al botón. Su superficie debe coincidir con la del panel.
- El título (`strong`) va en su propia línea, con margen inferior de **4 px** y peso alto. El cuerpo (`p`) no tiene margen exterior y usa `line-height: 1.5` para lectura compacta.
- Al abrir, anima **160 ms** desde `opacity: 0` y `translateY(-4px)` hasta su posición normal. Con `prefers-reduced-motion: reduce`, se elimina la animación.
- Cuando está cerrado, `[hidden]` aplica `display: none`. El botón expone `aria-expanded` y enlaza el panel con `aria-controls`; el panel usa `role="note"` y puede recibir foco.
- Al reproducirlo en otra web, conservar geometría, anclaje y estados de interacción; asignar colores desde los tokens propios del nuevo sitio.

## 7. Modales y avisos

- Cabecera y pie de modal tienen padding horizontal de 12–16 px; cuerpo de 12–16 px. El contenido puede usar menos padding si el modal es deliberadamente denso.
- Espacio entre acciones: 6–8 px. Agrupar botones al final y conservar áreas pulsables cómodas.
- Evitar que títulos centrados y botones de cierre compitan: reservar su espacio y mantener el título en una sola línea cuando sea posible.
- Los mensajes de validación deben quedar junto al campo; los avisos globales/toasts se reservan para el resultado de una acción o información que no pertenece a un único control.

## 8. Responsive y consistencia

- Usar breakpoints del framework base y cambiar principalmente la distribución: varias columnas pasan a una, barras flexibles envuelven, y los controles ocupan el ancho disponible.
- Reducir padding de paneles y encabezados en móvil a 10–12 px. No reducir el área táctil del control junto con el padding del panel.
- Aplicar una sola escala compartida y crear variantes explícitas (`normal`, `compacto`) en vez de pequeños ajustes sueltos por página.
- Los estilos globales definen tokens y controles comunes; las hojas de cada módulo se limitan a excepciones de contexto.
- No trasladar reglas de color literales de este ERP. Mantener tokens semánticos separados (texto, superficie, borde, foco, éxito, advertencia y error) para que el sitio nuevo defina su propia paleta sin alterar tamaños ni espaciado.

## 9. Checklist para replicar el sistema

- [ ] Definir tokens de espacios, tipografía, radios y alturas de controles.
- [ ] Igualar alturas de input, select y botón en cada toolbar/formulario.
- [ ] Establecer variante compacta para filtros densos.
- [ ] Unificar ancho, padding y alineación de selectores nativos y enriquecidos.
- [ ] Definir layout de página, panel, toolbar y grupo de formulario usando `gap`.
- [ ] Crear patrón accesible de icono + aviso y contador de notificación.
- [ ] Ajustar el layout en móvil y verificar que no haya desbordamiento horizontal.
- [ ] Mantener colores en tokens semánticos separados de la arquitectura de tamaños.
