import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menu,       setMenu]       = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname === path ? 'navbar__link--active' : '';

  /* Focus input when search bar opens */
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  /* Close search bar when route changes */
  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery('');
    setMenu(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/products');
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Admins should never see the customer navbar
  if (isAdmin) return null;

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo gradient-text">✦ ShopVerse</Link>

        {/* Desktop Nav links — hidden when search is open */}
        {!searchOpen && (
          <ul className="navbar__links">
            <li><Link to="/"        className={`navbar__link ${isActive('/')}`}>Home</Link></li>
            <li><Link to="/products" className={`navbar__link ${isActive('/products')}`}>Products</Link></li>
          </ul>
        )}

        {/* Inline search bar (expands on click) */}
        {searchOpen && (
          <form className="navbar__search-bar animate-fade-in" onSubmit={handleSearchSubmit}>
            <Search size={16} className="navbar__search-bar__icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="navbar__search-bar__input"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search products"
            />
            <button type="submit" className="navbar__search-bar__go btn btn-primary btn-sm">
              Go
            </button>
            <button
              type="button"
              className="navbar__icon-btn"
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </form>
        )}

        {/* Actions */}
        <div className="navbar__actions">
          {/* Search toggle */}
          {!searchOpen && (
            <button
              className="navbar__icon-btn"
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={20} />
            </button>
          )}

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
          {/* Mobile search */}
          <form className="navbar__mobile-search" onSubmit={handleSearchSubmit}>
            <Search size={15} />
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar__mobile-search__input"
              aria-label="Search products"
            />
          </form>
          <Link to="/"         className="navbar__mobile-link" onClick={() => setMenu(false)}>Home</Link>
          <Link to="/products" className="navbar__mobile-link" onClick={() => setMenu(false)}>Products</Link>
          <Link to="/products?sort=price_asc" className="navbar__mobile-link" onClick={() => setMenu(false)}>🏷️ Deals</Link>
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
