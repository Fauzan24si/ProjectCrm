import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';
import RouteProgress from './components/RouteProgress';
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
const Profile = React.lazy(() => import('./pages/main/Profile'));
const Address = React.lazy(() => import('./pages/main/Address'));
const Keranjang = React.lazy(() => import('./pages/main/Keranjang'));
const TransactionHistory = React.lazy(() => import('./pages/main/TransactionHistory'));
const MemberTrackOrder = React.lazy(() => import('./pages/main/MemberTrackOrder'));
const Customers = React.lazy(() => import('./pages/main/Customers'));
const CustomerDetail = React.lazy(() => import('./pages/main/CustomerDetail'));
const UserDetail = React.lazy(() => import('./pages/main/UserDetail'));
const Users = React.lazy(() => import('./pages/main/Users'));
const Produk = React.lazy(() => import('./pages/main/Produk'));
const ProductDetail = React.lazy(() => import('./pages/main/ProductDetail'));
const SalesReport = React.lazy(() => import('./pages/main/SalesReport'));
const OrderDetail = React.lazy(() => import('./pages/main/OrderDetail'));
const Pesanan = React.lazy(() => import('./pages/main/Pesanan'));
const TrackOrder = React.lazy(() => import('./pages/main/TrackOrder'));
const PaymentConfirm = React.lazy(() => import('./pages/main/PaymentConfirm'));
const PaymentFinish = React.lazy(() => import('./pages/main/PaymentFinish'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CartProvider>
          <WishlistProvider>
            <RouteProgress />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="shop/:id" element={<ShopProductDetail />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="track" element={<TrackOrder />} />
                  <Route path="payment/confirm" element={<PaymentConfirm />} />
                  <Route path="payment/finish" element={<PaymentFinish />} />
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
                    <Route path="/member/profile" element={<Profile />} />
                    <Route path="/member/address" element={<Address />} />
                    <Route path="/member/cart" element={<Keranjang />} />
                    <Route path="/member/transactions" element={<TransactionHistory />} />
                    <Route path="/member/track" element={<MemberTrackOrder />} />
                  </Route>
                </Route>

                {/* Admin area — hanya admin yang boleh masuk */}
                <Route element={<ProtectedRoute role="admin" />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<Produk />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/sales-report" element={<SalesReport />} />
                    <Route path="/orders" element={<Pesanan />} />
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

// Fallback ringan saat chunk halaman (lazy) sedang dimuat:
// progress bar indeterminate ala DaisyUI di bagian atas, bukan
// loading fullscreen yang membuat layar "berkedip".
const RouteFallback = () => (
  <>
    <style>{`
      @keyframes route-indeterminate {
        0% { left: -40%; width: 40%; }
        50% { left: 30%; width: 50%; }
        100% { left: 100%; width: 40%; }
      }
      .route-fallback {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: rgba(16, 24, 40, 0.15);
        overflow: hidden;
        z-index: 9999;
      }
      .route-fallback::after {
        content: '';
        position: absolute;
        top: 0;
        height: 100%;
        background: #101828;
        box-shadow: 0 0 8px rgba(16, 24, 40, 0.6);
        animation: route-indeterminate 1.1s ease-in-out infinite;
      }
    `}</style>
    <div className="route-fallback" role="progressbar" aria-label="Memuat halaman" />
  </>
);

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
