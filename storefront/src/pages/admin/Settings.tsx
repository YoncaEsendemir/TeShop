import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  updateProfile,
  updatePassword,
  fetchAdminSettings,
  updateSettings,
  type StoreSettings,
} from '../../services/adminApi'
import { useAuth } from '../../store/auth'
import { useTheme, type ThemeChoice } from '../../store/theme'
import Seo from '../../components/Seo'

const inputCls =
  'w-full rounded-lg border border-border-subtle bg-bg px-3 py-2 text-sm text-text focus-visible:outline-2 focus-visible:outline-text'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface p-5">
      <h2 className="mb-4 font-medium text-text">{title}</h2>
      {children}
    </section>
  )
}

function Note({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return <p className={ok ? 'text-sm text-success' : 'text-sm text-danger'}>{children}</p>
}

export default function Settings() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { user, token, setAuth } = useAuth()
  const { theme, setTheme } = useTheme()

  // Profil
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const profileM = useMutation({
    mutationFn: () => updateProfile({ name, email }),
    onSuccess: (u) => { if (token) setAuth(token, u) },
  })

  // Şifre
  const [cur, setCur] = useState('')
  const [npw, setNpw] = useState('')
  const [npw2, setNpw2] = useState('')
  const passM = useMutation({
    mutationFn: () => updatePassword({ current_password: cur, new_password: npw, new_password_confirmation: npw2 }),
    onSuccess: () => { setCur(''); setNpw(''); setNpw2('') },
  })

  // Mağaza bilgisi
  const { data: settings } = useQuery({ queryKey: ['admin', 'settings'], queryFn: fetchAdminSettings })
  const [store, setStore] = useState<StoreSettings>({ store_name: '', store_email: '', store_phone: '', store_address: '' })
  useEffect(() => { if (settings) setStore(settings) }, [settings])
  const storeM = useMutation({
    mutationFn: () => updateSettings(store),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })

  const themes: ThemeChoice[] = ['light', 'dark', 'system']

  return (
    <div className="max-w-2xl space-y-6">
      <Seo title="Ayarlar" />
      <h1 className="font-display text-2xl font-bold text-text">Ayarlar</h1>

      {/* Tema */}
      <Section title={t('theme.label')}>
        <div className="flex gap-2">
          {themes.map((th) => (
            <button
              key={th}
              type="button"
              onClick={() => setTheme(th)}
              className={
                'rounded-full border px-4 py-2 text-sm transition-colors ' +
                (theme === th
                  ? 'border-text bg-primary text-primary-text'
                  : 'border-border-subtle bg-bg text-text-muted hover:text-text')
              }
            >
              {t(`theme.${th}`)}
            </button>
          ))}
        </div>
      </Section>

      {/* Profil */}
      <Section title="Profil">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); profileM.mutate() }}>
          <div>
            <label className="mb-1 block text-sm text-text-muted">Ad</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={profileM.isPending}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-text disabled:opacity-50">Kaydet</button>
            {profileM.isSuccess && <Note ok>Profil güncellendi.</Note>}
            {profileM.isError && <Note>Güncellenemedi (e-posta kullanımda olabilir).</Note>}
          </div>
        </form>
      </Section>

      {/* Şifre */}
      <Section title="Şifre Değiştir">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); passM.mutate() }}>
          <div>
            <label className="mb-1 block text-sm text-text-muted">Mevcut şifre</label>
            <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} className={inputCls} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-text-muted">Yeni şifre (min 8)</label>
              <input type="password" value={npw} onChange={(e) => setNpw(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted">Yeni şifre (tekrar)</label>
              <input type="password" value={npw2} onChange={(e) => setNpw2(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={passM.isPending}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-text disabled:opacity-50">Güncelle</button>
            {passM.isSuccess && <Note ok>Şifre güncellendi.</Note>}
            {passM.isError && <Note>Mevcut şifre hatalı veya yeni şifre geçersiz.</Note>}
          </div>
        </form>
      </Section>

      {/* Mağaza bilgisi */}
      <Section title="Mağaza Bilgisi">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); storeM.mutate() }}>
          <div>
            <label className="mb-1 block text-sm text-text-muted">Mağaza adı</label>
            <input value={store.store_name} onChange={(e) => setStore({ ...store, store_name: e.target.value })} className={inputCls} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-text-muted">İletişim e-posta</label>
              <input type="email" value={store.store_email} onChange={(e) => setStore({ ...store, store_email: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted">Telefon</label>
              <input value={store.store_phone} onChange={(e) => setStore({ ...store, store_phone: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">Adres</label>
            <input value={store.store_address} onChange={(e) => setStore({ ...store, store_address: e.target.value })} className={inputCls} />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={storeM.isPending}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-text disabled:opacity-50">Kaydet</button>
            {storeM.isSuccess && <Note ok>Mağaza bilgisi güncellendi.</Note>}
          </div>
        </form>
      </Section>
    </div>
  )
}
