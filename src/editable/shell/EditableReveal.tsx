'use client'

import { useEffect, useRef, useState } from 'react'

type EditableRevealProps = {
  children: React.ReactNode
  className?: string
  index?: number
}

export function EditableReveal({ children, className = '', index = 0 }: EditableRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`editable-reveal ${mounted ? 'is-mounted' : ''} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: mounted ? `${Math.min(index, 10) * 70}ms` : undefined }}
    >
      {children}
    </div>
  )
}
