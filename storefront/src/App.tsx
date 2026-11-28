import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'

// Kod bölme: açılış (Home) dışındaki sayfalar talep üzerine yüklenir → küçük ilk paket
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Legal = lazy(() => import('./pages/Legal'))
const Register = lazy(() => import('./pages/Register'))
const Login = lazy(() => import('./pages/Login'))
const Account = lazy(() => import('./pages/Account'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Checkout = lazy(() => import('./pages/Checkout'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminProductEdit = lazy(() => import('./pages/admin/AdminProductEdit'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminOrderCreate = lazy(() => import('./pages/admin/AdminOrderCreate'))
const Settings = lazy(() => import('./pages/admin/Settings'))

function App() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Routes>
        {/* Storefront */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/urunler" element={<Products />} />
          <Route path="/kategori/:slug" element={<Products />} />
          <Route path="/urun/:slug" element={<ProductDetail />} />

          {/* Müşteri hesabı */}
          <Route path="/kayit" element={<Register />} />
          <Route path="/giris" element={<Login />} />
          <Route path="/hesabim" element={<Account />} />
          <Route path="/favorilerim" element={<Wishlist />} />
          <Route path="/odeme" element={<Checkout />} />

          {/* Yasal sayfalar (KVKK) */}
          <Route path="/gizlilik" element={<Legal slug="gizlilik" />} />
          <Route path="/kvkk" element={<Legal slug="kvkk" />} />
          <Route path="/cerez-politikasi" element={<Legal slug="cerez-politikasi" />} />
          <Route path="/mesafeli-satis" element={<Legal slug="mesafeli-satis" />} />
          <Route path="/iade" element={<Legal slug="iade" />} />
          <Route path="/kargo" element={<Legal slug="kargo" />} />
          <Route path="/iletisim" element={<Legal slug="iletisim" />} />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="kategoriler" element={<AdminCategories />} />
          <Route path="urunler" element={<AdminProducts />} />
          <Route path="urunler/yeni" element={<AdminProductEdit />} />
          <Route path="urunler/:id/duzenle" element={<AdminProductEdit />} />
          <Route path="siparisler" element={<AdminOrders />} />
          <Route path="siparisler/yeni" element={<AdminOrderCreate />} />
          <Route path="ayarlar" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
