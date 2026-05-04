import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider }          from './context/CartContext';
import { ToastProvider }         from './components/ui/Toast';
import Navbar          from './components/layout/Navbar';
import Home            from './pages/Home';
import Products        from './pages/Products';
import Cart            from './pages/Cart';
import Login           from './pages/Login';
import Profile         from './pages/Profile';
import ProductDetail   from './pages/ProductDetail';
import Checkout        from './pages/Checkout';
import Admin           from './pages/Admin';
import RagChatWidget   from './components/shared/RagChatWidget/RagChatWidget';

/* ── Full-page loader ────────────────────────────────────── */
const Loader = () => (
  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
    <div className="skeleton" style={{ width:200, height:40, borderRadius:'var(--radius-md)' }} />
  </div>
);

/* ── Route Guards ────────────────────────────────────────── */

/**
 * UserRoute — only logged-in CUSTOMERS can access.
 * Admins are redirected to /admin (they have no business on user pages).
 */
const UserRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user)    return <Navigate to="/login"  replace />;
  if (isAdmin)  return <Navigate to="/admin"  replace />;   // admin → admin panel
  return children;
};

/**
 * AdminRoute — only logged-in ADMINS can access.
 * Regular users are redirected to home.
 */
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading)  return <Loader />;
  if (!user)    return <Navigate to="/login"  replace />;
  if (!isAdmin) return <Navigate to="/"       replace />;   // user → storefront
  return children;
};

/**
 * GuestOrUserRoute — public routes that logged-in admins should skip.
 * E.g. home, products, cart — admins are bounced to their dashboard.
 */
const GuestOrUserRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading)  return <Loader />;
  if (user && isAdmin) return <Navigate to="/admin" replace />;
  return children;
};

/* ── Admin Layout (no Navbar, uses sidebar) ──────────────── */
const AdminLayout = () => (
  <Routes>
    <Route path="*" element={<AdminRoute><Admin /></AdminRoute>} />
  </Routes>
);

/* ── Customer Layout (with Navbar) ──────────────────────── */
const AppRoutes = () => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <Loader />;

  // Admins get the admin-only layout immediately
  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/login"   element={<Login />} />
        {/* Any other URL → admin dashboard */}
        <Route path="*"        element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  // Regular customers get the storefront + Navbar + RAG Chat Widget
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public pages */}
        <Route path="/"            element={<Home />} />
        <Route path="/products"    element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login"       element={<Login />} />

        {/* Customer-only pages */}
        <Route path="/cart"     element={<Cart />} />
        <Route path="/checkout" element={<UserRoute><Checkout /></UserRoute>} />
        <Route path="/profile"  element={<UserRoute><Profile /></UserRoute>} />

        {/* Admin panel blocked for users */}
        <Route path="/admin"    element={<Navigate to="/" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* RAG AI Chatbot — persists across all customer pages */}
      <RagChatWidget />
    </>
  );
};

/* ── Root App ────────────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
