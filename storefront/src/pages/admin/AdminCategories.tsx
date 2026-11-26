import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  adminCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryInput,
} from '../../services/adminApi'
import type { Category } from '../../types'
import Seo from '../../components/Seo'

const EMPTY: CategoryInput = { name: '', parent_id: null, is_active: true }

export default function AdminCategories() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryInput>(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminCategories,
  })

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
    qc.invalidateQueries({ queryKey: ['categories'] }) // storefront menüsü de güncellensin
  }

  const saveMutation = useMutation({
    mutationFn: (input: CategoryInput) =>
      editing ? updateCategory(editing.id, input) : createCategory(input),
    onSuccess: () => {
      invalidate()
      closeForm()
    },
    onError: () => setError('Kaydedilemedi. Alanları kontrol edin (ad gerekli, slug benzersiz).'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: invalidate,
  })

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setError(null)
    setShowForm(true)
  }

  function openEdit(c: Category) {
    setEditing(c)
    setForm({ name: c.name, slug: c.slug, parent_id: c.parent_id, is_active: c.is_active })
    setError(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
    setForm(EMPTY)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    saveMutation.mutate(form)
  }

  return (
    <div>
      <Seo title="Kategoriler" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">Kategoriler</h1>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-text transition-transform hover:scale-105"
        >
          <Plus size={16} /> Yeni Kategori
        </button>
      </div>

      {/* Form (ekle/düzenle) */}
      {showForm && (
        <form
          onSubmit={submit}
          className="mb-6 rounded-xl border border-border-subtle bg-surface p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-text">
              {editing ? 'Kategori Düzenle' : 'Yeni Kategori'}
            </h2>
            <button type="button" onClick={closeForm} aria-label="Kapat" className="text-text-muted hover:text-text">
              <X size={18} />
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-text-muted">Ad *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-border-subtle bg-bg px-3 py-2 text-text focus:border-text-muted focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-text-muted">Üst Kategori</label>
              <select
                value={form.parent_id ?? ''}
                onChange={(e) =>
                  setForm({ ...form, parent_id: e.target.value ? Number(e.target.value) : null })
                }
                className="w-full rounded-lg border border-border-subtle bg-bg px-3 py-2 text-text focus:border-text-muted focus:outline-none"
              >
                <option value="">— Ana kategori —</option>
                {categories
                  .filter((c) => c.id !== editing?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="accent-primary"
            />
            Aktif
          </label>

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-text disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full border border-border-subtle px-5 py-2 text-sm text-text-muted hover:text-text"
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}

      {/* Liste */}
      <div className="overflow-hidden rounded-xl border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Ad</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Üst</th>
              <th className="px-4 py-3 font-medium">Ürün</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-bg">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">Yükleniyor…</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">Kategori yok.</td></tr>
            ) : (
              categories.map((c) => {
                const parent = categories.find((p) => p.id === c.parent_id)
                return (
                  <tr key={c.id} className="text-text">
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3 text-text-subtle">{c.slug}</td>
                    <td className="px-4 py-3 text-text-muted">{parent?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-text-muted">{c.products_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={c.is_active ? 'text-success' : 'text-text-subtle'}>
                        {c.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="rounded-md p-2 text-text-muted hover:bg-surface hover:text-text"
                          aria-label="Düzenle"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`"${c.name}" kategorisi silinsin mi?`)) deleteMutation.mutate(c.id)
                          }}
                          className="rounded-md p-2 text-text-muted hover:bg-surface hover:text-danger"
                          aria-label="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
