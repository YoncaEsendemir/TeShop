import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Star, Upload } from 'lucide-react'
import {
  adminCategories,
  adminProduct,
  createProduct,
  updateProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  uploadImage,
  deleteImage,
  type ProductInput,
  type VariantInput,
} from '../../services/adminApi'
import { imageUrl } from '../../lib/utils'
import Seo from '../../components/Seo'

const EMPTY_PRODUCT: ProductInput = {
  category_id: 0,
  name: '',
  description: '',
  base_price: 0,
  discount_price: null,
  is_active: true,
}

const EMPTY_VARIANT: VariantInput = { sku: '', size: '', color: '', price: null, stock: 0, is_active: true }

export default function AdminProductEdit() {
  const { id } = useParams()
  const productId = id ? Number(id) : null
  const isEdit = !!productId
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [form, setForm] = useState<ProductInput>(EMPTY_PRODUCT)
  const [variant, setVariant] = useState<VariantInput>(EMPTY_VARIANT)
  const [error, setError] = useState<string | null>(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminCategories,
  })

  const { data: product } = useQuery({
    queryKey: ['admin', 'product', productId],
    queryFn: () => adminProduct(productId!),
    enabled: isEdit,
  })

  // Düzenleme: ürünü forma doldur
  useEffect(() => {
    if (product) {
      setForm({
        category_id: product.category?.id ?? 0,
        name: product.name,
        description: product.description ?? '',
        base_price: parseFloat(product.base_price),
        discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
        is_active: product.is_active,
      })
    }
  }, [product])

  function refetchProduct() {
    qc.invalidateQueries({ queryKey: ['admin', 'product', productId] })
    qc.invalidateQueries({ queryKey: ['admin', 'products'] })
  }

  const saveProduct = useMutation({
    mutationFn: () =>
      isEdit && product
        ? updateProduct(product.id, form)
        : createProduct(form),
    onSuccess: (saved) => {
      setError(null)
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      if (!isEdit) navigate(`/admin/urunler/${saved.id}/duzenle`)
      else refetchProduct()
    },
    onError: () => setError('Ürün kaydedilemedi. Alanları kontrol edin (kategori, ad, fiyat gerekli).'),
  })

  const addVariant = useMutation({
    mutationFn: () => createVariant(product!.id, variant),
    onSuccess: () => { setVariant(EMPTY_VARIANT); refetchProduct() },
    onError: () => setError('Varyant eklenemedi (SKU benzersiz olmalı).'),
  })

  const changeStock = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) => updateVariant(id, { stock }),
    onSuccess: refetchProduct,
  })

  const removeVariant = useMutation({
    mutationFn: (id: number) => deleteVariant(id),
    onSuccess: refetchProduct,
  })

  const addImage = useMutation({
    mutationFn: ({ file, primary }: { file: File; primary: boolean }) =>
      uploadImage(product!.id, file, { is_primary: primary }),
    onSuccess: refetchProduct,
    onError: () => setError('Görsel yüklenemedi (yalnız resim, max 4MB).'),
  })

  const removeImage = useMutation({
    mutationFn: (id: number) => deleteImage(id),
    onSuccess: refetchProduct,
  })

  return (
    <div className="max-w-4xl">
      <Seo title={isEdit ? 'Ürün Düzenle' : 'Yeni Ürün'} />
      <Link to="/admin/urunler" className="mb-4 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} /> Ürünlere dön
      </Link>
      <h1 className="mb-6 font-display text-2xl font-bold text-text">
        {isEdit ? product?.name ?? 'Ürün Düzenle' : 'Yeni Ürün'}
      </h1>

      {error && (
        <p className="mb-5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {/* Ürün formu */}
      <form
        onSubmit={(e) => { e.preventDefault(); saveProduct.mutate() }}
        className="space-y-4 rounded-xl border border-border-subtle bg-surface p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-text-muted">Ürün Adı *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border-subtle bg-bg px-3 py-2 text-text focus:border-text-muted focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-muted">Kategori *</label>
            <select
              required
              value={form.category_id || ''}
              onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
              className="w-full rounded-lg border border-border-subtle bg-bg px-3 py-2 text-text focus:border-text-muted focus:outline-none"
            >
              <option value="">— Seç —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                checked={form.is_active ?? true}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="accent-primary"
              />
              Aktif (sitede görünür)
            </label>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-muted">Fiyat (₺) *</label>
            <input
              type="number" step="0.01" min="0" required
              value={form.base_price || ''}
              onChange={(e) => setForm({ ...form, base_price: parseFloat(e.target.value) })}
              className="w-full rounded-lg border border-border-subtle bg-bg px-3 py-2 text-text focus:border-text-muted focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-muted">İndirimli Fiyat (₺)</label>
            <input
              type="number" step="0.01" min="0"
              value={form.discount_price ?? ''}
              onChange={(e) => setForm({ ...form, discount_price: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full rounded-lg border border-border-subtle bg-bg px-3 py-2 text-text focus:border-text-muted focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-text-muted">Açıklama</label>
            <textarea
              rows={4}
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-border-subtle bg-bg px-3 py-2 text-text focus:border-text-muted focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saveProduct.isPending}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-text disabled:opacity-50"
        >
          {saveProduct.isPending ? 'Kaydediliyor…' : isEdit ? 'Değişiklikleri Kaydet' : 'Ürünü Oluştur'}
        </button>
        {!isEdit && (
          <p className="text-xs text-text-subtle">Ürünü oluşturduktan sonra varyant ve görsel ekleyebilirsin.</p>
        )}
      </form>

      {/* Varyantlar + Görseller (yalnız düzenlemede) */}
      {isEdit && product && (
        <>
          {/* Varyantlar */}
          <section className="mt-8">
            <h2 className="mb-4 font-display text-lg font-semibold text-text">
              Varyantlar (beden / renk / stok)
            </h2>

            <div className="overflow-hidden rounded-xl border border-border-subtle">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Beden</th>
                    <th className="px-4 py-3 font-medium">Renk</th>
                    <th className="px-4 py-3 font-medium">Stok</th>
                    <th className="px-4 py-3 font-medium text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle bg-bg">
                  {(product.variants ?? []).map((v) => (
                    <tr key={v.id} className="text-text">
                      <td className="px-4 py-3 text-text-subtle">{v.sku}</td>
                      <td className="px-4 py-3">{v.size ?? '—'}</td>
                      <td className="px-4 py-3">{v.color ?? '—'}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number" min="0" defaultValue={v.stock}
                          onBlur={(e) => {
                            const stock = parseInt(e.target.value)
                            if (!Number.isNaN(stock) && stock !== v.stock) changeStock.mutate({ id: v.id, stock })
                          }}
                          className="w-20 rounded-md border border-border-subtle bg-surface px-2 py-1 text-text focus:border-text-muted focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeVariant.mutate(v.id)}
                          className="rounded-md p-2 text-text-muted hover:text-danger"
                          aria-label="Varyantı sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Yeni varyant satırı */}
                  <tr className="bg-surface/50">
                    <td className="px-4 py-2">
                      <input
                        placeholder="SKU" value={variant.sku}
                        onChange={(e) => setVariant({ ...variant, sku: e.target.value })}
                        className="w-28 rounded-md border border-border-subtle bg-bg px-2 py-1 text-text focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        placeholder="M" value={variant.size ?? ''}
                        onChange={(e) => setVariant({ ...variant, size: e.target.value })}
                        className="w-16 rounded-md border border-border-subtle bg-bg px-2 py-1 text-text focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        placeholder="Siyah" value={variant.color ?? ''}
                        onChange={(e) => setVariant({ ...variant, color: e.target.value })}
                        className="w-24 rounded-md border border-border-subtle bg-bg px-2 py-1 text-text focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number" min="0" placeholder="0" value={variant.stock || ''}
                        onChange={(e) => setVariant({ ...variant, stock: parseInt(e.target.value) || 0 })}
                        className="w-20 rounded-md border border-border-subtle bg-bg px-2 py-1 text-text focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => variant.sku && addVariant.mutate()}
                        disabled={!variant.sku || addVariant.isPending}
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-text disabled:opacity-40"
                      >
                        <Plus size={14} /> Ekle
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Görseller */}
          <section className="mt-8">
            <h2 className="mb-4 font-display text-lg font-semibold text-text">Görseller</h2>

            <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-text hover:bg-surface-2">
              <Upload size={16} />
              Görsel Yükle
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) addImage.mutate({ file, primary: (product.images?.length ?? 0) === 0 })
                  e.target.value = ''
                }}
              />
            </label>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(product.images ?? []).map((img) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-border-subtle bg-surface-2">
                  <img src={imageUrl(img.path) ?? ''} alt="" className="h-full w-full object-cover" />
                  {img.is_primary && (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-text">
                      <Star size={10} /> Kapak
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage.mutate(img.id)}
                    className="absolute right-2 top-2 rounded-full bg-bg/80 p-1.5 text-text-muted hover:text-danger"
                    aria-label="Görseli sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(product.images?.length ?? 0) === 0 && (
                <p className="col-span-full py-6 text-sm text-text-subtle">Henüz görsel yok.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
