import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShoppingCart as CartIcon, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { CartItem } from '../components';
import './Cart.css';

const SHIPPING_THRESHOLD = 50;

const Cart = () => {
  const { cart, subtotal, shipping, tax, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();
  const toast     = useToast();

  const handleCheckout = () => {
    if (!user) {
      toast.info('Please sign in to proceed to checkout.');
      navigate('/login');
      return;
    }
    if (cart.length === 0) {
      toast.warning('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = () => {
    clearCart();
    toast.info('Cart cleared.');
  };

  /* ── Empty State ── */
  if (cart.length === 0) {
    return (
      <main className="cart-page container">
        <div className="cart-empty animate-fade-in">
          <div className="cart-empty__icon glass">
            <CartIcon size={48} strokeWidth={1.5} />
          </div>
          <h1 className="cart-empty__title">Your cart is empty</h1>
          <p className="cart-empty__sub">
            Looks like you haven't added anything yet.<br />
            Explore our products and find something you love!
          </p>
          <Link to="/products" className="btn btn-primary btn-lg animate-glow-pulse">
            <ShoppingBag size={18} /> Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  /* ── Filled Cart ── */
  return (
    <main className="cart-page container animate-fade-in">
      {/* Header */}
      <div className="cart-header">
        <div>
          <h1 className="cart-header__title">
            Shopping <span className="gradient-text">Cart</span>
          </h1>
          <p className="cart-header__count">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="btn btn-danger btn-sm"
          onClick={handleClearCart}
          title="Clear all items"
        >
          <Trash2 size={14} /> Clear Cart
        </button>
      </div>

      {/* Main grid */}
      <div className="cart-grid">
        {/* ── Item List ── */}
        <section className="cart-items">
          <div className="cart-items__list stagger">
            {cart.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Continue shopping */}
          <Link to="/products" className="cart-continue">
            ← Continue Shopping
          </Link>
        </section>

        {/* ── Order Summary ── */}
        <aside className="cart-summary glass-elevated">
          <h2 className="cart-summary__heading">Order Summary</h2>

          {/* Free shipping progress bar */}
          {shipping > 0 && (
            <div className="cart-free-shipping">
              <div className="cart-free-shipping__info">
                <span>Add <strong>${(SHIPPING_THRESHOLD - subtotal).toFixed(2)}</strong> more for free shipping!</span>
                <span className="badge badge-success">Free &gt;$50</span>
              </div>
              <div className="cart-free-shipping__bar">
                <div
                  className="cart-free-shipping__fill"
                  style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
          {shipping === 0 && subtotal > 0 && (
            <div className="cart-free-shipping-badge">
              <span className="badge badge-success">🎉 You qualify for free shipping!</span>
            </div>
          )}

          {/* Line items */}
          <div className="cart-summary__lines">
            <div className="cart-summary__line">
              <span className="cart-summary__label">Subtotal</span>
              <span className="cart-summary__value">${subtotal.toFixed(2)}</span>
            </div>
            <div className="cart-summary__line">
              <span className="cart-summary__label">Shipping</span>
              <span className={`cart-summary__value ${shipping === 0 ? 'cart-summary__value--free' : ''}`}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="cart-summary__line">
              <span className="cart-summary__label">Estimated Tax (8%)</span>
              <span className="cart-summary__value">${tax.toFixed(2)}</span>
            </div>
            <div className="cart-summary__divider" />
            <div className="cart-summary__line cart-summary__line--total">
              <span className="cart-summary__total-label">Total</span>
              <span className="cart-summary__total-value gradient-text">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            className="btn btn-primary btn-lg animate-glow-pulse"
            style={{ width: '100%' }}
            onClick={handleCheckout}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          {/* Security badges */}
          <div className="cart-summary__trust">
            <span>🔒 SSL Secured</span>
            <span>✦ Encrypted Checkout</span>
          </div>

          {/* Accepted payments */}
          <div className="cart-summary__payments">
            {['💳 Visa', '💳 Mastercard', '💳 PayPal', '💳 UPI'].map(p => (
              <span key={p} className="payment-chip">{p}</span>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Cart;
