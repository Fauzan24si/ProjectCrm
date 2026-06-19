import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import Loading from './components/Loading';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Lazy load pages
const Home = React.lazy(() => import('./pages/main/Home'));
const Shop = React.lazy(() => import('./pages/main/Shop'));
const About = React.lazy(() => import('./pages/main/About'));
const Contact = React.lazy(() => import('./pages/main/Contact'));
const ShopProductDetail = React.lazy(() => import('./pages/main/ShopProductDetail'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const Dashboard = React.lazy(() => import('./pages/main/Dashboard'));
const MemberDashboard = React.lazy(() => import('./pages/main/MemberDashboard'));
const Wishlist = React.lazy(() => import('./pages/main/Wishlist'));
const Customers = React.lazy(() => import('./pages/main/Customers'));
const CustomerDetail = React.lazy(() => import('./pages/main/CustomerDetail'));
const UserDetail = React.lazy(() => import('./pages/main/UserDetail'));
const Users = React.lazy(() => import('./pages/main/Users'));
const Produk = React.lazy(() => import('./pages/main/Produk'));
const ProductDetail = React.lazy(() => import('./pages/main/ProductDetail'));
const SalesReport = React.lazy(() => import('./pages/main/SalesReport'));
const OrderDetail = React.lazy(() => import('./pages/main/OrderDetail'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CartProvider>
          <WishlistProvider>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="shop/:id" element={<ShopProductDetail />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                </Route>

                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Member area — pakai AdminLayout dengan sidebar role-aware */}
                <Route element={<ProtectedRoute role="user" />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/member" element={<MemberDashboard />} />
                    <Route path="/member/wishlist" element={<Wishlist />} />
                  </Route>
                </Route>

                {/* Admin area — hanya admin yang boleh masuk */}
                <Route element={<ProtectedRoute role="admin" />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<Produk />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/sales-report" element={<SalesReport />} />
                    <Route path="/orders/:id" element={<OrderDetail />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/customers/:id" element={<CustomerDetail />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/users/:abc" element={<UserDetail />} />
                  </Route>
                </Route>

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <ChatWidgetWrapper />
          </WishlistProvider>
        </CartProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// A wrapper to hide ChatWidget on auth screens
const ChatWidgetWrapper = () => {
  const location = useLocation();
  const hidePaths = ['/login', '/register'];
  if (hidePaths.includes(location.pathname)) {
    return null;
  }
  return <ChatWidget />;
};

export default App;
