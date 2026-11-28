import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Legal from './pages/Legal'
import Register from './pages/Register'
import Login from './pages/Login'
import Account from './pages/Account'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import AdminCategories from './pages/admin/AdminCategories'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductEdit from './pages/admin/AdminProductEdit'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderCreate from './pages/admin/AdminOrderCreate'
import Settings from './pages/admin/Settings'

function App() {
  return (
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
  )
}

export default App
