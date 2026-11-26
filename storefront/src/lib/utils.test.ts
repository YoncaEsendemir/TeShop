import { describe, it, expect } from 'vitest'
import { formatPrice, imageUrl, cn } from './utils'

describe('formatPrice', () => {
  it('TL biçiminde virgüllü ve ₺ ile döner', () => {
    expect(formatPrice(299.9)).toBe('299,90 ₺')
  })

  it('string fiyatı da biçimler ve binlik ayraç ekler', () => {
    expect(formatPrice('1234.5')).toBe('1.234,50 ₺')
  })

  it('sıfırı biçimler', () => {
    expect(formatPrice(0)).toBe('0,00 ₺')
  })
})

describe('imageUrl', () => {
  it('null/undefined için null döner', () => {
    expect(imageUrl(null)).toBeNull()
    expect(imageUrl(undefined)).toBeNull()
  })

  it('zaten tam URL ise olduğu gibi döner', () => {
    expect(imageUrl('http://cdn.x/a.jpg')).toBe('http://cdn.x/a.jpg')
  })

  it('göreli yolu storage tabanıyla birleştirir', () => {
    expect(imageUrl('products/a.jpg')).toBe('http://localhost:8000/storage/products/a.jpg')
  })
})

describe('cn', () => {
  it('yalnızca truthy sınıfları birleştirir', () => {
    expect(cn('a', false, 'b', null, undefined, 'c')).toBe('a b c')
  })
})
