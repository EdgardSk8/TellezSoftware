// Cotizador: suma los paquetes marcados más el presupuesto del pedido personalizado.

const MAIL = 'tellezsoftware@gmail.com'

const packages = Array.from(document.querySelectorAll('[data-package]'))
const linesEl = document.querySelector('[data-quote-lines]')
const totalEl = document.querySelector('[data-quote-total]')
const summaryEl = document.querySelector('.quote-summary')
const mailEl = document.querySelector('[data-quote-mail]')
const copyEl = document.querySelector('[data-quote-copy]')
const statusEl = document.querySelector('[data-quote-status]')
const formEl = document.querySelector('[data-quote-form]')
const descriptionEl = document.querySelector('[data-quote-description]')
const budgetEl = document.querySelector('[data-quote-budget]')
const nameEl = document.querySelector('[data-quote-name]')
const contactEl = document.querySelector('[data-quote-contact]')

const money = (value) =>
  'C$ ' + String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const readState = () => {
  const chosen = packages
    .filter((card) => card.querySelector('[data-pick]').checked)
    .map((card) => ({
      name: card.dataset.package,
      price: Number(card.dataset.price) || 0,
    }))

  const description = descriptionEl.value.trim()
  const budget = Math.max(0, Math.round(Number(budgetEl.value) || 0))
  const hasCustom = description !== '' || budget > 0
  const total =
    chosen.reduce((sum, item) => sum + item.price, 0) + (hasCustom ? budget : 0)

  return { chosen, description, budget, hasCustom, total }
}

const renderLines = (state) => {
  linesEl.textContent = ''

  if (state.chosen.length === 0 && !state.hasCustom) {
    const empty = document.createElement('li')
    empty.className = 'quote-empty'
    empty.textContent = 'Todavía no has elegido nada.'
    linesEl.append(empty)
    return
  }

  const addRow = (label, amount) => {
    const row = document.createElement('li')
    row.className = 'quote-line'
    const name = document.createElement('span')
    name.textContent = label
    const value = document.createElement('b')
    value.textContent = amount
    row.append(name, value)
    linesEl.append(row)
  }

  state.chosen.forEach((item) => addRow(item.name, money(item.price)))

  if (state.hasCustom) {
    addRow('Pedido personalizado', state.budget > 0 ? money(state.budget) : 'A definir')
  }
}

const buildMessage = (state) => {
  const parts = ['Hola TellezSoftware, quiero cotizar lo siguiente:', '']

  if (state.chosen.length > 0) {
    parts.push('Paquetes:')
    state.chosen.forEach((item) => parts.push('- ' + item.name + ': ' + money(item.price)))
    parts.push('')
  }

  if (state.description !== '') {
    parts.push('Pedido personalizado:')
    parts.push(state.description)
    parts.push('')
  }

  if (state.budget > 0) {
    parts.push('Presupuesto que tengo en mente: ' + money(state.budget))
    parts.push('')
  }

  parts.push('Total estimado: ' + money(state.total))

  const name = nameEl.value.trim()
  const contact = contactEl.value.trim()
  if (name !== '') parts.push('', 'Nombre: ' + name)
  if (contact !== '') parts.push('Contacto: ' + contact)

  return parts.join('\n')
}

const update = () => {
  const state = readState()
  renderLines(state)
  totalEl.textContent = money(state.total)
  mailEl.href =
    'mailto:' +
    MAIL +
    '?subject=' +
    encodeURIComponent('Cotización desde el sitio web') +
    '&body=' +
    encodeURIComponent(buildMessage(state))
}

packages.forEach((card) => {
  card.querySelector('[data-pick]').addEventListener('change', update)
})

formEl.addEventListener('input', update)

formEl.addEventListener('submit', (event) => {
  event.preventDefault()
  const state = readState()

  if (state.chosen.length === 0 && !state.hasCustom) {
    statusEl.textContent = 'Elige un paquete o cuéntanos tu pedido para armar el resumen.'
    descriptionEl.focus()
    return
  }

  statusEl.textContent = ''
  summaryEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
})

copyEl.addEventListener('click', async () => {
  const message = buildMessage(readState())

  try {
    await navigator.clipboard.writeText(message)
    statusEl.textContent = 'Resumen copiado. Pégalo en WhatsApp o en un correo.'
  } catch {
    statusEl.textContent = 'No se pudo copiar automáticamente. Selecciona el texto y cópialo a mano.'
  }
})

update()
