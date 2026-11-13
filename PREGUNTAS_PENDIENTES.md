# Preguntas pendientes para retomar

Estas decisiones no impiden preparar la base inicial, pero habrá que
resolverlas antes de completar pagos, comunicaciones, operación comercial y
producción. No incluyas contraseñas, tokens ni claves API en las respuestas.

## Registro, cuentas y comunicación

1. ¿Qué correo debe ser el usuario/propietario inicial de la administración
   global? No hace falta enviar ninguna contraseña.
2. Solo se indicó `tellezsoftware@gmail.com` como correo general. ¿Se contratará
   un proveedor de correo transaccional para verificación, invitaciones y
   recuperación de contraseña? ¿Cuál?
3. Mientras no haya correo transaccional, ¿se pospone el envío/recuperación por
   correo o se configura primero un proveedor antes de abrir el registro?
4. ¿Qué protección antiabuso se desea para el registro público y el inicio de
   sesión (límites de intentos, Turnstile y/o verificación de correo)?

## Pedidos, delivery y liquidación

5. ¿Quién define la tarifa de delivery de cada pedido y en qué momento la ve y
   acepta el comprador?
6. ¿El repartidor será un usuario registrado en la aplicación, una empresa
   externa o ambos? ¿Qué datos de cada entrega y repartidor se deben guardar?
7. ¿Con qué frecuencia se liquida (por pedido, al cierre diario u otra) y qué
   comprobante/arqueo debe producir administración?
8. ¿Cómo se manejan cancelaciones, devoluciones, pedidos parciales y casos en
   que el comprador no paga o no recibe el pedido? ¿Cómo se revierte el 20% de
   delivery en esos casos?
9. ¿Habrá pedidos con retiro en tienda desde el primer hito de marketplace?
10. ¿El comprador podrá comprar como invitado o deberá crear cuenta para
    realizar pedidos?

## Pagos y operación comercial

11. Para efectivo, billetera móvil, BAC, Lafise y transferencias, ¿qué
    comprobante/referencia se solicitará y quién confirmará manualmente cada
    pago?
12. Cuando se investiguen BAC, Lafise y billeteras móviles, ¿ya habrá una
    empresa/cuenta comercial solicitante y titular de las integraciones?
13. ¿Los vendedores pagarán una mensualidad al inicio? ¿Qué límites y precios
    iniciales se aplicarán, o primero funcionará como piloto sin cobro?
14. ¿La plataforma cobrará alguna comisión distinta del 20% de la tarifa de
    delivery? El documento propone mensualidad y anuncios, pero deja precios y
    responsabilidades por definir.
15. ¿Qué zona horaria y formato de fecha se usarán por defecto? ¿Qué impuestos,
    numeración y documentos se necesitan en Nicaragua?

## Productos, tiendas y reglas

16. ¿Qué campos son obligatorios al crear un producto para cada perfil
    (ropa/calzado, ferretería, productos sólidos e inventario personal)?
17. ¿Qué unidades/conversiones iniciales de ferretería y qué datos de
    serialización/garantía se necesitan para productos sólidos?
18. ¿Qué reglas de publicación, categorías prohibidas, términos y políticas de
    devolución aplicarán a tiendas abiertas al público?
19. ¿Qué información de contacto del vendedor podrá mostrarse públicamente y
    qué datos del comprador se conservarán?

## Diseño y producción

20. ¿Los colores sugeridos (verde salvia `#BFDCC9` y azul cielo `#BFD7EE`)
    quedan aprobados o quieres cambiar alguno?
21. ¿Hay logotipo, nombre comercial, textos legales y datos de soporte que
    deban aparecer en el sitio?
22. ¿Qué regiones/países se habilitarán después de Nicaragua y qué monedas
    deberán soportarse además de NIO?
23. Antes de abrirlo al público, ¿se desea mantener la publicación inmediata de
    tiendas o cambiar a aprobación/validación? La decisión actual es
    publicación inmediata.

## Preparación técnica de Cloudflare

- La cuenta de Pages y GitHub está conectada, pero se indicó que aún no existen
  D1 ni R2. Se podrá revisar la creación de estos recursos en la próxima sesión.
- No enviar credenciales de Cloudflare, GitHub, correo ni pasarelas por chat.
  Los secretos se configuran localmente o en el panel seguro de Cloudflare.
