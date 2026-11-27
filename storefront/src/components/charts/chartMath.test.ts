import { describe, it, expect } from 'vitest'
import { niceMax, donutSegments, barHeights } from './chartMath'

describe('niceMax', () => {
  it('maksimumu kapsayan yuvarlak değer döner', () => {
    expect(niceMax([3, 7])).toBeGreaterThanOrEqual(7)
  })
  it('boş dizide 0 (güvenli)', () => {
    expect(niceMax([])).toBe(0)
  })
})

describe('donutSegments', () => {
  it('oranları toplamı 1 olacak şekilde böler', () => {
    const segs = donutSegments([1, 1, 2])
    expect(segs.map((s) => s.length)).toEqual([0.25, 0.25, 0.5])
    const sum = segs.reduce((a, s) => a + s.length, 0)
    expect(sum).toBeCloseTo(1)
  })
  it('boş dizide boş döner', () => {
    expect(donutSegments([])).toEqual([])
  })
})

describe('barHeights', () => {
  it('değerleri yüksekliğe ölçekler', () => {
    const h = barHeights([5, 10], 100)
    expect(h[1]).toBeGreaterThan(h[0])
    expect(Math.max(...h)).toBeLessThanOrEqual(100)
  })
})
