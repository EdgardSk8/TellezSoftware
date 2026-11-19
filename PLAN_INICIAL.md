# Plan inicial — TellezSoftware

## Propósito

Construir una aplicación SaaS web multiempresa para inventario, gestión
comercial y, progresivamente, escaparates públicos y marketplace. La
plataforma se desplegará en Cloudflare Pages y usará servicios de Cloudflare
para backend, datos y archivos.

Este es el documento maestro de arquitectura, reglas de negocio, decisiones y
roadmap. Distingue lo comprobado en el repositorio de lo propuesto para el
producto y de las decisiones que siguen pendientes. Una regla marcada como
objetivo no se considera implementada hasta que código, migración y pruebas lo
demuestren.

## Estado actual verificado

- Se leyó el documento maestro `Documento_Maestro_SaaS_Multiempresa_Ampliado.txt`.
- La aplicación real es React + TypeScript + Vite con Cloudflare Pages
  Functions (runtime de Workers), D1, R2 y Wrangler.
- Según lo indicado por el propietario, Cloudflare Pages está conectado a GitHub.
- El UUID D1 de producción `b5146cf5-5045-4bfb-b9e2-3a0e73213947` fue
  verificado con Wrangler en la cuenta autenticada; corresponde a la base
  `tellezsoftware`.
- `wrangler.jsonc` contiene los bindings D1 `DB` y R2 `FILES` de producción y
  preview. La D1 de producción existente y la D1 de preview tienen aplicada la
  migración inicial; se verificaron sus tablas con Wrangler.
- `wrangler.jsonc` configura bindings para producción y preview; existe además
  `wrangler.local.jsonc`. El desarrollo de Pages utiliza emuladores locales
  persistentes bajo `.wrangler/`; esos datos no se sincronizan con Cloudflare.
- Se preparó un script Wrangler idempotente para validar el proyecto Pages,
  crear/reutilizar D1/R2 separados para producción y preview, escribir bindings
  reales y aplicar migraciones SQL.
- No se crearon credenciales de Cloudflare. La D1 de preview y los buckets R2
  `tellezsoftware-files-production` y `tellezsoftware-files-preview` se crearon
  con Wrangler y se verificaron en la cuenta autenticada.
- El proyecto Pages `tellezsoftware` está conectado a GitHub. La rama `preview`
  se desplegó manualmente con Wrangler. La carga, edición, archivado,
  paginación, catálogo público e imágenes WebP/R2 se verificaron en localhost
  usando D1/R2 emulados; no implica que esos datos locales estén en Cloudflare.
- Producción no se ha desplegado con la configuración actualizada ni se ha
  validado allí el flujo de imágenes.

## Decisiones confirmadas

- **País inicial:** Nicaragua.
- **Moneda:** cada empresa podrá elegirla; NIO será la sugerencia inicial.
- **Idiomas:** español e inglés desde el inicio.
- **Perfiles iniciales implementados:** ropa/calzado, ferretería, productos
  sólidos e inventario personal. Son un conjunto inicial, no todos los giros
  comerciales posibles ni un esquema de producto definitivo.
- **Dominio inicial:** `tellezsoftware.pages.dev`.
- **Registro:** existe el flujo técnico de registro; no se considera aprobado
  el lanzamiento público hasta completar las protecciones, aviso de privacidad
  y validación legal descritos en este documento.
- **Primer entregable funcional:** base segura y usable con registro, tenants,
  acceso, panel inicial y productos/inventario.
- **Inventario inicial deseado:** perfiles con soporte para variantes,
  conversiones de unidades y productos serializados según corresponda.
- **Pagos de pedidos deseados:** efectivo, billetera móvil, BAC, Lafise y
  transferencias; el comprador seleccionará el método. Todavía no hay cuentas
  comerciales/API confirmadas, por lo que las integraciones reales deben
  investigarse y no deben simularse como pagos confirmados.
- **Liquidación inicial de delivery:** el repartidor cobra al comprador y
  entrega lo recaudado a administración. Administración paga al vendedor el
  importe de sus productos y liquida el delivery. De la tarifa de delivery,
  20% corresponde a administración/plataforma y 80% al repartidor; por ejemplo,
  de C$1,000, C$200 y C$800 respectivamente. Cada pedido y liquidación deberá
  quedar registrado y ser auditable.
- **Alcance de largo plazo:** se busca construir toda la plataforma descrita
  en el documento maestro, en entregas verificables. El primer hito no se debe
  presentar como si todas las fases del ERP y marketplace estuvieran completas.
- **Varios negocios por usuario:** la misma cuenta podrá tener membresías en
  varios espacios de trabajo y roles diferentes por espacio. El esquema actual
  permite membresías múltiples, pero el registro crea un espacio y la interfaz
  todavía no implementa el selector/cambio de contexto.

## Arquitectura actual y dirección aprobada

- **Frontend:** TypeScript, React y Vite; aplicación modular con textos
  preparados para español e inglés.
- **Hosting:** Cloudflare Pages para los archivos estáticos.
- **API/runtime:** Cloudflare Pages Functions sobre el runtime de Workers, con
  lógica y autorización en servidor.
- **Base de datos:** Cloudflare D1; migraciones SQL versionadas.
- **Archivos:** Cloudflare R2 privado, con metadatos y pertenencia al tenant en
  D1; la carga WebP está implementada y probada localmente.
- **Autenticación:** sesiones seguras en cookies `HttpOnly`, autorización
  verificada en cada endpoint y aislamiento por tenant en el backend.
- **Configuración:** bindings mediante configuración de Cloudflare; secretos
  solo en variables seguras del entorno, nunca en el frontend, Git o estos
  documentos.
- **Un solo sitio:** Pages Functions se despliegan dentro del mismo proyecto y
  origen de Cloudflare Pages; no se creó un servicio independiente.
- **Recursos actuales:** bindings `DB` (D1) y `FILES` (R2). No se requieren
  microservicios, KV, Durable Objects, Queues u otros recursos hasta que una
  necesidad medida justifique incorporarlos.
- **Alcance local implementado:** login/registro y operaciones API usan D1
  local al ejecutar Pages mediante Wrangler. En `npm run dev`, la interfaz usa
  datos demostrativos del navegador. La verificación/recuperación por correo,
  permisos granulares, backoffice global y funciones comerciales aún faltan.
- **Práctica de desarrollo:** primero un flujo pequeño completo y comprobable;
  ampliar módulos con migraciones y pruebas, sin introducir microservicios
  hasta que haya una necesidad concreta.

## Arquitectura maestra y reglas para futuras contribuciones

### Stack y alcance

El stack de TellezSoftware es **React + TypeScript + Vite, Cloudflare Pages
Functions sobre Workers, D1, R2 y Wrangler**. Esta arquitectura modular se
diseña para esos servicios y sus límites serverless; las decisiones y
referencias de este documento corresponden exclusivamente a TellezSoftware.
Cambiar framework, runtime o proveedor requiere un ADR con caso de negocio,
costos y aprobación explícita.

### Estilo arquitectónico

La dirección es un **monolito modular** con límites de dominio inspirados en
DDD y separación por responsabilidades:

- **Presentación:** componentes React, formularios, navegación y estado visual.
  No es autoridad para permisos, precios, existencias ni reglas contables.
- **Adaptadores HTTP:** Pages Functions convierten solicitudes HTTP en casos
  de uso, verifican autenticación/origen, validan entrada, autorizan y traducen
  resultados/errores a respuestas HTTP.
- **Aplicación:** casos de uso que coordinan una operación y su transacción.
  Extraer helpers o módulos de aplicación cuando haya lógica compartida real;
  no crear un service/repository genérico por cada endpoint.
- **Dominio:** reglas e invariantes comerciales puras, que se irán extrayendo
  cuando las operaciones dejen de ser triviales o requieran reutilización y
  pruebas independientes.
- **Infraestructura:** consultas D1, almacenamiento R2, reloj/UUID u otros
  adaptadores externos. Las consultas SQL y APIs Cloudflare no deben ser
  responsabilidad de componentes de interfaz.

En el repositorio actual la lógica de servidor vive principalmente en
`functions/` y la interfaz en `src/App.tsx`; la estructura modular anterior es
un destino incremental, no una afirmación de que ya existan todas esas capas.
No se deben mover archivos masivamente solo para que coincidan con un patrón.

Reglas de dependencias:

1. La interfaz puede llamar al API; el dominio no importa React ni recibe
   objetos HTTP.
2. Los endpoints no deben duplicar reglas de dominio ni confiar en campos
   sensibles enviados por el cliente.
3. Un módulo no consulta ni modifica directamente tablas ajenas para saltarse
   sus reglas; expone un caso de uso/contrato interno cuando haga falta.
4. Comunicación entre módulos dentro del mismo Worker es directa y explícita.
   Eventos se reservan para hechos que necesitan consumidores independientes,
   auditoría o trabajo asíncrono; no añadir un bus sin esa necesidad.
5. Centralizar formato de errores HTTP mediante helpers existentes y registrar
   fallos inesperados sin exponer secretos o datos personales en logs.
6. Usar transacciones atómicas para cambios relacionados. Con D1, preferir
   `batch()` para el conjunto atómico y actualizaciones condicionales para
   concurrencia; no asumir que se dispone de una transacción interactiva de
   larga duración.
7. Añadir abstracciones, repositorios e interfaces solo si reducen acoplamiento
   o duplicación comprobable, permiten pruebas útiles o encapsulan una
   integración externa.

### Módulos y límites de contexto

Estos son límites lógicos del monolito; algunos son futuros y no implican
carpetas, tablas o pantallas implementadas:

| Módulo / contexto | Responsabilidad y datos principales | Dependencias permitidas |
|---|---|---|
| Identidad y acceso | Usuarios, autenticación, sesiones, membresías, invitaciones, roles/permisos | Núcleo compartido |
| Empresas y configuración | Espacios de trabajo/empresas, moneda, actividad comercial, preferencias y sucursales | Identidad, auditoría |
| Catálogo de productos | Productos, categorías, marcas, unidades, atributos y variantes | Empresas/configuración |
| Inventario | Almacenes, existencias, kardex, ajustes, reservas, transferencias y valoración | Productos, empresas |
| Compras y proveedores | Solicitudes, órdenes, recepción, facturas, devoluciones y cuentas por pagar | Inventario, caja, contabilidad |
| Ventas y clientes | Cotizaciones, pedidos, ventas, devoluciones, impuestos y cuentas por cobrar | Productos, inventario, caja, contabilidad |
| Caja, bancos y pagos | Cajas, sesiones, movimientos, métodos y conciliaciones | Ventas/compras, contabilidad |
| Contabilidad | Plan de cuentas, diarios, asientos y períodos | Compras, ventas, inventario, caja |
| Tiendas y marketplace | Publicación, catálogo público, pedidos marketplace, delivery y liquidaciones | Catálogo, inventario, ventas, pagos |
| Reportes y auditoría | Consultas/reportes y trazabilidad de actor, fecha y documento fuente | Lectura de otros contextos mediante contratos |
| Plataforma/operación | Administración global restringida, soporte y configuración técnica | Identidad; separación fuerte de datos de negocio |

Cada contexto debe mantener vocabulario coherente. Por ejemplo, “producto
plantilla” y “variante vendible” no son lo mismo; “pedido” no equivale a
“venta cobrada”; “ajuste” no equivale a editar la cantidad. Los cambios que
cruzan contextos se coordinan desde un caso de uso y se prueban como una
operación completa.

## Modelo multiempresa, actividad y autorización

### Vocabulario y frontera de aislamiento

- **Usuario:** identidad de acceso; puede pertenecer a cero o varios espacios.
- **Espacio de trabajo/tenant:** frontera lógica de propiedad, consulta y
  autorización de datos. En el esquema actual la tabla es `tenants`.
- **Empresa legal:** entidad jurídica y fiscal. No se debe asumir que tenant y
  empresa legal son equivalentes hasta confirmar si un tenant puede contener
  varias empresas legales o viceversa.
- **Actividad comercial/perfil:** plantilla de configuración con sugerencias
  para categorías, atributos y flujos. No debe convertirse en una restricción
  que impida a la empresa vender otra clase de producto.
- **Sucursal/almacén:** ubicación subordinada al tenant; almacén representa
  control físico de existencias y sucursal puede incluir operación comercial.
  Su relación exacta requiere decisión antes de diseñar el esquema.

### Reglas objetivo

1. Un usuario inicia sesión una sola vez y puede cambiar de espacio si mantiene
   una membresía vigente. La sesión debe fijar explícitamente el contexto
   activo; cada cambio verifica en servidor la membresía, el rol y el estado.
2. El rol y permisos pertenecen a la membresía/contexto, no al usuario global.
   Ser `owner` en una empresa no concede acceso a otra.
3. Todo registro de negocio lleva `tenant_id` directo o se alcanza por una
   relación cuya pertenencia al mismo tenant está garantizada.
4. En D1 usar claves foráneas compuestas y restricciones como
   `UNIQUE (tenant_id, id)` para evitar referencias cruzadas; incluir tenant en
   índices y consultas de lectura/escritura.
5. En una actualización no basta con buscar por `id`: condicionar por
   `tenant_id` y aplicar autorización para la acción. No aceptar un
   `tenant_id` arbitrario del cliente como identidad de contexto.
6. Las pruebas deben crear al menos dos tenants y comprobar lectura,
   actualización, archivos e imágenes cruzadas (rechazo esperado, sin revelar
   existencia de recursos ajenos).
7. Los endpoints públicos de catálogo solo entregan campos expresamente
   permitidos y datos de productos con estado público aprobado. Actualmente
   catálogo público deriva disponibilidad de `quantity > 0`; no hay estado de
   publicación independiente.

### Estado actual y brechas

La base actual tiene `users`, `tenants`, `tenant_memberships` y `sessions`.
Una membresía asocia usuario, tenant y rol (`owner`, `manager`, `staff`,
`viewer`); la sesión guarda el tenant activo. Esto da base para varias
membresías, pero el registro crea un solo tenant y aún no hay invitaciones,
selector/cambio de espacio, sucursales, permisos granulares ni un backoffice
global. La interfaz no es una frontera de seguridad: todas las reglas deben
confirmarse en cada endpoint.

## Perfiles comerciales y modelo de productos

### Plantilla comercial configurable

Los perfiles iniciales son ropa/calzado, ferretería, productos sólidos e
inventario personal. La lista futura puede incluir electrónica, repuestos,
tienda general, alimentos, licorería y perfiles definidos por el negocio.
Un perfil configura valores iniciales y campos sugeridos; cada negocio puede
tener categorías propias y mezclar bienes con características distintas.
Una tienda que vende ropa y bebidas no debe tener que escoger un único molde
que imponga tallas a todos sus productos.

Campos opcionales se habilitan según necesidad: talla/color, presentación o
volumen, serie/IMEI, lote, vencimiento, garantía, compatibilidad, composición,
dimensiones y unidades especiales. Para licorería, por ejemplo, puede
registrarse volumen/presentación; no asumir que es ropa. Reglas de edad mínima,
venta restringida y jurisdicción de alcohol quedan bloqueadas a revisión legal
y configuración territorial.

### Clases de producto

1. **Simple:** una referencia vendible sin matriz de variantes; no debe exigir
   talla, color ni opciones que no usa.
2. **Con variantes:** producto padre más combinaciones concretas (p. ej.,
   camisa azul/M o botella de presentación específica). Cada variante vendible
   requiere identidad y SKU propio; puede tener barcode, precio/costo,
   imágenes y existencias independientes.
3. **Con atributos técnicos:** especificaciones descriptivas o filtrables (p.
   ej. voltaje, diámetro, modelo compatible) que por sí solas no crean SKUs ni
   combinaciones. La generación de variantes solo ocurre si el usuario la
   solicita de forma explícita.

En variantes, bloquear combinaciones duplicadas y SKU/barcode repetidos dentro
del ámbito aprobado. Mantener el producto padre para organizar y describir,
pero contabilizar stock y venta en la unidad vendible definida. No modificar
retroactivamente los atributos que identifican variantes sin una migración o
regla explícita.

SKU es una referencia de negocio, no el identificador interno. El objetivo es
ofrecer generación automática, editable y con unicidad garantizada por tenant
(o por variante); códigos de barras y referencias externas son opcionales.
La regla final de generación, edición, importación y unicidad global/local está
pendiente. Hoy el API exige SKU y lo valida como único por tenant; no genera
SKU automáticamente.

### Estado implementado frente al objetivo

El registro solicita el tipo del primer negocio y lo guarda en
`tenants.business_type` (`0005`); para cuentas históricas sin ese dato, la
sesión deriva un tipo compatible desde `inventory_profile`. El tipo pertenece
al espacio de trabajo, no a una preferencia global. Cada negocio tiene su
propio tenant e inventario; el selector de la barra lateral cambia el contexto
activo, y el backend aísla productos y movimientos por `tenant_id`. El
propietario puede preparar espacios separados para los ocho tipos iniciales.
El formulario adapta unidad, categoría y campos opcionales al negocio activo:
por ejemplo, licorería ofrece botella/caja/litro y volumen/presentación en vez
de talla; el campo de serie se muestra para electrónica y repuestos. El tipo
del producto nuevo se deriva del negocio activo, no se selecciona como un
perfil independiente.

El producto aún guarda `variant` como texto libre, no como variantes
independientes; `serial_tracking` es descriptivo y no existe catálogo dinámico
de atributos, barcode, marca, jerarquía de categorías ni UOM con conversiones.
La separación de giro y tipo de producto es una base para esos formularios
configurables, no sustituye el modelo futuro de atributos y variantes.

## UX y configuración progresiva

- El registro inicial solicita solo datos necesarios para crear el primer
  espacio, actividad sugerida, moneda y credenciales; no presentar ajustes
  contables o de almacén antes de que exista esa necesidad.
- Guiar con configuración progresiva y defaults explícitos; el usuario puede
  revisar/cambiar los defaults y no se ocultan consecuencias importantes.
- Mostrar campos de variantes, lotes, serie, vencimiento, garantías, atributos
  técnicos y conversiones solo cuando estén configurados para esa categoría o
  producto.
- Sugerir categorías editables por actividad; no bloquear categorías libres ni
  duplicar nombres de forma accidental.
- Distinguir advertencia, borrador y documento confirmado; solicitar
  confirmación para acciones irreversibles o que afecten saldo/stock.
- Mantener formularios accesibles, móviles, ES/EN, errores accionables y
  preservar entradas del usuario si falla una solicitud.

## Reglas maestras de inventario y productos

Estas reglas son criterios de diseño para fases futuras, no todas están
implementadas:

- Categorías pueden organizarse jerárquicamente, con pertenencia tenant y
  detección de ciclos; marcas y atributos pueden ser opcionales.
- Unidades de medida requieren unidad base y conversiones explícitas y
  dimensionalmente compatibles; no convertir unidades incompatibles ni perder
  precisión por redondeos silenciosos.
- Existencia disponible, física, reservada y en tránsito son estados distintos
  cuando existan pedidos, almacenes o transferencias.
- Todo cambio de cantidad se origina en un movimiento inmutable: recepción,
  venta/despacho, devolución, transferencia, reserva/liberación o ajuste
  aprobado. No modificar stock directo ni borrar movimientos confirmados.
- Registrar actor, tenant, producto/variante, ubicación, cantidad antes/después,
  motivo, fecha y documento fuente; operaciones que cambian saldo y kardex
  deben ser atómicas y usar control de concurrencia/idempotencia.
- Ajustes requieren motivo y, según permisos, aprobación. Transferencia tiene
  salida y entrada vinculadas; debe evitar inventario duplicado o perdido.
- Devoluciones referencian operación original cuando exista; el estado del
  artículo (reintegrable, dañado, cuarentena) no se infiere automáticamente.
- Alertas de mínimo/máximo no equivalen a reservas ni compras automáticas.
- Almacenes y sucursales no se deben agregar al modelo hasta resolver jerarquía,
  transferencias, disponibilidad y permisos por ubicación.
- Valoración de inventario afecta contabilidad: FIFO y promedio ponderado son
  alternativas; método, costo de flete, monedas, costo negativo, retroactividad
  y fecha efectiva quedan pendientes de aprobación contable/fiscal. No inventar
  tratamiento de Nicaragua.
- La moneda debe conservar precisión exacta. No hacer cálculos financieros
  autoritativos con coma flotante binaria; escoger representación/escala y
  reglas de redondeo por moneda antes de implementar ventas o contabilidad.

## Compras, ventas, caja y contabilidad

### Compras y proveedores

El flujo objetivo distingue proveedor, solicitud/orden, recepción parcial,
factura, devolución a proveedor, costos adicionales de adquisición y pagos.
Una orden no aumenta stock hasta que se recibe mercancía; cada recepción genera
movimientos trazables. Factura y recepción pueden ocurrir en momentos
diferentes; saldo de cuentas por pagar se deriva de documentos y pagos, no de un
campo editable arbitrariamente. Integración con caja/contabilidad depende de
documentos confirmados.

### Ventas y clientes

Separar cotización/proforma, pedido, despacho/entrega, venta/factura y pago;
no representar todos como un registro con un estado ambiguo. Cotizaciones no
consumen stock; reservas y ventas/despachos siguen reglas explícitas. Confirmar
una venta crea sus movimientos y efectos financieros una sola vez, en una
transacción lógica, con clave de idempotencia para reintentos. Cancelar o
devolver requiere documento de reversión vinculado; preservar el historial.
Impuestos, descuentos, garantías, facturación fiscal, crédito y su tratamiento
son decisiones legales/comerciales aún pendientes.

### Caja, bancos y pagos

Cada caja/banco pertenece a tenant y, cuando aplique, sucursal. Registrar
aperturas, cierres, arqueos, ingresos/egresos, transferencias y conciliaciones
con usuario y documento fuente. Pago parcial conserva saldo pendiente y método,
referencia y estado verificable. Una captura o redirección del navegador no
confirma un pago integrado. No almacenar PAN completo ni CVV. Proveedores,
titularidad, moneda, operaciones manuales y conciliación requieren aprobación
antes de implementar.

### Contabilidad

El objetivo contable es partida doble, pero no se deben habilitar asientos
reales hasta definir plan de cuentas, moneda funcional, período, impuestos y
políticas con un contador local. Un asiento contabilizado debe cuadrar
(débitos=créditos), referenciar documento fuente e impedir duplicidad. No editar
asientos confirmados; corregir por reversión/ajuste auditado. Inventario,
ventas, compras, caja, cuentas por cobrar y pagar deben poder conciliarse con
sus movimientos. No inventar reglas fiscales, tasas ni numeración legal.

## Reglas transversales de integridad, seguridad y operación

- IDs internos no son numeraciones visibles. Numeración visible se define por
  tenant, tipo de documento y período solo cuando se apruebe su semántica.
- Validar tipos, límites, referencias, contexto tenant, permisos y estado en el
  servidor; aplicar constraints/índices además de validación de interfaz.
- Transacciones críticas deben preservar todas las invariantes o no guardar
  nada. Reintentos deben ser idempotentes o detectar conflictos.
- Registros financieros y kardex confirmados son append-only; archivado lógico
  aplica a catálogo, pero no sustituye reversión de documentos.
- Auditar actor, acción, recurso/tenant, fecha y motivo sin guardar secretos.
- Autenticación, autorización, CSRF/origen, límites de abuso, privacidad,
  retención y respuesta a incidentes son requisitos de producción.
- Backups deben incluir bases y estrategia coherente para objetos R2; demostrar
  restauración en entorno aislado.
- Los datos de demo/local, preview y producción son ambientes diferentes. No
  copiar usuarios/productos de prueba ni aplicar migraciones remotas sin
  autorización explícita y plan de reversión.
- Los términos actuales son borrador de piloto; completar identidad del
  operador, privacidad y revisión legal antes de apertura pública.

## Dependencias entre módulos

Orden de dependencia de negocio recomendado:

1. Identidad, tenants, membresías, permisos y configuración.
2. Catálogo, unidades, atributos y variantes.
3. Kardex, ubicaciones, ajustes y valoración.
4. Compras/proveedores y ventas/clientes (usan catálogo, stock y documentos).
5. Caja/bancos y cuentas por cobrar/pagar (concilian las operaciones).
6. Contabilidad y reportes (consumen documentos/movimientos confirmados).
7. Tiendas/pedidos/delivery/planes e integraciones de pago.

Reportes leen modelos o consultas autorizadas; no se convierten en vía para
escribir en otro contexto. Si una fase requiere una dependencia circular,
rediseñar el contrato del caso de uso antes de añadir acoplamiento.

## Convenciones para desarrolladores e IA

1. Leer este plan y el código real antes de proponer cambios. El estado de
   archivo no sustituye evidencia en código/pruebas.
2. Preservar el stack React/TypeScript/Pages Functions/Workers/D1/R2. No
   introducir otro framework, microservicios ni nueva infraestructura sin
   decisión aprobada.
3. Diferenciar explícitamente implementado, probado solo local, desplegado en
   preview y probado en producción.
4. Buscar utilidades y patrones existentes; cambios quirúrgicos, tipados,
   localizados; no duplicar validación o lógica del dominio.
5. Cada cambio de esquema requiere migración incremental, compatible con datos
   existentes, aplicada localmente y cubierta por pruebas. No reescribir
   migraciones ya aplicadas ni borrar datos para resolver un test.
6. Para operaciones críticas, escribir primero pruebas de invariantes,
   aislamiento multi-tenant, autorización, conflictos y reintentos.
7. Ejecutar validaciones mínimas relevantes (`npm test`, `npm run build`,
   `npm run lint`, smoke local cuando aplique) e informar resultados exactos.
8. Nunca añadir secretos, credenciales, tokens ni contraseñas de prueba al plan
   o al código.
9. Respetar local-first. No usar `--remote`, desplegar, modificar D1/R2 remoto
   ni crear usuarios/productos reales sin autorización explícita para esa
   operación.
10. Si falta una regla comercial/legal, marcarla como pendiente; no completar
    con una suposición silenciosa.

## Decisiones arquitectónicas (ADR)

| ADR | Estado | Problema y decisión | Justificación y consecuencias | Alternativas descartadas |
|---|---|---|---|---|
| ADR-001 | Aceptada | Mantener React/TypeScript/Vite + Pages Functions sobre Workers + D1/R2; aplicar monolito modular y límites DDD progresivamente. | Coincide con el código existente y entrega despliegue integrado; requiere mantener contratos internos claros. | Cambiar de stack o dividir en microservicios sin necesidad/caso aprobado. |
| ADR-002 | Aceptada como base | Aislamiento multi-tenant compartido por `tenant_id`, membresías y claves/consultas tenant-aware. | Un usuario puede tener varias membresías; reduce costo operativo y soporta el tamaño inicial. Cada consulta debe estar aislada en servidor. | Una base de datos por negocio como default; no justificada a esta escala. |
| ADR-003 | Parcial | Tenant es contexto de autorización actual; empresa legal, grupo empresarial, negocio, sucursal y almacén se modelan separados si reglas reales lo requieren. | Evita mezclar conceptos legales/operativos; jerarquía exacta aún necesita validación. | Asumir que un usuario equivale a una empresa o que todo tenant es una entidad fiscal. |
| ADR-004 | Parcialmente implementada | Cada espacio de trabajo representa un tipo de negocio y tiene inventario separado; los formularios se adaptan al espacio activo. | Mantiene existencias y campos propios de cada actividad. El modelo dinámico de atributos y variantes sigue pendiente. | Un selector genérico de tipo de producto que mezcle negocios e inventarios. |
| ADR-005 | Aceptada | Ningún cambio de stock sin movimiento auditable y control de concurrencia. | Permite kardex y reconstrucción; movimiento y saldo deben actualizarse atómicamente. | Editar cantidad directamente en un CRUD genérico. |
| ADR-006 | Objetivo condicionado | Contabilidad futura con partida doble y reversión de documentos confirmados. | Mantiene trazabilidad y conciliación; no activar antes de aprobación contable/fiscal. | Asientos editables o reglas fiscales inventadas por desarrollo. |
| ADR-007 | Aceptada | No usar microservicios por defecto. Extraer servicio separado solo con límites estables y necesidad medida de escala/equipo/aislamiento. | Reduce despliegue y complejidad operativa inicial. | Distribuir cada módulo en un servicio por anticipado. |
| ADR-008 | Pendiente | Estrategia exacta de variantes/SKU, monedas y valoración. | Afecta constraints, migraciones y documentos transaccionales; requiere validar flujos con usuarios y asesoría contable. | Codificar una regla irreversible sin requisitos aprobados. |

Un ADR nuevo o una modificación importante debe indicar problema, decisión,
estado, justificación, consecuencias y alternativas descartadas. Cambiar una
decisión aceptada requiere registrar el motivo y plan de migración, no editarla
en silencio.

## Estructura del repositorio y estructura objetivo

La estructura siguiente es una guía evolutiva, no el inventario literal del
repositorio. El código de servidor actual está en `functions/api/` y
`functions/_lib/`; la interfaz principal está en `src/App.tsx`; D1 usa
`migrations/`; pruebas en `tests/`. Extraer módulos frontend/backend por
responsabilidad cuando exista una entrega que lo justifique. Mantener el
proyecto ejecutable durante la transición.

```text
/
├── functions/
│   ├── _middleware.ts
│   └── api/
│       ├── auth/
│       ├── tenants/
│       ├── products/
│       ├── inventory/
│       └── admin/
├── src/
│   ├── app/                 # Enrutamiento y composición de la aplicación
│   ├── components/          # Componentes reutilizables
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── tenants/
│   │   ├── products/
│   │   └── inventory/
│   ├── i18n/                # Español e inglés
│   ├── lib/                 # Cliente API, validación y utilidades comunes
│   ├── styles/              # Tokens y estilos globales
│   └── types/
├── migrations/              # Migraciones de D1
├── public/                  # Iconos, fuentes y assets estáticos
├── tests/
├── .dev.vars.example        # Nombres de variables, nunca valores secretos
├── package.json
├── tsconfig.json
├── vite.config.ts
└── wrangler.jsonc           # Configuración de Pages y bindings
```

La estructura puede ajustarse al crear el proyecto, pero debe mantener
separados el frontend, las funciones del servidor y las migraciones. Los
endpoints privados no deben confiar en un `tenant_id` enviado por el
navegador: el servidor debe derivar el tenant de la sesión autorizada.

La carpeta `src/features/` y los módulos indicados son destino potencial, no
carpetas que ya existan. Un módulo de servidor puede organizarse bajo
`functions/api/` y helpers de dominio compartidos solo cuando varias rutas
necesiten la misma regla. Evitar “arquitectura por carpetas” sin límites reales.

## Colores y estilo visual inicial

Dos colores principales pastel:

| Uso | Color | Hex |
|---|---|---|
| Verde salvia | Superficies y acentos positivos | `#B6D9C2` |
| Azul cielo | Acento secundario para información | `#C0D8EC` |
| Verde profundo | Botones/acciones principales con contraste | `#6F9F7D` |

Colores de apoyo para mantener legibilidad:

- Fondo general: `#F5F8F6`.
- Superficies/tarjetas: `#FFFFFF`.
- Texto principal: `#293A33`.
- Texto secundario: `#829089`.
- Bordes: `#E7ECE8`.

Los colores pastel son acentos, no sustituyen el contraste: evitar texto blanco
pequeño sobre estos fondos y comprobar contraste y foco de teclado antes de
cerrar el diseño. Los colores de error, advertencia y éxito se definirán como
estados semánticos separados.

## Tareas realizadas

- [x] Leer el documento maestro funcional y técnico.
- [x] Revisar el estado inicial de la carpeta y del repositorio.
- [x] Registrar las decisiones de negocio y el primer hito acordado.
- [x] Proponer una arquitectura y estructura compatibles con Cloudflare Pages.
- [x] Proponer dos colores principales pastel y una base legible.
- [x] Crear la aplicación frontend React/TypeScript/Vite y preparar `dist/` para
      la publicación estática en Cloudflare Pages.
- [x] Construir una interfaz adaptable en español e inglés con dashboard,
      navegación, resumen de inventario y secciones marcadas como futuras.
- [x] Agregar el formulario local de productos con perfil, SKU, categoría,
      unidad, variante, serial, cantidades, costo y precio.
- [x] Agregar búsqueda, filtros de stock y registro local de entradas, salidas y
      correcciones, con historial de movimientos en el navegador.
- [x] Implementar Pages Functions locales para registro, login/logout, sesión,
      listado/alta paginados de productos y ajustes de inventario.
- [x] Añadir hash PBKDF2, sesiones opacas con cookie `HttpOnly`/`Secure`,
      verificación de origen para escrituras y limitación de intentos de login.
- [x] Añadir migración D1 inicial con usuarios, tenants, membresías, sesiones,
      productos, intentos de login y movimientos.
- [x] Integrar al prototipo las pantallas de registro/inicio, alta de productos
      y ajustes D1 cuando se sirve con Pages Functions.
- [x] Añadir edición persistente, archivado/restauración reversible,
      paginación por cursor en API/interfaz y filtros de archivo.
- [x] Añadir carga privada, optimización/validación WebP y entrega controlada
      con D1/R2 emulados localmente; catálogo público por slug.
- [x] Añadir pruebas WebP y smoke test de API local para autenticación,
      aislamiento, edición, movimientos, imágenes, catálogo y ciclo de vida.
- [x] Publicar una página inicial de términos bilingües para el piloto y exigir
      aceptación de versión al registrar; aplicar su migración solo en D1 local.
- [x] Verificar build y lint, alta/ajuste/recarga en UI, cookie de sesión,
      aislamiento entre dos tenants, rechazo CSRF y conflictos de stock
      concurrentes en el entorno local.
- [x] Retirar el UUID provisional de la configuración Pages raíz.
- [x] Separar la configuración Wrangler local y de Pages producción/preview.
- [x] Crear un script con confirmación explícita que aprovisiona/reutiliza
      D1/R2 con Wrangler, valida UUIDs reales, escribe bindings por entorno y
      aplica migraciones sin borrar recursos.

## Tareas pendientes

### Fundación y despliegue

- [x] Crear el esqueleto TypeScript/React/Vite para el sitio estático.
- [x] Configurar Pages Functions y binding D1 para desarrollo local con
      Wrangler. Esto no creó ni configuró recursos remotos.
- [ ] Confirmar que el flujo de build/deploy de GitHub a `main` funciona.
- [x] Ejecutar con autorización el aprovisionamiento de D1/R2 y verificar IDs
      reales para producción y preview, además de aplicar/verificar las
      migraciones en ambas bases.
- [x] Añadir migración D1 inicial y configurar ejecución local.
- [ ] Definir entornos/variables sin almacenar secretos en el repositorio.
- [ ] Subir a GitHub el `wrangler.jsonc` resultante con IDs reales antes de
      desplegar Pages Functions en producción.

### Primer hito funcional

- [x] Implementar registro/inicio/cierre de sesión en Pages Functions y cookies
      de sesión protegidas.
- [ ] Añadir verificación de correo y recuperación de contraseña con proveedor
      transaccional antes de abrir el registro en producción.
- [x] Crear tenants y membresías; las consultas API de productos/inventario
      derivan el tenant de la sesión y aíslan datos.
- [ ] Implementar permisos iniciales y el acceso administrativo global.
- [x] Crear dashboard inicial con datos D1 autenticados o datos demo locales.
- [x] Implementar listado y alta de productos, categoría, perfil, variantes
      descriptivas, unidades, precio/costo y stock mínimo.
- [x] Añadir edición persistente autenticada y archivado/restauración reversible
      con control por rol y tenant. Quedan pendientes atributos configurables,
      variantes independientes y serialización completa por unidad.
- [ ] Implementar variantes, conversiones y serialización según el perfil.
- [x] Registrar existencias y movimientos auditables en D1.
- [x] Añadir paginación por cursor, validación de servidor y pruebas locales de
      aislamiento entre tenants; la interfaz conserva filtros al navegar. La
      cobertura automatizada de autorización/paginación todavía debe ampliarse.
- [x] Preparar interfaz adaptable y textos de interfaz iniciales en
      español/inglés.
- [ ] Completar traducciones, navegación, validaciones y accesibilidad de todos
      los módulos; quedan por revisar y probar sistemáticamente los flujos ya
      implementados.
- [x] Incorporar selector de tenant y cambio de contexto activo con verificación
      de membresía en servidor. Invitaciones multiusuario y permisos avanzados
      siguen pendientes.
- [x] Separar el tipo de negocio por espacio de trabajo y usarlo para adaptar
      formularios sin mezclar inventarios; los atributos dinámicos completos
      siguen pendientes.

### Siguientes etapas

- [ ] Añadir compras, ventas/POS, clientes, proveedores y caja.
- [x] Añadir catálogo público básico por slug conectado a productos e imágenes.
- [ ] Definir publicación/moderación independiente de existencias y reglas de
      contenido antes de permitir tiendas públicas.
- [ ] Añadir pedidos de un solo vendedor, reserva de existencias y estados.
- [ ] Añadir tarifas, liquidación diaria y auditoría del delivery.
- [ ] Investigar y luego integrar métodos de pago disponibles en Nicaragua.
- [ ] Añadir suscripciones, planes, límites y política de morosidad.
- [x] Implementar carga y entrega privada de imágenes optimizadas WebP en R2,
      con límite de cinco imágenes y 150 KiB por archivo.
- [ ] Definir cuotas por tenant, métricas y limpieza de objetos huérfanos.
- [ ] Revisar con asesoría legal los términos iniciales publicados, completar
      la identidad del operador y el aviso de privacidad, y preparar políticas
      legales/fiscales, copias de seguridad y pruebas de restauración antes de
      producción.

## Roadmap maestro por entregas

Las fases se ordenan por dependencias. Cada módulo nuevo requiere criterios de
aceptación, permisos, migración compatible y pruebas antes de considerarse
completo.

### Fase A — Identidad y espacios multiempresa

- [ ] Invitaciones, membresías múltiples y selector/cambio seguro del tenant
      activo.
- [ ] Matriz de capacidades por rol y permisos por acción; autorizar siempre
      del lado del API.
- [ ] Pruebas automáticas de acceso cruzado, enumeración, expiración y CSRF.
- [ ] Definir modelo de empresa legal/grupo, tenant, tienda, sucursal y almacén.

### Fase B — Catálogo configurable e inventario

- [ ] Producto simple, plantilla y variantes con stock/SKU/barcode propios;
      atributos técnicos no generan combinaciones salvo selección explícita.
- [ ] Perfiles configurables, categorías jerárquicas, marcas y unidades de
      medida con conversiones dimensionalmente válidas.
- [ ] Lotes, serie, vencimiento y garantía según configuración por categoría.
- [ ] Almacenes/sucursales, transferencias, reservas, devoluciones y
      valoración después de aprobar sus reglas.
- [ ] Expandir pruebas del kardex, concurrencia, idempotencia y límites tenant.

### Fase C — Compras y proveedores

- [ ] Proveedores, órdenes, recepciones parciales, facturas, devoluciones,
      costos adicionales y cuentas por pagar.
- [ ] Vincular recepción a movimiento de inventario y preservar trazabilidad de
      documentos borrador/confirmados.

### Fase D — Ventas, clientes y POS

- [ ] Cotizaciones, pedidos, ventas, despacho, devoluciones/anulaciones,
      pagos parciales, cuentas por cobrar y clientes.
- [ ] Evitar doble confirmación y doble movimiento mediante transacciones y
      claves de idempotencia.
- [ ] Definir descuentos/impuestos/facturación según asesoría local antes de
      producción.

### Fase E — Caja, pagos y contabilidad

- [ ] Caja, bancos, sesiones, arqueos, conciliación y referencias de pago.
- [ ] Definir moneda exacta y política de redondeo antes de cálculo monetario.
- [ ] Aprobar plan de cuentas, períodos y tratamiento fiscal con contador.
- [ ] Implementar asientos equilibrados, idempotentes, no editables una vez
      confirmados y reversibles mediante asientos compensatorios.

### Fase F — Tienda, marketplace y operación

- [ ] Publicación/moderación independiente de stock y políticas por categoría.
- [ ] Pedidos de un vendedor, disponibilidad/reserva, entrega, cancelación,
      devolución y liquidación con trazabilidad.
- [ ] Revisar obligaciones especiales por productos restringidos (p. ej.
      alcohol), protección de consumidores y privacidad en cada jurisdicción.
- [ ] Pagos, suscripciones, cuotas y proveedores solo cuando se aprueben
      titularidad, disponibilidad y contratos.

### Fase G — Preparación para operación

- [ ] Verificación/recuperación por correo, protección antiabuso, monitoreo,
      soporte, límites y acceso inicial de administración.
- [ ] Aviso de privacidad, identidad del operador, términos revisados,
      requisitos fiscales y legales.
- [ ] Backups D1/R2 y ejercicio de restauración; pruebas de carga,
      accesibilidad y seguridad.
- [ ] Validación de bindings y aceptación en preview aislado; checklist y
      reversión antes de producción.

Ninguna fase comercial o contable se considera lista por tener una pantalla:
debe completar API, modelo, autorización, persistencia, auditoría, tratamiento
de errores, pruebas y documentación.

## Límites importantes

- No incluir credenciales ni secretos en código o documentos. El acceso
  inicial de administración deberá configurarse mediante un mecanismo seguro.
- No marcar pagos como aprobados por una captura, una redirección del navegador
  o una selección de método; verificar pagos integrados mediante el proveedor
  o registrar explícitamente la revisión manual.
- No cobrar un total con delivery desconocido antes de mostrarlo al comprador.
- No almacenar datos completos de tarjetas ni CVV.
- No confiar en el navegador ni en `localStorage` para guardar datos reales,
  autenticar usuarios, autorizar operaciones o separar tenants. Solo el modo
  Pages Functions usa el API D1 local/autorizado; el modo Vite es demostrativo.
- No habilitar el registro al público sin correo verificado, monitoreo, medidas
  antiabuso adicionales, políticas legales y una revisión de seguridad.
- No prometer que las pasarelas solicitadas están disponibles hasta verificar
  soporte comercial y técnico en Nicaragua.
- El 20% descrito es sobre la tarifa de delivery, no sobre el subtotal de
  productos.

## Decisiones pendientes que no deben inventarse

1. Si un usuario puede pertenecer a varias empresas legales dentro de un tenant,
   o si cada empresa legal debe ser un tenant separado.
2. Jerarquía exacta de tenant, marcas/tiendas, sucursales y almacenes; permisos
   por sucursal y flujo de invitación.
3. Perfiles de actividad iniciales definitivos; si licorería tendrá campos y
   controles legales propios; cuáles categorías están prohibidas/restringidas.
4. Generación y alcance de unicidad de SKU, códigos de barras e importación.
5. Si variantes tienen costos/precios independientes, cuándo se generan y cómo
   se migra el `variant` actual de texto libre.
6. Unidades/conversiones iniciales, lotes, series, vencimiento, garantías y
   precisión fraccionaria por producto.
7. Sucursales, almacenes, stock reservado/en tránsito, transferencias y
   política de stock negativo.
8. Método de valoración (FIFO, promedio u otro), costos adicionales y
   contabilización; requiere aprobación contable/fiscal.
9. Monedas, precisión y redondeo; impuestos, facturación, zona horaria y
   período fiscal.
10. Roles/permisos por acción, por tenant y por sucursal, y quién administra
    globalmente la plataforma.
11. Políticas de devoluciones, delivery, comisiones, pagos, subscripciones,
    precios y titular de cuentas comerciales.
12. Correo transaccional, Turnstile/antiabuso, aviso de privacidad, retención y
    eliminación de datos.

## Referencias oficiales y criterio de uso

Estas fuentes sirven de referencia conceptual; no reemplazan decisiones
comerciales, legales ni validación con el stack real:

- [Microsoft Azure Architecture Center — N-tier](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/n-tier):
  separación de responsabilidades por capas, sin confundir capa lógica con
  despliegue físico.
- [Microsoft — Domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis):
  análisis del dominio, lenguaje ubicuo y límites de contexto; se usan sus
  principios DDD aunque el proyecto no adopta microservicios.
- [Odoo — Product variants](https://www.odoo.com/documentation/19.0/applications/sales/sales/products_prices/products/variants.html):
  referencia de atributos, valores y variantes; adaptarla evitando
  combinaciones automáticas que el negocio no haya solicitado.
- [ERPNext — Stock Ledger](https://docs.frappe.io/erpnext/stock-ledger):
  trazabilidad de entradas/salidas/transferencias y conexión con documentos
  fuente y valoración.
- [Cloudflare D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)
  y [Wrangler local development](https://developers.cloudflare.com/workers/local-development/):
  fuentes operativas para cambios D1 y separación de datos locales/remotos.
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
  y [Workers](https://developers.cloudflare.com/workers/): referencias para el
  runtime y las rutas de servidor existentes.
