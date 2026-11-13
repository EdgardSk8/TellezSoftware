import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
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
  X,
} from 'lucide-react'
import './App.css'

type Language = 'es' | 'en'
type Page = 'dashboard' | 'products' | 'inventory' | 'orders' | 'customers' | 'reports' | 'settings'

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
  tenant: { id: string; name: string; profile: string; currency: string; role: string }
}

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
    customers: 'Clientes', reports: 'Reportes', settings: 'Configuración',     workspaceLabel: 'ESPACIO DE TRABAJO', navAria: 'Navegación principal',
    operations: 'OPERACIONES', management: 'GESTIÓN', overview: 'VISTA GENERAL', welcome: 'Buenos días, Edgard 👋',
    subtitle: 'Aquí tienes el resumen de tu negocio por hoy.', addProduct: 'Agregar producto',
    totalProducts: 'Productos', stockUnits: 'Unidades en stock', lowStock: 'Stock bajo', inventoryValue: 'Valor del inventario',
    sampleData: 'Datos de muestra', localDemo: 'de este prototipo', accountData: 'datos de la cuenta', stockOverview: 'Resumen de inventario', stockOverviewSub: 'Estado actual de tus productos',
    email: 'Correo electrónico', password: 'Contraseña', signIn: 'Iniciar sesión', register: 'Crear cuenta', currency: 'Moneda',
    clothing: 'Ropa y calzado', hardware: 'Ferretería', solidGoods: 'Productos sólidos', personalProfile: 'Inventario personal',
    businessName: 'Nombre del negocio', createWorkspace: 'Crear espacio de trabajo', authTitle: 'Gestiona tu negocio con claridad',
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
    eachUnit: 'unidad', boxUnit: 'caja', packageUnit: 'paquete', meterUnit: 'metro',
    centimeterUnit: 'centímetro', kilogramUnit: 'kilogramo', gramUnit: 'gramo', literUnit: 'litro',
    gallonUnit: 'galón', rollUnit: 'rollo',
    selectProduct: 'Selecciona un producto', entry: 'Entrada', exit: 'Salida', correction: 'Corrección', noMovements: 'Aún no hay movimientos',
    previousQuantity: 'Antes', newQuantity: 'Después',
    comingSoon: 'En preparación', comingSoonHint: 'Esta sección forma parte de las siguientes etapas del proyecto.',
    margin: 'Margen estimado', welcomeBack: '¡Qué bueno verte de nuevo!',
  },
  en: {
    workspace: 'My business', owner: 'Starter plan · Nicaragua', search: 'Search products, orders...',
    dashboard: 'Dashboard', products: 'Products', inventory: 'Inventory', orders: 'Orders',
    customers: 'Customers', reports: 'Reports', settings: 'Settings',     workspaceLabel: 'WORKSPACE', navAria: 'Main navigation',
    operations: 'OPERATIONS', management: 'MANAGEMENT', overview: 'OVERVIEW', welcome: 'Good morning, Edgard 👋',
    subtitle: 'Here is your business summary for today.', addProduct: 'Add product',
    totalProducts: 'Products', stockUnits: 'Units in stock', lowStock: 'Low stock', inventoryValue: 'Inventory value',
    sampleData: 'Sample data', localDemo: 'in this prototype', accountData: 'account data', stockOverview: 'Inventory overview', stockOverviewSub: 'Current status of your products',
    email: 'Email address', password: 'Password', signIn: 'Sign in', register: 'Create account', currency: 'Currency',
    clothing: 'Clothing & footwear', hardware: 'Hardware', solidGoods: 'Consumer goods', personalProfile: 'Personal inventory',
    businessName: 'Business name', createWorkspace: 'Create workspace', authTitle: 'Run your business with clarity',
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
    eachUnit: 'unit', boxUnit: 'box', packageUnit: 'package', meterUnit: 'meter',
    centimeterUnit: 'centimeter', kilogramUnit: 'kilogram', gramUnit: 'gram', literUnit: 'liter',
    gallonUnit: 'gallon', rollUnit: 'roll',
    selectProduct: 'Select a product', entry: 'Stock in', exit: 'Stock out', correction: 'Correction', noMovements: 'No movements yet',
    previousQuantity: 'Before', newQuantity: 'After',
    comingSoon: 'Coming soon', comingSoonHint: 'This section is part of the next project milestones.',
    margin: 'Estimated margin', welcomeBack: 'Welcome back!',
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

function profileText(profile: string, t: Texts): string {
  const code = profileCodes[profile]
  if (code === 'clothing') return t.clothing
  if (code === 'hardware') return t.hardware
  if (code === 'solid_goods') return t.solidGoods
  return t.personalProfile
}

function unitText(unit: string, t: Texts): string {
  const units: Record<string, string> = {
    unidad: t.eachUnit,
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

async function loadApiWorkspace(): Promise<{ session: AuthSession; products: Product[]; movements: StockMovement[] }> {
  const value = await requestApi('/api/auth/me')
  if (!isRecord(value) || !isRecord(value.user) || !isRecord(value.tenant)) throw new Error('La sesión recibida no es válida.')
  const { user, tenant } = value
  if (typeof user.id !== 'string' || typeof user.email !== 'string' || typeof user.emailVerified !== 'boolean'
    || typeof tenant.id !== 'string' || typeof tenant.name !== 'string' || typeof tenant.profile !== 'string'
    || typeof tenant.currency !== 'string' || typeof tenant.role !== 'string') {
    throw new Error('La sesión recibida no contiene datos de espacio de trabajo válidos.')
  }

  const [productValue, movementValue] = await Promise.all([
    requestApi('/api/products?limit=100'),
    requestApi('/api/inventory/movements?limit=100'),
  ])
  if (!isRecord(productValue) || !Array.isArray(productValue.items) || !isRecord(movementValue) || !Array.isArray(movementValue.items)) {
    throw new Error('El inventario recibido no tiene el formato esperado.')
  }
  return {
    session: {
      user: { id: user.id, email: user.email, emailVerified: user.emailVerified },
      tenant: { id: tenant.id, name: tenant.name, profile: tenant.profile, currency: tenant.currency, role: tenant.role },
    },
    products: productValue.items.map(mapApiProduct),
    movements: movementValue.items.map(mapApiMovement),
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

function App() {
  const [language, setLanguage] = useState<Language>('es')
  const t = copy[language]
  const [apiStatus, setApiStatus] = useState<'checking' | 'ready' | 'unavailable'>('checking')
  const [session, setSession] = useState<AuthSession | null>(null)
  const [page, setPage] = useState<Page>('dashboard')
  const [products, setProducts] = useState<Product[]>(readProducts)
  const [movements, setMovements] = useState<StockMovement[]>(readMovements)
  const [query, setQuery] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'low' | 'out'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState(profiles[3])

  useEffect(() => {
    let active = true
    loadApiWorkspace().then((workspace) => {
      if (!active) return
      setSession(workspace.session)
      setProducts(workspace.products)
      setMovements(workspace.movements)
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
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const lowProducts = products.filter((item) => stockState(item) === 'low')
  const outProducts = products.filter((item) => stockState(item) === 'out')
  const filteredProducts = useMemo(() => products.filter((item) => {
    const matchesText = `${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(query.toLowerCase())
    const state = stockState(item)
    return matchesText && (stockFilter === 'all' || state === stockFilter)
  }), [products, query, stockFilter])
  const availableUnits = products.reduce((sum, item) => sum + item.quantity, 0)
  const inventoryValue = products.reduce((sum, item) => sum + item.quantity * item.cost, 0)

  async function refreshWorkspace() {
    const workspace = await loadApiWorkspace()
    setSession(workspace.session)
    setProducts(workspace.products)
    setMovements(workspace.movements)
    setProfile(profileLabel(workspace.session.tenant.profile))
    setApiStatus('ready')
  }

  async function signIn(email: string, password: string) {
    await requestApi('/api/auth/login', { email, password })
    await refreshWorkspace()
  }

  async function register(email: string, password: string, tenantName: string, tenantProfile: string, currency: string) {
    await requestApi('/api/auth/register', { email, password, tenantName, profile: tenantProfile, currency })
    await refreshWorkspace()
  }

  async function signOut() {
    try {
      await requestApi('/api/auth/logout', {}, 'POST')
      setSession(null)
      setProducts(initialProducts)
      setMovements([])
      setApiStatus('ready')
      setPage('dashboard')
    } catch (error) {
      setToast(error instanceof Error ? error.message : t.authUnavailable)
    }
  }

  async function saveProduct(product: Product) {
    if (session) {
      try {
        const result = await requestApi('/api/products', {
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
        })
        if (!isRecord(result) || typeof result.id !== 'string') throw new Error('El API no devolvió el identificador del producto.')
        const productId = result.id
        const savedProduct = { ...product, id: productId, profile }
        setProducts((current) => [savedProduct, ...current])
        const movementId = result.movementId
        if (typeof movementId === 'string' && product.quantity > 0) {
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
        setToast(t.success)
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

  function editProduct(product: Product) {
    setEditingProduct(product)
    setProfile(product.profile)
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

  const pageTitle = t[page]

  if (apiStatus === 'checking') {
    return <LoadingPage label={t.loading} />
  }

  if (apiStatus === 'ready' && !session) {
    return <AuthPage language={language} t={t} onLanguageChange={setLanguage} onSignIn={signIn} onRegister={register} />
  }

  return (
    <div className="app-shell">
      {sidebarOpen && <button className="mobile-backdrop" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Box size={21} strokeWidth={2.2} /></div>
          <span>Tellez<span className="brand-light">Software</span></span>
          <button className="sidebar-close icon-button" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={19} /></button>
        </div>
        <button className="workspace-switch" onClick={() => setToast(language === 'es' ? 'Selector de espacio disponible próximamente' : 'Workspace switcher coming soon')}>
          <span className="workspace-avatar">T</span>
          <span className="workspace-copy"><strong>{session?.tenant.name ?? t.workspace}</strong><small>{session ? session.tenant.role : t.owner}</small></span>
          <ChevronDown size={16} className="muted-icon" />
        </button>
        <nav className="side-nav" aria-label={t.navAria}>
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-caption">{t[group.label]}</p>
              {group.items.map(({ id, icon: Icon }) => (
                <button key={id} onClick={() => { setPage(id); setSidebarOpen(false) }} className={`nav-item ${page === id ? 'nav-active' : ''}`}>
                  <Icon size={18} strokeWidth={1.9} /><span>{t[id]}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="plan-card">
            <div className="plan-icon"><Sparkles size={16} /></div>
            <div className="plan-text"><strong>{t.plan}</strong><span>{session ? t.notConfigured : t.planSub}</span></div>
            <button className="plan-link" onClick={() => setToast(t.comingSoon)}>{t.seePlans}</button>
            {!session && <><div className="plan-meter"><span style={{ width: `${Math.min(products.length / 500 * 100, 100)}%` }} /></div><small>{products.length} / 500 {t.productsLimit} {t.used}</small></>}
            {session && <small>{products.length} {t.products.toLowerCase()}</small>}
          </div>
          <button className="nav-item support-item" onClick={() => setToast('tellezsoftware@gmail.com')}><CircleHelp size={18} /><span>{t.help}</span></button>
          <button className="user-profile" aria-label={session ? `${t.signOut}: ${session.user.email}` : t.account} onClick={session ? signOut : () => setToast(language === 'es' ? 'La gestión de cuenta estará disponible pronto' : 'Account management coming soon')}>
            <span className="user-avatar">{session ? session.user.email.slice(0, 2).toUpperCase() : 'ET'}</span><span className="user-copy"><strong>{session?.user.email ?? 'Edgard Tellez'}</strong><small>{session?.tenant.role ?? 'Administrador'}</small></span><LogOut size={17} className="muted-icon" />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle icon-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
            <div className="breadcrumbs"><span>{t.overview}</span><ChevronRight size={14} /><strong>{pageTitle}</strong></div>
          </div>
          <div className="topbar-actions">
            <label className="global-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} /><kbd>⌘ K</kbd></label>
            <button className="language-toggle" onClick={() => setLanguage((current) => current === 'es' ? 'en' : 'es')} aria-label="Change language">{language === 'es' ? 'ES' : 'EN'} <ChevronDown size={13} /></button>
            <button className="notification-button icon-button" aria-label={t.notifications} onClick={() => setToast(language === 'es' ? 'No tienes notificaciones nuevas' : 'You have no new notifications')}><Bell size={19} /><i /></button>
          </div>
        </header>

        <div className="page-content">
          {session && !session.user.emailVerified && <div className="email-notice" role="status"><CircleHelp size={15} /><span>{t.emailNotice}</span></div>}
          {apiStatus === 'unavailable' && <div className="api-warning" role="status"><CircleHelp size={15} /><span>{t.authUnavailable}</span></div>}
          {page === 'dashboard' && (
            <>
              <div className="welcome-row">
                <div><p className="eyebrow">{new Intl.DateTimeFormat(language === 'es' ? 'es-NI' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(appStartedAt)}</p><h1>{t.welcome}</h1><p className="page-subtitle">{t.subtitle}</p></div>
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
                    <div className="donut-wrap"><div className="donut-chart" style={{ background: `conic-gradient(#74b88e 0 ${(products.length - lowProducts.length - outProducts.length) / Math.max(products.length, 1) * 100}%, #e8b982 0 ${(products.length - outProducts.length) / Math.max(products.length, 1) * 100}%, #e89393 0 100%)` }}><div><strong>{products.length}</strong><span>{t.products.toLowerCase()}</span></div></div></div>
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
              <ProductsTable products={products.slice(0, 5)} t={t} currency={session?.tenant.currency} onViewAll={() => setPage('products')} onEdit={session ? undefined : editProduct} />
            </>
          )}

          {page === 'products' && (
            <>
              <div className="welcome-row">
                <div><p className="eyebrow">{t.management}</p><h1>{t.productList}</h1><p className="page-subtitle">{t.productListSub}</p></div>
                <button className="primary-button" onClick={() => { setEditingProduct(null); setModalOpen(true) }}><Plus size={18} />{t.addProduct}</button>
              </div>
              <div className="panel catalog-panel">
                <div className="catalog-toolbar">
                  <div className="tabs">
                    {(['all', 'in', 'low', 'out'] as const).map((filter) => <button key={filter} onClick={() => setStockFilter(filter)} className={stockFilter === filter ? 'tab-active' : ''}>{filter === 'all' ? t.all : filter === 'in' ? t.inStock : filter === 'low' ? t.low : t.out}{filter === 'low' && lowProducts.length > 0 && <span>{lowProducts.length}</span>}</button>)}
                  </div>
                  <div className="catalog-tools"><label className="table-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchProducts} /></label><button className="outline-button" onClick={() => setToast(t.comingSoon)}><SlidersHorizontal size={16} />{t.filters}</button></div>
                </div>
                <ProductsTable products={filteredProducts} t={t} currency={session?.tenant.currency} onEdit={session ? undefined : editProduct} />
                <div className="pagination"><span>{t.showing} <strong>{filteredProducts.length ? 1 : 0}–{filteredProducts.length}</strong> {t.of} <strong>{filteredProducts.length}</strong> {t.results}</span><div><button disabled><ChevronLeft size={16} />{t.previous}</button><button disabled>{t.next}<ChevronRight size={16} /></button></div></div>
              </div>
            </>
          )}

          {page === 'inventory' && (
            <>
              <div className="welcome-row"><div><p className="eyebrow">{t.operations}</p><h1>{t.inventoryTitle}</h1><p className="page-subtitle">{t.inventorySub}</p></div><div className="inventory-actions"><button className="outline-button" onClick={() => setAdjustOpen(true)}><SlidersHorizontal size={16} />{t.adjustInventory}</button><button className="primary-button" onClick={() => { setEditingProduct(null); setModalOpen(true) }}><Plus size={18} />{t.addProduct}</button></div></div>
              <div className="inventory-filter-row">{(['all', 'low', 'out'] as const).map((filter) => <button className={`inventory-filter ${stockFilter === filter ? 'filter-selected' : ''}`} onClick={() => setStockFilter(filter)} key={filter}>{filter === 'all' ? t.allStock : filter === 'low' ? `${t.lowStockTab} (${lowProducts.length})` : `${t.outTab} (${outProducts.length})`}</button>)}</div>
              <ProductsTable products={products.filter((item) => stockFilter === 'all' || stockState(item) === stockFilter)} t={t} currency={session?.tenant.currency} onEdit={session ? undefined : editProduct} />
              <section className="panel movement-panel">
                <div className="panel-heading"><div><h2>{t.movementHistory}</h2><p>{t.movementHistorySub}</p></div></div>
                <div className="movement-list">{movements.length === 0 ? <div className="movement-empty">{t.noMovements}</div> : movements.slice(0, 8).map((movement) => <div className="movement-row" key={movement.id}><span className={`movement-sign ${movement.change > 0 ? 'movement-in' : movement.change < 0 ? 'movement-out' : 'movement-correction'}`}>{movement.change > 0 ? '+' : ''}{movement.change}</span><span className="movement-name"><strong>{movement.productName}</strong><small>{movement.reason}</small></span><span className="movement-balance">{t.previousQuantity} {movement.before} <ChevronRight size={13} /> {t.newQuantity} {movement.after}</span><time>{new Intl.DateTimeFormat(language === 'es' ? 'es-NI' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(movement.createdAt))}</time></div>)}</div>
              </section>
            </>
          )}

          {!['dashboard', 'products', 'inventory'].includes(page) && (
            <section className="coming-panel"><div className="coming-icon"><ClipboardList size={25} /></div><p className="eyebrow">{t[page]}</p><h1>{t.comingSoon}</h1><p>{t.comingSoonHint}</p><button className="primary-button" onClick={() => setPage('dashboard')}>{t.dashboard}</button></section>
          )}
          <footer className="page-footer"><span>© 2026 TellezSoftware</span><span className="demo-indicator"><i />{session ? (language === 'es' ? 'Sesión autenticada · D1' : 'Authenticated session · D1') : (language === 'es' ? (apiStatus === 'unavailable' ? 'Modo demo local · API no disponible' : 'Prototipo local · datos de este navegador') : (apiStatus === 'unavailable' ? 'Local demo · API unavailable' : 'Local prototype · browser data'))}</span><a href="mailto:tellezsoftware@gmail.com">tellezsoftware@gmail.com</a></footer>
        </div>
      </main>
      {modalOpen && <ProductModal t={t} language={language} defaultProfile={profile} currency={session?.tenant.currency ?? 'NIO'} profileLocked={Boolean(session)} initialProduct={editingProduct ?? undefined} existingProducts={products} onProfileChange={setProfile} onClose={() => { setModalOpen(false); setEditingProduct(null) }} onSave={saveProduct} />}
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

function ProductsTable({ products, t, currency, onViewAll, onEdit }: { products: Product[]; t: Texts; currency?: string; onViewAll?: () => void; onEdit?: (product: Product) => void }) {
  return <section className="panel products-panel">
    <div className="panel-heading"><div><h2>{t.recentProducts}</h2><p>{t.recentProductsSub}</p></div>{onViewAll && <button className="subtle-button" onClick={onViewAll}>{t.viewAll}<ChevronRight size={15} /></button>}</div>
    <div className="table-scroll"><table><thead><tr><th>{t.product}</th><th>{t.sku}</th><th>{t.category}</th><th>{t.quantity}</th><th>{t.price}</th><th>{t.status}</th>{onEdit && <th aria-label={t.editProduct} />}</tr></thead>
      <tbody>{products.map((item) => {
        const state = stockState(item)
        const label = state === 'out' ? t.out : state === 'low' ? t.low : t.inStock
        return <tr key={item.id}><td><div className="product-cell"><span className={`product-thumb ${item.category.toLowerCase().includes('ropa') ? 'thumb-pink' : item.category.toLowerCase().includes('herra') ? 'thumb-green' : item.category.toLowerCase().includes('tecnología') ? 'thumb-blue' : 'thumb-yellow'}`}><Package size={17} /></span><span><strong>{item.name}</strong>{item.variant && <small>{item.variant}</small>}</span></div></td><td><span className="sku-text">{item.sku}</span></td><td>{item.category}</td><td><strong className={state === 'out' ? 'quantity-out' : ''}>{item.quantity}</strong><span className="unit-text"> {unitText(item.unit, t)}</span></td><td className="price-cell">{money(item.price, currency)}</td><td><span className={`status-pill status-${state}`}><i />{label}</span></td>{onEdit && <td><button className="row-action" aria-label={`${t.editProduct}: ${item.name}`} onClick={() => onEdit(item)}><Pencil size={14} /></button></td>}</tr>
      })}</tbody></table>
      {products.length === 0 && <div className="empty-state"><div><Package size={22} /></div><strong>{t.noResults}</strong><span>{t.noResultsHint}</span></div>}
    </div>
  </section>
}

function LoadingPage({ label }: { label: string }) {
  return <main className="loading-page"><div className="brand-mark"><Box size={21} /></div><span>{label}</span></main>
}

function AuthPage({ language, t, onLanguageChange, onSignIn, onRegister }: {
  language: Language
  t: Texts
  onLanguageChange: (language: Language) => void
  onSignIn: (email: string, password: string) => Promise<void>
  onRegister: (email: string, password: string, tenantName: string, profile: string, currency: string) => Promise<void>
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [profile, setProfile] = useState('hardware')
  const [currency, setCurrency] = useState('NIO')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await onSignIn(email.trim(), password)
      else await onRegister(email.trim(), password, tenantName.trim(), profile, currency)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.authUnavailable)
    } finally {
      setBusy(false)
    }
  }

  function changeMode(next: 'login' | 'register') {
    setMode(next)
    setError('')
  }

  return <main className="auth-page">
    <div className="auth-topbar">
      <a className="brand auth-brand" href="/" aria-label="TellezSoftware home"><span className="brand-mark"><Box size={21} /></span><span>Tellez<span className="brand-light">Software</span></span></a>
      <button className="language-toggle" onClick={() => onLanguageChange(language === 'es' ? 'en' : 'es')} aria-label="Change language">{language === 'es' ? 'ES' : 'EN'} <ChevronDown size={13} /></button>
    </div>
    <div className="auth-layout">
      <section className="auth-intro">
        <div className="auth-orb"><Package size={32} /></div>
        <p className="eyebrow">TELLEZSOFTWARE</p>
        <h1>{t.authTitle}</h1>
        <p>{t.authSubtitle}</p>
        <div className="auth-feature"><span><Package size={17} /></span><div><strong>{t.inventory}</strong><small>{language === 'es' ? 'Productos y existencias organizados' : 'Products and stock, organized'}</small></div></div>
        <div className="auth-feature"><span><Warehouse size={17} /></span><div><strong>{language === 'es' ? 'Un espacio para tu negocio' : 'One workspace for your business'}</strong><small>{language === 'es' ? 'Tus datos privados y bajo tu control' : 'Your private data, under your control'}</small></div></div>
      </section>
      <section className="auth-card" aria-labelledby="auth-heading">
        <div className="auth-tabs"><button type="button" className={mode === 'login' ? 'auth-tab-active' : ''} onClick={() => changeMode('login')}>{t.signIn}</button><button type="button" className={mode === 'register' ? 'auth-tab-active' : ''} onClick={() => changeMode('register')}>{t.register}</button></div>
        <h2 id="auth-heading">{mode === 'login' ? t.signIn : t.createWorkspace}</h2>
        <p className="auth-card-subtitle">{mode === 'login' ? t.welcomeBack : t.authSubtitle}</p>
        <form onSubmit={submit}>
          {mode === 'register' && <>
            <label className="field"><span>{t.businessName} *</span><input autoFocus required maxLength={100} value={tenantName} onChange={(event) => setTenantName(event.target.value)} placeholder={language === 'es' ? 'Ej. Mi tienda' : 'e.g. My store'} /></label>
            <label className="field"><span>{t.profileLabel} *</span><select value={profile} onChange={(event) => setProfile(event.target.value)}>{Object.entries(profileCodes).map(([label, code]) => <option value={code} key={code}>{profileText(label, t)}</option>)}</select></label>
            <label className="field"><span>{t.currency} *</span><select value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="NIO">NIO — Córdobas</option><option value="USD">USD — US Dollar</option></select></label>
          </>}
          <label className="field"><span>{t.email} *</span><input autoFocus={mode === 'login'} required type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@ejemplo.com" /></label>
          <label className="field"><span>{t.password} *</span><input required type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 12 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••••" /><small className="password-hint">{mode === 'register' ? t.passwordHint : ''}</small></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="primary-button auth-submit" disabled={busy}>{busy ? t.loading : mode === 'login' ? t.signIn : t.createWorkspace}<ChevronRight size={17} /></button>
        </form>
        <p className="auth-switch">{mode === 'login' ? t.noAccount : t.haveAccount}<button onClick={() => changeMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? t.createAccount : t.backToSignIn}</button></p>
        <p className="auth-footnote">{language === 'es' ? 'Al crear una cuenta, tus datos se guardan en la base de datos configurada para esta aplicación.' : 'When you create an account, your data is saved in this application database.'}</p>
      </section>
    </div>
    <footer className="auth-footer"><span>© 2026 TellezSoftware</span><a href="mailto:tellezsoftware@gmail.com">tellezsoftware@gmail.com</a><span>Pages Functions + D1</span></footer>
  </main>
}

function ProductModal({ t, language, defaultProfile, currency, profileLocked, initialProduct, existingProducts, onProfileChange, onClose, onSave }: {
  t: Texts
  language: Language
  defaultProfile: string
  currency: string
  profileLocked: boolean
  initialProduct?: Product
  existingProducts: Product[]
  onProfileChange: (profile: string) => void
  onClose: () => void
  onSave: (product: Product) => void | Promise<void>
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState(() => ({
    name: initialProduct?.name ?? '',
    sku: initialProduct?.sku ?? '',
    category: initialProduct?.category ?? '',
    quantity: String(initialProduct?.quantity ?? 0),
    minStock: String(initialProduct?.minStock ?? 3),
    unit: initialProduct?.unit ?? 'unidad',
    cost: initialProduct?.cost ? String(initialProduct.cost) : '',
    price: initialProduct?.price ? String(initialProduct.price) : '',
    variant: initialProduct?.variant ?? '',
    serial: initialProduct?.serial ?? '',
  }))
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const currencyLabel = currency === 'NIO' ? 'C$' : currency
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
      await onSave({ id: initialProduct?.id ?? crypto.randomUUID(), name: form.name.trim(), sku: form.sku.trim(), category: form.category.trim() || 'General', profile: defaultProfile, quantity: numeric(form.quantity), minStock: numeric(form.minStock), unit: form.unit, cost: numeric(form.cost), price: numeric(form.price), variant: form.variant.trim() || undefined, serial: form.serial.trim() || undefined })
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
          <label className="field"><span>{t.category}</span><input value={form.category} onChange={(event) => update('category', event.target.value)} placeholder={language === 'es' ? 'Ej. Ropa' : 'e.g. Clothing'} /></label>
          <label className="field"><span>{t.profileLabel}</span><select value={defaultProfile} disabled={profileLocked} onChange={(event) => onProfileChange(event.target.value)}>{profiles.map((item) => <option value={item} key={item}>{profileText(item, t)}</option>)}</select></label>
          <label className="field"><span>{t.unit}</span><select value={form.unit} onChange={(event) => update('unit', event.target.value)}>{['unidad', 'caja', 'paquete', 'metro', 'centímetro', 'kilogramo', 'gramo', 'litro', 'galón', 'rollo'].map((unit) => <option value={unit} key={unit}>{unitText(unit, t)}</option>)}</select></label>
          <label className="field"><span>{t.quantity}</span><input type="number" min="0" step="0.01" value={form.quantity} onChange={(event) => update('quantity', event.target.value)} /></label>
          <label className="field"><span>{t.minStock}</span><input type="number" min="0" step="0.01" value={form.minStock} onChange={(event) => update('minStock', event.target.value)} /></label>
          <label className="field"><span>{t.cost} ({currencyLabel})</span><input type="number" min="0" step="0.01" value={form.cost} onChange={(event) => update('cost', event.target.value)} placeholder="0.00" /></label>
          <label className="field"><span>{t.price} ({currencyLabel})</span><input type="number" min="0" step="0.01" value={form.price} onChange={(event) => update('price', event.target.value)} placeholder="0.00" /></label>
          <label className="field"><span>{t.variant}</span><input value={form.variant} onChange={(event) => update('variant', event.target.value)} placeholder={language === 'es' ? 'Ej. Azul / Talla M' : 'e.g. Blue / Size M'} /></label>
          <label className="field"><span>{t.serial}</span><input value={form.serial} onChange={(event) => update('serial', event.target.value)} placeholder={language === 'es' ? 'Ej. IMEI / número de serie' : 'e.g. IMEI / serial number'} /></label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="outline-button" onClick={onClose} disabled={busy}>{t.cancel}</button><button type="submit" className="primary-button" disabled={busy}>{initialProduct ? <Pencil size={15} /> : <Plus size={17} />}{busy ? t.loading : initialProduct ? t.updateProduct : t.save}</button></div>
      </form>
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

export default App
