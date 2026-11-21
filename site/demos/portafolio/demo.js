// Aparición escalonada al hacer scroll, como en el sitio principal.
document.documentElement.classList.add('js')

const root = document.querySelector('[data-reveal-root]')

const groups = [
  '.hero-grid > *',
  '.block-head',
  '.work-item',
  '.profile > *',
  '.card',
  '.step',
  '.include',
  '.plan',
  '.faq',
  '.contact-panel',
]

if (root) {
  const targets = new Set()

  groups.forEach((selector) => {
    root.querySelectorAll(selector).forEach((element, index) => {
      element.setAttribute('data-reveal', '')
      element.style.setProperty('--i', String(index))
      targets.add(element)
    })
  })

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if ('IntersectionObserver' in window && !reduced) {
    const pending = new Set(targets)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          pending.delete(entry.target)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )

    root.setAttribute('data-reveal-ready', 'true')
    targets.forEach((target) => observer.observe(target))

    // Red de seguridad: con un salto de scroll nada queda oculto para siempre.
    let frame = 0

    const sweep = () => {
      frame = 0

      for (const target of Array.from(pending)) {
        if (target.getBoundingClientRect().top >= window.innerHeight * 0.94) continue
        target.classList.add('is-in')
        pending.delete(target)
        observer.unobserve(target)
      }
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(sweep)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    sweep()
  }
}
