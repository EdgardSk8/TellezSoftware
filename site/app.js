// Aparición escalonada al entrar en pantalla. Sin JS, el contenido se ve siempre.
const root = document.querySelector('[data-reveal-root]')

if (
  root &&
  'IntersectionObserver' in window &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  const targets = root.querySelectorAll('[data-reveal]')

  // Una sola pasada: al entrar en pantalla se deja de observar.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  )

  // El estado oculto solo existe cuando el JS ya está listo.
  root.dataset.revealReady = 'true'
  targets.forEach((target) => observer.observe(target))
}
