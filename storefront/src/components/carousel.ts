/** Carousel'de bir sonraki slide index'i. 0/1 slide'da güvenle yerinde kalır. */
export function nextSlide(current: number, length: number): number {
  if (length <= 1) return 0
  return (current + 1) % length
}
