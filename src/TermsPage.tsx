import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { CURRENT_TERMS_VERSION } from '../shared/terms'

type Language = 'es' | 'en'

const terms = {
  es: {
    home: 'Volver a TellezSoftware',
    switchLanguage: 'Cambiar idioma',
    title: 'Términos y condiciones de uso',
    updated: `Versión ${CURRENT_TERMS_VERSION} · Vigente desde el 14 de noviembre de 2026`,
    noticeTitle: 'Condiciones para la etapa piloto',
    notice: 'TellezSoftware es actualmente un proyecto independiente en desarrollo y no se presenta como una sociedad mercantil registrada. Este documento describe el alcance actual del servicio; no sustituye la identificación completa del operador, un aviso de privacidad ni la revisión legal necesaria antes de ofrecerlo al público.',
    sections: [
      {
        title: '1. Aceptación y alcance',
        paragraphs: [
          'Al crear una cuenta y marcar la casilla de aceptación, confirmas que leíste estos términos y aceptas usarlos para el servicio disponible en esta etapa piloto. Si no estás de acuerdo, no crees una cuenta ni continúes usando las funciones autenticadas.',
          'Estos términos no pretenden impedir que presentes consultas o reclamaciones ni renunciar a derechos que no puedan renunciarse conforme a la ley aplicable.',
        ],
      },
      {
        title: '2. Qué ofrece actualmente el servicio',
        paragraphs: [
          'TellezSoftware ofrece herramientas en desarrollo para organizar productos, existencias e imágenes, además de catálogos informativos por negocio. Las funciones pueden cambiar mientras se prueba y mejora el producto.',
          'Por ahora no se ofrece una pasarela de pago, procesamiento de pedidos, liquidación de dinero ni verificación de vendedores a través de la plataforma. Un catálogo publicado no significa que TellezSoftware venda los productos o garantice la conducta, existencia o calidad de un vendedor o producto.',
        ],
      },
      {
        title: '3. Cuentas y uso responsable',
        paragraphs: [
          'Debes proporcionar información veraz, proteger tus credenciales y avisar al soporte si sospechas que otra persona accedió a tu cuenta. Eres responsable de las acciones realizadas mediante tu cuenta, salvo cuando la ley disponga otra cosa.',
          'Solo puedes cargar información que tengas derecho a usar. No publiques contenido ilegal, engañoso, infractor, dañino o que exponga datos personales de terceros sin autorización. No intentes acceder a cuentas o datos de otros negocios, interferir con el servicio ni evadir sus límites de seguridad.',
        ],
      },
      {
        title: '4. Tus productos, datos e imágenes',
        paragraphs: [
          'Conservas tus derechos sobre el contenido que aportas. Nos autorizas a almacenarlo, procesarlo y mostrarlo únicamente en la medida necesaria para operar las funciones que solicitas, como guardar inventario y publicar imágenes en el catálogo que habilites.',
          'Eres responsable de la exactitud de precios, existencias, descripciones, permisos y demás información que cargues, así como de mantener tus propios registros y copias de seguridad. No uses el piloto como único registro contable, fiscal, legal o de inventario crítico.',
          'No cargues contraseñas, números completos de tarjetas, datos financieros sensibles, historiales médicos ni otra información sensible que no sea necesaria. El funcionamiento de almacenamiento y conservación puede cambiar; solicita asistencia antes de dejar de usar la cuenta. El aviso de privacidad debe consultarse por separado y completarse antes de una apertura pública.',
        ],
      },
      {
        title: '5. No asesoría ni garantía de resultados',
        paragraphs: [
          'El servicio es una herramienta de apoyo y no sustituye asesoría contable, fiscal, legal, financiera ni recomendaciones sobre decisiones comerciales. Debes verificar por otros medios que los datos y cálculos sean correctos antes de actuar.',
          'Durante el piloto, el servicio se proporciona en desarrollo y puede presentar errores, interrupciones, cambios o pérdida de información. En la medida permitida por la ley, no se garantiza disponibilidad continua, ausencia de errores ni adecuación a un propósito particular. Nada de esta sección limita derechos o responsabilidades que legalmente no puedan excluirse.',
        ],
      },
      {
        title: '6. Tarifas y transacciones',
        paragraphs: [
          'Actualmente no hay una suscripción ni cobro de pedidos habilitado en el producto. Si se ofrecen tarifas, límites de pago o nuevas funciones comerciales, se mostrarán sus condiciones antes de activarlas y se solicitará la aceptación que corresponda.',
          'Las ventas, entregas, devoluciones, garantías y acuerdos entre un negocio y sus clientes son responsabilidad de las partes que los celebran. TellezSoftware no es parte de esas operaciones por el solo hecho de alojar un catálogo informativo.',
        ],
      },
      {
        title: '7. Suspensión y terminación',
        paragraphs: [
          'Podemos restringir temporalmente el acceso cuando sea razonablemente necesario para proteger cuentas, usuarios, datos o el funcionamiento del servicio, atender un requerimiento legal o investigar un uso que infrinja estos términos. Cuando sea posible, informaremos el motivo y los pasos para resolverlo.',
          'Puedes dejar de usar el servicio en cualquier momento. Para solicitar ayuda con una cuenta o sus datos, escribe al correo de contacto. Los plazos y procedimientos definitivos de exportación, conservación y eliminación se detallarán en el aviso de privacidad antes del lanzamiento público.',
        ],
      },
      {
        title: '8. Cambios y contacto',
        paragraphs: [
          'Podemos actualizar estas condiciones para reflejar cambios del servicio o requisitos aplicables. Indicaremos la nueva versión y fecha en esta página; los cambios materiales deberán comunicarse y, cuando corresponda, requerirán una nueva aceptación antes de seguir usando la función afectada.',
          'Para preguntas o reclamaciones, contacta a tellezsoftware@gmail.com. Este canal no limita el derecho a acudir a las autoridades u otros mecanismos de reclamación disponibles conforme a la ley.',
        ],
      },
      {
        title: '9. Ley aplicable',
        paragraphs: [
          'Estos términos no pretenden desplazar normas obligatorias de protección al consumidor, privacidad u otras leyes aplicables. La jurisdicción y los datos de identificación formal del operador deben confirmarse con asesoría legal antes de que el servicio se ofrezca al público.',
        ],
      },
    ],
    closing: 'Documento operativo inicial para el piloto. No es asesoría legal y no reemplaza un aviso de privacidad.',
  },
  en: {
    home: 'Back to TellezSoftware',
    switchLanguage: 'Change language',
    title: 'Terms and Conditions of Use',
    updated: `Version ${CURRENT_TERMS_VERSION} · Effective November 14, 2026`,
    noticeTitle: 'Pilot-stage terms',
    notice: 'TellezSoftware is currently an independently operated project in development and is not presented as a registered company. This document describes the current service scope; it does not replace full operator identification, a privacy notice, or the legal review needed before offering the service publicly.',
    sections: [
      {
        title: '1. Acceptance and scope',
        paragraphs: [
          'By creating an account and checking the acceptance box, you confirm that you have read and agree to these terms for the service available during this pilot. If you do not agree, do not create an account or continue using authenticated features.',
          'These terms do not prevent you from raising questions or complaints, or waive rights that cannot be waived under applicable law.',
        ],
      },
      {
        title: '2. What the service currently provides',
        paragraphs: [
          'TellezSoftware provides in-development tools to organize products, stock, and images, as well as informational business catalogs. Features may change while the product is tested and improved.',
          'At this time, the platform does not provide payment processing, order processing, money settlement, or seller verification. A published catalog does not mean TellezSoftware sells products or guarantees a seller’s conduct, product availability, or product quality.',
        ],
      },
      {
        title: '3. Accounts and responsible use',
        paragraphs: [
          'You must provide accurate information, protect your credentials, and contact support if you suspect unauthorized access. You are responsible for activity through your account except where applicable law provides otherwise.',
          'Only upload information you have the right to use. Do not publish unlawful, misleading, infringing, harmful content or personal information about others without authorization. Do not access another business’s account or data, disrupt the service, or evade security limits.',
        ],
      },
      {
        title: '4. Your products, data, and images',
        paragraphs: [
          'You retain your rights in the content you provide. You authorize us to store, process, and display it only as needed to operate the features you request, such as saving inventory and displaying images in a catalog you enable.',
          'You are responsible for the accuracy of prices, stock, descriptions, permissions, and other information you upload, and for keeping your own records and backups. Do not rely on this pilot as your sole accounting, tax, legal, or critical inventory record.',
          'Do not upload passwords, full payment-card numbers, sensitive financial data, medical histories, or other sensitive information that is not needed. Storage and retention behavior may change; contact support before discontinuing use. A separate privacy notice must be completed before public launch.',
        ],
      },
      {
        title: '5. No advice or guaranteed results',
        paragraphs: [
          'The service is a support tool and does not replace accounting, tax, legal, financial advice, or recommendations about business decisions. Independently verify data and calculations before relying on them.',
          'During the pilot, the service is under development and may contain errors, interruptions, changes, or data loss. To the extent permitted by law, continuous availability, error-free operation, and fitness for a particular purpose are not guaranteed. Nothing in this section limits rights or responsibilities that cannot legally be excluded.',
        ],
      },
      {
        title: '6. Fees and transactions',
        paragraphs: [
          'The product currently has no enabled subscription or order-payment feature. If fees, payment limits, or commercial features are introduced, their terms will be shown before activation and any required acceptance will be requested.',
          'Sales, delivery, returns, warranties, and agreements between a business and its customers are the responsibility of the parties entering into them. Hosting an informational catalog alone does not make TellezSoftware a party to those transactions.',
        ],
      },
      {
        title: '7. Suspension and termination',
        paragraphs: [
          'We may temporarily restrict access when reasonably necessary to protect accounts, users, data, or service operations; respond to legal requirements; or investigate use that violates these terms. Where possible, we will explain the reason and steps to resolve it.',
          'You may stop using the service at any time. For help with an account or its data, email the contact address. Final export, retention, and deletion timelines will be described in the privacy notice before public launch.',
        ],
      },
      {
        title: '8. Changes and contact',
        paragraphs: [
          'We may update these terms to reflect service changes or applicable requirements. The new version and date will appear on this page; material changes should be communicated and, where required, accepted again before continuing to use the affected feature.',
          'For questions or complaints, contact tellezsoftware@gmail.com. This channel does not limit your right to contact authorities or use other complaint mechanisms available under applicable law.',
        ],
      },
      {
        title: '9. Applicable law',
        paragraphs: [
          'These terms do not purport to displace mandatory consumer-protection, privacy, or other applicable laws. The jurisdiction and formal identification details of the operator must be confirmed with legal counsel before the service is offered publicly.',
        ],
      },
    ],
    closing: 'Initial pilot-stage operating document. It is not legal advice and does not replace a privacy notice.',
  },
} as const

export function TermsPage({ language: initialLanguage }: { language: Language }) {
  const [language, setLanguage] = useState(initialLanguage)
  function changeLanguage(value: Language) {
    const url = new URL(window.location.href)
    if (value === 'en') url.searchParams.set('lang', 'en')
    else url.searchParams.delete('lang')
    window.history.replaceState(null, '', url)
    setLanguage(value)
  }
  const content = terms[language]
  const homeUrl = '/'

  useEffect(() => {
    const previousTitle = document.title
    document.title = `${content.title} | TellezSoftware`
    return () => { document.title = previousTitle }
  }, [content.title])

  return <main className="terms-page">
    <header className="terms-header">
      <a className="brand terms-brand" href={homeUrl} aria-label="TellezSoftware">
        <span className="brand-mark"><img src="/logo.png" alt="" /></span>
        <span>Tellez<span className="brand-light">Software</span></span>
      </a>
      <button className="language-toggle" onClick={() => changeLanguage(language === 'es' ? 'en' : 'es')} aria-label={content.switchLanguage}>
        {language.toUpperCase()} <ChevronDown size={13} />
      </button>
    </header>
    <article className="terms-content">
      <a className="terms-back" href={homeUrl}>{content.home}</a>
      <p className="eyebrow">TELLEZSOFTWARE</p>
      <h1>{content.title}</h1>
      <p className="terms-updated">{content.updated}</p>
      <aside className="terms-notice">
        <strong>{content.noticeTitle}</strong>
        <p>{content.notice}</p>
      </aside>
      {content.sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
      ))}
      <p className="terms-closing">{content.closing}</p>
    </article>
    <footer className="terms-footer">
      <span>© 2026 TellezSoftware</span>
      <a href="mailto:tellezsoftware@gmail.com">tellezsoftware@gmail.com</a>
    </footer>
  </main>
}
