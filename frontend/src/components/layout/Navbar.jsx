import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menu, setMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname === path ? 'navbar__link--active' : '';

  // Admins should never see the customer navbar — they have the admin sidebar.
  // The AppRoutes in App.jsx already prevents rendering Navbar for admins,
  // but guard here too for safety.
  if (isAdmin) return null;

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo gradient-text">✦ ShopVerse</Link>

        {/* Desktop Nav links */}
        <ul className="navbar__links">
          <li><Link to="/"        className={`navbar__link ${isActive('/')}`}>Home</Link></li>
          <li><Link to="/products" className={`navbar__link ${isActive('/products')}`}>Products</Link></li>
        </ul>

        {/* Actions — customer-only */}
        <div className="navbar__actions">
          {/* Search */}
          <Link to="/products" className="navbar__icon-btn" aria-label="Search">
            <Search size={20} />
          </Link>

          {/* Cart with badge */}
          <Link to="/cart" className="navbar__icon-btn navbar__cart" aria-label="Cart">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="navbar__cart-badge animate-fade-in">{totalItems}</span>
            )}
          </Link>

          {user ? (
            <>
              {/* Profile */}
              <Link to="/profile" className="navbar__icon-btn" aria-label="My Account">
                <User size={20} />
              </Link>
              {/* Sign out */}
              <button onClick={handleSignOut} className="navbar__icon-btn" aria-label="Sign out">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm animate-glow-pulse">
              Login
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="navbar__hamburger navbar__icon-btn"
            aria-label="Toggle menu"
            onClick={() => setMenu(v => !v)}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {menu && (
        <div className="navbar__mobile-menu glass animate-fade-in">
          <Link to="/"         className="navbar__mobile-link" onClick={() => setMenu(false)}>Home</Link>
          <Link to="/products" className="navbar__mobile-link" onClick={() => setMenu(false)}>Products</Link>
          <Link to="/cart"     className="navbar__mobile-link" onClick={() => setMenu(false)}>
            Cart {totalItems > 0 && <span className="navbar__cart-badge">{totalItems}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="navbar__mobile-link" onClick={() => setMenu(false)}>My Account</Link>
              <button className="navbar__mobile-link navbar__mobile-signout" onClick={() => { setMenu(false); handleSignOut(); }}>
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{margin:'var(--space-4)'}} onClick={() => setMenu(false)}>
              Login / Sign Up
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
