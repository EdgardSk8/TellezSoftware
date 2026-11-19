# Plan de trabajo — TellezSoftware

Revisión del estado del repositorio y de la infraestructura al 14 de noviembre
de 2026. Este documento convierte las tareas pendientes de
[PLAN_INICIAL.md](./PLAN_INICIAL.md) en una secuencia de entregas verificables.
No asigna fechas: el orden representa dependencias y prioridades recomendadas.

## Resumen ejecutivo

La base técnica y el primer flujo de inventario existen, y la infraestructura
remota inicial de Cloudflare ya está aprovisionada. El catálogo público y la
carga de imágenes WebP a R2 ya funcionan en localhost con emuladores locales.
El build, el lint y pruebas manuales de acceso entre dos tenants pasaron en
esta revisión. La autenticación y varias funciones comerciales aún están
pendientes. **El proyecto no está listo para abrir el registro al público ni
para procesar operaciones comerciales reales.**

## Compromiso con el cliente

La sencillez y la confianza del cliente guían cada flujo. El registro debe pedir
solo lo indispensable para crear una cuenta; no se debe exigir al cliente que
defina detalles del negocio antes de entender para qué sirven. Después de
ingresar, el propietario configura el tipo de negocio y la moneda en
**Configurar cuenta**, con una explicación breve y clara de cómo cada opción
adapta el inventario o muestra los precios. Se evita mezclar decisiones y
formularios innecesarios, y se protege la información ya registrada: por
ejemplo, no se permite cambiar la moneda cuando hay productos con precios.

- [x] Simplificar el alta y trasladar tipo de negocio y moneda a Configurar
  cuenta, posterior al ingreso.
- [x] Explicar al cliente el efecto de cada dato antes de guardarlo.
- [x] Impedir cambios de moneda que puedan reinterpretar precios existentes.

Orden recomendado:

1. Preparar y verificar un despliegue controlado de Pages, sin abrir el registro
   al público.
2. Completar las operaciones de productos e inventario en API y UI.
3. Ampliar las pruebas reproducibles y revisar accesibilidad y experiencia móvil.
4. Completar la autenticación y las protecciones necesarias antes de abrir el
   registro.
5. Construir escaparates, pedidos y operaciones comerciales después de resolver
   las decisiones de negocio pendientes.
6. Cerrar preparación operativa y de producción antes de anunciar el servicio.

## Estado comprobado

### Hecho

- Aplicación React, TypeScript y Vite con interfaz inicial en español e inglés.
- Pages Functions para registro, inicio/cierre de sesión, sesión actual,
  productos e historial/ajustes de inventario.
- D1 con esquema inicial; las tablas se verificaron en las bases remotas de
  producción y preview.
- R2 de producción (`tellezsoftware-files-production`) y preview
  (`tellezsoftware-files-preview`) creados y listados en la cuenta autenticada.
- Bindings `DB` y `FILES` configurados para producción y preview en
  `wrangler.jsonc`; `npm run infra:check` pasa.
- Separación entre demo de `npm run dev` (datos en `localStorage`) y Pages
  Functions con D1 local/remota.
- Build de producción con `npm run build`: correcto en esta revisión.
- Lint con `npm run lint`: correcto en esta revisión.
- Pruebas WebP con `npm test` y prueba API de Pages local con
  `npm run test:local:api`: correctas; esta última prueba CRUD, R2 emulado,
  privacidad y catálogo público.

### Parcial o pendiente

- Cloudflare Pages está conectado a GitHub, pero no se verificó un despliegue
  con el `wrangler.jsonc` actualizado.
- La API y la interfaz tienen listado paginado por cursor, búsqueda y filtros.
  La edición persistente, el archivado/restauración y los controles de página
  están conectados a Pages Functions; las pruebas automatizadas iniciales no
  sustituyen aún una cobertura completa de autorización y concurrencia.
- R2 está configurado y el flujo local de carga, consulta, presentación y
  borrado de imágenes WebP está implementado. No se ha probado con los buckets
  remotos ni en Pages preview.
- La interfaz pública `/catalogo/{slug}` lista productos y muestra imágenes.
  Actualmente un producto se considera disponible si `quantity > 0`; todavía
  no existe un estado de publicación independiente ni controles de catálogo.
- Registro e inicio de sesión funcionan, pero no hay verificación/recuperación
  por correo, administración global ni Turnstile. El registro no debe abrirse
  públicamente hasta completar las protecciones acordadas.
- Las pantallas de pedidos, clientes, reportes y otras secciones todavía tienen
  contenido de demostración o indican que estarán disponibles más adelante.
- El plan funcional y [PREGUNTAS_PENDIENTES.md](./PREGUNTAS_PENDIENTES.md)
  contienen decisiones de negocio aún sin respuesta.

## Fase 0 — Despliegue controlado de Pages

**Prioridad: P0.** Permite validar que la configuración que ya existe funciona
en Pages; no equivale a lanzar el producto al público.

- [x] Revisar el diff y confirmar que `wrangler.jsonc` apunta a las cuentas,
  bases y buckets esperados; mantener fuera del repositorio cualquier secreto.
- [ ] Integrar y subir a GitHub los cambios de configuración aprobados.
- [ ] Confirmar en Pages el comando `npm run build`, el directorio `dist` y la
  configuración de build V2 requerida por Pages Functions. El despliegue
  manual de Wrangler compiló y publicó Functions, pero no verifica la
  configuración del pipeline de build conectado a GitHub.
- [x] Desplegar primero a un entorno/branch de preview controlado con Wrangler.
- [x] Probar carga de la aplicación y respuesta de autenticación en preview;
  Wrangler compiló el Worker y las Functions y la URL respondió. `infra:check`
  confirma las asignaciones configuradas a `tellezsoftware-preview` y
  `tellezsoftware-files-preview`. La operación R2 se verificó después solo
  en localhost con emuladores; no se ha probado contra el bucket de preview.
- [x] Confirmar que la URL de preview es pública por defecto y que el propietario
  autorizó ese acceso solo para validación. Usar únicamente datos de prueba;
  el registro del preview sigue disponible.
- [ ] Desplegar a producción solo como validación técnica controlada; mantener
  cerrado el lanzamiento público hasta completar las fases de autenticación y
  preparación de producción.

**Criterio de salida:** build y Pages Functions responden en preview, los
bindings corresponden al entorno correcto y no se publican secretos ni datos
demo como datos reales.

## Fase 1 — Completar productos e inventario

**Prioridad: P1.** Base funcional para que una empresa pueda usar el sistema
sin depender del navegador local.

- [x] Implementar edición persistente de productos en Pages Functions, con
  validación de servidor, aislamiento por tenant y permisos.
- [x] Definir e implementar el ciclo de vida reversible con archivado y
  restauración; se evita el borrado irreversible.
- [x] Conectar la UI de edición y estados de carga/error al API autenticado.
- [x] Consumir la paginación por cursor que ya expone la API; agregar controles
  de página y conservar búsqueda/filtros al navegar.
- [ ] Alinear unidades, conversiones, variantes y serialización con los perfiles
  de inventario, después de resolver las preguntas 16 y 17 de
  [PREGUNTAS_PENDIENTES.md](./PREGUNTAS_PENDIENTES.md).
- [ ] Revisar navegación, formularios, traducciones ES/EN, accesibilidad y
  validaciones en los flujos ya implementados.
- [x] Añadir pruebas automatizadas iniciales para validación WebP y un smoke
  test reproducible para permisos, edición, stock, publicación y archivo en
  Pages local. Falta ampliar cobertura de paginación, concurrencia y aislamiento
  entre tenants.

**Criterio de salida:** operaciones de producto e inventario se guardan en D1
mediante el API autenticado, se mantienen aisladas entre tenants y cuentan con
pruebas de los casos principales y de errores.

## Fase 2 — Imágenes de producto con R2

**Prioridad: P1.** El flujo base se implementó y verificó solo en localhost.

- [x] Aplicar límite actual de cinco imágenes por producto, WebP y 150 KiB;
  la primera imagen cargada es la portada. Falta validar si negocio desea otro
  límite u orden manual.
- [x] Mantener objetos R2 sin acceso público directo; el catálogo solo sirve
  imágenes unidas a productos con existencia disponible.
- [x] Añadir metadata en D1 mediante `0002_product_images.sql`, asociada a
  producto y tenant, con tipo, tamaño, dimensiones y posición.
- [x] Añadir endpoints para listar, cargar, consultar y borrar con validación
  del WebP, tamaño, dimensiones, sesión, rol y aislamiento de tenant.
- [x] Añadir conversión en navegador a WebP, selección, vista previa,
  diagnóstico de errores y eliminación.
- [x] Probar en localhost la carga, lectura y presentación en catálogo con
  D1/R2 locales. El objeto de prueba resultó en WebP de 0.6 KiB y 128 × 128 px.
- [x] Verificar que la lectura privada sin sesión da 401 y que otro tenant no
  puede leer la imagen (404); el endpoint público omite SKU, cantidad, costo,
  serial e identificadores del tenant.
- [ ] Definir y probar limpieza de objetos huérfanos ante fallos parciales y
  una eventual eliminación permanente. El archivado reversible conserva las
  imágenes y su metadata para permitir restaurar el producto.
- [ ] Repetir pruebas en un entorno Pages preview aislado antes de cualquier
  despliegue; no se han probado los buckets remotos.

**Criterio de salida parcial:** carga y visualización funcionan localmente y el
aislamiento entre tenants pasa las pruebas manuales. La fase no se considera
lista para despliegue hasta verificar preview, límites/errores automatizados y
limpieza de objetos huérfanos.

## Fase 3 — Autenticación y controles antes del registro público

**Prioridad: P1, bloquea el lanzamiento público.**

- [ ] Elegir proveedor de correo transaccional y definir remitente/dominio
  (preguntas 1–3 de `PREGUNTAS_PENDIENTES.md`).
- [ ] Implementar verificación de correo, reenvío seguro y recuperación/cambio
  de contraseña con tokens de un solo uso, expiración y respuestas que no
  permitan enumerar cuentas.
- [ ] Definir y aplicar protección antiabuso para registro y login: límites,
  monitoreo y decisión sobre Turnstile (pregunta 4).
- [ ] Definir el acceso del administrador global y su proceso de alta seguro;
  no crear credenciales predecibles ni introducir contraseñas en código.
- [ ] Verificar autorización por rol en cada endpoint y documentar las
  capacidades de owner, manager, staff y viewer.
- [ ] Añadir pruebas de seguridad funcional para sesión, CSRF, límites de
  intentos, recuperación y permisos.

**Criterio de salida:** el registro público solo se habilita con verificación
de correo, medidas antiabuso y una ruta de administración inicial aprobada.

## Fase 4 — Tiendas y catálogo público

**Prioridad: P2.** Requiere decisiones de producto y políticas; no asumir que
una UI pública equivale a un marketplace completo.

- [ ] Resolver políticas de publicación, moderación, productos permitidos,
  devoluciones y datos visibles (preguntas 18, 19 y 23).
- [x] Usar el slug generado para el tenant en `/catalogo/{slug}` y mostrar su
  catálogo público.
- [ ] Implementar un estado de publicación independiente y comprobarlo en
  cada respuesta pública. Por ahora la publicación se deriva de `quantity > 0`.
- [x] Conectar el catálogo con la entrega controlada de imágenes R2 de la fase
  2.
- [ ] Añadir controles de disponibilidad, búsqueda y presentación móvil, y
  pruebas de que no se filtran productos privados ni datos del comprador.

**Criterio de salida:** un visitante puede consultar solo tiendas y productos
publicados, sin acceder a inventario, costos, datos privados ni contenido de
otros tenants.

## Fase 5 — Pedidos, delivery y liquidaciones

**Prioridad: P2.** Empezar después de aprobar las reglas operativas de
`PREGUNTAS_PENDIENTES.md` (preguntas 5–10).

- [ ] Definir compra como invitado o con cuenta, retiro en tienda, tarifa y
  aceptación del delivery, perfiles de repartidor y estados de pedido.
- [ ] Diseñar pedidos de un solo vendedor, reserva/liberación de stock,
  cancelaciones, devoluciones y pedidos parciales.
- [ ] Implementar registro auditable de repartidor, cobro, liquidación y
  comprobantes; calcular 20% de plataforma sobre delivery y 80% de repartidor,
  no sobre productos.
- [ ] Definir el tratamiento de pedidos fallidos y reversión de importes antes
  de automatizar pagos o liquidaciones.
- [ ] Añadir reportes de conciliación y pruebas de transiciones válidas,
  idempotencia y auditoría.

**Criterio de salida:** cada pedido y movimiento de dinero puede reconstruirse
con registros auditables; cancelaciones y excepciones tienen reglas verificadas.

## Fase 6 — Pagos y operación comercial

**Prioridad: P3.** Requiere decisiones de titularidad comercial, proveedores y
operación (preguntas 11–15).

- [ ] Documentar el proceso manual inicial para efectivo, transferencias y
  comprobantes, incluyendo quién revisa y aprueba cada pago.
- [ ] Investigar disponibilidad comercial/técnica en Nicaragua para BAC,
  Lafise y billeteras móviles antes de prometer integraciones.
- [ ] Integrar solo proveedores aprobados; nunca marcar pago como confirmado
  por captura o redirección del navegador.
- [ ] Definir precios, suscripciones, comisiones, impuestos, numeración,
  zona horaria y políticas de morosidad.
- [ ] Implementar compras, ventas/POS, clientes, proveedores y caja según las
  reglas aprobadas, con permisos y auditoría.

**Criterio de salida:** pagos y saldos se concilian con evidencia verificable,
sin almacenar datos de tarjeta ni CVV y sin estados de pago simulados.

## Fase 7 — Preparación para operación pública

**Prioridad: P1 para lanzamiento; parte de P3 puede desarrollarse después.**

- [ ] Configurar y probar variables y secretos por ambiente; revisar que no
  estén incluidos en el frontend, Git, logs o documentación.
- [ ] Preparar monitoreo, alertas, manejo de errores y retención adecuada de
  registros.
- [ ] Definir cuotas de almacenamiento R2, formatos/optimización de imágenes y
  límites de uso por tenant.
- [ ] Preparar copias de seguridad de D1 y R2, política de retención y una
  prueba documentada de restauración.
- [ ] Completar revisión de seguridad, accesibilidad, privacidad, términos,
  políticas de devolución y requisitos legales/fiscales aplicables.
- [x] Publicar una primera versión bilingüe de términos para el piloto y
  registrar en D1 la versión aceptada al crear una cuenta. Su revisión legal,
  la identificación formal del operador y el aviso de privacidad siguen
  pendientes; no es criterio de autorización para lanzamiento.
- [ ] Realizar pruebas de aceptación en preview y checklist de despliegue y
  reversión antes de habilitar usuarios reales.
- [ ] Confirmar con el propietario que están aprobados el dominio, marca,
  soporte, publicación de tiendas y apertura del registro.

**Criterio de salida:** existe un procedimiento verificable de despliegue,
monitoreo, respaldo/restauración y respuesta a fallos; el propietario aprueba
explícitamente la apertura pública.

## Decisiones que bloquean o afectan el alcance

Las decisiones de negocio ya están enumeradas en
[PREGUNTAS_PENDIENTES.md](./PREGUNTAS_PENDIENTES.md); conviene resolverlas por
fase, no todas antes de seguir trabajando:

- **Para abrir registro:** proveedor de correo, verificación/recuperación,
  antiabuso, dueño inicial de administración global y política de publicación.
- **Para terminar inventario por perfil:** campos obligatorios, unidades,
  conversiones, serialización y garantías.
- **Para imágenes:** número máximo, formatos, tamaño, orden, reemplazo y
  conservación/eliminación. Está decidido que son privadas en inventario y
  visibles en tienda cuando se publique el producto.
- **Para pedidos:** tarifa y aceptación de delivery, repartidores, liquidación,
  excepciones, retiro en tienda y compra con/sin cuenta.
- **Para pagos y operación comercial:** comprobantes, titulares de cuentas,
  mensualidad/comisiones, impuestos y zona horaria.
- **Para lanzamiento:** marca, textos legales, soporte, países/monedas y
  moderación de tiendas.

No se deben guardar tokens, contraseñas, claves de API ni credenciales de
Cloudflare/GitHub en este documento. Mantener los valores secretos en el
almacenamiento seguro del ambiente correspondiente.
