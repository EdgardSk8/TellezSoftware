import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  ExternalLink,
  FileBarChart,
  ImagePlus,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Archive,
  ArchiveRestore,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Users,
  Warehouse,
  Trash2,
  X,
} from 'lucide-react'
import { CURRENT_TERMS_VERSION } from '../shared/terms'
import { BUSINESS_TYPES, businessGroupForType, isBusinessType, isSelectableBusinessType, type BusinessType } from '../shared/business-types'
import { COUNTRIES, isCountryCode, type CountryCode } from '../shared/locations'
import { productKindForCategory, type ProductKind } from '../shared/product-categories'
import { TermsPage } from './TermsPage'
import { LandingPage } from './LandingPage'
import './App.css'

type Language = 'es' | 'en'
type Page = 'dashboard' | 'products' | 'inventory' | 'orders' | 'customers' | 'reports' | 'settings' | 'setup'

type Product = {
  id: string
  name: string
  sku: string
  category: string
  profile: string
  quantity: number
  minStock: number
  unit: string
  cost: number
  price: number
  variant?: string
  serial?: string
  imageUrl?: string
  archivedAt?: string | null
}

type ProductImage = {
  id: string
  contentType: string
  sizeBytes: number
  width: number
  height: number
  position: number
  createdAt: string
  url: string
}

type StockMovement = {
  id: string
  productId: string
  productName: string
  change: number
  before: number
  after: number
  reason: string
  createdAt: string
}

type AuthSession = {
  user: { id: string; email: string; emailVerified: boolean }
  tenant: { id: string; name: string; slug: string; profile: string; businessType: BusinessType; currency: string; role: string; setupCompleted: boolean; countryCode: CountryCode | null; city: string | null; address: string | null; trialStartedAt: string | null; planTier: string }
}

type WorkspaceItem = AuthSession['tenant']

const initialProducts: Product[] = [
  { id: 'p-1', name: 'Camisa deportiva', sku: 'CAM-NEG-M', category: 'Ropa', profile: 'Ropa y calzado', quantity: 18, minStock: 5, unit: 'unidad', cost: 280, price: 520, variant: 'Negra / M' },
  { id: 'p-2', name: 'Taladro percutor 650W', sku: 'FER-TAL-065', category: 'Herramientas', profile: 'Ferretería', quantity: 4, minStock: 5, unit: 'unidad', cost: 1450, price: 2190, serial: 'Serie por unidad' },
  { id: 'p-3', name: 'Cable eléctrico THHN', sku: 'FER-CAB-THHN', category: 'Electricidad', profile: 'Ferretería', quantity: 86, minStock: 20, unit: 'metro', cost: 18, price: 32 },
  { id: 'p-4', name: 'Audífonos Bluetooth', sku: 'TEC-AUD-BT01', category: 'Tecnología', profile: 'Productos sólidos', quantity: 0, minStock: 3, unit: 'unidad', cost: 420, price: 790 },
  { id: 'p-5', name: 'Lámpara de escritorio', sku: 'HOG-LAM-02', category: 'Hogar', profile: 'Inventario personal', quantity: 12, minStock: 2, unit: 'unidad', cost: 0, price: 0 },
]

const copy = {
  es: {
    workspace: 'Mi negocio', owner: 'Plan inicial · Nicaragua', search: 'Buscar productos, pedidos...',
    dashboard: 'Panel principal', products: 'Productos', inventory: 'Inventario', orders: 'Pedidos',
    customers: 'Clientes', reports: 'Reportes', settings: 'Configurar cuenta',     workspaceLabel: 'ESPACIO DE TRABAJO', navAria: 'Navegación principal',
    operations: 'OPERACIONES', management: 'GESTIÓN', overview: 'VISTA GENERAL', welcome: 'Bienvenido a tu panel',
    subtitle: 'Aquí tienes el resumen de tu negocio por hoy.', addProduct: 'Agregar producto',
    totalProducts: 'Productos', stockUnits: 'Unidades en stock', lowStock: 'Stock bajo', inventoryValue: 'Valor del inventario',
    sampleData: 'Datos de muestra', localDemo: 'de este prototipo', accountData: 'datos de la cuenta', stockOverview: 'Resumen de inventario', stockOverviewSub: 'Estado actual de tus productos',
    email: 'Correo electrónico', password: 'Contraseña', signIn: 'Iniciar sesión', register: 'Crear cuenta', currency: 'Moneda',
    clothing: 'Ropa y calzado', hardware: 'Ferretería', solidGoods: 'Productos sólidos', personalProfile: 'Inventario personal',
    businessName: 'Nombre del negocio', createWorkspace: 'Crear cuenta', authTitle: 'Gestiona tu negocio con claridad',
    setupAfterSignUp: 'Después de crear tu cuenta, configurarás tu negocio antes de entrar al panel.',
    accountConfigTitle: 'Configurar cuenta', accountConfigSub: 'Adapta el inventario a tu negocio y define cómo se mostrarán tus precios.',
    businessTypeHelp: 'Esto adapta las categorías y los campos sugeridos al agregar productos. Puedes comenzar y configurarlo aquí cuando estés listo.',
    currencyHelp: 'Esta moneda se usa para mostrar costos y precios. Solo se puede cambiar antes de registrar productos.',
    saveSettings: 'Guardar configuración', settingsSaved: 'Configuración guardada correctamente.',
    ownerOnlySettings: 'Solo el propietario de la cuenta puede cambiar esta configuración.',
    setupTitle: 'Preparemos tu espacio de trabajo', setupIntro: 'Unos datos iniciales nos ayudan a adaptar el inventario. Puedes cambiar estos ajustes más adelante.', setupNameHelp: 'Este nombre identificará tu negocio en la aplicación y en tu catálogo público.',
    location: 'Ubicación (opcional)', locationHelp: 'Estos datos ayudan a identificar dónde opera tu negocio. Puedes completarlos o dejarlos para después.', country: 'País', chooseCountry: 'Selecciona un país', city: 'Ciudad', chooseCity: 'Selecciona una ciudad', address: 'Dirección física', addressPlaceholder: 'Barrio, calle y señas', useGps: 'Usar mi ubicación GPS', gpsLoading: 'Obteniendo ubicación…', gpsDenied: 'No se pudo obtener tu ubicación. Revisa el permiso del navegador.', gpsNoKey: 'Agrega VITE_GOOGLE_MAPS_API_KEY para completar la dirección con Google Maps.', continueDashboard: 'Guardar y entrar al panel', skipLocation: 'Omitir ubicación',
    phone: 'Número de teléfono', phoneCountry: 'País del número', phoneNumber: 'Número', phoneHelp: 'Elige el país del número para agregar el prefijo correcto.', freeTrial: 'Prueba gratis · 7 días', paidPlan: 'Luego $5/mes · hasta 10 productos durante la prueba', trialEnded: 'Prueba terminada · plan de $5/mes', upgradeUnavailable: 'Los pagos aún no están habilitados. Contacta con soporte para activar el plan.',
    authSubtitle: 'Inventario y operaciones en un solo lugar.', noAccount: '¿Aún no tienes cuenta?', haveAccount: '¿Ya tienes cuenta?',
    createAccount: 'Regístrate', backToSignIn: 'Inicia sesión', passwordHint: 'Mínimo 12 caracteres.',
    emailNotice: 'El correo aún no está verificado. La verificación y recuperación por email se habilitarán al configurar un proveedor de correo.',
    authUnavailable: 'No se pudo conectar al API de Pages. Ejecuta npm run dev:stack para usar autenticación local.',
    loading: 'Conectando...', account: 'Cuenta',
    available: 'Disponibles', attention: 'Necesitan atención', outOfStock: 'Agotados', recentProducts: 'Productos recientes',
    recentProductsSub: 'Últimos productos agregados a tu inventario', viewAll: 'Ver todos', product: 'Producto',
    sku: 'SKU', category: 'Categoría', quantity: 'Cantidad', price: 'Precio', status: 'Estado',
    inStock: 'En stock', low: 'Stock bajo', out: 'Agotado', quickActions: 'Acciones rápidas', quickActionsSub: 'Accesos directos a tus tareas frecuentes',
    newProduct: 'Nuevo producto', adjustStock: 'Ajustar inventario', createOrder: 'Crear pedido',
    editProduct: 'Editar producto', updateProduct: 'Guardar cambios', productUpdated: 'Producto actualizado correctamente',
    plan: 'Tu plan', planSub: 'Plan de demostración', notConfigured: 'Facturación no configurada', productsLimit: 'productos', used: 'utilizados',
    seePlans: 'Ver planes', profile: 'Perfil de inventario', personal: 'Inventario personal', store: 'Tienda pública',
    live: 'Activa', viewStore: 'Ver tienda', notifications: 'Notificaciones', help: 'Centro de ayuda', signOut: 'Cerrar sesión',
    productList: 'Catálogo de productos', productListSub: 'Administra los productos y existencias de tu negocio.',
    all: 'Todos', searchProducts: 'Buscar por nombre, SKU o categoría...', filters: 'Filtros',
    showing: 'Mostrando', of: 'de', results: 'productos', previous: 'Anterior', next: 'Siguiente',
    newProductTitle: 'Agregar producto', newProductSub: 'Completa los datos de tu producto. Podrás editarlos después.',
    name: 'Nombre del producto', profileLabel: 'Perfil', unit: 'Unidad de medida', cost: 'Costo unitario',
    minStock: 'Alerta de stock bajo', variant: 'Variante (opcional)', serial: 'Control de serie (opcional)',
    cancel: 'Cancelar', save: 'Guardar producto',     required: 'Este campo es obligatorio', duplicateSku: 'Ya existe un producto con ese SKU.',
    storageError: 'No se pudieron guardar los datos de demostración en este navegador.',
    success: 'Producto agregado correctamente', noResults: 'No se encontraron productos', noResultsHint: 'Prueba con otra búsqueda o agrega un producto nuevo.',
    inventoryTitle: 'Control de inventario', inventorySub: 'Consulta existencias y detecta productos que necesitan atención.',
    allStock: 'Todo el inventario', lowStockTab: 'Stock bajo', outTab: 'Agotados', restock: 'Reabastecer',
    adjustInventory: 'Ajustar existencias', movementHistory: 'Historial de movimientos', movementHistorySub: 'Entradas y salidas registradas en este navegador',
    movement: 'Movimiento', reason: 'Motivo', units: 'Unidades', saveAdjustment: 'Guardar ajuste', movementRecorded: 'Movimiento de inventario registrado',
    zeroMovement: 'El ajuste debe cambiar la existencia actual.',
    eachUnit: 'unidad', bottleUnit: 'botella', boxUnit: 'caja', packageUnit: 'paquete', meterUnit: 'metro',
    centimeterUnit: 'centímetro', kilogramUnit: 'kilogramo', gramUnit: 'gramo', literUnit: 'litro',
    gallonUnit: 'galón', rollUnit: 'rollo',
    selectProduct: 'Selecciona un producto', entry: 'Entrada', exit: 'Salida', correction: 'Corrección', noMovements: 'Aún no hay movimientos',
    previousQuantity: 'Antes', newQuantity: 'Después',
    comingSoon: 'En preparación', comingSoonHint: 'Esta sección forma parte de las siguientes etapas del proyecto.',
    margin: 'Margen estimado', welcomeBack: '¡Qué bueno verte de nuevo!',
    manageImages: 'Gestionar imágenes', addImages: 'Agregar imágenes', imageCount: 'Imágenes',
    imageUploadHint: 'Se convierten a WebP y se optimizan a un máximo de 150 KiB cada una.',
    imageLimit: 'Puedes agregar hasta 5 imágenes por producto.',
    productSavedImageError: 'Producto guardado, pero algunas imágenes no se pudieron subir.',
    imageLoadError: 'No se pudieron cargar las imágenes del producto.',
    imageDeleteError: 'No se pudo eliminar la imagen.',
    storeUnavailable: 'No se pudo cargar esta tienda.',
    storeEmpty: 'No hay productos disponibles por ahora.',
    loadMore: 'Cargar más productos',
    storePowered: 'Tienda creada con TellezSoftware',
    close: 'Cerrar',
    noImages: 'Este producto todavía no tiene imágenes.',
    deleteImage: 'Eliminar imagen',
    archivedProducts: 'Ver archivados',
    activeProducts: 'Ver activos',
    archiveProduct: 'Archivar producto',
    restoreProduct: 'Restaurar producto',
    adjustStockSeparately: 'Ajusta existencias desde Inventario para conservar el historial.',
  },
  en: {
    workspace: 'My business', owner: 'Starter plan · Nicaragua', search: 'Search products, orders...',
    dashboard: 'Dashboard', products: 'Products', inventory: 'Inventory', orders: 'Orders',
    customers: 'Customers', reports: 'Reports', settings: 'Configure account',     workspaceLabel: 'WORKSPACE', navAria: 'Main navigation',
    operations: 'OPERATIONS', management: 'MANAGEMENT', overview: 'OVERVIEW', welcome: 'Welcome to your workspace 👋',
    subtitle: 'Here is your business summary for today.', addProduct: 'Add product',
    totalProducts: 'Products', stockUnits: 'Units in stock', lowStock: 'Low stock', inventoryValue: 'Inventory value',
    sampleData: 'Sample data', localDemo: 'in this prototype', accountData: 'account data', stockOverview: 'Inventory overview', stockOverviewSub: 'Current status of your products',
    email: 'Email address', password: 'Password', signIn: 'Sign in', register: 'Create account', currency: 'Currency',
    clothing: 'Clothing & footwear', hardware: 'Hardware', solidGoods: 'Consumer goods', personalProfile: 'Personal inventory',
    businessName: 'Business name', createWorkspace: 'Create account', authTitle: 'Run your business with clarity',
    setupAfterSignUp: 'After creating your account, you will set up your business before entering the dashboard.',
    accountConfigTitle: 'Configure account', accountConfigSub: 'Tailor your inventory to your business and choose how prices are displayed.',
    businessTypeHelp: 'This adapts suggested categories and fields when adding products. You can start now and set it here when you are ready.',
    currencyHelp: 'This currency is used to display costs and prices. It can only be changed before products are recorded.',
    saveSettings: 'Save settings', settingsSaved: 'Settings saved successfully.',
    ownerOnlySettings: 'Only the account owner can change these settings.',
    setupTitle: 'Let’s set up your workspace', setupIntro: 'A few details help us tailor inventory to your business. You can change these settings later.', setupNameHelp: 'This name identifies your business in the app and public catalog.',
    location: 'Location (optional)', locationHelp: 'These details help identify where your business operates. Fill them in now or later.', country: 'Country', chooseCountry: 'Choose a country', city: 'City', chooseCity: 'Choose a city', address: 'Physical address', addressPlaceholder: 'Neighborhood, street, and directions', useGps: 'Use my GPS location', gpsLoading: 'Getting location…', gpsDenied: 'Could not get your location. Check your browser permission.', gpsNoKey: 'Add VITE_GOOGLE_MAPS_API_KEY to complete the address with Google Maps.', continueDashboard: 'Save and open dashboard', skipLocation: 'Skip location',
    phone: 'Phone number', phoneCountry: 'Phone country', phoneNumber: 'Number', phoneHelp: 'Choose the country for this number to add the correct calling code.', freeTrial: 'Free trial · 7 days', paidPlan: 'Then $5/month · up to 10 products during trial', trialEnded: 'Trial ended · $5/month plan', upgradeUnavailable: 'Payments are not enabled yet. Contact support to activate the plan.',
    authSubtitle: 'Inventory and operations in one place.', noAccount: "Don't have an account?", haveAccount: 'Already have an account?',
    createAccount: 'Sign up', backToSignIn: 'Sign in', passwordHint: 'At least 12 characters.',
    emailNotice: 'Your email is not verified yet. Email verification and recovery will be enabled once an email provider is configured.',
    authUnavailable: 'Could not connect to the Pages API. Run npm run dev:stack to use local authentication.',
    loading: 'Connecting...', account: 'Account',
    available: 'Available', attention: 'Need attention', outOfStock: 'Out of stock', recentProducts: 'Recent products',
    recentProductsSub: 'Recently added to your inventory', viewAll: 'View all', product: 'Product',
    sku: 'SKU', category: 'Category', quantity: 'Quantity', price: 'Price', status: 'Status',
    inStock: 'In stock', low: 'Low stock', out: 'Out of stock', quickActions: 'Quick actions', quickActionsSub: 'Shortcuts to common tasks',
    newProduct: 'New product', adjustStock: 'Adjust inventory', createOrder: 'Create order',
    editProduct: 'Edit product', updateProduct: 'Save changes', productUpdated: 'Product updated successfully',
    plan: 'Your plan', planSub: 'Demo plan', notConfigured: 'Billing not configured', productsLimit: 'products', used: 'used',
    seePlans: 'View plans', profile: 'Inventory profile', personal: 'Personal inventory', store: 'Public store',
    live: 'Active', viewStore: 'View store', notifications: 'Notifications', help: 'Help center', signOut: 'Sign out',
    productList: 'Product catalog', productListSub: 'Manage your products and business inventory.',
    all: 'All', searchProducts: 'Search by name, SKU or category...', filters: 'Filters',
    showing: 'Showing', of: 'of', results: 'products', previous: 'Previous', next: 'Next',
    newProductTitle: 'Add product', newProductSub: 'Enter your product details. You can edit them later.',
    name: 'Product name', profileLabel: 'Profile', unit: 'Unit of measure', cost: 'Unit cost',
    minStock: 'Low stock alert', variant: 'Variant (optional)', serial: 'Serial tracking (optional)',
    cancel: 'Cancel', save: 'Save product',     required: 'This field is required', duplicateSku: 'A product with this SKU already exists.',
    storageError: 'Could not save demo data in this browser.',
    success: 'Product added successfully', noResults: 'No products found', noResultsHint: 'Try another search or add a new product.',
    inventoryTitle: 'Inventory control', inventorySub: 'Review stock and find products that need attention.',
    allStock: 'All inventory', lowStockTab: 'Low stock', outTab: 'Out of stock', restock: 'Restock',
    adjustInventory: 'Adjust stock', movementHistory: 'Movement history', movementHistorySub: 'Stock changes recorded in this browser',
    movement: 'Movement', reason: 'Reason', units: 'Units', saveAdjustment: 'Save adjustment', movementRecorded: 'Inventory movement recorded',
    zeroMovement: 'The adjustment must change the current stock.',
    eachUnit: 'unit', bottleUnit: 'bottle', boxUnit: 'box', packageUnit: 'package', meterUnit: 'meter',
    centimeterUnit: 'centimeter', kilogramUnit: 'kilogram', gramUnit: 'gram', literUnit: 'liter',
    gallonUnit: 'gallon', rollUnit: 'roll',
    selectProduct: 'Select a product', entry: 'Stock in', exit: 'Stock out', correction: 'Correction', noMovements: 'No movements yet',
    previousQuantity: 'Before', newQuantity: 'After',
    comingSoon: 'Coming soon', comingSoonHint: 'This section is part of the next project milestones.',
    margin: 'Estimated margin', welcomeBack: 'Welcome back!',
    manageImages: 'Manage images', addImages: 'Add images', imageCount: 'Images',
    imageUploadHint: 'Images are converted to WebP and optimized to a maximum of 150 KiB each.',
    imageLimit: 'You can add up to 5 images per product.',
    productSavedImageError: 'Product saved, but some images could not be uploaded.',
    imageLoadError: 'Could not load product images.',
    imageDeleteError: 'Could not delete the image.',
    storeUnavailable: 'Could not load this store.',
    storeEmpty: 'There are no available products right now.',
    loadMore: 'Load more products',
    storePowered: 'Store created with TellezSoftware',
    close: 'Close',
    noImages: 'This product has no images yet.',
    deleteImage: 'Delete image',
    archivedProducts: 'View archived',
    activeProducts: 'View active',
    archiveProduct: 'Archive product',
    restoreProduct: 'Restore product',
    adjustStockSeparately: 'Adjust stock from Inventory to preserve the movement history.',
  },
} as const

type Texts = { [Key in keyof typeof copy.es]: string }

const appStartedAt = new Date()

const navGroups: { label: 'operations' | 'management'; items: { id: Page; icon: typeof LayoutDashboard }[] }[] = [
  { label: 'operations', items: [{ id: 'dashboard', icon: LayoutDashboard }, { id: 'products', icon: Package }, { id: 'inventory', icon: Warehouse }, { id: 'orders', icon: ShoppingBag }, { id: 'customers', icon: Users }] },
  { label: 'management', items: [{ id: 'reports', icon: FileBarChart }, { id: 'settings', icon: Settings }] },
]

const profiles = ['Ropa y calzado', 'Ferretería', 'Productos sólidos', 'Inventario personal']

const profileCodes: Record<string, string> = {
  'Ropa y calzado': 'clothing',
  Ferretería: 'hardware',
  'Productos sólidos': 'solid_goods',
  'Inventario personal': 'personal',
}

function profileLabel(code: string): string {
  return Object.entries(profileCodes).find(([, value]) => value === code)?.[0] ?? profiles[0]
}

function businessTypeText(businessType: BusinessType, language: Language): string {
  const labels: Record<BusinessType, { es: string; en: string }> = {
    clothing: { es: 'Ropa y calzado', en: 'Clothing & footwear' },
    hardware: { es: 'Ferretería y repuestos', en: 'Hardware & auto parts' },
    electronics: { es: 'Electrónica', en: 'Electronics' },
    auto_parts: { es: 'Repuestos de vehículos', en: 'Automotive parts' },
    food: { es: 'Alimentos y bebidas', en: 'Food & beverages' },
    liquor: { es: 'Licorería', en: 'Liquor store' },
    general: { es: 'Tienda general', en: 'General store' },
    personal: { es: 'Inventario personal', en: 'Personal inventory' },
  }
  return labels[businessType][language]
}

function dashboardContext(businessType: BusinessType, language: Language): string {
  const contexts: Record<BusinessType, { es: string; en: string }> = {
    clothing: { es: 'Resumen de tu tienda de ropa y calzado.', en: 'Your clothing and footwear store summary.' },
    hardware: { es: 'Resumen de tu ferretería y repuestos.', en: 'Your hardware and auto parts summary.' },
    electronics: { es: 'Resumen de tu tienda de electrónica.', en: 'Your electronics store summary.' },
    auto_parts: { es: 'Resumen de tu negocio de repuestos.', en: 'Your automotive parts business summary.' },
    food: { es: 'Resumen de tu negocio de alimentos y bebidas.', en: 'Your food and beverages business summary.' },
    liquor: { es: 'Resumen de tu licorería.', en: 'Your liquor store summary.' },
    general: { es: 'Resumen de tu tienda general.', en: 'Your general store summary.' },
    personal: { es: 'Resumen de tu inventario personal.', en: 'Your personal inventory summary.' },
  }
  return contexts[businessType][language]
}

function variantFieldCopy(kind: ProductKind, language: Language): { label: string; placeholder: string } {
  const copyByKind: Record<ProductKind, { es: { label: string; placeholder: string }; en: { label: string; placeholder: string } }> = {
    clothing: { es: { label: 'Color o talla (opcional)', placeholder: 'Ej. Azul / Talla M' }, en: { label: 'Color or size (optional)', placeholder: 'e.g. Blue / Size M' } },
    hardware: { es: { label: 'Medida o material (opcional)', placeholder: 'Ej. 1/2 pulg. / acero' }, en: { label: 'Size or material (optional)', placeholder: 'e.g. 1/2 in / steel' } },
    electronics: { es: { label: 'Modelo o especificación (opcional)', placeholder: 'Ej. 128 GB / negro' }, en: { label: 'Model or specification (optional)', placeholder: 'e.g. 128 GB / black' } },
    auto_parts: { es: { label: 'Compatibilidad (opcional)', placeholder: 'Ej. Modelo / año' }, en: { label: 'Compatibility (optional)', placeholder: 'e.g. Model / year' } },
    food: { es: { label: 'Peso o presentación (opcional)', placeholder: 'Ej. 500 g / paquete' }, en: { label: 'Weight or packaging (optional)', placeholder: 'e.g. 500 g / package' } },
    beverages: { es: { label: 'Volumen o presentación (opcional)', placeholder: 'Ej. 750 ml / caja de 12' }, en: { label: 'Volume or packaging (optional)', placeholder: 'e.g. 750 ml / case of 12' } },
    general: { es: { label: 'Detalle adicional (opcional)', placeholder: 'Ej. Material o presentación' }, en: { label: 'Additional detail (optional)', placeholder: 'e.g. Material or packaging' } },
  }
  return copyByKind[kind][language]
}

function unitText(unit: string, t: Texts): string {
  const units: Record<string, string> = {
    unidad: t.eachUnit,
    botella: t.bottleUnit,
    caja: t.boxUnit,
    paquete: t.packageUnit,
    metro: t.meterUnit,
    centímetro: t.centimeterUnit,
    kilogramo: t.kilogramUnit,
    gramo: t.gramUnit,
    litro: t.literUnit,
    galón: t.gallonUnit,
    rollo: t.rollUnit,
  }
  return units[unit] ?? unit
}

function defaultUnit(businessType: BusinessType): string {
  if (businessType === 'liquor') return 'botella'
  if (businessType === 'food') return 'kilogramo'
  return 'unidad'
}

function unitsForProductKind(kind: ProductKind): string[] {
  switch (kind) {
    case 'clothing':
      return ['unidad', 'paquete', 'caja']
    case 'hardware':
      return ['unidad', 'caja', 'paquete', 'metro', 'centímetro', 'kilogramo', 'gramo', 'rollo']
    case 'auto_parts':
    case 'electronics':
      return ['unidad', 'caja', 'paquete']
    case 'food':
      return ['kilogramo', 'gramo', 'unidad', 'paquete', 'caja', 'litro']
    case 'beverages':
      return ['botella', 'caja', 'litro', 'galón']
    case 'general':
      return ['unidad', 'caja', 'paquete', 'kilogramo', 'litro']
  }
}

function categorySuggestions(businessType: BusinessType, language: Language): string[] {
  const suggestions: Record<BusinessType, { es: string[]; en: string[] }> = {
    clothing: { es: ['Ropa', 'Calzado', 'Accesorios'], en: ['Clothing', 'Footwear', 'Accessories'] },
    hardware: { es: ['Herramientas', 'Materiales', 'Repuestos'], en: ['Tools', 'Materials', 'Auto parts'] },
    electronics: { es: ['Tecnología', 'Celulares', 'Accesorios'], en: ['Technology', 'Phones', 'Accessories'] },
    auto_parts: { es: ['Repuestos', 'Frenos', 'Motor'], en: ['Auto parts', 'Brakes', 'Engine'] },
    food: { es: ['Alimentos', 'Granos', 'Bebidas'], en: ['Food', 'Grains', 'Beverages'] },
    liquor: { es: ['Bebidas', 'Vinos', 'Licores'], en: ['Beverages', 'Wines', 'Liquor'] },
    general: { es: ['Hogar', 'Oficina', 'Tecnología', 'Ropa', 'Bebidas'], en: ['Home', 'Office', 'Technology', 'Clothing', 'Beverages'] },
    personal: { es: ['Hogar', 'Oficina', 'Tecnología'], en: ['Home', 'Office', 'Technology'] },
  }
  return suggestions[businessType][language]
}

function categoryPlaceholder(businessType: BusinessType, language: Language): string {
  return `${language === 'es' ? 'Ej.' : 'e.g.'} ${categorySuggestions(businessType, language)[0]}`
}

class ApiResponseError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function requestApi(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST'): Promise<unknown> {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  let data: unknown
  try {
    data = await response.json()
  } catch {
    data = null
  }
  if (!response.ok) {
    const message = isRecord(data) && typeof data.error === 'string'
      ? data.error
      : `La solicitud falló (HTTP ${response.status}).`
    throw new ApiResponseError(message, response.status)
  }
  if (!isRecord(data)) throw new Error('El API devolvió una respuesta no válida.')
  return data
}

async function requestImageApi(path: string, blob: Blob): Promise<ProductImage> {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'image/webp' },
    body: blob,
  })
  let value: unknown
  try {
    value = await response.json()
  } catch {
    value = null
  }
  if (!response.ok) {
    const message = isRecord(value) && typeof value.error === 'string'
      ? value.error
      : `La solicitud falló (HTTP ${response.status}).`
    throw new ApiResponseError(message, response.status)
  }
  if (!isRecord(value)
    || typeof value.id !== 'string' || value.contentType !== 'image/webp'
    || typeof value.sizeBytes !== 'number' || typeof value.width !== 'number'
    || typeof value.height !== 'number' || typeof value.position !== 'number'
    || typeof value.createdAt !== 'string' || typeof value.url !== 'string') {
    throw new Error('El API devolvió metadatos de imagen no válidos.')
  }
  return {
    id: value.id,
    contentType: value.contentType,
    sizeBytes: value.sizeBytes,
    width: value.width,
    height: value.height,
    position: value.position,
    createdAt: value.createdAt,
    url: value.url,
  }
}

async function compressImage(file: File): Promise<Blob> {
  const image = await createImageBitmap(file)
  try {
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height))
    let width = Math.max(1, Math.round(image.width * scale))
    let height = Math.max(1, Math.round(image.height * scale))
    const qualities = [0.82, 0.74, 0.66, 0.58, 0.5, 0.42, 0.34]

    for (let resize = 0; resize < 5; resize += 1) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('No se pudo preparar la imagen para optimizarla.')
      context.drawImage(image, 0, 0, width, height)

      for (const quality of qualities) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
        if (blob?.type === 'image/webp' && blob.size > 0 && blob.size <= 150 * 1024) return blob
      }
      width = Math.max(1, Math.floor(width * 0.82))
      height = Math.max(1, Math.floor(height * 0.82))
    }
    throw new Error('Esta imagen no pudo reducirse a 150 KiB. Prueba con otra imagen.')
  } finally {
    image.close()
  }
}

async function loadApiWorkspace(): Promise<{ session: AuthSession; products: Product[]; movements: StockMovement[]; workspaces: WorkspaceItem[] }> {
  const value = await requestApi('/api/auth/me')
  if (!isRecord(value) || !isRecord(value.user) || !isRecord(value.tenant)) throw new Error('La sesión recibida no es válida.')
  const { user, tenant } = value
  if (typeof user.id !== 'string' || typeof user.email !== 'string' || typeof user.emailVerified !== 'boolean'
    || typeof tenant.id !== 'string' || typeof tenant.name !== 'string' || typeof tenant.slug !== 'string' || typeof tenant.profile !== 'string'
    || !isBusinessType(tenant.businessType)
    || typeof tenant.currency !== 'string' || typeof tenant.role !== 'string' || typeof tenant.setupCompleted !== 'boolean'
    || !(tenant.countryCode === null || isCountryCode(tenant.countryCode))
    || !(tenant.city === null || typeof tenant.city === 'string') || !(tenant.address === null || typeof tenant.address === 'string')
    || !(tenant.trialStartedAt === null || typeof tenant.trialStartedAt === 'string') || typeof tenant.planTier !== 'string') {
    throw new Error('La sesión recibida no contiene datos de espacio de trabajo válidos.')
  }

  const [productValue, movementValue, workspaceValue] = await Promise.all([
    requestApi('/api/products?limit=100'),
    requestApi('/api/inventory/movements?limit=100'),
    requestApi('/api/workspaces'),
  ])
  if (!isRecord(productValue) || !Array.isArray(productValue.items)
    || !isRecord(movementValue) || !Array.isArray(movementValue.items)
    || !isRecord(workspaceValue) || !Array.isArray(workspaceValue.items)) {
    throw new Error('El inventario recibido no tiene el formato esperado.')
  }
  const workspaces = workspaceValue.items.map((item): WorkspaceItem => {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string'
      || typeof item.slug !== 'string' || typeof item.profile !== 'string'
      || !isBusinessType(item.businessType) || typeof item.currency !== 'string'
      || typeof item.role !== 'string') {
      throw new Error('La lista de negocios recibida no tiene un formato válido.')
    }
    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      profile: item.profile,
      businessType: item.businessType,
      currency: item.currency,
      role: item.role,
      setupCompleted: Boolean(item.setupCompleted), countryCode: null, city: null, address: null, trialStartedAt: null, planTier: 'free',
    }
  })
  return {
    session: {
      user: { id: user.id, email: user.email, emailVerified: user.emailVerified },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, profile: tenant.profile, businessType: tenant.businessType, currency: tenant.currency, role: tenant.role, setupCompleted: tenant.setupCompleted, countryCode: tenant.countryCode, city: tenant.city, address: tenant.address, trialStartedAt: tenant.trialStartedAt, planTier: tenant.planTier },
    },
    products: productValue.items.map(mapApiProduct),
    movements: movementValue.items.map(mapApiMovement),
    workspaces,
  }
}

function mapApiProduct(value: unknown): Product {
  if (!isRecord(value)
    || typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.sku !== 'string'
    || typeof value.category !== 'string' || typeof value.profile !== 'string'
    || typeof value.quantity !== 'number' || typeof value.minStock !== 'number'
    || typeof value.unit !== 'string' || typeof value.cost !== 'number' || typeof value.price !== 'number') {
    throw new Error('El API devolvió un producto con datos no válidos.')
  }
  return {
    id: value.id,
    name: value.name,
    sku: value.sku,
    category: value.category,
    profile: profileLabel(value.profile),
    quantity: value.quantity,
    minStock: value.minStock,
    unit: value.unit,
    cost: value.cost,
    price: value.price,
    variant: typeof value.variant === 'string' ? value.variant : undefined,
    serial: typeof value.serial === 'string' ? value.serial : undefined,
    imageUrl: typeof value.imageUrl === 'string' ? value.imageUrl : undefined,
    archivedAt: typeof value.archivedAt === 'string' ? value.archivedAt : null,
  }
}

function mapApiMovement(value: unknown): StockMovement {
  if (!isRecord(value)
    || typeof value.id !== 'string' || typeof value.productId !== 'string'
    || typeof value.productName !== 'string' || typeof value.change !== 'number'
    || typeof value.before !== 'number' || typeof value.after !== 'number'
    || typeof value.reason !== 'string' || typeof value.createdAt !== 'string') {
    throw new Error('El API devolvió un movimiento de inventario no válido.')
  }
  return {
    id: value.id,
    productId: value.productId,
    productName: value.productName,
    change: value.change,
    before: value.before,
    after: value.after,
    reason: value.reason,
    createdAt: value.createdAt,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isProductImage(value: unknown): value is ProductImage {
  return isRecord(value)
    && typeof value.id === 'string'
    && value.contentType === 'image/webp'
    && typeof value.sizeBytes === 'number'
    && typeof value.width === 'number'
    && typeof value.height === 'number'
    && typeof value.position === 'number'
    && typeof value.createdAt === 'string'
    && typeof value.url === 'string'
}

function isProduct(value: unknown): value is Product {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.sku === 'string'
    && typeof value.category === 'string'
    && typeof value.profile === 'string'
    && typeof value.quantity === 'number'
    && Number.isFinite(value.quantity)
    && typeof value.minStock === 'number'
    && Number.isFinite(value.minStock)
    && typeof value.unit === 'string'
    && typeof value.cost === 'number'
    && Number.isFinite(value.cost)
    && typeof value.price === 'number'
    && Number.isFinite(value.price)
}

function isStockMovement(value: unknown): value is StockMovement {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.productId === 'string'
    && typeof value.productName === 'string'
    && typeof value.change === 'number'
    && Number.isFinite(value.change)
    && typeof value.before === 'number'
    && Number.isFinite(value.before)
    && typeof value.after === 'number'
    && Number.isFinite(value.after)
    && typeof value.reason === 'string'
    && typeof value.createdAt === 'string'
}

function readProducts(): Product[] {
  try {
    const saved = localStorage.getItem('tellez-demo-products')
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.every(isProduct)) return parsed
      console.error('Ignoring invalid local demo product data.')
    }
  } catch {
    console.error('Could not read the local demo product data.')
  }
  return initialProducts
}

function readMovements(): StockMovement[] {
  try {
    const saved = localStorage.getItem('tellez-demo-movements')
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.every(isStockMovement)) return parsed
      console.error('Ignoring invalid local demo inventory movement history.')
    }
  } catch {
    console.error('Could not read the local demo inventory movement history.')
  }
  return []
}

function persistDemoData(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Could not persist local demo data: ${key}.`, error)
    return false
  }
}

function money(amount: number, currency = 'NIO') {
  return new Intl.NumberFormat('es-NI', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function stockState(product: Product): 'in' | 'low' | 'out' {
  if (product.quantity <= 0) return 'out'
  if (product.quantity <= product.minStock) return 'low'
  return 'in'
}

function WorkspaceApp() {
  const [language, setLanguage] = useState<Language>('es')
  const t = copy[language]
  const entryPath = window.location.pathname.replace(/\/+$/u, '') || '/'
  const showsSignIn = entryPath === '/ingresar'
  const showsLanding = entryPath === '/bienvenida'
  const initialAuthMode = showsSignIn && new URLSearchParams(window.location.search).get('mode') === 'register' ? 'register' : 'login'
  const [apiStatus, setApiStatus] = useState<'checking' | 'ready' | 'unavailable'>('checking')
  const [session, setSession] = useState<AuthSession | null>(null)
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([])
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)
  const [workspaceActionBusy, setWorkspaceActionBusy] = useState(false)
  const [page, setPage] = useState<Page>('dashboard')
  const [setupName, setSetupName] = useState('')
  const [setupBusinessType, setSetupBusinessType] = useState<BusinessType>('general')
  const [setupCurrency, setSetupCurrency] = useState('NIO')
  const [setupCountry, setSetupCountry] = useState<CountryCode | ''>('')
  const [setupCity, setSetupCity] = useState('')
  const [setupAddress, setSetupAddress] = useState('')
  const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>('NI')
  const [customPhoneDialCode, setCustomPhoneDialCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [setupBusy, setSetupBusy] = useState(false)
  const [gpsBusy, setGpsBusy] = useState(false)
  const [gpsMapUrl, setGpsMapUrl] = useState('')
  const [setupError, setSetupError] = useState('')
  const [products, setProducts] = useState<Product[]>(readProducts)
  const [productPageItems, setProductPageItems] = useState<Product[]>([])
  const [productPageCursorState, setProductPageCursorState] = useState<{ key: string; cursors: (string | null)[] }>({ key: '', cursors: [null] })
  const [productPageNextCursor, setProductPageNextCursor] = useState<string | null>(null)
  const [productPageTotal, setProductPageTotal] = useState(0)
  const [productPageLoading, setProductPageLoading] = useState(false)
  const [movements, setMovements] = useState<StockMovement[]>(readMovements)
  const [query, setQuery] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'low' | 'out'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState(profiles[3])
  const [showArchived, setShowArchived] = useState(false)
  const [imageProduct, setImageProduct] = useState<Product | null>(null)
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [imageModalBusy, setImageModalBusy] = useState(false)
  const [imageModalError, setImageModalError] = useState('')
  const productPageRequest = useRef(0)
  const productPageKey = `${showArchived ? 'archived' : 'active'}:${stockFilter}:${query.trim()}`
  const productPageCursors = productPageCursorState.key === productPageKey ? productPageCursorState.cursors : [null]
  const activePageNextCursor = productPageCursorState.key === productPageKey ? productPageNextCursor : null

  const fetchProductsPage = useCallback(async (cursor: string | null, pageIndex: number) => {
    const requestId = productPageRequest.current + 1
    productPageRequest.current = requestId
    const parameters = new URLSearchParams({ limit: '25', q: query.trim(), status: stockFilter, archived: showArchived ? 'archived' : 'active' })
    if (cursor) parameters.set('cursor', cursor)
    setProductPageLoading(true)
    try {
      const result = await requestApi(`/api/products?${parameters.toString()}`)
      if (!isRecord(result) || !Array.isArray(result.items)
        || !(result.nextCursor === null || typeof result.nextCursor === 'string')
        || typeof result.total !== 'number') {
        throw new Error('La página de productos recibida no tiene un formato válido.')
      }
      const items = result.items.map(mapApiProduct)
      if (requestId !== productPageRequest.current) return
      setProductPageItems(items)
      setProductPageNextCursor(result.nextCursor)
      setProductPageTotal(result.total)
      setProductPageCursorState((current) => {
        const cursors = current.key === productPageKey ? current.cursors : [null]
        return { key: productPageKey, cursors: cursors.length - 1 === pageIndex ? cursors : cursors.slice(0, pageIndex + 1) }
      })
    } catch (error) {
      if (requestId === productPageRequest.current) setToast(error instanceof Error ? error.message : t.authUnavailable)
    } finally {
      if (requestId === productPageRequest.current) setProductPageLoading(false)
    }
  }, [productPageKey, query, showArchived, stockFilter, t.authUnavailable])

  useEffect(() => {
    let active = true
    loadApiWorkspace().then((workspace) => {
      if (!active) return
      setSession(workspace.session)
      if (!workspace.session.tenant.setupCompleted && workspace.session.tenant.role === 'owner') {
        setSetupName('')
        setSetupBusinessType(workspace.session.tenant.businessType)
        setSetupCurrency(workspace.session.tenant.currency)
        setPage('setup')
      }
      setProducts(workspace.products)
      setMovements(workspace.movements)
      setWorkspaces(workspace.workspaces)
      setProfile(profileLabel(workspace.session.tenant.profile))
      setApiStatus('ready')
    }).catch((error: unknown) => {
      if (!active) return
      if (error instanceof ApiResponseError && error.status === 401) {
        setApiStatus('ready')
        return
      }
      console.error('Could not initialize the Pages API session.', error)
      setApiStatus('unavailable')
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    if (session && showsSignIn) window.history.replaceState(null, '', '/')
  }, [session, showsSignIn])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!session || page !== 'products') return
    const timer = window.setTimeout(() => { void fetchProductsPage(null, 0) }, 180)
    return () => window.clearTimeout(timer)
  }, [session, page, fetchProductsPage])

  const lowProducts = products.filter((item) => stockState(item) === 'low')
  const outProducts = products.filter((item) => stockState(item) === 'out')
  const currentProductList = products
  const filteredProducts = useMemo(() => currentProductList.filter((item) => {
    const matchesText = `${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(query.toLowerCase())
    const state = stockState(item)
    return matchesText && (stockFilter === 'all' || state === stockFilter)
  }), [currentProductList, query, stockFilter])
  const availableUnits = products.reduce((sum, item) => sum + item.quantity, 0)
  const inventoryValue = products.reduce((sum, item) => sum + item.quantity * item.cost, 0)

  async function refreshWorkspace() {
    const workspace = await loadApiWorkspace()
    setSession(workspace.session)
    setProducts(workspace.products)
    setMovements(workspace.movements)
    setWorkspaces(workspace.workspaces)
    setProfile(profileLabel(workspace.session.tenant.profile))
    setApiStatus('ready')
  }

  async function signIn(email: string, password: string) {
    await requestApi('/api/auth/login', { email, password })
    await refreshWorkspace()
    if (showsSignIn) window.history.replaceState(null, '', '/')
  }

  async function register(email: string, password: string, acceptedTermsVersion: string) {
    await requestApi('/api/auth/register', { email, password, acceptedTermsVersion })
    await refreshWorkspace()
    setPage('setup')
    if (showsSignIn) window.history.replaceState(null, '', '/')
  }

  async function completeSetup(skipLocation = false) {
    if (!session) return
    setSetupError('')
    setSetupBusy(true)
    try {
      const result = await requestApi('/api/workspaces/setup', {
        name: setupName,
        businessType: setupBusinessType,
        currency: setupCurrency,
        countryCode: skipLocation ? null : setupCountry || null,
        city: skipLocation ? null : setupCity || null,
        address: skipLocation ? '' : setupAddress,
        phoneCountryCode,
        customPhoneDialCode,
        phoneNumber,
      }, 'PATCH')
      await refreshWorkspace()
      if (!isRecord(result) || result.setupCompleted !== true) throw new Error('No se confirmó la configuración de la cuenta.')
      setPage('dashboard')
    } catch (error) {
      setSetupError(error instanceof Error ? error.message : t.authUnavailable)
    } finally {
      setSetupBusy(false)
    }
  }

  async function useGpsLocation() {
    if (!navigator.geolocation) { setSetupError(t.gpsDenied); return }
    setGpsBusy(true)
    setSetupError('')
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const coordinates = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
      const mapUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
      setGpsMapUrl(mapUrl)
      setSetupAddress((current) => current.trim() ? `${current.trim()} (${coordinates})`.slice(0, 300) : coordinates)
      setGpsBusy(false)
    }, () => { setSetupError(t.gpsDenied); setGpsBusy(false) }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 })
  }

  async function saveAccountSettings(businessType: BusinessType, currency: string) {
    await requestApi('/api/workspaces/settings', { businessType, currency }, 'PATCH')
    await refreshWorkspace()
  }

  async function selectWorkspace(workspaceId: string) {
    if (workspaceId === session?.tenant.id) {
      setWorkspaceMenuOpen(false)
      return
    }
    setWorkspaceActionBusy(true)
    try {
      await requestApi('/api/workspaces/switch', { workspaceId })
      await refreshWorkspace()
      setPage('dashboard')
      setProductPageCursorState({ key: '', cursors: [null] })
      setWorkspaceMenuOpen(false)
    } catch (error) {
      setToast(error instanceof Error ? error.message : t.authUnavailable)
    } finally {
      setWorkspaceActionBusy(false)
    }
  }

  async function initializeBusinessWorkspaces() {
    setWorkspaceActionBusy(true)
    try {
      const result = await requestApi('/api/workspaces/initialize-types', {})
      if (!isRecord(result) || typeof result.created !== 'number') {
        throw new Error('El API no confirmó la preparación de los negocios.')
      }
      await refreshWorkspace()
      setToast(language === 'es'
        ? result.created === 0 ? 'Ya estaban preparados los ocho negocios.' : `Se prepararon ${result.created} negocios con inventarios separados.`
        : result.created === 0 ? 'All eight businesses were already set up.' : `Set up ${result.created} businesses with separate inventories.`)
    } catch (error) {
      setToast(error instanceof Error ? error.message : t.authUnavailable)
    } finally {
      setWorkspaceActionBusy(false)
    }
  }

  async function signOut() {
    try {
      await requestApi('/api/auth/logout', {}, 'POST')
      setSession(null)
      setProducts(initialProducts)
      setMovements([])
      setWorkspaces([])
      setWorkspaceMenuOpen(false)
      setApiStatus('ready')
      setPage('dashboard')
    } catch (error) {
      setToast(error instanceof Error ? error.message : t.authUnavailable)
    }
  }

  async function returnToSignIn() {
    await signOut()
    window.location.assign('/ingresar')
  }

  async function saveProduct(product: Product, imageFiles: File[] = []) {
    if (session) {
      try {
        const isEditing = Boolean(editingProduct)
        const result = await requestApi(
          isEditing && editingProduct ? `/api/products/${encodeURIComponent(editingProduct.id)}` : '/api/products',
          {
            name: product.name,
            sku: product.sku,
            category: product.category,
            profile: profileCodes[product.profile],
            unit: product.unit,
            quantity: product.quantity,
            minStock: product.minStock,
            cost: product.cost,
            price: product.price,
            variant: product.variant,
            serial: product.serial,
          },
          isEditing ? 'PATCH' : 'POST',
        )
        if (!isRecord(result) || typeof result.id !== 'string') throw new Error('El API no devolvió el identificador del producto.')
        const productId = result.id
        let savedProduct = isEditing ? mapApiProduct(result) : { ...product, id: productId }
        if (isEditing) {
          savedProduct = { ...savedProduct, imageUrl: editingProduct?.imageUrl }
          setProducts((current) => current.map((item) => item.id === productId ? savedProduct : item))
          setProductPageItems((current) => current.map((item) => item.id === productId ? savedProduct : item))
        } else {
          setProducts((current) => [savedProduct, ...current])
          setProductPageItems((current) => [savedProduct, ...current].slice(0, 25))
        }
        const movementId = result.movementId
        if (!isEditing && typeof movementId === 'string' && product.quantity > 0) {
          setMovements((current) => [{
            id: movementId,
            productId,
            productName: product.name,
            change: product.quantity,
            before: 0,
            after: product.quantity,
            reason: language === 'es' ? 'Existencia inicial del producto' : 'Initial product stock',
            createdAt: new Date().toISOString(),
          }, ...current])
        }
        setModalOpen(false)
        setEditingProduct(null)
        let uploadFailed = false
        for (const file of imageFiles) {
          try {
            const optimized = await compressImage(file)
            const uploaded = await requestImageApi(`/api/products/${encodeURIComponent(productId)}/images`, optimized)
            if (!savedProduct.imageUrl) {
              savedProduct = { ...savedProduct, imageUrl: uploaded.url }
              setProducts((current) => current.map((item) => item.id === productId ? savedProduct : item))
              setProductPageItems((current) => current.map((item) => item.id === productId ? savedProduct : item))
            }
          } catch (uploadError) {
            console.error('Product image upload failed.', uploadError)
            uploadFailed = true
          }
        }
        setToast(uploadFailed ? t.productSavedImageError : isEditing ? t.productUpdated : t.success)
      } catch (error) {
        setToast(error instanceof Error ? error.message : t.authUnavailable)
      }
      return
    }

    const isEditing = products.some((item) => item.id === product.id)
    const updatedProducts = isEditing ? products.map((item) => item.id === product.id ? product : item) : [product, ...products]
    setProducts(updatedProducts)
    const persisted = persistDemoData('tellez-demo-products', updatedProducts)
    setModalOpen(false)
    setEditingProduct(null)
    setToast(persisted ? (isEditing ? t.productUpdated : t.success) : t.storageError)
  }

  function goToNextProductPage() {
    if (!productPageNextCursor || productPageLoading) return
    const next = productPageNextCursor
    setProductPageCursorState({ key: productPageKey, cursors: [...productPageCursors, next] })
    void fetchProductsPage(next, productPageCursors.length)
  }

  function goToPreviousProductPage() {
    if (productPageCursors.length <= 1 || productPageLoading) return
    const previous = productPageCursors[productPageCursors.length - 2]
    setProductPageCursorState({ key: productPageKey, cursors: productPageCursors.slice(0, -1) })
    void fetchProductsPage(previous, productPageCursors.length - 2)
  }

  async function toggleProductArchive(product: Product) {
    const archived = !product.archivedAt
    if (archived && !window.confirm(language === 'es'
      ? `¿Archivar "${product.name}"? No aparecerá en el catálogo, pero podrás restaurarlo.`
      : `Archive "${product.name}"? It will disappear from the catalog, but you can restore it.`)) return
    try {
      await requestApi(`/api/products/${encodeURIComponent(product.id)}`, { archived }, 'PATCH')
      if (archived) {
        setProducts((current) => current.filter((item) => item.id !== product.id))
      } else {
        setProducts((current) => [{ ...product, archivedAt: null }, ...current])
      }
      void fetchProductsPage(productPageCursors.at(-1) ?? null, productPageCursors.length - 1)
      setToast(archived
        ? (language === 'es' ? 'Producto archivado; puedes restaurarlo desde la lista de archivados.' : 'Product archived; restore it from the archived list.')
        : (language === 'es' ? 'Producto restaurado.' : 'Product restored.'))
    } catch (error) {
      setToast(error instanceof Error ? error.message : t.authUnavailable)
    }
  }

  async function openImageManager(product: Product) {
    setImageProduct(product)
    setProductImages([])
    setImageModalError('')
    setImageModalBusy(true)
    try {
      const result = await requestApi(`/api/products/${encodeURIComponent(product.id)}/images`)
      if (!isRecord(result) || !Array.isArray(result.items)) {
        throw new Error('La lista de imágenes no tiene el formato esperado.')
      }
      const images = result.items.filter(isProductImage)
      if (images.length !== result.items.length) throw new Error('El API devolvió metadatos de imagen no válidos.')
      setProductImages(images)
    } catch (error) {
      setImageModalError(error instanceof Error ? error.message : t.imageLoadError)
    } finally {
      setImageModalBusy(false)
    }
  }

  async function addProductImage(file: File) {
    if (!imageProduct) throw new Error('No se seleccionó un producto.')
    const optimized = await compressImage(file)
    const image = await requestImageApi(
      `/api/products/${encodeURIComponent(imageProduct.id)}/images`,
      optimized,
    )
    setProductImages((current) => [...current, image].sort((a, b) => a.position - b.position))
    if (!imageProduct.imageUrl) {
      setImageProduct((current) => current ? { ...current, imageUrl: image.url } : current)
      setProducts((current) => current.map((item) => item.id === imageProduct.id ? { ...item, imageUrl: image.url } : item))
      setProductPageItems((current) => current.map((item) => item.id === imageProduct.id ? { ...item, imageUrl: image.url } : item))
    }
  }

  async function removeProductImage(image: ProductImage) {
    if (!imageProduct) return
    const response = await fetch(
      `/api/products/${encodeURIComponent(imageProduct.id)}/images/${encodeURIComponent(image.id)}`,
      { method: 'DELETE', credentials: 'same-origin' },
    )
    if (!response.ok) {
      let message = `La solicitud falló (HTTP ${response.status}).`
      try {
        const value: unknown = await response.json()
        if (isRecord(value) && typeof value.error === 'string') message = value.error
      } catch {
        console.error('Could not read the image deletion error response.')
      }
      throw new ApiResponseError(message, response.status)
    }
    const next = productImages.filter((item) => item.id !== image.id)
    setProductImages(next)
    const imageUrl = imageProduct.imageUrl === image.url ? next[0]?.url : imageProduct.imageUrl
    setImageProduct((current) => current ? { ...current, imageUrl } : current)
    setProducts((current) => current.map((item) => item.id === imageProduct.id ? { ...item, imageUrl } : item))
    setProductPageItems((current) => current.map((item) => item.id === imageProduct.id ? { ...item, imageUrl } : item))
  }

  function editProduct(product: Product) {
    setEditingProduct(product)
    setModalOpen(true)
  }

  async function adjustStock(productId: string, change: number, reason: string) {
    const product = products.find((item) => item.id === productId)
    if (!product) {
      setToast(language === 'es' ? 'No se encontró el producto seleccionado.' : 'The selected product was not found.')
      return
    }
    const after = product.quantity + change
    if (after < 0) {
      setToast(language === 'es' ? 'La existencia no puede quedar en negativo.' : 'Stock cannot be negative.')
      return
    }
    if (session) {
      try {
        const result = await requestApi('/api/inventory/adjust', { productId, change, reason })
        if (!isRecord(result) || !isRecord(result.movement)) throw new Error('El API no devolvió el movimiento registrado.')
        const movement = mapApiMovement({
          id: result.movement.id,
          productId: result.movement.productId,
          productName: product.name,
          change: result.movement.quantityChange,
          before: result.movement.quantityBefore,
          after: result.movement.quantityAfter,
          reason: result.movement.reason,
          createdAt: result.movement.createdAt,
        })
        setProducts((current) => current.map((item) => item.id === productId ? { ...item, quantity: after } : item))
        setProductPageItems((current) => current.map((item) => item.id === productId ? { ...item, quantity: after } : item))
        setMovements((current) => [movement, ...current])
        setAdjustOpen(false)
        setToast(t.movementRecorded)
      } catch (error) {
        setToast(error instanceof Error ? error.message : t.authUnavailable)
      }
      return
    }

    const updatedProducts = products.map((item) => item.id === productId ? { ...item, quantity: after } : item)
    const updatedMovements = [{
      id: crypto.randomUUID(),
      productId,
      productName: product.name,
      change,
      before: product.quantity,
      after,
      reason,
      createdAt: new Date().toISOString(),
    }, ...movements]
    setProducts(updatedProducts)
    setMovements(updatedMovements)
    const productsPersisted = persistDemoData('tellez-demo-products', updatedProducts)
    const movementsPersisted = persistDemoData('tellez-demo-movements', updatedMovements)
    setAdjustOpen(false)
    setToast(productsPersisted && movementsPersisted ? t.movementRecorded : t.storageError)
  }

  const pageTitle = page === 'setup' ? t.setupTitle : t[page]
  const canManageProducts = Boolean(session && ['owner', 'manager'].includes(session.tenant.role))

  if (showsLanding) {
    return <LandingPage language={language} onLanguageChange={setLanguage} />
  }

  if (apiStatus === 'checking') {
    return <LoadingPage label={t.loading} />
  }

  if (apiStatus === 'ready' && !session) {
    if (showsSignIn) {
      return <AuthPage language={language} t={t} onLanguageChange={setLanguage} onSignIn={signIn} onRegister={register} initialMode={initialAuthMode} />
    }
    return <LandingPage language={language} onLanguageChange={setLanguage} />
  }

  if (session && (!session.tenant.setupCompleted || page === 'setup')) {
    return <WorkspaceSetupPage
      t={t} language={language} name={setupName} setName={setSetupName}
      phoneCountryCode={phoneCountryCode} setPhoneCountryCode={setPhoneCountryCode} customPhoneDialCode={customPhoneDialCode} setCustomPhoneDialCode={setCustomPhoneDialCode} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
      businessType={setupBusinessType} setBusinessType={setSetupBusinessType}
      currency={setupCurrency} setCurrency={setSetupCurrency}
      country={setupCountry} setCountry={(value) => { setSetupCountry(value); setSetupCity('') }}
      city={setupCity} setCity={setSetupCity} address={setupAddress} setAddress={setSetupAddress}
      busy={setupBusy} gpsBusy={gpsBusy} error={setupError} gpsMapUrl={gpsMapUrl} onGps={() => { void useGpsLocation() }}
      onBack={() => { void returnToSignIn() }}
      onSubmit={() => { void completeSetup(false) }} onSkip={() => { void completeSetup(true) }}
    />
  }

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden text-xs">
      {sidebarOpen && <button className="mobile-backdrop" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
      <aside className={`relative z-20 flex h-dvh min-h-0 w-[252px] shrink-0 flex-col overflow-hidden border-r border-[var(--border)] bg-white px-2.5 pb-[9px] pt-[14px] max-[1100px]:w-[225px] max-[850px]:fixed max-[850px]:inset-y-0 max-[850px]:left-0 max-[850px]:w-[265px] max-[850px]:transition-transform max-[850px]:duration-200 max-[850px]:shadow-[7px_0_24px_#1b2b2017] ${sidebarOpen ? 'max-[850px]:translate-x-0' : 'max-[850px]:-translate-x-[105%]'}`}>
        <div className="brand">
          <div className="brand-mark"><img src="/logo.png" alt="" /></div>
          <span>Tellez<span className="brand-light">Software</span></span>
          <button className="sidebar-close icon-button" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={19} /></button>
        </div>
        <button className="workspace-switch" aria-expanded={workspaceMenuOpen} aria-haspopup="menu" onClick={() => setWorkspaceMenuOpen((open) => !open)}>
          <span className="workspace-avatar">{session ? businessTypeText(session.tenant.businessType, language).slice(0, 1) : 'T'}</span>
          <span className="workspace-copy"><strong>{session?.tenant.name ?? t.workspace}</strong><small>{session ? businessTypeText(session.tenant.businessType, language) : t.owner}</small></span>
          <ChevronDown size={16} className="muted-icon" />
        </button>
        {workspaceMenuOpen && session && (
          <div className="workspace-menu" role="menu" aria-label={language === 'es' ? 'Tus negocios' : 'Your businesses'}>
            <p className="workspace-menu-title">{language === 'es' ? 'Negocios e inventarios' : 'Businesses and inventories'}</p>
            {workspaces.map((workspace) => (
              <button
                type="button"
                role="menuitem"
                key={workspace.id}
                className={`workspace-option ${workspace.id === session.tenant.id ? 'workspace-option-active' : ''}`}
                disabled={workspaceActionBusy}
                onClick={() => { void selectWorkspace(workspace.id) }}
              >
                <span className="workspace-avatar">{businessTypeText(workspace.businessType, language).slice(0, 1)}</span>
                <span className="workspace-copy"><strong>{businessTypeText(workspace.businessType, language)}</strong><small>{workspace.name}</small></span>
                {workspace.id === session.tenant.id && <span className="workspace-current">{language === 'es' ? 'Activo' : 'Active'}</span>}
              </button>
            ))}
            {session.tenant.role === 'owner' && workspaces.length < BUSINESS_TYPES.length && (
              <button type="button" className="workspace-create-all" disabled={workspaceActionBusy} onClick={() => { void initializeBusinessWorkspaces() }}>
                {workspaceActionBusy
                  ? (language === 'es' ? 'Preparando…' : 'Setting up…')
                  : (language === 'es' ? 'Preparar los 8 negocios' : 'Set up all 8 businesses')}
              </button>
            )}
          </div>
        )}
        <nav className="side-nav" aria-label={t.navAria}>
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-caption">{t[group.label]}</p>
              {group.items.map(({ id, icon: Icon }) => (
                <button key={id} onClick={() => { setPage(id); setSidebarOpen(false); setWorkspaceMenuOpen(false) }} className={`nav-item ${page === id ? 'nav-active' : ''}`}>
                  <Icon size={18} strokeWidth={1.9} /><span>{t[id === 'setup' ? 'settings' : id]}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="plan-card">
            <div className="plan-icon"><Sparkles size={16} /></div>
            <div className="plan-text"><strong>{session ? session.tenant.planTier === 'paid' ? t.plan : session.tenant.trialStartedAt && Date.now() < Date.parse(session.tenant.trialStartedAt) + 7 * 86400000 ? t.freeTrial : t.trialEnded : t.plan}</strong><span>{session ? t.paidPlan : t.planSub}</span></div>
            <button className="plan-link" onClick={() => setToast(session ? t.upgradeUnavailable : t.comingSoon)}>{t.seePlans}</button>
            {!session && <><div className="plan-meter"><span style={{ width: `${Math.min(products.length / 10 * 100, 100)}%` }} /></div><small>{products.length} / 10 {t.productsLimit} {t.used}</small></>}
            {session && <small>{products.length} {t.products.toLowerCase()}</small>}
          </div>
          <button className="nav-item support-item" onClick={() => setToast('tellezsoftware@gmail.com')}><CircleHelp size={18} /><span>{t.help}</span></button>
          <button className="user-profile" aria-label={session ? `${t.signOut}: ${session.user.email}` : t.account} onClick={session ? signOut : () => setToast(language === 'es' ? 'La gestión de cuenta estará disponible pronto' : 'Account management coming soon')}>
            <span className="user-avatar">{session ? session.user.email.slice(0, 2).toUpperCase() : 'ET'}</span><span className="user-copy"><strong>{session?.user.email ?? 'Edgard Tellez'}</strong><small>{session?.tenant.role ?? 'Administrador'}</small></span><LogOut size={17} className="muted-icon" />
          </button>
        </div>
      </aside>

      <main className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 min-h-14 flex-[0_0_56px] items-center justify-between gap-3 border-b border-[var(--border)] bg-white/80 px-[18px] max-[1100px]:px-4 max-[850px]:h-[52px] max-[850px]:min-h-[52px] max-[850px]:basis-[52px] max-[850px]:px-3 max-[620px]:px-2 min-[1500px]:px-6">
          <div className="topbar-left">
            <button className="menu-toggle icon-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
            <div className="breadcrumbs"><span>{t.overview}</span><ChevronRight size={14} /><strong>{pageTitle}</strong></div>
          </div>
          <div className="topbar-actions">
            <label className="global-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} /><kbd>⌘ K</kbd></label>
            {session && <a className="store-link" href={`/catalogo/${encodeURIComponent(session.tenant.slug)}`} target="_blank" rel="noreferrer"><ExternalLink size={14} />{t.viewStore}</a>}
            <button className="language-toggle" onClick={() => setLanguage((current) => current === 'es' ? 'en' : 'es')} aria-label="Change language">{language === 'es' ? 'ES' : 'EN'} <ChevronDown size={13} /></button>
            <button className="notification-button icon-button" aria-label={t.notifications} onClick={() => setToast(language === 'es' ? 'No tienes notificaciones nuevas' : 'You have no new notifications')}><Bell size={19} /><i /></button>
          </div>
        </header>

        <div className="flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain px-3.5 pb-2.5 pt-3.5 min-[851px]:px-[22px] min-[851px]:pb-3 min-[851px]:pt-[18px] min-[1500px]:px-7 max-[1100px]:px-4 max-[1100px]:pb-2.5 max-[1100px]:pt-4 max-[850px]:px-3.5 max-[850px]:pb-2.5 max-[850px]:pt-3.5 max-[620px]:px-2.5 max-[620px]:pb-2 max-[620px]:pt-3">
          {session && !session.user.emailVerified && <div className="email-notice" role="status"><CircleHelp size={15} /><span>{t.emailNotice}</span></div>}
          {apiStatus === 'unavailable' && <div className="api-warning" role="status"><CircleHelp size={15} /><span>{t.authUnavailable}</span></div>}
          {page === 'dashboard' && (
            <>
              <div className="welcome-row">
                <div><p className="eyebrow">{new Intl.DateTimeFormat(language === 'es' ? 'es-NI' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(appStartedAt)}{session && <span className="business-type-badge">{businessTypeText(session.tenant.businessType, language)}</span>}</p><h1>{t.welcome}</h1><p className="page-subtitle">{session ? dashboardContext(session.tenant.businessType, language) : t.subtitle}</p></div>
                <button className="primary-button" onClick={() => { setEditingProduct(null); setModalOpen(true) }}><Plus size={18} />{t.addProduct}</button>
              </div>
              <section className="stats-grid" aria-label="Business summary">
                <StatCard label={t.totalProducts} value={products.length.toString()} icon={<Package size={18} />} tone="mint" change={session ? t.account : t.sampleData} trend="neutral" note={session ? t.accountData : t.localDemo} />
                <StatCard label={t.stockUnits} value={availableUnits.toLocaleString()} icon={<Warehouse size={18} />} tone="blue" change={session ? t.account : t.sampleData} trend="neutral" note={session ? t.accountData : t.localDemo} />
                <StatCard label={t.lowStock} value={lowProducts.length.toString()} icon={<SlidersHorizontal size={18} />} tone="peach" change={`${outProducts.length} ${language === 'es' ? 'agotados' : 'out of stock'}`} trend="neutral" note={t.attention} />
                <StatCard label={t.inventoryValue} value={money(inventoryValue, session?.tenant.currency)} icon={<Tag size={18} />} tone="lilac" change={session ? t.account : t.sampleData} trend="neutral" note={session ? t.accountData : t.localDemo} />
              </section>
              <div className="dashboard-grid">
                <section className="panel inventory-overview">
                  <div className="panel-heading"><div><h2>{t.stockOverview}</h2><p>{t.stockOverviewSub}</p></div><button className="subtle-button" onClick={() => setPage('inventory')}>{t.viewAll}<ChevronRight size={15} /></button></div>
                  <div className="stock-chart">
                    <div className="donut-wrap"><div className="donut-chart" style={{ background: `conic-gradient(#4cd9a8 0 ${(products.length - lowProducts.length - outProducts.length) / Math.max(products.length, 1) * 100}%, #e8b982 0 ${(products.length - outProducts.length) / Math.max(products.length, 1) * 100}%, #d81b5e 0 100%)` }}><div><strong>{products.length}</strong><span>{t.products.toLowerCase()}</span></div></div></div>
                    <div className="stock-legend">
                      <LegendRow color="green" label={t.available} value={products.length - lowProducts.length - outProducts.length} />
                      <LegendRow color="orange" label={t.low} value={lowProducts.length} />
                      <LegendRow color="red" label={t.outOfStock} value={outProducts.length} />
                    </div>
                  </div>
                  <div className="stock-note"><span className="note-dot" />{lowProducts.length + outProducts.length} {language === 'es' ? 'productos requieren tu atención' : 'products need your attention'}<button onClick={() => { setPage('inventory'); setStockFilter('low') }}>{language === 'es' ? 'Revisar' : 'Review'}<ArrowUpRight size={14} /></button></div>
                </section>
                <section className="panel quick-panel">
                  <div className="panel-heading"><div><h2>{t.quickActions}</h2><p>{t.quickActionsSub}</p></div></div>
                  <button className="quick-action" onClick={() => setModalOpen(true)}><span className="quick-icon mint"><Plus size={18} /></span><span><strong>{t.newProduct}</strong><small>{language === 'es' ? 'Agrega un artículo a tu catálogo' : 'Add an item to your catalog'}</small></span><ChevronRight size={17} /></button>
                  <button className="quick-action" onClick={() => { setPage('inventory'); setStockFilter('all'); setAdjustOpen(true) }}><span className="quick-icon blue"><Warehouse size={18} /></span><span><strong>{t.adjustStock}</strong><small>{language === 'es' ? 'Registra entradas y salidas' : 'Record stock in and out'}</small></span><ChevronRight size={17} /></button>
                  <button className="quick-action" onClick={() => setPage('orders')}><span className="quick-icon peach"><ClipboardList size={18} /></span><span><strong>{t.createOrder}</strong><small>{language === 'es' ? 'Registra una nueva operación' : 'Record a new transaction'}</small></span><ChevronRight size={17} /></button>
                </section>
              </div>
              <ProductsTable products={products.slice(0, 5)} t={t} currency={session?.tenant.currency} onViewAll={() => setPage('products')} onManageImages={canManageProducts ? openImageManager : undefined} />
            </>
          )}

          {page === 'products' && (
            <>
              <div className="welcome-row">
                <div><p className="eyebrow">{t.management}</p><h1>{t.productList}</h1><p className="page-subtitle">{t.productListSub}</p></div>
                <div className="inventory-actions">{canManageProducts && <button className="outline-button" onClick={() => { setShowArchived(!showArchived); setQuery(''); setStockFilter('all') }}>{showArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}{showArchived ? t.activeProducts : t.archivedProducts}</button>}{!showArchived && (!session || canManageProducts) && <button className="primary-button" onClick={() => { setEditingProduct(null); setModalOpen(true) }}><Plus size={18} />{t.addProduct}</button>}</div>
              </div>
              <div className="panel catalog-panel">
                <div className="catalog-toolbar">
                  <div className="tabs">
                    {(['all', 'in', 'low', 'out'] as const).map((filter) => <button key={filter} onClick={() => setStockFilter(filter)} className={stockFilter === filter ? 'tab-active' : ''}>{filter === 'all' ? t.all : filter === 'in' ? t.inStock : filter === 'low' ? t.low : t.out}{filter === 'low' && lowProducts.length > 0 && <span>{lowProducts.length}</span>}</button>)}
                  </div>
                  <div className="catalog-tools"><label className="table-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchProducts} /></label><button className="outline-button" onClick={() => setToast(t.comingSoon)}><SlidersHorizontal size={16} />{t.filters}</button></div>
                </div>
                <ProductsTable products={session ? productPageItems : filteredProducts} t={t} currency={session?.tenant.currency} onEdit={!session || canManageProducts && !showArchived ? editProduct : undefined} onManageImages={canManageProducts ? openImageManager : undefined} onArchive={canManageProducts ? toggleProductArchive : undefined} />
                <div className="pagination"><span>{productPageLoading ? t.loading : <>{t.showing} <strong>{session ? productPageTotal === 0 ? 0 : (productPageCursors.length - 1) * 25 + 1 : filteredProducts.length ? 1 : 0}–{session ? Math.min((productPageCursors.length - 1) * 25 + productPageItems.length, productPageTotal) : filteredProducts.length}</strong> {t.of} <strong>{session ? productPageTotal : filteredProducts.length}</strong> {t.results}</>}</span><div><button disabled={!session || productPageCursors.length <= 1 || productPageLoading} onClick={goToPreviousProductPage}><ChevronLeft size={16} />{t.previous}</button><button disabled={!session || !activePageNextCursor || productPageLoading} onClick={goToNextProductPage}>{t.next}<ChevronRight size={16} /></button></div></div>
              </div>
            </>
          )}

          {page === 'inventory' && (
            <>
              <div className="welcome-row"><div><p className="eyebrow">{t.operations}</p><h1>{t.inventoryTitle}</h1><p className="page-subtitle">{t.inventorySub}</p></div><div className="inventory-actions"><button className="outline-button" onClick={() => setAdjustOpen(true)}><SlidersHorizontal size={16} />{t.adjustInventory}</button><button className="primary-button" onClick={() => { setEditingProduct(null); setModalOpen(true) }}><Plus size={18} />{t.addProduct}</button></div></div>
              <div className="inventory-filter-row">{(['all', 'low', 'out'] as const).map((filter) => <button className={`inventory-filter ${stockFilter === filter ? 'filter-selected' : ''}`} onClick={() => setStockFilter(filter)} key={filter}>{filter === 'all' ? t.allStock : filter === 'low' ? `${t.lowStockTab} (${lowProducts.length})` : `${t.outTab} (${outProducts.length})`}</button>)}</div>
              <ProductsTable products={products.filter((item) => stockFilter === 'all' || stockState(item) === stockFilter)} t={t} currency={session?.tenant.currency} onManageImages={canManageProducts ? openImageManager : undefined} />
              <section className="panel movement-panel">
                <div className="panel-heading"><div><h2>{t.movementHistory}</h2><p>{t.movementHistorySub}</p></div></div>
                <div className="movement-list">{movements.length === 0 ? <div className="movement-empty">{t.noMovements}</div> : movements.slice(0, 8).map((movement) => <div className="movement-row" key={movement.id}><span className={`movement-sign ${movement.change > 0 ? 'movement-in' : movement.change < 0 ? 'movement-out' : 'movement-correction'}`}>{movement.change > 0 ? '+' : ''}{movement.change}</span><span className="movement-name"><strong>{movement.productName}</strong><small>{movement.reason}</small></span><span className="movement-balance">{t.previousQuantity} {movement.before} <ChevronRight size={13} /> {t.newQuantity} {movement.after}</span><time>{new Intl.DateTimeFormat(language === 'es' ? 'es-NI' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(movement.createdAt))}</time></div>)}</div>
              </section>
            </>
          )}

          {page === 'settings' && session && (
            <AccountSettingsPage
              key={session.tenant.id}
              t={t}
              language={language}
              tenant={session.tenant}
              onSave={saveAccountSettings}
            />
          )}
          {!['dashboard', 'products', 'inventory', 'settings'].includes(page) && (
            <section className="coming-panel"><div className="coming-icon"><ClipboardList size={25} /></div><p className="eyebrow">{page === 'setup' ? t.setupTitle : t[page]}</p><h1>{t.comingSoon}</h1><p>{t.comingSoonHint}</p><button className="primary-button" onClick={() => setPage('dashboard')}>{t.dashboard}</button></section>
          )}
          <footer className="page-footer"><span>© 2026 TellezSoftware</span><span className="demo-indicator"><i />{session ? (language === 'es' ? 'Sesión autenticada · D1' : 'Authenticated session · D1') : (language === 'es' ? (apiStatus === 'unavailable' ? 'Modo demo local · API no disponible' : 'Prototipo local · datos de este navegador') : (apiStatus === 'unavailable' ? 'Local demo · API unavailable' : 'Local prototype · browser data'))}</span><nav aria-label={language === 'es' ? 'Información legal' : 'Legal information'}><a href={language === 'es' ? '/terminos' : '/terminos?lang=en'}>{language === 'es' ? 'Términos' : 'Terms'}</a><a href="mailto:tellezsoftware@gmail.com">tellezsoftware@gmail.com</a></nav></footer>
        </div>
      </main>
      {modalOpen && <ProductModal key={session?.tenant.id ?? 'demo'} t={t} language={language} defaultProfile={profile} businessType={session?.tenant.businessType ?? 'general'} currency={session?.tenant.currency ?? 'NIO'} stockLocked={Boolean(session && editingProduct)} uploadEnabled={Boolean(session)} initialProduct={editingProduct ?? undefined} existingProducts={products} onClose={() => { setModalOpen(false); setEditingProduct(null) }} onSave={saveProduct} />}
      {imageProduct && <ImageManagerModal t={t} language={language} product={imageProduct} images={productImages} loading={imageModalBusy} initialError={imageModalError} onAdd={addProductImage} onDelete={removeProductImage} onClose={() => setImageProduct(null)} />}
      {adjustOpen && <AdjustmentModal t={t} language={language} products={products} onClose={() => setAdjustOpen(false)} onSave={adjustStock} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

function StatCard({ label, value, icon, tone, change, trend, note }: { label: string; value: string; icon: React.ReactNode; tone: string; change: string; trend: 'up' | 'down' | 'neutral'; note: string }) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div><strong className="stat-value">{value}</strong><div className="stat-foot"><span className={`trend ${trend}`}>{trend === 'up' ? <ArrowUpRight size={14} /> : trend === 'down' ? <ArrowDownRight size={14} /> : null}{change}</span><span>{note}</span></div></article>
}

function LegendRow({ color, label, value }: { color: string; label: string; value: number }) {
  return <div className="legend-row"><span className={`legend-dot ${color}`} /><span>{label}</span><strong>{value}</strong></div>
}

function ProductsTable({ products, t, currency, onViewAll, onEdit, onManageImages, onArchive }: {
  products: Product[]
  t: Texts
  currency?: string
  onViewAll?: () => void
  onEdit?: (product: Product) => void
  onManageImages?: (product: Product) => void
  onArchive?: (product: Product) => void
}) {
  return <section className="panel products-panel">
    <div className="panel-heading"><div><h2>{t.recentProducts}</h2><p>{t.recentProductsSub}</p></div>{onViewAll && <button className="subtle-button" onClick={onViewAll}>{t.viewAll}<ChevronRight size={15} /></button>}</div>
    <div className="table-scroll"><table><thead><tr><th>{t.product}</th><th>{t.sku}</th><th>{t.category}</th><th>{t.quantity}</th><th>{t.price}</th><th>{t.status}</th>{(onEdit || onManageImages || onArchive) && <th aria-label={t.manageImages} />}</tr></thead>
      <tbody>{products.map((item) => {
        const state = stockState(item)
        const label = state === 'out' ? t.out : state === 'low' ? t.low : t.inStock
        return <tr key={item.id}><td><div className="product-cell"><span className={`product-thumb ${item.category.toLowerCase().includes('ropa') ? 'thumb-pink' : item.category.toLowerCase().includes('herra') ? 'thumb-green' : item.category.toLowerCase().includes('tecnología') ? 'thumb-blue' : 'thumb-yellow'}`}>{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <Package size={17} />}</span><span><strong>{item.name}</strong>{item.variant && <small>{item.variant}</small>}</span></div></td><td><span className="sku-text">{item.sku}</span></td><td>{item.category}</td><td><strong className={state === 'out' ? 'quantity-out' : ''}>{item.quantity}</strong><span className="unit-text"> {unitText(item.unit, t)}</span></td><td className="price-cell">{money(item.price, currency)}</td><td><span className={`status-pill status-${state}`}><i />{label}</span></td>{(onEdit || onManageImages || onArchive) && <td className="table-actions">{onManageImages && <button className="row-action" aria-label={`${t.manageImages}: ${item.name}`} title={t.manageImages} onClick={() => onManageImages(item)}><ImagePlus size={15} /></button>}{onEdit && <button className="row-action" aria-label={`${t.editProduct}: ${item.name}`} onClick={() => onEdit(item)}><Pencil size={14} /></button>}{onArchive && <button className="row-action" aria-label={`${item.archivedAt ? t.restoreProduct : t.archiveProduct}: ${item.name}`} title={item.archivedAt ? t.restoreProduct : t.archiveProduct} onClick={() => onArchive(item)}>{item.archivedAt ? <ArchiveRestore size={15} /> : <Archive size={15} />}</button>}</td>}</tr>
      })}</tbody></table>
      {products.length === 0 && <div className="empty-state"><div><Package size={22} /></div><strong>{t.noResults}</strong><span>{t.noResultsHint}</span></div>}
    </div>
  </section>
}

function LoadingPage({ label }: { label: string }) {
  return <main className="loading-page"><div className="brand-mark"><img src="/logo.png" alt="" /></div><span>{label}</span></main>
}

function HelpHint({ text, language }: { text: string; language: Language }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  return <span className="help-hint">
    <button type="button" className="help-hint__button" aria-label={language === 'es' ? `Mostrar ayuda: ${text}` : `Show help: ${text}`} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false) }}>
      <Info size={16} aria-hidden="true" />
    </button>
    <span id={panelId} className="help-hint__panel" role="note" tabIndex={0} hidden={!open}>
      <Info className="help-hint__panel-icon" size={16} aria-hidden="true" />
      <span className="help-hint__content"><strong className="help-hint__title">{language === 'es' ? 'Información' : 'Information'}</strong><p className="help-hint__body">{text}</p></span>
    </span>
  </span>
}

function WorkspaceSetupPage({ t, language, name, setName, phoneCountryCode, setPhoneCountryCode, customPhoneDialCode, setCustomPhoneDialCode, phoneNumber, setPhoneNumber, businessType, setBusinessType, currency, setCurrency, country, setCountry, city, setCity, address, setAddress, onBack, busy, gpsBusy, error, gpsMapUrl, onGps, onSubmit, onSkip }: {
  t: Texts; language: Language; name: string; setName: (value: string) => void
  phoneCountryCode: CountryCode; setPhoneCountryCode: (value: CountryCode) => void; customPhoneDialCode: string; setCustomPhoneDialCode: (value: string) => void; phoneNumber: string; setPhoneNumber: (value: string) => void
  businessType: BusinessType; setBusinessType: (value: BusinessType) => void
  currency: string; setCurrency: (value: string) => void
  country: CountryCode | ''; setCountry: (value: CountryCode | '') => void
  city: string; setCity: (value: string) => void; address: string; setAddress: (value: string) => void
  onBack: () => void
  busy: boolean; gpsBusy: boolean; error: string; gpsMapUrl: string; onGps: () => void; onSubmit: () => void; onSkip: () => void
}) {
  const selectedCountry = COUNTRIES.find((item) => item.code === country)
  const countryLabel = (item: typeof COUNTRIES[number]) => language === 'es' ? item.name : ({ NI: 'Nicaragua', CR: 'Costa Rica', HN: 'Honduras', SV: 'El Salvador', GT: 'Guatemala', US: 'United States', CA: 'Canada', MX: 'Mexico', OTHER: 'Other' }[item.code])
  return <main className="flex min-h-screen flex-col gap-2 bg-[#f5fefa] px-[max(14px,calc((100vw-1000px)/2))] py-1.5">
    <header className="flex items-center justify-between"><a className="brand no-underline" href="/" aria-label="TellezSoftware home"><span className="brand-mark"><img src="/logo.png" alt="" /></span><span>Tellez<span className="brand-light">Software</span></span></a><div className="flex items-center gap-4"><button type="button" className="inline-flex items-center gap-1.5 rounded-lg border-0 bg-transparent px-1.5 py-1 text-[11px] font-semibold text-[#567a63] transition-colors hover:bg-[#e9fdf5] hover:text-[#3d6a4c]" onClick={onBack} aria-label={language === 'es' ? 'Volver a la pantalla de inicio de sesión' : 'Back to the sign-in screen'}><ArrowLeft size={14} />{language === 'es' ? 'Volver al inicio' : 'Back to start'}</button><button className="language-toggle" onClick={() => { document.documentElement.lang = language === 'es' ? 'en' : 'es'; window.location.reload() }} aria-label="Change language">{language === 'es' ? 'ES' : 'EN'} <ChevronDown size={13} /></button></div></header>
    <section className="setup-card mx-auto w-full max-w-[1000px] rounded-[14px] border border-[#ddf1e9] bg-white p-3 shadow-[0_9px_35px_#26392d08]">
      <p className="eyebrow">{language === 'es' ? 'PASO 1 · CONFIGURACIÓN' : 'STEP 1 · SETUP'}</p>
      <h1 className="setup-title mb-1 font-bold tracking-[-.7px] text-[#34443b]">{t.setupTitle}</h1><p className="mb-2.5 text-[13px] text-[#829089]">{t.setupIntro}</p>
      <form className="grid grid-cols-2 gap-x-3 gap-y-1.5" onSubmit={(event) => { event.preventDefault(); onSubmit() }}>
        <div className="field col-span-2"><div className="flex items-center justify-between"><label className="text-[12px] font-semibold text-[#627168]" htmlFor="setup-name">{t.businessName} *</label><HelpHint text={t.setupNameHelp} language={language} /></div><input id="setup-name" autoFocus required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder={language === 'es' ? 'Ej. Mi negocio' : 'e.g. My business'} /></div>
        <div className="field"><div className="flex items-center justify-between gap-1"><label className="text-[12px] font-semibold text-[#627168]" htmlFor="setup-business-type">{language === 'es' ? 'Tipo de negocio' : 'Business type'} *</label><HelpHint text={t.businessTypeHelp} language={language} /></div><select id="setup-business-type" value={businessType} onChange={(event) => { if (isSelectableBusinessType(event.target.value)) setBusinessType(event.target.value) }}>{BUSINESS_TYPES.map((type) => <option value={type} key={type}>{businessTypeText(type, language)}</option>)}</select></div>
        <div className="field"><div className="flex items-center justify-between gap-1"><label className="text-[12px] font-semibold text-[#627168]" htmlFor="setup-currency">{t.currency} *</label><HelpHint text={t.currencyHelp} language={language} /></div><select id="setup-currency" value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="NIO">NIO — {language === 'es' ? 'Córdobas' : 'Nicaraguan córdobas'}</option><option value="USD">USD — {language === 'es' ? 'Dólares estadounidenses' : 'US dollars'}</option></select></div>
        <div className="field col-span-2"><div className="flex items-center justify-between"><label className="text-[12px] font-semibold text-[#627168]" htmlFor="setup-phone-country">{t.phone} *</label><HelpHint text={t.phoneHelp} language={language} /></div><div className="phone-input-row"><select id="setup-phone-country" aria-label={t.phoneCountry} value={phoneCountryCode} onChange={(event) => { if (isCountryCode(event.target.value)) setPhoneCountryCode(event.target.value) }}>{COUNTRIES.map((item) => <option key={item.code} value={item.code}>{language === 'es' ? item.name : item.code === 'MX' ? 'Mexico' : item.name} ({item.dialCode})</option>)}</select>{phoneCountryCode === 'OTHER' && <input className="phone-dial-code" aria-label={language === 'es' ? 'Prefijo internacional' : 'Calling code'} required value={customPhoneDialCode} onChange={(event) => setCustomPhoneDialCode(event.target.value)} placeholder="+XXX" maxLength={5} />}<input aria-label={t.phoneNumber} type="tel" required autoComplete="tel-national" inputMode="tel" maxLength={20} value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder={phoneCountryCode === 'NI' ? '8888 8888' : '555 123 4567'} /></div></div>
        <div className="col-span-2 flex items-center justify-between border-t border-[#ecf7f2] pt-2"><h2 className="m-0 text-[16px] font-semibold">{t.location}</h2><HelpHint text={t.locationHelp} language={language} /></div>
        <label className="field"><span>{t.country}</span><select value={country} onChange={(event) => setCountry(isCountryCode(event.target.value) ? event.target.value : '')}><option value="">{t.chooseCountry}</option>{COUNTRIES.map((item) => <option key={item.code} value={item.code}>{countryLabel(item)}</option>)}</select></label>
        <label className="field"><span>{t.city}</span><select value={city} disabled={!selectedCountry} onChange={(event) => setCity(event.target.value)}><option value="">{t.chooseCity}</option>{selectedCountry?.cities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="field col-span-2"><span>{t.address}</span><input maxLength={300} value={address} onChange={(event) => setAddress(event.target.value)} placeholder={t.addressPlaceholder} /></label>
        <div className="col-span-2"><button className="outline-button" type="button" disabled={gpsBusy || busy} onClick={onGps}><ExternalLink size={15} />{gpsBusy ? t.gpsLoading : t.useGps}</button>{gpsMapUrl && <a className="ml-3 text-[11px] text-[#007a56]" href={gpsMapUrl} target="_blank" rel="noreferrer">{language === 'es' ? 'Ver ubicación en Google Maps' : 'View location in Google Maps'}</a>}</div>
        {error && <p className="form-error col-span-2" role="alert">{error}</p>}
        <div className="col-span-2 flex justify-between gap-3 pt-1"><button type="button" className="outline-button" disabled={busy} onClick={onSkip}>{t.skipLocation}</button><button type="submit" className="primary-button ml-auto" disabled={busy}>{busy ? t.loading : t.continueDashboard}<ChevronRight size={17} /></button></div>
      </form>
    </section>
    <footer className="mx-auto flex w-full max-w-[700px] justify-between gap-3 text-[9px] text-[#9ba69f]"><span>© 2026 TellezSoftware</span><a className="text-[#81958a] no-underline hover:text-[#007a56] hover:underline" href={language === 'es' ? '/terminos' : '/terminos?lang=en'}>{language === 'es' ? 'Términos y condiciones' : 'Terms and Conditions'}</a></footer>
  </main>
}

function AccountSettingsPage({ t, language, tenant, onSave }: {
  t: Texts
  language: Language
  tenant: WorkspaceItem
  onSave: (businessType: BusinessType, currency: string) => Promise<void>
}) {
  const [businessType, setBusinessType] = useState<BusinessType>(businessGroupForType(tenant.businessType))
  const [currency, setCurrency] = useState(tenant.currency)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const isOwner = tenant.role === 'owner'

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaved(false)
    setBusy(true)
    try {
      await onSave(businessType, currency)
      setSaved(true)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t.authUnavailable)
    } finally {
      setBusy(false)
    }
  }

  return <>
    <div className="welcome-row">
      <div><p className="eyebrow">{t.account}</p><h1>{t.accountConfigTitle}</h1><p className="page-subtitle">{t.accountConfigSub}</p></div>
    </div>
    <section className="panel">
      <form className="form-grid" onSubmit={submit}>
        <label className="field span-two">
          <span>{language === 'es' ? 'Tipo de negocio' : 'Business type'}</span>
          <select disabled={!isOwner || busy} value={businessType} onChange={(event) => {
            if (isSelectableBusinessType(event.target.value)) {
              setBusinessType(event.target.value)
              setSaved(false)
            }
          }}>
            {BUSINESS_TYPES.map((type) => <option value={type} key={type}>{businessTypeText(type, language)}</option>)}
          </select>
          <small>{t.businessTypeHelp}</small>
        </label>
        <label className="field span-two">
          <span>{t.currency}</span>
          <select disabled={!isOwner || busy} value={currency} onChange={(event) => { setCurrency(event.target.value); setSaved(false) }}>
            {currency !== 'NIO' && currency !== 'USD' && <option value={currency}>{currency}</option>}
            <option value="NIO">NIO — {language === 'es' ? 'Córdobas' : 'Nicaraguan córdobas'}</option>
            <option value="USD">USD — {language === 'es' ? 'Dólares estadounidenses' : 'US dollars'}</option>
          </select>
          <small>{t.currencyHelp}</small>
        </label>
        {!isOwner && <p className="form-error span-two" role="status">{t.ownerOnlySettings}</p>}
        {error && <p className="form-error span-two" role="alert">{error}</p>}
        {saved && <p className="span-two" role="status">{t.settingsSaved}</p>}
        {isOwner && <div className="span-two"><button type="submit" className="primary-button" disabled={busy}>{busy ? t.loading : t.saveSettings}</button></div>}
      </form>
    </section>
  </>
}

function GoogleMark() {
  return <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
  </svg>
}

function googleAuthErrorText(code: string | null, language: Language): string {
  if (!code) return ''
  const es = language === 'es'
  switch (code) {
    case 'cuenta_existente':
      return es
        ? 'Ya existe una cuenta con ese correo. Inicia sesión con tu contraseña o usa otro correo de Google.'
        : 'An account already exists with that email. Sign in with your password or use another Google account.'
    case 'no_configurado':
      return es ? 'El inicio de sesión con Google aún no está configurado.' : 'Google sign-in is not configured yet.'
    case 'correo_no_verificado':
      return es ? 'Tu correo de Google no está verificado.' : 'Your Google email is not verified.'
    case 'acceso_denegado':
      return es ? 'Cancelaste el acceso con Google.' : 'You cancelled Google sign-in.'
    case 'sin_espacio':
      return es ? 'Tu cuenta no tiene un espacio de trabajo asociado.' : 'Your account has no workspace linked.'
    default:
      return es
        ? 'No se pudo completar el acceso con Google. Inténtalo de nuevo.'
        : 'Google sign-in could not be completed. Please try again.'
  }
}

function AuthPage({ language, t, onLanguageChange, onSignIn, onRegister, initialMode = 'login' }: {
  language: Language
  t: Texts
  onLanguageChange: (language: Language) => void
  onSignIn: (email: string, password: string) => Promise<void>
  onRegister: (email: string, password: string, acceptedTermsVersion: string) => Promise<void>
  initialMode?: 'login' | 'register'
}) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const [oauthCode] = useState(() => new URLSearchParams(window.location.search).get('google'))
  const oauthErrorMessage = googleAuthErrorText(oauthCode, language)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has('google')) return
    params.delete('google')
    const query = params.toString()
    window.history.replaceState(null, '', `/ingresar${query ? `?${query}` : ''}`)
  }, [])

  async function continueWithGoogle() {
    setError('')
    setGoogleError('')
    if (mode === 'register' && !acceptedTerms) {
      setGoogleError(language === 'es' ? 'Acepta los términos para crear tu cuenta con Google.' : 'Accept the terms to create your account with Google.')
      return
    }
    setGoogleBusy(true)
    try {
      const response = await fetch('/api/auth/google/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ acceptedTermsVersion: CURRENT_TERMS_VERSION }),
      })
      const payload: unknown = await response.json().catch(() => null)
      const url = isRecord(payload) && typeof payload.url === 'string' ? payload.url : ''
      if (!response.ok || !url) {
        setGoogleError(isRecord(payload) && typeof payload.error === 'string'
          ? payload.error
          : language === 'es' ? 'No se pudo iniciar el acceso con Google.' : 'Google sign-in could not be started.')
        return
      }
      window.location.assign(url)
    } catch {
      setGoogleError(language === 'es' ? 'No se pudo conectar con el servidor.' : 'Could not reach the server.')
    } finally {
      setGoogleBusy(false)
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await onSignIn(email.trim(), password)
      else await onRegister(email.trim(), password, CURRENT_TERMS_VERSION)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.authUnavailable)
    } finally {
      setBusy(false)
    }
  }

  function changeMode(next: 'login' | 'register') {
    setMode(next)
    setError('')
    setAcceptedTerms(false)
  }

  return <main className="flex min-h-screen flex-col bg-[#f4fbf9] px-[clamp(18px,5vw,72px)] py-6">
    <div className="flex items-center justify-between">
      <a className="brand no-underline" href="/" aria-label="TellezSoftware home"><span className="brand-mark"><img src="/logo.png" alt="" /></span><span>Tellez<span className="brand-light">Software</span></span></a>
      <div className="flex items-center gap-4">
        <a className="inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[11px] font-semibold text-[#567a63] no-underline transition-colors hover:bg-[#e9fdf5] hover:text-[#3d6a4c]" href="/" aria-label={language === 'es' ? 'Volver a la página de inicio' : 'Back to the home page'}><ArrowLeft size={14} />{language === 'es' ? 'Volver al inicio' : 'Back to start'}</a>
        <button className="language-toggle" onClick={() => onLanguageChange(language === 'es' ? 'en' : 'es')} aria-label="Change language">{language === 'es' ? 'ES' : 'EN'} <ChevronDown size={13} /></button>
      </div>
    </div>
    <div className="mx-auto my-9 grid w-full max-w-[1050px] flex-1 grid-cols-1 items-center gap-5 min-[851px]:grid-cols-[minmax(0,.9fr)_minmax(380px,1fr)] min-[851px]:gap-[clamp(35px,8vw,100px)]">
      <section className="max-w-[400px] p-2.5 max-[850px]:hidden">
        <div className="mb-7 grid size-[61px] place-items-center rounded-[18px] border border-[#d3f8e8] bg-gradient-to-br from-[#defaf0] to-[#efe2fb] text-[#007a56]"><Package size={32} /></div>
        <p className="eyebrow tracking-[1.2px] text-[#008a5e]">TELLEZSOFTWARE</p>
        <h1 className="mb-3 max-w-[370px] auth-title leading-[1.18] tracking-[-1.1px]">{t.authTitle}</h1>
        <p className="mb-7 text-[13px] text-[#85938a]">{t.authSubtitle}</p>
        <div className="mt-4 flex items-center gap-3"><span className="grid size-[34px] place-items-center rounded-[10px] bg-white text-[#008a5e]"><Package size={17} /></span><div className="flex flex-col gap-1"><strong className="text-[11px] text-[#526258]">{t.inventory}</strong><small className="text-[10px] text-[#96a199]">{language === 'es' ? 'Productos y existencias organizados' : 'Products and stock, organized'}</small></div></div>
        <div className="mt-4 flex items-center gap-3"><span className="grid size-[34px] place-items-center rounded-[10px] bg-white text-[#008a5e]"><Warehouse size={17} /></span><div className="flex flex-col gap-1"><strong className="text-[11px] text-[#526258]">{language === 'es' ? 'Un espacio para tu negocio' : 'One workspace for your business'}</strong><small className="text-[10px] text-[#96a199]">{language === 'es' ? 'Tus datos privados y bajo tu control' : 'Your private data, under your control'}</small></div></div>
      </section>
      <section className="w-full rounded-[13px] border border-[#ddf1e9] bg-white px-7 py-6 shadow-[0_9px_35px_#26392d08] max-[620px]:px-3.5 max-[620px]:py-4" aria-labelledby="auth-heading">
        <div className="mb-5 flex gap-[18px] border-b border-[#edf8f3]"><button type="button" className={`relative border-0 bg-transparent px-px pb-2.5 pt-2 text-[10px] ${mode === 'login' ? 'font-bold text-[#007a56] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[#00c885] after:content-[\"\"]' : 'text-[#93a097]'}`} onClick={() => changeMode('login')}>{t.signIn}</button><button type="button" className={`relative border-0 bg-transparent px-px pb-2.5 pt-2 text-[10px] ${mode === 'register' ? 'font-bold text-[#007a56] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[#00c885] after:content-[\"\"]' : 'text-[#93a097]'}`} onClick={() => changeMode('register')}>{t.register}</button></div>
        <h2 id="auth-heading" className="mb-1 text-[18px] font-bold tracking-[-.3px] text-[#34443b]">{mode === 'login' ? t.signIn : t.createWorkspace}</h2>
        <p className="mb-3 text-[10px] text-[#929e96]">{mode === 'login' ? t.welcomeBack : t.authSubtitle}</p>
        <button type="button" className="google-button" onClick={() => { void continueWithGoogle() }} disabled={googleBusy || busy || (mode === 'register' && !acceptedTerms)}>
          <GoogleMark />
          {googleBusy
            ? (language === 'es' ? 'Conectando…' : 'Connecting…')
            : (language === 'es' ? 'Continuar con Google' : 'Continue with Google')}
        </button>
        {mode === 'register' && !acceptedTerms && <small className="google-hint">{language === 'es' ? 'Acepta los términos para continuar con Google.' : 'Accept the terms to continue with Google.'}</small>}
        {mode === 'login' && <small className="google-hint">{language === 'es' ? 'Al continuar con Google aceptas los ' : 'By continuing with Google you accept the '}<a href="/terminos">{language === 'es' ? 'Términos y condiciones' : 'Terms and conditions'}</a>.</small>}
        {(googleError || oauthErrorMessage) && <p className="form-error" role="alert">{googleError || oauthErrorMessage}</p>}
        <div className="auth-divider">{language === 'es' ? 'o' : 'or'}</div>
        <form className="flex flex-col gap-3" onSubmit={submit}>
          {mode === 'register' && <small className="password-hint">{t.setupAfterSignUp}</small>}
          <label className="field"><span>{t.email} *</span><input autoFocus={mode === 'login'} required type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@ejemplo.com" /></label>
          <label className="field"><span>{t.password} *</span><input required type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 12 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••••" /><small className="password-hint">{mode === 'register' ? t.passwordHint : ''}</small></label>
          {mode === 'register' && <label className="terms-acceptance"><input type="checkbox" required checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} /><span>{language === 'es' ? <>He leído y acepto los <a href="/terminos" target="_blank" rel="noreferrer">Términos y condiciones</a> (versión {CURRENT_TERMS_VERSION}).</> : <>I have read and agree to the <a href="/terminos?lang=en" target="_blank" rel="noreferrer">Terms and Conditions</a> (version {CURRENT_TERMS_VERSION}).</>}</span></label>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="primary-button mt-0.5 h-[39px] w-full justify-center disabled:cursor-wait disabled:opacity-70" disabled={busy}>{busy ? t.loading : mode === 'login' ? t.signIn : t.createWorkspace}<ChevronRight className="ml-auto" size={17} /></button>
        </form>
        <p className="mt-4 text-center text-[10px] text-[#87948b]">{mode === 'login' ? t.noAccount : t.haveAccount}<button className="ml-1 border-0 bg-transparent p-0 font-bold text-[#007a56]" onClick={() => changeMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? t.createAccount : t.backToSignIn}</button></p>
        <p className="mt-[15px] text-center text-[9px] leading-[1.5] text-[#a1aaa4]">{language === 'es' ? 'Al crear una cuenta, tus datos se guardan en la base de datos configurada para esta aplicación.' : 'When you create an account, your data is saved in this application database.'}</p>
      </section>
    </div>
    <footer className="mx-auto flex w-full max-w-[1050px] justify-between gap-3 text-[9px] text-[#9ba69f] max-[620px]:flex-wrap max-[620px]:justify-center"><span>© 2026 TellezSoftware</span><a className="text-[#81958a] no-underline hover:text-[#007a56] hover:underline" href={language === 'es' ? '/terminos' : '/terminos?lang=en'}>{language === 'es' ? 'Términos y condiciones' : 'Terms and Conditions'}</a><a className="text-[#81958a] no-underline hover:text-[#007a56] hover:underline" href="mailto:tellezsoftware@gmail.com">tellezsoftware@gmail.com</a><span>Pages Functions + D1</span></footer>
  </main>
}

function ProductModal({ t, language, defaultProfile, businessType, currency, stockLocked, uploadEnabled, initialProduct, existingProducts, onClose, onSave }: {
  t: Texts
  language: Language
  defaultProfile: string
  businessType: BusinessType
  currency: string
  stockLocked: boolean
  uploadEnabled: boolean
  initialProduct?: Product
  existingProducts: Product[]
  onClose: () => void
  onSave: (product: Product, imageFiles: File[]) => void | Promise<void>
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [form, setForm] = useState(() => ({
    name: initialProduct?.name ?? '',
    sku: initialProduct?.sku ?? '',
    category: initialProduct?.category ?? '',
    quantity: String(initialProduct?.quantity ?? 0),
    minStock: String(initialProduct?.minStock ?? 3),
    unit: initialProduct?.unit ?? defaultUnit(businessType),
    cost: initialProduct?.cost ? String(initialProduct.cost) : '',
    price: initialProduct?.price ? String(initialProduct.price) : '',
    variant: initialProduct?.variant ?? '',
    serial: initialProduct?.serial ?? '',
  }))
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const currencyLabel = currency === 'NIO' ? 'C$' : currency
  const productProfile = initialProduct?.profile ?? defaultProfile
  const productKind = productKindForCategory(form.category, businessType)
  const variantCopy = variantFieldCopy(productKind, language)
  const unitChoices = [...new Set([form.unit, ...unitsForProductKind(productKind)])]
  const updateCategory = (category: string) => {
    const choices = unitsForProductKind(productKindForCategory(category, businessType))
    setForm((current) => ({
      ...current,
      category,
      unit: choices.includes(current.unit) ? current.unit : choices[0],
    }))
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!form.name.trim() || !form.sku.trim()) { setError(t.required); return }
    if (existingProducts.some((product) => product.id !== initialProduct?.id && product.sku.toLowerCase() === form.sku.trim().toLowerCase())) {
      setError(t.duplicateSku)
      return
    }
    const numeric = (value: string) => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0
    setBusy(true)
    try {
      await onSave({ id: initialProduct?.id ?? crypto.randomUUID(), name: form.name.trim(), sku: form.sku.trim(), category: form.category.trim() || 'General', profile: productProfile, quantity: numeric(form.quantity), minStock: numeric(form.minStock), unit: form.unit, cost: numeric(form.cost), price: numeric(form.price), variant: form.variant.trim() || undefined, serial: form.serial.trim() || undefined }, imageFiles)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t.storageError)
    } finally {
      setBusy(false)
    }
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-heading"><div><span className="modal-icon"><Package size={19} /></span><div><h2 id="modal-title">{initialProduct ? t.editProduct : t.newProductTitle}</h2><p>{t.newProductSub}</p></div></div><button className="icon-button" onClick={onClose} aria-label={t.cancel}><X size={19} /></button></div>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label className="field span-two"><span>{t.name} *</span><input autoFocus value={form.name} onChange={(event) => update('name', event.target.value)} placeholder={language === 'es' ? 'Ej. Camisa deportiva' : 'e.g. Sports shirt'} /></label>
          <label className="field"><span>{t.sku} *</span><input value={form.sku} onChange={(event) => update('sku', event.target.value)} placeholder="CAM-NEG-M" /></label>
          <label className="field"><span>{t.category}</span><input list="product-categories" value={form.category} onChange={(event) => updateCategory(event.target.value)} placeholder={categoryPlaceholder(businessType, language)} /><datalist id="product-categories">{categorySuggestions(businessType, language).map((category) => <option value={category} key={category} />)}</datalist></label>
          <label className="field"><span>{t.unit}</span><select value={form.unit} onChange={(event) => update('unit', event.target.value)}>{unitChoices.map((unit) => <option value={unit} key={unit}>{unitText(unit, t)}</option>)}</select></label>
          <label className="field"><span>{t.quantity}</span><input type="number" min="0" step="0.01" value={form.quantity} disabled={stockLocked} onChange={(event) => update('quantity', event.target.value)} />{stockLocked && <small>{t.adjustStockSeparately}</small>}</label>
          <label className="field"><span>{t.minStock}</span><input type="number" min="0" step="0.01" value={form.minStock} onChange={(event) => update('minStock', event.target.value)} /></label>
          <label className="field"><span>{t.cost} ({currencyLabel})</span><input type="number" min="0" step="0.01" value={form.cost} onChange={(event) => update('cost', event.target.value)} placeholder="0.00" /></label>
          <label className="field"><span>{t.price} ({currencyLabel})</span><input type="number" min="0" step="0.01" value={form.price} onChange={(event) => update('price', event.target.value)} placeholder="0.00" /></label>
          <label className="field"><span>{variantCopy.label}</span><input value={form.variant} onChange={(event) => update('variant', event.target.value)} placeholder={variantCopy.placeholder} /></label>
          {(productKind === 'electronics' || productKind === 'auto_parts' || Boolean(form.serial)) && <label className="field"><span>{t.serial}</span><input value={form.serial} onChange={(event) => update('serial', event.target.value)} placeholder={language === 'es' ? 'Ej. IMEI / número de serie' : 'e.g. IMEI / serial number'} /></label>}
        </div>
        {uploadEnabled && !initialProduct && <label className="field image-file-field"><span>{t.addImages} ({t.imageCount})</span><input type="file" accept="image/*" multiple disabled={busy} onChange={(event) => { const selected = Array.from(event.target.files ?? []); if (selected.length > 5) { setError(t.imageLimit); event.target.value = ''; setImageFiles([]); return } setError(''); setImageFiles(selected) }} /><small>{t.imageUploadHint} {t.imageLimit} {imageFiles.length > 0 && `· ${imageFiles.length} ${t.imageCount.toLowerCase()}`}</small></label>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="outline-button" onClick={onClose} disabled={busy}>{t.cancel}</button><button type="submit" className="primary-button" disabled={busy}>{initialProduct ? <Pencil size={15} /> : <Plus size={17} />}{busy ? t.loading : initialProduct ? t.updateProduct : t.save}</button></div>
      </form>
    </section>
  </div>
}

function ImageManagerModal({ t, language, product, images, loading, initialError, onAdd, onDelete, onClose }: {
  t: Texts
  language: Language
  product: Product
  images: ProductImage[]
  loading: boolean
  initialError: string
  onAdd: (file: File) => Promise<void>
  onDelete: (image: ProductImage) => Promise<void>
  onClose: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function addFiles(files: File[]) {
    if (files.length + images.length > 5) {
      setError(t.imageLimit)
      return
    }
    setError('')
    setBusy(true)
    const failures: string[] = []
    for (const file of files) {
      try {
        await onAdd(file)
      } catch (uploadError) {
        failures.push(uploadError instanceof Error ? uploadError.message : t.imageLoadError)
      }
    }
    setError(failures.join(' '))
    setBusy(false)
  }

  async function deleteImage(image: ProductImage) {
    if (!window.confirm(language === 'es' ? '¿Eliminar esta imagen del producto?' : 'Delete this product image?')) return
    setError('')
    setBusy(true)
    try {
      await onDelete(image)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t.imageDeleteError)
    } finally {
      setBusy(false)
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section className="image-modal" role="dialog" aria-modal="true" aria-labelledby="image-modal-title">
      <div className="modal-heading"><div><span className="modal-icon"><ImagePlus size={19} /></span><div><h2 id="image-modal-title">{t.manageImages}</h2><p>{product.name}</p></div></div><button className="icon-button" onClick={onClose} aria-label={t.close} disabled={busy}><X size={19} /></button></div>
      <p className="image-hint">{t.imageUploadHint} {t.imageLimit}</p>
      <label className="image-drop-zone"><ImagePlus size={20} /><span>{busy ? t.loading : t.addImages}</span><input type="file" accept="image/*" multiple disabled={busy || images.length >= 5} onChange={(event) => { const selected = Array.from(event.target.files ?? []); event.target.value = ''; void addFiles(selected) }} /></label>
      {(initialError || error) && <p className="form-error" role="alert">{error || initialError}</p>}
      {loading ? <p className="image-loading">{t.loading}</p> : <div className="image-manager-grid">{images.map((image) => <article className="managed-image" key={image.id}><img src={image.url} alt={`${product.name} · ${image.position + 1}`} /><div className="managed-image-details"><span>{image.width} × {image.height} px · {(image.sizeBytes / 1024).toFixed(1)} KiB</span><button className="row-action image-delete-button" aria-label={`${t.deleteImage}: ${product.name}`} disabled={busy} onClick={() => void deleteImage(image)}><Trash2 size={15} /></button></div></article>)}{images.length === 0 && !initialError && <p className="image-loading">{t.noImages}</p>}</div>}
      <div className="modal-actions"><button className="outline-button" disabled={busy} onClick={onClose}>{t.close}</button></div>
    </section>
  </div>
}

function AdjustmentModal({ t, language, products, onClose, onSave }: {
  t: Texts
  language: Language
  products: Product[]
  onClose: () => void
  onSave: (productId: string, change: number, reason: string) => void | Promise<void>
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? '')
  const [kind, setKind] = useState<'in' | 'out' | 'correction'>('in')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const selected = products.find((item) => item.id === productId)
  const amountLabel = kind === 'correction' ? (language === 'es' ? 'Existencia contada' : 'Counted stock') : t.units

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = Number(amount)
    if (!selected) {
      setError(t.selectProduct)
      return
    }
    if (!Number.isFinite(parsed) || parsed < 0 || !amount) {
      setError(language === 'es' ? 'Ingresa una cantidad válida.' : 'Enter a valid quantity.')
      return
    }
    if (!reason.trim()) {
      setError(t.required)
      return
    }
    const change = kind === 'in' ? parsed : kind === 'out' ? -parsed : parsed - selected.quantity
    if (change === 0) {
      setError(t.zeroMovement)
      return
    }
    if (selected.quantity + change < 0) {
      setError(language === 'es' ? 'La salida supera las existencias disponibles.' : 'The stock out exceeds available inventory.')
      return
    }
    setBusy(true)
    try {
      await onSave(productId, change, reason.trim())
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t.storageError)
    } finally {
      setBusy(false)
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="product-modal adjustment-modal" role="dialog" aria-modal="true" aria-labelledby="adjustment-title">
      <div className="modal-heading"><div><span className="modal-icon"><Warehouse size={19} /></span><div><h2 id="adjustment-title">{t.adjustInventory}</h2><p>{t.movementHistorySub}</p></div></div><button className="icon-button" onClick={onClose} aria-label={t.cancel}><X size={19} /></button></div>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label className="field span-two"><span>{t.product} *</span><select value={productId} onChange={(event) => setProductId(event.target.value)}>{products.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.quantity} {unitText(item.unit, t)}</option>)}</select></label>
          <label className="field"><span>{t.movement} *</span><select value={kind} onChange={(event) => { const value = event.target.value; if (value === 'in' || value === 'out' || value === 'correction') setKind(value) }}><option value="in">{t.entry}</option><option value="out">{t.exit}</option><option value="correction">{t.correction}</option></select></label>
          <label className="field"><span>{amountLabel} *</span><input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" /></label>
          <label className="field span-two"><span>{t.reason} *</span><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder={language === 'es' ? 'Ej. Recepción de compra / conteo físico' : 'e.g. Purchase received / physical count'} /></label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="outline-button" onClick={onClose} disabled={busy}>{t.cancel}</button><button type="submit" className="primary-button" disabled={busy}><Warehouse size={16} />{busy ? t.loading : t.saveAdjustment}</button></div>
      </form>
    </section>
  </div>
}

type CatalogProduct = {
  id: string
  name: string
  category: string
  price: number
  unit: string
  variant: string | null
  imageUrl: string | null
}

function isCatalogProduct(value: unknown): value is CatalogProduct {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.category === 'string'
    && typeof value.price === 'number'
    && typeof value.unit === 'string'
    && (typeof value.variant === 'string' || value.variant === null)
    && (typeof value.imageUrl === 'string' || value.imageUrl === null)
}

function PublicCatalogPage({ slug }: { slug: string }) {
  const t = copy.es
  const [store, setStore] = useState<{ name: string; currency: string } | null>(null)
  const [items, setItems] = useState<CatalogProduct[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const result = await requestApi(`/api/catalog/${encodeURIComponent(slug)}`)
        if (!isRecord(result) || !isRecord(result.store) || typeof result.store.name !== 'string'
          || typeof result.store.currency !== 'string' || !Array.isArray(result.items)
          || !(result.nextCursor === null || typeof result.nextCursor === 'string')) {
          throw new Error('El API devolvió un catálogo con un formato no válido.')
        }
        const loadedItems = result.items.filter(isCatalogProduct)
        if (loadedItems.length !== result.items.length) throw new Error('El API devolvió productos con datos no válidos.')
        if (active) {
          setStore({ name: result.store.name, currency: result.store.currency })
          setItems(loadedItems)
          setNextCursor(result.nextCursor)
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : t.storeUnavailable)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [slug, t.storeUnavailable])

  useEffect(() => {
    if (!store) return
    const previousTitle = document.title
    document.title = `${store.name} | TellezSoftware`
    return () => { document.title = previousTitle }
  }, [store])

  async function loadMore() {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    setError('')
    try {
      const result = await requestApi(`/api/catalog/${encodeURIComponent(slug)}?cursor=${encodeURIComponent(nextCursor)}`)
      if (!isRecord(result) || !Array.isArray(result.items)
        || !(result.nextCursor === null || typeof result.nextCursor === 'string')) {
        throw new Error('El API devolvió un catálogo con un formato no válido.')
      }
      const loadedItems = result.items.filter(isCatalogProduct)
      if (loadedItems.length !== result.items.length) throw new Error('El API devolvió productos con datos no válidos.')
      setItems((current) => [...current, ...loadedItems])
      setNextCursor(result.nextCursor)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t.storeUnavailable)
    } finally {
      setLoadingMore(false)
    }
  }

  return <main className="flex min-h-screen flex-col bg-[#f5fefa] text-[#293a33]">
    <header className="flex min-h-[66px] items-center justify-between border-b border-[#dff2ea] bg-white px-[max(22px,calc((100vw-1180px)/2))]"><a className="brand text-[#2b3c34] no-underline" href="/"><span className="brand-mark"><img src="/logo.png" alt="" /></span><span>Tellez<span className="brand-light">Software</span></span></a><span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#718078]">{t.store}</span></header>
    <section className="mx-auto my-[45px] mb-7 w-[calc(100%-44px)] max-w-[1180px] rounded-xl border border-[#dff2ea] bg-gradient-to-br from-[#eff7f0] to-white px-[34px] py-[30px] max-[620px]:mt-6 max-[620px]:px-4 max-[620px]:py-5"><p className="eyebrow text-[#62846a]">{t.productList}</p><h1 className="mb-1 catalog-title">{store?.name ?? t.store}</h1><p className="m-0 text-xs text-[#839087]">{t.productListSub}</p></section>
    <section className="mx-auto min-h-[300px] w-[calc(100%-44px)] max-w-[1180px] flex-1 max-[620px]:w-[calc(100%-28px)]" aria-label={t.productList}>
      {loading && <div className="px-4 py-9 text-center text-xs text-[#77857c]" role="status">{t.loading}</div>}
      {!loading && error && <div className="px-4 py-9 text-center text-xs text-[#9c5e56]" role="alert">{error || t.storeUnavailable}</div>}
      {!loading && !error && items.length === 0 && <div className="px-4 py-9 text-center text-xs text-[#77857c]">{t.storeEmpty}</div>}
      <div className="grid grid-cols-2 gap-2.5 min-[851px]:grid-cols-4 min-[1100px]:gap-4">{items.map((item) => <article className="overflow-hidden rounded-[10px] border border-[#dff2ea] bg-white transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_7px_22px_#26392d0b]" key={item.id}>
        <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-[#e9fdf5] text-[#85a58b]">{item.imageUrl ? <img className="block size-full object-cover" src={item.imageUrl} alt={item.name} loading="lazy" /> : <Package size={28} strokeWidth={1.4} />}</div>
        <div className="p-3.5 max-[620px]:p-2.5"><span className="text-[9px] font-bold uppercase tracking-[.04em] text-[#76917c]">{item.category}</span><h2 className="mb-1 mt-1 text-sm leading-[1.4] text-[#34443b]">{item.name}</h2>{item.variant && <p className="mb-2.5 mt-0 text-[10px] text-[#87938c]">{item.variant}</p>}<strong className="text-sm text-[#007a56]">{new Intl.NumberFormat('es-NI', { style: 'currency', currency: store?.currency ?? 'NIO', maximumFractionDigits: 2 }).format(item.price)} <small className="text-[10px] font-normal text-[#87938c]">/ {item.unit}</small></strong></div>
      </article>)}</div>
      {nextCursor && <div className="flex justify-center py-6"><button className="outline-button" disabled={loadingMore} onClick={() => void loadMore()}>{loadingMore ? t.loading : t.loadMore}</button></div>}
    </section>
    <footer className="mx-auto mt-[30px] flex min-h-16 w-[calc(100%-44px)] max-w-[1180px] items-center justify-between gap-3 border-t border-[#dff2ea] text-[10px] text-[#89968e] max-[620px]:w-[calc(100%-28px)] max-[620px]:flex-col max-[620px]:items-start max-[620px]:justify-center"><span>{t.storePowered}</span><nav className="flex gap-3.5"><a className="text-[#007a56] no-underline hover:underline" href="/terminos">Términos</a><a className="text-[#007a56] no-underline hover:underline" href="mailto:tellezsoftware@gmail.com">tellezsoftware@gmail.com</a></nav></footer>
  </main>
}

function App() {
  const termsPath = window.location.pathname.replace(/\/+$/u, '')
  if (termsPath === '/terminos' || termsPath === '/terms') {
    const language = new URLSearchParams(window.location.search).get('lang') === 'en' || termsPath === '/terms' ? 'en' : 'es'
    return <TermsPage language={language} />
  }
  const match = /^\/catalogo\/([^/]+)\/?$/u.exec(window.location.pathname)
  if (!window.location.pathname.startsWith('/catalogo/')) return <WorkspaceApp />
  let slug = match?.[1] ?? ''
  try {
    slug = decodeURIComponent(slug)
  } catch {
    console.error('The public catalog URL contains an invalid encoded slug.')
  }
  return <PublicCatalogPage slug={slug} />
}

export default App
