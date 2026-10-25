/*
 * Um único IntersectionObserver para toda a página. Quando o elemento entra
 * na viewport ganha `data-revealed` e deixa de ser observado — o CSS faz a
 * transição usando o índice (--reveal-i) como atraso do stagger.
 */

let observer: IntersectionObserver | null = null

function getObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.setAttribute('data-revealed', '')
        obs.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
  )
  return observer
}

export function observeReveal(element: Element): () => void {
  const obs = getObserver()
  obs.observe(element)
  return () => {
    obs.unobserve(element)
  }
}
