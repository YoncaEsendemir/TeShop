import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <Seo title="Sayfa Bulunamadı" />
      <p className="font-display text-6xl font-bold text-text-subtle">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-text">
        Sayfa bulunamadı
      </h1>
      <p className="mt-2 text-text-muted">
        Aradığın sayfa taşınmış veya hiç var olmamış olabilir.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-primary px-6 py-3 font-medium text-primary-text transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-text"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  )
}
