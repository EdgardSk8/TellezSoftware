// Aparición suave de los bloques al entrar en pantalla.
const targets = document.querySelectorAll('.reveal')
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if ('IntersectionObserver' in window && !reduced) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )

  targets.forEach((target) => observer.observe(target))
} else {
  targets.forEach((target) => target.classList.add('is-in'))
}
