import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Boxes,
  Check,
  ChevronDown,
  ClipboardList,
  Coffee,
  Globe,
  Images,
  Lock,
  Mail,
  MapPin,
  Menu,
  Minus,
  Package,
  Share2,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Tag,
  TriangleAlert,
  Users,
  Wallet,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import './LandingPage.css'

type LandingLanguage = 'es' | 'en'

const copy = {
  es: {
    nav: { features: 'Funciones', how: 'Cómo funciona', catalog: 'Catálogo', faq: 'Preguntas', about: 'Nosotros', signIn: 'Entrar', start: 'Crear cuenta' },
    hero: {
      badge: 'Nuevo · Catálogo público para cada negocio',
      titleA: 'Todo tu negocio,',
      titleB: 'en un solo lugar',
      subtitle: 'Organiza productos, existencias y movimientos sin hojas de cálculo. Comparte un catálogo que solo muestra lo que tienes disponible y decide con datos reales.',
      primary: 'Crear cuenta gratis',
      secondary: 'Ver cómo funciona',
      notes: ['Sin tarjeta de crédito', 'Listo en minutos', 'Tus datos bajo tu control'],
      preview: {
        app: 'Mi negocio',
        nav: ['Panel principal', 'Productos', 'Inventario', 'Reportes'],
        title: 'Resumen de hoy',
        subtitle: 'Así se ve tu negocio',
        stats: ['Productos', 'Unidades', 'Stock bajo', 'Valor'],
        table: 'Productos recientes',
        rows: [
          ['Camisa Oxford', 'En stock'],
          ['Café molido 500 g', 'Stock bajo'],
          ['Cemento gris 50 kg', 'Agotado'],
        ],
        floatA: 'Catálogo actualizado',
        floatB: 'Stock bajo detectado',
        browser: 'tellezsoftware.app',
      },
    },
    proof: [
      ['4 rubros', 'listos para empezar'],
      ['5 imágenes', 'por producto'],
      ['ES / EN', 'interfaz bilingüe'],
      ['100%', 'de tus datos, bajo tu control'],
    ],
    about: {
      eyebrow: 'QUIÉNES SOMOS',
      title: 'Software hecho en Nicaragua para negocios que quieren orden',
      badge: 'Hecho en Nicaragua',
      paragraphs: [
        'TellezSoftware nació de un problema cotidiano: negocios que llevan sus productos en cuadernos, hojas de Excel y fotos sueltas de WhatsApp. Esa información se pierde, se duplica y nunca está a mano cuando el cliente pregunta.',
        'Somos un proyecto independiente de desarrollo de software. Construimos herramientas simples, en español, que funcionan en el navegador y se adaptan a la forma real de vender de un negocio nicaragüense.',
      ],
      pillars: [
        { title: 'Qué hacemos', body: 'Diseñamos y desarrollamos software de inventario y catálogo para pequeños y medianos negocios: ropa y calzado, ferretería y repuestos, alimentos y bebidas, y tienda general.' },
        { title: 'Qué ofrecemos', body: 'Un panel para organizar productos, existencias y movimientos, más un catálogo público por negocio que se comparte con un enlace y se abre en cualquier teléfono.' },
      ],
      reasons: {
        title: 'Por qué somos la mejor opción en Nicaragua',
        subtitle: 'Porque la herramienta se adapta a tu negocio y no al revés.',
        items: [
          { title: 'Montos en córdobas desde el inicio', body: 'Configuras NIO o USD al crear tu negocio y todos los costos y precios se muestran en la moneda con la que trabajas.' },
          { title: 'Pensado para rubros nicaragüenses', body: 'Cuatro grupos de negocio reales, cada uno con sus categorías, unidades y campos sugeridos.' },
          { title: 'Funciona con lo que ya tienes', body: 'No necesitas comprar equipos ni instalar aplicaciones: se usa desde el navegador del celular o de la computadora.' },
          { title: 'Listo para compartir por WhatsApp', body: 'Un solo enlace para tus clientes, con lo que está disponible y sin capturas, audios ni listas desactualizadas.' },
        ],
      },
    },
    features: {
      eyebrow: 'FUNCIONES',
      title: 'Todo lo que tu negocio necesita',
      subtitle: 'Menos libretas y hojas de cálculo. Más orden, más claridad y un catálogo que tus clientes pueden ver al instante.',
      items: [
        { title: 'Inventario por negocio', body: 'Crea varios espacios de trabajo y mantén un inventario separado para cada negocio, sin mezclar productos ni historiales.' },
        { title: 'Productos a tu medida', body: 'Las categorías, unidades y campos sugeridos cambian según tu rubro: talla para ropa, volumen para bebidas o número de serie.' },
        { title: 'Ajustes auditables', body: 'Cada entrada, salida o corrección queda registrada con motivo y fecha. La cantidad nunca cambia por accidente.' },
        { title: 'Catálogo público', body: 'Comparte un enlace por negocio y deja que tus clientes vean solo los productos con existencia disponible.' },
        { title: 'Hasta 5 imágenes', body: 'Tus fotos se convierten a WebP en el navegador y se optimizan a un máximo de 150 KiB por archivo.' },
        { title: 'Cuenta y acceso', body: 'Registro e inicio de sesión dentro de la app. Cada negocio conserva sus datos privados y separados.' },
      ],
    },
    comparison: {
      eyebrow: 'COMPARACIÓN',
      title: 'TellezSoftware vs lo que usas hoy',
      subtitle: 'Una sola herramienta para lo que hoy repartes entre cuadernos, Excel y fotos de WhatsApp.',
      columns: ['TellezSoftware', 'Excel', 'PDF / Fotos', 'Cuaderno'],
      rows: [
        { label: 'Actualización instantánea', values: ['yes', 'no', 'no', 'no'] },
        { label: 'Existencias y alertas de stock', values: ['yes', 'no', 'no', 'no'] },
        { label: 'Historial de movimientos', values: ['yes', 'manual', 'no', 'manual'] },
        { label: 'Catálogo público para clientes', values: ['yes', 'no', 'manual', 'no'] },
        { label: 'Imágenes de productos', values: ['yes', 'yes', 'yes', 'no'] },
        { label: 'Varios negocios separados', values: ['yes', 'no', 'no', 'no'] },
      ],
      yes: 'Sí',
      no: 'No',
      manual: 'Manual',
      footnote: 'Excel requiere trabajo manual. Los PDF y las fotos se desactualizan. TellezSoftware mantiene todo al día en un solo enlace.',
    },
    steps: {
      eyebrow: 'CÓMO FUNCIONA',
      title: 'De la primera cuenta a tu primera venta',
      subtitle: 'Crea, organiza y comparte. Todo el recorrido en un solo lugar, sin complicaciones técnicas.',
      items: [
        { title: 'Crea tu cuenta', body: 'Regístrate con tu correo y acepta los términos. Toma menos de un minuto.', tag: 'Un minuto' },
        { title: 'Configura tu negocio', body: 'Elige el tipo de negocio, la moneda y, si quieres, tu ubicación.', tag: 'Paso a paso' },
        { title: 'Carga tus productos', body: 'Agrega fotos, precios, existencias y el stock mínimo para recibir alertas.', tag: 'Con ayuda' },
        { title: 'Comparte tu catálogo', body: 'Publica tu enlace y muestra únicamente lo que está disponible.', tag: 'Un solo enlace' },
      ],
    },
    catalog: {
      eyebrow: 'CATÁLOGO PÚBLICO',
      title: 'Tu catálogo, listo para compartir',
      subtitle: 'Un enlace público por negocio, con lo que tus clientes necesitan ver y nada de lo que no.',
      bullets: [
        'Solo aparecen productos con existencia mayor que cero.',
        'Nunca muestra SKU, costo, número de serie ni cantidad.',
        'Las imágenes se sirven solo desde tu catálogo.',
        'Funciona en el navegador, sin instalar aplicaciones.',
      ],
      cta: 'Crear mi catálogo',
      mock: { store: 'Urban Wear', tag: 'Ropa y calzado', product: 'ASICS Japan Pro', price: '$105', available: 'Disponible' },
    },
    types: {
      eyebrow: 'HECHO PARA TU RUBRO',
      title: 'Un espacio para cada tipo de negocio',
      subtitle: 'Elige tu rubro al empezar y la app adapta categorías, unidades y detalles de producto.',
      items: [
        { title: 'Ropa y calzado', body: 'Tallas, colores y referencias por prenda.' },
        { title: 'Ferretería y repuestos', body: 'Medidas, materiales y control por unidad.' },
        { title: 'Alimentos y bebidas', body: 'Volumen, presentación y fecha de ingreso.' },
        { title: 'Tienda general', body: 'Categorías libres para lo que vendas.' },
      ],
    },
    faq: {
      eyebrow: 'PREGUNTAS FRECUENTES',
      title: 'Todo lo que necesitas saber',
      subtitle: 'Resolvemos las dudas más comunes antes de que empieces.',
      items: [
        { q: '¿Necesito instalar algo?', a: 'No. TellezSoftware funciona desde el navegador, tanto para ti como para tus clientes. Tu catálogo se abre con un enlace, sin descargas.' },
        { q: '¿Puedo administrar varios negocios?', a: 'Sí. Cada negocio tiene su propio espacio e inventario separado, y puedes cambiar entre ellos desde el selector de la barra lateral.' },
        { q: '¿Qué muestra el catálogo público?', a: 'Solo productos con existencia disponible. No expone SKU, costos, números de serie ni cantidades: únicamente nombre, categoría, precio y fotos.' },
        { q: '¿Cómo cambio la cantidad de un producto?', a: 'Con ajustes de inventario que quedan registrados con motivo y fecha. Así la existencia siempre es confiable y auditable.' },
        { q: '¿Puedo archivar productos?', a: 'Sí. Puedes archivar y restaurar productos cuando quieras; su historial de movimientos se conserva.' },
        { q: '¿En qué idiomas está disponible?', a: 'En español e inglés. Puedes cambiar el idioma en cualquier momento desde el botón ES/EN.' },
        { q: '¿Cuánto cuesta?', a: 'Puedes crear tu cuenta y usar el panel sin costo mientras la facturación no esté habilitada. No pedimos tarjeta para empezar.' },
      ],
    },
    cta: {
      title: 'Empieza a ordenar tu negocio hoy',
      subtitle: 'Crea tu cuenta, configura tu espacio y comparte tu catálogo en minutos.',
      primary: 'Crear cuenta gratis',
      secondary: 'Ya tengo cuenta',
    },
    footer: {
      tagline: 'Inventario y catálogo para pequeños negocios.',
      product: 'Producto',
      account: 'Cuenta',
      legal: 'Legal',
      links: { features: 'Funciones', how: 'Cómo funciona', faq: 'Preguntas frecuentes', terms: 'Términos y condiciones' },
      rights: '© 2026 TellezSoftware',
      contact: 'tellezsoftware@gmail.com',
    },
  },
  en: {
    nav: { features: 'Features', how: 'How it works', catalog: 'Catalog', faq: 'FAQ', about: 'About', signIn: 'Sign in', start: 'Create account' },
    hero: {
      badge: 'New · A public catalog for every business',
      titleA: 'Your whole business,',
      titleB: 'in one place',
      subtitle: 'Organize products, stock and movements without spreadsheets. Share a catalog that only shows what you have available and make decisions with real data.',
      primary: 'Create a free account',
      secondary: 'See how it works',
      notes: ['No credit card', 'Ready in minutes', 'Your data under your control'],
      preview: {
        app: 'My business',
        nav: ['Dashboard', 'Products', 'Inventory', 'Reports'],
        title: 'Today’s overview',
        subtitle: 'This is your business',
        stats: ['Products', 'Units', 'Low stock', 'Value'],
        table: 'Recent products',
        rows: [
          ['Oxford shirt', 'In stock'],
          ['Ground coffee 500 g', 'Low stock'],
          ['Gray cement 50 kg', 'Out of stock'],
        ],
        floatA: 'Catalog updated',
        floatB: 'Low stock detected',
        browser: 'tellezsoftware.app',
      },
    },
    proof: [
      ['4 industries', 'ready to start'],
      ['5 images', 'per product'],
      ['ES / EN', 'bilingual interface'],
      ['100%', 'of your data, under your control'],
    ],
    about: {
      eyebrow: 'ABOUT US',
      title: 'Software built in Nicaragua for businesses that want order',
      badge: 'Made in Nicaragua',
      paragraphs: [
        'TellezSoftware started from an everyday problem: businesses that keep their products in notebooks, spreadsheets and scattered WhatsApp photos. That information gets lost, duplicated and is never at hand when a customer asks.',
        'We are an independent software project. We build simple tools, in Spanish, that run in the browser and adapt to the way a Nicaraguan business actually sells.',
      ],
      pillars: [
        { title: 'What we do', body: 'We design and build inventory and catalog software for small and medium businesses: clothing and footwear, hardware and parts, food and drinks, and general stores.' },
        { title: 'What we offer', body: 'A dashboard to organize products, stock and movements, plus a public catalog per business that is shared with a link and opens on any phone.' },
      ],
      reasons: {
        title: 'Why we are the best option in Nicaragua',
        subtitle: 'Because the tool adapts to your business, not the other way around.',
        items: [
          { title: 'Amounts in córdobas from day one', body: 'You choose NIO or USD when creating your business and every cost and price is shown in the currency you work with.' },
          { title: 'Built for Nicaraguan trades', body: 'Four real business groups, each with its own categories, units and suggested fields.' },
          { title: 'Works with what you already have', body: 'No new equipment and nothing to install: it runs in your phone or computer browser.' },
          { title: 'Ready to share on WhatsApp', body: 'One link for your customers, showing what is available, with no screenshots, voice notes or outdated lists.' },
        ],
      },
    },
    features: {
      eyebrow: 'FEATURES',
      title: 'Everything your business needs',
      subtitle: 'Less notebooks and spreadsheets. More order, more clarity and a catalog your customers can see instantly.',
      items: [
        { title: 'Inventory per business', body: 'Create several workspaces and keep a separate inventory for each business, without mixing products or history.' },
        { title: 'Products that fit your trade', body: 'Categories, units and suggested fields change with your business type: size for clothing, volume for drinks or serial numbers.' },
        { title: 'Auditable adjustments', body: 'Every entry, exit or correction is recorded with a reason and date. Quantities never change by accident.' },
        { title: 'Public catalog', body: 'Share one link per business and let customers see only the products you have in stock.' },
        { title: 'Up to 5 images', body: 'Photos are converted to WebP in the browser and optimized to a maximum of 150 KiB each.' },
        { title: 'Account and access', body: 'Sign up and sign in right inside the app. Every business keeps its own private data.' },
      ],
    },
    comparison: {
      eyebrow: 'COMPARISON',
      title: 'TellezSoftware vs what you use today',
      subtitle: 'One tool for what you now split across notebooks, Excel and WhatsApp photos.',
      columns: ['TellezSoftware', 'Excel', 'PDF / Photos', 'Notebook'],
      rows: [
        { label: 'Instant updates', values: ['yes', 'no', 'no', 'no'] },
        { label: 'Stock levels and low-stock alerts', values: ['yes', 'no', 'no', 'no'] },
        { label: 'Movement history', values: ['yes', 'manual', 'no', 'manual'] },
        { label: 'Public catalog for customers', values: ['yes', 'no', 'manual', 'no'] },
        { label: 'Product images', values: ['yes', 'yes', 'yes', 'no'] },
        { label: 'Separate businesses', values: ['yes', 'no', 'no', 'no'] },
      ],
      yes: 'Yes',
      no: 'No',
      manual: 'Manual',
      footnote: 'Excel needs manual work. PDFs and photos go out of date. TellezSoftware keeps everything up to date behind a single link.',
    },
    steps: {
      eyebrow: 'HOW IT WORKS',
      title: 'From your first account to your first sale',
      subtitle: 'Create, organize and share. The whole journey in one place, with no technical hassle.',
      items: [
        { title: 'Create your account', body: 'Sign up with your email and accept the terms. It takes less than a minute.', tag: 'One minute' },
        { title: 'Set up your business', body: 'Choose your business type, currency and, if you want, your location.', tag: 'Step by step' },
        { title: 'Add your products', body: 'Add photos, prices, stock and the minimum level to receive alerts.', tag: 'Guided' },
        { title: 'Share your catalog', body: 'Publish your link and show only what is available.', tag: 'One link' },
      ],
    },
    catalog: {
      eyebrow: 'PUBLIC CATALOG',
      title: 'Your catalog, ready to share',
      subtitle: 'One public link per business, with what your customers need to see and nothing they don’t.',
      bullets: [
        'Only products with stock above zero are listed.',
        'Never shows SKU, cost, serial numbers or quantities.',
        'Images are served only from your catalog.',
        'Runs in the browser, with nothing to install.',
      ],
      cta: 'Create my catalog',
      mock: { store: 'Urban Wear', tag: 'Clothing', product: 'ASICS Japan Pro', price: '$105', available: 'Available' },
    },
    types: {
      eyebrow: 'BUILT FOR YOUR TRADE',
      title: 'A workspace for every kind of business',
      subtitle: 'Pick your trade when you start and the app adapts categories, units and product details.',
      items: [
        { title: 'Clothing and footwear', body: 'Sizes, colors and references per item.' },
        { title: 'Hardware and parts', body: 'Measurements, materials and per-unit control.' },
        { title: 'Food and drinks', body: 'Volume, packaging and arrival date.' },
        { title: 'General store', body: 'Flexible categories for whatever you sell.' },
      ],
    },
    faq: {
      eyebrow: 'FREQUENTLY ASKED QUESTIONS',
      title: 'Everything you need to know',
      subtitle: 'We answer the most common questions before you begin.',
      items: [
        { q: 'Do I need to install anything?', a: 'No. TellezSoftware runs in the browser, for you and your customers. Your catalog opens with a link, with no downloads.' },
        { q: 'Can I manage several businesses?', a: 'Yes. Every business has its own workspace and separate inventory, and you can switch between them from the sidebar.' },
        { q: 'What does the public catalog show?', a: 'Only products that are in stock. It never exposes SKU, cost, serial numbers or quantities: just name, category, price and photos.' },
        { q: 'How do I change a product quantity?', a: 'Through inventory adjustments that are recorded with a reason and date. That keeps your stock reliable and auditable.' },
        { q: 'Can I archive products?', a: 'Yes. You can archive and restore products at any time and their movement history is preserved.' },
        { q: 'Which languages are supported?', a: 'Spanish and English. You can switch languages at any time with the ES/EN button.' },
        { q: 'How much does it cost?', a: 'You can create your account and use the dashboard at no cost while billing is disabled. No card is required to start.' },
      ],
    },
    cta: {
      title: 'Start getting your business in order today',
      subtitle: 'Create your account, set up your workspace and share your catalog in minutes.',
      primary: 'Create a free account',
      secondary: 'I already have an account',
    },
    footer: {
      tagline: 'Inventory and catalog for small businesses.',
      product: 'Product',
      account: 'Account',
      legal: 'Legal',
      links: { features: 'Features', how: 'How it works', faq: 'FAQ', terms: 'Terms and Conditions' },
      rights: '© 2026 TellezSoftware',
      contact: 'tellezsoftware@gmail.com',
    },
  },
}

const featureIcons = [Boxes, Tag, ClipboardList, Store, Images, ShieldCheck]
const aboutReasonIcons = [Wallet, Tag, Smartphone, Share2]
const stepIcons = [Users, Sparkles, Package, Share2]
const typeIcons = [Shirt, Wrench, Coffee, ShoppingBag]

function SignInLink({ language, className = '' }: { language: LandingLanguage; className?: string }) {
  const t = copy[language]
  return <a className={`landing-btn landing-btn-ghost ${className}`} href="/ingresar">{t.nav.signIn}</a>
}

function StartLink({ language, className = '', label }: { language: LandingLanguage; className?: string; label?: string }) {
  const t = copy[language]
  return <a className={`landing-btn landing-btn-primary ${className}`} href="/ingresar?mode=register">{label ?? t.nav.start}<ArrowRight size={16} /></a>
}

function LandingNav({ language, onLanguageChange }: { language: LandingLanguage; onLanguageChange: (language: LandingLanguage) => void }) {
  const t = copy[language]
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePress)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const links = [
    { href: '#nosotros', label: t.nav.about },
    { href: '#funciones', label: t.nav.features },
    { href: '#como-funciona', label: t.nav.how },
    { href: '#catalogo', label: t.nav.catalog },
    { href: '#preguntas', label: t.nav.faq },
  ]
  return <header className="landing-nav" ref={navRef}>
    <div className="landing-nav-inner">
      <a className="landing-brand" href="/" aria-label="TellezSoftware home">
        <span className="landing-brand-mark"><img src="/logo.png" alt="" /></span>
        <span>Tellez<span className="landing-brand-light">Software</span></span>
      </a>
      <nav className="landing-nav-links" aria-label={language === 'es' ? 'Navegación principal' : 'Main navigation'}>
        {links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
      </nav>
      <div className="landing-nav-actions">
        <button className="landing-lang" type="button" onClick={() => onLanguageChange(language === 'es' ? 'en' : 'es')} aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a español'}>
          {language === 'es' ? 'ES' : 'EN'}<ChevronDown size={12} />
        </button>
        <SignInLink language={language} className="landing-nav-signin" />
        <StartLink language={language} className="landing-nav-start" />
        <button className="landing-nav-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label={language === 'es' ? 'Abrir menú' : 'Open menu'} aria-expanded={open} aria-controls="landing-mobile-menu">
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </div>
    <div id="landing-mobile-menu" className={`landing-nav-mobile${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="landing-nav-mobile-inner">
        {links.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}
        <a href="/ingresar" onClick={() => setOpen(false)}>{t.nav.signIn}</a>
        <a className="landing-btn landing-btn-primary" href="/ingresar?mode=register" onClick={() => setOpen(false)}>{t.nav.start}<ArrowRight size={16} /></a>
      </div>
    </div>
  </header>
}

function DashboardPreview({ language }: { language: LandingLanguage }) {
  const t = copy[language].hero
  return <div className="landing-preview">
    <div className="landing-preview-frame">
      <div className="landing-preview-topbar">
        <span className="landing-dot" /><span className="landing-dot" /><span className="landing-dot" />
        <span className="landing-preview-url"><Lock size={10} />{t.preview.browser}</span>
      </div>
      <div className="landing-preview-app">
        <aside className="landing-preview-side">
          <div className="landing-preview-workspace"><span>TS</span><div><strong>{t.preview.app}</strong><small>{t.preview.subtitle}</small></div></div>
          {t.preview.nav.map((item, index) => <div className={`landing-preview-navitem ${index === 0 ? 'is-active' : ''}`} key={item}>{item}</div>)}
        </aside>
        <div className="landing-preview-main">
          <div className="landing-preview-heading">
            <div><strong>{t.preview.title}</strong><small>{t.preview.subtitle}</small></div>
            <span className="landing-preview-pill">＋</span>
          </div>
          <div className="landing-preview-stats">
            {t.preview.stats.map((stat, index) => <div className={`landing-preview-stat tone-${index}`} key={stat}><small>{stat}</small><strong>{['128', '1.940', '7', 'C$ 84.200'][index]}</strong></div>)}
          </div>
          <div className="landing-preview-table">
            <div className="landing-preview-table-head"><span>{t.preview.table}</span><span>{language === 'es' ? 'Estado' : 'Status'}</span></div>
            {t.preview.rows.map(([name, status], index) => <div className="landing-preview-row" key={name}>
              <span className="landing-preview-product"><i className={`tone-${index}`} /><b>{name}</b></span>
              <span className={`landing-preview-status ${index === 1 ? 'is-low' : index === 2 ? 'is-out' : ''}`}>{status}</span>
            </div>)}
          </div>
        </div>
      </div>
    </div>
    <div className="landing-float landing-float-a"><span className="landing-float-icon"><Zap size={14} /></span><div><strong>{t.preview.floatA}</strong><small>{language === 'es' ? 'Hace un momento' : 'Just now'}</small></div></div>
    <div className="landing-float landing-float-b"><span className="landing-float-icon warm"><TriangleAlert size={14} /></span><div><strong>{t.preview.floatB}</strong><small>{language === 'es' ? 'Café molido 500 g' : 'Ground coffee 500 g'}</small></div></div>
  </div>
}

function Hero({ language }: { language: LandingLanguage }) {
  const t = copy[language].hero
  return <section className="landing-hero">
    <div className="landing-dots" aria-hidden="true" />
    <div className="landing-hero-inner">
      <div className="landing-hero-copy">
        <span className="landing-badge"><Sparkles size={13} />{t.badge}</span>
        <h1 className="landing-h1">{t.titleA}<br /><span className="landing-highlight">{t.titleB}</span></h1>
        <p className="landing-lead">{t.subtitle}</p>
        <div className="landing-hero-actions">
          <StartLink language={language} className="landing-btn-lg" label={t.primary} />
          <a className="landing-btn landing-btn-outline landing-btn-lg" href="#como-funciona">{t.secondary}<ArrowRight size={16} /></a>
        </div>
        <ul className="landing-hero-notes">
          {t.notes.map((note) => <li key={note}><Check size={14} />{note}</li>)}
        </ul>
      </div>
      <div className="landing-hero-visual">
        <DashboardPreview language={language} />
      </div>
    </div>
    <div className="landing-proof">
      <ul>
        {copy[language].proof.map(([value, label]) => <li key={value}><strong>{value}</strong><span>{label}</span></li>)}
      </ul>
      <p className="landing-proof-note">
        <ShieldCheck size={14} />
        {language === 'es' ? 'Sesión propia, catálogo por negocio y datos privados por defecto.' : 'Your own session, one catalog per business and private data by default.'}
      </p>
    </div>
    <button className="landing-scroll" type="button" onClick={() => document.getElementById('funciones')?.scrollIntoView({ behavior: 'smooth' })} aria-label={language === 'es' ? 'Ver funciones' : 'See features'}>
      <ChevronDown size={18} />
    </button>
  </section>
}

function About({ language }: { language: LandingLanguage }) {
  const t = copy[language].about
  return <section className="landing-section landing-about" id="nosotros">
    <div className="landing-about-grid">
      <div className="landing-about-copy">
        <p className="landing-eyebrow">{t.eyebrow}</p>
        <h2 className="landing-h2">{t.title}</h2>
        <span className="landing-about-badge"><MapPin size={13} />{t.badge}</span>
        {t.paragraphs.map((paragraph) => <p className="landing-about-text" key={paragraph}>{paragraph}</p>)}
      </div>
      <div className="landing-about-pillars">
        {t.pillars.map((pillar, index) => {
          const Icon = index === 0 ? Boxes : Store
          return <article className="landing-pillar" key={pillar.title}>
            <span className="landing-pillar-icon"><Icon size={20} /></span>
            <div>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </div>
          </article>
        })}
      </div>
    </div>
    <div className="landing-about-reasons">
      <header className="landing-about-reasons-head">
        <h3>{t.reasons.title}</h3>
        <p>{t.reasons.subtitle}</p>
      </header>
      <ul className="landing-reasons">
        {t.reasons.items.map((reason, index) => {
          const Icon = aboutReasonIcons[index]
          return <li key={reason.title}>
            <span className="landing-reason-icon"><Icon size={17} /></span>
            <strong>{reason.title}</strong>
            <p>{reason.body}</p>
          </li>
        })}
      </ul>
    </div>
  </section>
}

function Features({ language }: { language: LandingLanguage }) {
  const t = copy[language].features
  return <section className="landing-section" id="funciones">
    <header className="landing-section-head">
      <p className="landing-eyebrow">{t.eyebrow}</p>
      <h2 className="landing-h2">{t.title}</h2>
      <p className="landing-section-sub">{t.subtitle}</p>
    </header>
    <div className="landing-feature-grid">
      {t.items.map((item, index) => {
        const Icon = featureIcons[index]
        return <article className="landing-feature" key={item.title}>
          <span className="landing-feature-icon"><Icon size={20} /></span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </article>
      })}
    </div>
  </section>
}

function Comparison({ language }: { language: LandingLanguage }) {
  const t = copy[language].comparison
  const cell = (value: string) => {
    if (value === 'yes') return <span className="landing-compare-yes" title={t.yes}><Check size={15} /></span>
    if (value === 'manual') return <span className="landing-compare-manual">{t.manual}</span>
    return <span className="landing-compare-no" title={t.no}><Minus size={15} /></span>
  }
  return <section className="landing-section landing-section-muted">
    <header className="landing-section-head">
      <p className="landing-eyebrow">{t.eyebrow}</p>
      <h2 className="landing-h2">{t.title}</h2>
      <p className="landing-section-sub">{t.subtitle}</p>
    </header>
    <div className="landing-compare-wrap">
      <table className="landing-compare">
        <thead>
          <tr>
            <th scope="col"><span className="landing-sr">{language === 'es' ? 'Función' : 'Feature'}</span></th>
            {t.columns.map((column, index) => <th scope="col" key={column} className={index === 0 ? 'is-highlight' : ''}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((row) => <tr key={row.label}>
            <th scope="row">{row.label}</th>
            {row.values.map((value, index) => <td key={`${row.label}-${index}`} className={index === 0 ? 'is-highlight' : ''}>{cell(value)}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
    <p className="landing-compare-note">{t.footnote}</p>
  </section>
}

function Steps({ language }: { language: LandingLanguage }) {
  const t = copy[language].steps
  return <section className="landing-section" id="como-funciona">
    <header className="landing-section-head">
      <p className="landing-eyebrow">{t.eyebrow}</p>
      <h2 className="landing-h2">{t.title}</h2>
      <p className="landing-section-sub">{t.subtitle}</p>
    </header>
    <ol className="landing-steps">
      {t.items.map((item, index) => {
        const Icon = stepIcons[index]
        return <li className="landing-step" key={item.title}>
          <span className="landing-step-icon"><Icon size={18} /></span>
          <span className="landing-step-number">{String(index + 1).padStart(2, '0')}</span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
          <span className="landing-step-tag">{item.tag}</span>
        </li>
      })}
    </ol>
  </section>
}

function CatalogShowcase({ language }: { language: LandingLanguage }) {
  const t = copy[language].catalog
  return <section className="landing-section landing-catalog" id="catalogo">
    <div className="landing-catalog-copy">
      <p className="landing-eyebrow">{t.eyebrow}</p>
      <h2 className="landing-h2">{t.title}</h2>
      <p className="landing-section-sub">{t.subtitle}</p>
      <ul className="landing-check-list">
        {t.bullets.map((bullet) => <li key={bullet}><span><Check size={13} /></span>{bullet}</li>)}
      </ul>
      <StartLink language={language} className="landing-btn-lg" label={t.cta} />
    </div>
    <div className="landing-catalog-visual">
      <div className="landing-store">
        <div className="landing-store-head">
          <span className="landing-store-avatar">{t.mock.store.slice(0, 1)}</span>
          <div><strong>{t.mock.store}</strong><small>{t.mock.tag}</small></div>
          <span className="landing-store-badge"><Globe size={12} />{language === 'es' ? 'Público' : 'Public'}</span>
        </div>
        <div className="landing-store-body">
          <div className="landing-store-image"><img src="/demo-product.jpg" alt={t.mock.product} /></div>
          <div className="landing-store-product">
            <strong>{t.mock.product}</strong>
            <span className="landing-store-price">{t.mock.price}</span>
            <span className="landing-store-available"><i />{t.mock.available}</span>
          </div>
        </div>
        <div className="landing-store-foot"><Lock size={12} />{language === 'es' ? 'Solo productos con existencia' : 'In-stock products only'}</div>
      </div>
      <div className="landing-store-glow" aria-hidden="true" />
    </div>
  </section>
}

function BusinessTypes({ language }: { language: LandingLanguage }) {
  const t = copy[language].types
  return <section className="landing-section landing-section-muted">
    <header className="landing-section-head">
      <p className="landing-eyebrow">{t.eyebrow}</p>
      <h2 className="landing-h2">{t.title}</h2>
      <p className="landing-section-sub">{t.subtitle}</p>
    </header>
    <div className="landing-types">
      {t.items.map((item, index) => {
        const Icon = typeIcons[index]
        return <article className="landing-type" key={item.title}>
          <span className="landing-type-icon"><Icon size={20} /></span>
          <strong>{item.title}</strong>
          <p>{item.body}</p>
        </article>
      })}
    </div>
  </section>
}

function Faq({ language }: { language: LandingLanguage }) {
  const t = copy[language].faq
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  return <section className="landing-section" id="preguntas">
    <header className="landing-section-head">
      <p className="landing-eyebrow">{t.eyebrow}</p>
      <h2 className="landing-h2">{t.title}</h2>
      <p className="landing-section-sub">{t.subtitle}</p>
    </header>
    <div className="landing-faq">
      {t.items.map((item, index) => {
        const open = openIndex === index
        return <div className={`landing-faq-item ${open ? 'is-open' : ''}`} key={item.q}>
          <button type="button" className="landing-faq-question" aria-expanded={open} onClick={() => setOpenIndex(open ? null : index)}>
            <span>{item.q}</span>
            <ChevronDown size={17} />
          </button>
          {open && <p className="landing-faq-answer">{item.a}</p>}
        </div>
      })}
    </div>
  </section>
}

function FinalCta({ language }: { language: LandingLanguage }) {
  const t = copy[language].cta
  return <section className="landing-cta">
    <p className="landing-eyebrow landing-eyebrow-light"><Sparkles size={12} />{language === 'es' ? 'EMPIEZA HOY' : 'START TODAY'}</p>
    <h2 className="landing-cta-title">{t.title}</h2>
    <p className="landing-cta-sub">{t.subtitle}</p>
    <div className="landing-cta-actions">
      <a className="landing-btn landing-btn-light landing-btn-lg" href="/ingresar?mode=register">{t.primary}<ArrowRight size={16} /></a>
      <a className="landing-btn landing-btn-ghost-light landing-btn-lg" href="/ingresar">{t.secondary}</a>
    </div>
  </section>
}

function LandingFooter({ language }: { language: LandingLanguage }) {
  const t = copy[language].footer
  return <footer className="landing-footer">
    <div className="landing-footer-grid">
      <div className="landing-footer-brand">
        <a className="landing-brand" href="/" aria-label="TellezSoftware home">
          <span className="landing-brand-mark"><img src="/logo.png" alt="" /></span>
          <span>Tellez<span className="landing-brand-light">Software</span></span>
        </a>
        <p>{t.tagline}</p>
        <a className="landing-footer-mail" href="mailto:tellezsoftware@gmail.com"><Mail size={14} />{t.contact}</a>
      </div>
      <div className="landing-footer-col">
        <strong>{t.product}</strong>
        <a href="#funciones">{t.links.features}</a>
        <a href="#como-funciona">{t.links.how}</a>
        <a href="#preguntas">{t.links.faq}</a>
      </div>
      <div className="landing-footer-col">
        <strong>{t.account}</strong>
        <a href="/ingresar">{language === 'es' ? 'Iniciar sesión' : 'Sign in'}</a>
        <a href="/ingresar?mode=register">{language === 'es' ? 'Crear cuenta' : 'Create account'}</a>
      </div>
      <div className="landing-footer-col">
        <strong>{t.legal}</strong>
        <a href={language === 'es' ? '/terminos' : '/terminos?lang=en'}>{t.links.terms}</a>
        <span className="landing-footer-muted">{t.rights}</span>
      </div>
    </div>
    <div className="landing-footer-bottom">
      <span>{t.rights}</span>
      <span className="landing-footer-stack">{language === 'es' ? 'Hecho con React, Cloudflare Pages, D1 y R2' : 'Built with React, Cloudflare Pages, D1 and R2'}</span>
    </div>
  </footer>
}

export function LandingPage({ language, onLanguageChange }: { language: LandingLanguage; onLanguageChange: (language: LandingLanguage) => void }) {
  return <div className="landing-page">
    <LandingNav language={language} onLanguageChange={onLanguageChange} />
    <main>
      <Hero language={language} />
      <About language={language} />
      <Features language={language} />
      <Comparison language={language} />
      <Steps language={language} />
      <CatalogShowcase language={language} />
      <BusinessTypes language={language} />
      <Faq language={language} />
      <FinalCta language={language} />
    </main>
    <LandingFooter language={language} />
  </div>
}
