import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, ClipboardList, CheckCircle, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Input  from '../components/ui/Input';
import './Checkout.css';

/* ── Step definitions ─────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Address',  icon: <MapPin size={16} /> },
  { id: 2, label: 'Payment',  icon: <CreditCard size={16} /> },
  { id: 3, label: 'Review',   icon: <ClipboardList size={16} /> },
];

const EMPTY_ADDRESS = {
  full_name: '', phone: '', line1: '', line2: '',
  city: '', state: '', zip: '', country: 'India',
};

const EMPTY_PAYMENT = {
  card_number: '', name_on_card: '', expiry: '', cvv: '',
};

/* ── Helpers ─────────────────────────────────────────────────── */
const maskCard = (val) =>
  val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);

const maskExpiry = (val) =>
  val.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5);

/* ── Component ───────────────────────────────────────────────── */
const Checkout = () => {
  const { cart, subtotal, shipping, tax, totalPrice, clearCart } = useCart();
  const { user }  = useAuth();
  const navigate   = useNavigate();
  const toast      = useToast();

  const [step,    setStep]    = useState(1);
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [payment, setPayment] = useState(EMPTY_PAYMENT);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  /* Field helpers */
  const addrField = (field) => ({
    value: address[field],
    onChange: (e) => setAddress(p => ({ ...p, [field]: e.target.value })),
  });
  const payField = (field) => ({
    value: payment[field],
    onChange: (e) => {
      let val = e.target.value;
      if (field === 'card_number') val = maskCard(val);
      if (field === 'expiry')      val = maskExpiry(val);
      setPayment(p => ({ ...p, [field]: val }));
    },
  });

  /* Step validation */
  const validateAddress = () => {
    const req = ['full_name', 'phone', 'line1', 'city', 'state', 'zip'];
    return req.every(f => address[f].trim());
  };
  const validatePayment = () => {
    return payment.card_number.length >= 19 &&
           payment.name_on_card.trim() &&
           payment.expiry.length === 5 &&
           payment.cvv.length >= 3;
  };

  /* Place order */
  const placeOrder = async () => {
    setPlacing(true);
    try {
      // 1. Create order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([{
          user_id:     user.id,
          total_price: totalPrice,
          status:      'pending',
          shipping_address: address,
        }])
        .select()
        .single();
      if (orderErr) throw orderErr;

      // 2. Insert order items
      const items = cart.map(item => ({
        order_id:   order.id,
        product_id: item.id,
        name:       item.name,
        price:      item.price,
        quantity:   item.quantity,
        image_url:  item.image_url,
      }));
      const { error: itemsErr } = await supabase.from('order_items').insert(items);
      if (itemsErr) throw itemsErr;

      // 3. Clear cart
      clearCart();
      setOrderId(order.id);
      setStep(4);  // confirmation screen
      toast.success('🎉 Order placed successfully!');
    } catch (err) {
      toast.error(err.message || 'Order failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  /* ── Step: Confirmed ── */
  if (step === 4) {
    return (
      <main className="checkout-page container animate-fade-in">
        <div className="checkout-confirmed glass-elevated">
          <CheckCircle size={64} strokeWidth={1.5} className="checkout-confirmed__icon" />
          <h1 className="checkout-confirmed__title">Order Confirmed! 🎉</h1>
          <p className="checkout-confirmed__sub">
            Your order <strong>#{orderId?.slice(0, 8).toUpperCase()}</strong> has been placed and is being processed.
          </p>
          <div className="checkout-confirmed__actions">
            <Button variant="primary" glow onClick={() => navigate('/profile')}>
              View My Orders
            </Button>
            <Button variant="ghost" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page container animate-fade-in">
      <h1 className="checkout-page__title">
        Secure <span className="gradient-text">Checkout</span>
      </h1>

      {/* ── Progress bar ── */}
      <div className="checkout-steps">
        {STEPS.map((s, i) => (
          <div key={s.id} className="checkout-step-wrap">
            <div className={`checkout-step ${step >= s.id ? 'checkout-step--active' : ''} ${step > s.id ? 'checkout-step--done' : ''}`}>
              <span className="checkout-step__icon">
                {step > s.id ? <CheckCircle size={16} /> : s.icon}
              </span>
              <span className="checkout-step__label">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`checkout-step__connector ${step > s.id ? 'checkout-step__connector--done' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Layout ── */}
      <div className="checkout-grid">
        {/* Left — Form */}
        <div className="checkout-form-col">

          {/* STEP 1 — Address */}
          {step === 1 && (
            <div className="checkout-panel glass animate-fade-in">
              <h2 className="checkout-panel__title"><MapPin size={18} /> Shipping Address</h2>
              <div className="checkout-form-grid">
                <Input label="Full Name"    placeholder="John Doe"      {...addrField('full_name')} required />
                <Input label="Phone"        placeholder="+91 9876543210" {...addrField('phone')}    required />
                <Input label="Address Line 1" placeholder="Street, building" {...addrField('line1')} required className="checkout-full" />
                <Input label="Address Line 2" placeholder="Apt, suite (optional)" {...addrField('line2')} className="checkout-full" />
                <Input label="City"   placeholder="Mumbai"      {...addrField('city')}    required />
                <Input label="State"  placeholder="Maharashtra" {...addrField('state')}   required />
                <Input label="ZIP"    placeholder="400001"      {...addrField('zip')}     required />
                <Input label="Country" placeholder="India"      {...addrField('country')} required />
              </div>
              <Button
                variant="primary" fullWidth glow
                icon={<ChevronRight size={16} />}
                onClick={() => {
                  if (!validateAddress()) { toast.warning('Please fill all required fields.'); return; }
                  setStep(2);
                }}
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {/* STEP 2 — Payment */}
          {step === 2 && (
            <div className="checkout-panel glass animate-fade-in">
              <h2 className="checkout-panel__title"><CreditCard size={18} /> Payment Details</h2>
              <div className="checkout-mock-notice">
                🔒 This is a <strong>demo checkout</strong> — no real payment is processed.
              </div>
              <div className="checkout-form-grid">
                <Input
                  label="Card Number" placeholder="1234 5678 9012 3456"
                  maxLength={19} {...payField('card_number')}
                  className="checkout-full" required
                />
                <Input label="Name on Card" placeholder="John Doe"   {...payField('name_on_card')} className="checkout-full" required />
                <Input label="Expiry (MM/YY)" placeholder="12/27"    {...payField('expiry')}       maxLength={5} required />
                <Input label="CVV"           placeholder="123"       {...payField('cvv')}          maxLength={4} type="password" required />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Button variant="ghost"   fullWidth onClick={() => setStep(1)}>← Back</Button>
                <Button variant="primary" fullWidth glow
                  onClick={() => {
                    if (!validatePayment()) { toast.warning('Please enter valid card details.'); return; }
                    setStep(3);
                  }}
                >
                  Review Order →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div className="checkout-panel glass animate-fade-in">
              <h2 className="checkout-panel__title"><ClipboardList size={18} /> Review Your Order</h2>

              {/* Items */}
              <div className="checkout-review-items">
                {cart.map(item => (
                  <div key={item.id} className="checkout-review-item">
                    <img src={item.image_url || 'https://via.placeholder.com/56'} alt={item.name} className="checkout-review-item__img" />
                    <div className="checkout-review-item__info">
                      <p className="checkout-review-item__name">{item.name}</p>
                      <p className="checkout-review-item__qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="checkout-review-item__price">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Address summary */}
              <div className="checkout-review-section">
                <h3 className="checkout-review-section__label">Shipping to</h3>
                <p className="checkout-review-section__text">
                  {address.full_name} · {address.phone}<br />
                  {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
                  {address.city}, {address.state} {address.zip}, {address.country}
                </p>
              </div>

              {/* Payment summary */}
              <div className="checkout-review-section">
                <h3 className="checkout-review-section__label">Payment</h3>
                <p className="checkout-review-section__text">
                  Card ending in ···· {payment.card_number.slice(-4)}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <Button variant="ghost" fullWidth onClick={() => setStep(2)}>← Back</Button>
                <Button variant="primary" fullWidth glow loading={placing} onClick={placeOrder}>
                  Place Order · ${totalPrice.toFixed(2)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right — Mini summary */}
        <aside className="checkout-summary glass">
          <h2 className="checkout-summary__heading">Order Summary</h2>
          <div className="checkout-summary__items">
            {cart.map(item => (
              <div key={item.id} className="checkout-summary__item">
                <span className="checkout-summary__item-name">
                  {item.name} <span className="checkout-summary__item-qty">×{item.quantity}</span>
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-summary__divider" />
          <div className="checkout-summary__totals">
            <div className="checkout-summary__row">
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="checkout-summary__row">
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? 'var(--success)' : undefined }}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="checkout-summary__row">
              <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
            </div>
            <div className="checkout-summary__row checkout-summary__row--total">
              <span>Total</span>
              <span className="gradient-text">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;
