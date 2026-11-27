import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { nextSlide } from './carousel'

export type HeroSlide = {
  img: string
  eyebrow?: string
  title: string
  cta: string
  href: string
}

const INTERVAL = 5000

/**
 * Tam genişlik, otomatik geçen hero carousel. Her slide: foto + koyu gradyan +
 * başlık + CTA. Noktalarla gezilir. Hareket azaltmada otomatik geçiş/animasyon
 * kapanır, ilk slide statik gösterilir; fare üzerindeyken geçiş durur.
 */
export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduce || paused || slides.length <= 1) return
    const id = setInterval(() => setIndex((i) => nextSlide(i, slides.length)), INTERVAL)
    return () => clearInterval(id)
  }, [reduce, paused, slides.length])

  if (slides.length === 0) return null
  const active = slides[Math.min(index, slides.length - 1)]

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <div
        className="relative h-[72vh] min-h-[460px] max-h-[760px] overflow-hidden rounded-2xl border border-border-subtle bg-surface"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Slide görseli (çapraz geçiş) */}
        <AnimatePresence initial={false} mode="sync">
          <motion.img
            key={active.img}
            src={active.img}
            alt={active.title}
            initial={reduce ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.8, ease: 'easeOut' }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* Okunabilirlik için koyu gradyan */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

        {/* İçerik */}
        <motion.div
          key={`txt-${index}`}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.1 }}
          className="absolute inset-x-0 bottom-0 p-6 sm:p-10"
        >
          {active.eyebrow && (
            <span className="label-caps text-white/70">{active.eyebrow}</span>
          )}
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
            {active.title}
          </h1>
          <Link
            to={active.href}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-text transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-white"
          >
            {active.cta}
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Noktalar */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 right-6 flex gap-2 sm:bottom-10">
            {slides.map((s, i) => (
              <button
                key={s.img}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                aria-current={i === index}
                className={
                  'h-2 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-white ' +
                  (i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80')
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
