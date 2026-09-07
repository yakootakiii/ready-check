import { useEffect, useRef, useState } from 'react'

/**
 * Entrance reveal driven by IntersectionObserver, so sections animate as they
 * scroll into view rather than all firing at load. `delay` staggers siblings.
 *
 * The observer is an enhancement, never the only path to visible: a hidden
 * document (a page opened in a background tab, or restored with the session)
 * starves IntersectionObserver entirely, and content that only becomes visible
 * on an observer callback would stay blank there. So anything already within
 * the viewport at mount reveals straight away — measured with
 * `getBoundingClientRect`, which is computed even while hidden — and the
 * observer is left to handle the scroll-in stagger for everything below the
 * fold.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const inView = () => {
      const rect = node.getBoundingClientRect()
      return rect.top < window.innerHeight && rect.bottom > 0
    }

    if (inView()) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    observer.observe(node)

    // Re-check when the tab comes back, in case the observer was starved.
    const onVisibilityChange = () => {
      if (!document.hidden && inView()) setVisible(true)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <Tag
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
