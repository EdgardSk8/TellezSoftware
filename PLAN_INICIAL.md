# Plan inicial — TellezSoftware

## Propósito

Construir una aplicación SaaS web multiempresa para inventario, gestión
comercial y, progresivamente, escaparates públicos y marketplace. La
plataforma se desplegará en Cloudflare Pages y usará servicios de Cloudflare
para backend, datos y archivos.

Este plan registra el estado y las decisiones iniciales; no significa que la
aplicación ya esté implementada ni que esté lista para producción.

## Estado actual verificado

- Se leyó el documento maestro `Documento_Maestro_SaaS_Multiempresa_Ampliado.txt`.
- Se inicializó una aplicación React + TypeScript + Vite en la rama `main`.
- Según lo indicado por el propietario, Cloudflare Pages está conectado a GitHub.
- Aún no están creados/configurados D1, R2 ni los bindings de la aplicación.
- No se han creado credenciales ni recursos de infraestructura de Cloudflare.
- El prototipo local no tiene backend ni autenticación: los datos de ejemplo y
  los cambios de inventario se guardan en `localStorage` del navegador actual.

## Decisiones confirmadas

- **País inicial:** Nicaragua.
- **Moneda:** cada empresa podrá elegirla; NIO será la sugerencia inicial.
- **Idiomas:** español e inglés desde el inicio.
- **Perfiles:** ropa/calzado, ferretería, productos sólidos e inventario personal.
- **Dominio inicial:** `tellezsoftware.pages.dev`.
- **Registro de vendedores:** abierto; las tiendas se publican al crear la cuenta.
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

## Arquitectura inicial propuesta

- **Frontend:** TypeScript, React y Vite; aplicación modular con textos
  preparados para español e inglés.
- **Hosting:** Cloudflare Pages para los archivos estáticos.
- **API:** Cloudflare Pages Functions, con lógica y autorización en servidor.
- **Base de datos:** Cloudflare D1; migraciones SQL versionadas.
- **Archivos:** Cloudflare R2, con metadatos y pertenencia al tenant en D1.
- **Autenticación:** sesiones seguras en cookies `HttpOnly`, autorización
  verificada en cada endpoint y aislamiento por tenant en el backend.
- **Configuración:** bindings mediante configuración de Cloudflare; secretos
  solo en variables seguras del entorno, nunca en el frontend, Git o estos
  documentos.
- **Un solo sitio:** Pages Functions se despliegan dentro del mismo proyecto y
  origen de Cloudflare Pages; no se creó un servicio independiente.
- **Alcance local implementado:** login/registro y operaciones API usan D1
  local al ejecutar Pages mediante Wrangler. En `npm run dev`, la interfaz usa
  datos demostrativos del navegador. La verificación/recuperación por correo,
  permisos granulares, backoffice global y funciones comerciales aún faltan.
- **Práctica de desarrollo:** primero un flujo pequeño completo y comprobable;
  ampliar módulos con migraciones y pruebas, sin introducir microservicios
  hasta que haya una necesidad concreta.

## Estructura inicial sugerida

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
- [x] Verificar build y lint, alta/ajuste/recarga en UI, cookie de sesión,
      aislamiento entre dos tenants, rechazo CSRF y conflictos de stock
      concurrentes en el entorno local.

## Tareas pendientes

### Fundación y despliegue

- [x] Crear el esqueleto TypeScript/React/Vite para el sitio estático.
- [x] Configurar Pages Functions y binding D1 para desarrollo local con
      Wrangler. Esto no creó ni configuró recursos remotos.
- [ ] Confirmar que el flujo de build/deploy de GitHub a `main` funciona.
- [ ] Crear D1, R2 y los bindings remotos por entorno (desarrollo y producción).
- [x] Añadir migración D1 inicial y configurar ejecución local.
- [ ] Definir entornos/variables sin almacenar secretos en el repositorio.

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
- [ ] Añadir edición en API autenticada, atributos configurables, variantes
      independientes y serialización completa por unidad.
- [ ] Implementar variantes, conversiones y serialización según el perfil.
- [x] Registrar existencias y movimientos auditables en D1.
- [x] Añadir paginación por cursor, validación de servidor y pruebas locales de
      aislamiento entre tenants. La interfaz todavía carga como máximo 100.
- [x] Preparar interfaz adaptable y textos de interfaz iniciales en
      español/inglés.
- [ ] Completar traducciones, navegación, validaciones y accesibilidad de todos
      los módulos; edición de productos en API y paginación de UI pendientes.

### Siguientes etapas

- [ ] Añadir compras, ventas/POS, clientes, proveedores y caja.
- [ ] Añadir escaparates, catálogo público y moderación.
- [ ] Añadir pedidos de un solo vendedor, reserva de existencias y estados.
- [ ] Añadir tarifas, liquidación diaria y auditoría del delivery.
- [ ] Investigar y luego integrar métodos de pago disponibles en Nicaragua.
- [ ] Añadir suscripciones, planes, límites y política de morosidad.
- [ ] Completar almacenamiento de imágenes, optimización, cuotas y métricas.
- [ ] Preparar políticas legales/fiscales, copias de seguridad y pruebas de
      restauración antes de producción.

## Límites importantes

- No usar `admin/1234` como credencial desplegada ni incluir contraseñas en
  código. El acceso inicial de administración deberá configurarse mediante un
  mecanismo de instalación seguro.
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
