import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import AdminCategories from './pages/admin/AdminCategories'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductEdit from './pages/admin/AdminProductEdit'

function App() {
  return (
    <Routes>
      {/* Storefront */}
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="/urunler" element={<Products />} />
        <Route path="/kategori/:slug" element={<Products />} />
        <Route path="/urun/:slug" element={<ProductDetail />} />
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
      </Route>
    </Routes>
  )
}

export default App
