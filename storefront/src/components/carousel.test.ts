import { describe, it, expect } from 'vitest'
import { nextSlide } from './carousel'

describe('nextSlide', () => {
  it('bir sonraki index’e geçer', () => {
    expect(nextSlide(0, 3)).toBe(1)
  })

  it('sondan başa döner', () => {
    expect(nextSlide(2, 3)).toBe(0)
  })

  it('tek slide’da yerinde kalır', () => {
    expect(nextSlide(0, 1)).toBe(0)
  })

  it('slide yokken 0 döner (patlamaz)', () => {
    expect(nextSlide(0, 0)).toBe(0)
  })
})
