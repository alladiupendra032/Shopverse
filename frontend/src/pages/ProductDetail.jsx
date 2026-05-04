import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Heart, Shield, Truck, RefreshCw, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import useProduct from '../hooks/useProduct';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import StarRating from '../components/ui/StarRating';
import Skeleton from '../components/ui/Skeleton';
import './ProductDetail.css';

const PERKS = [
  { icon: <Truck size={18} />,     text: 'Free shipping over $50' },
  { icon: <RefreshCw size={18} />, text: '30-day easy returns' },
  { icon: <Shield size={18} />,    text: '2-year warranty' },
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { addItem, cart, updateQty } = useCart();
  const toast  = useToast();

  const { product, loading, error } = useProduct(id);
  const [qty, setQty] = useState(1);

  const inCart     = cart.some((i) => i.id === id);
  const cartItem   = cart.find((i) => i.id === id);
  const isOutOfStock = product?.stock === 0;
  const discount   = product?.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    if (inCart) {
      updateQty(id, (cartItem?.quantity || 0) + qty);
    } else {
      addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, stock: product.stock }, qty);
    }
    toast.success(`${qty}× "${product.name}" added to cart! 🛒`);
  };

  const handleBuyNow = () => {
    if (!user) { toast.info('Please sign in to checkout.'); navigate('/login'); return; }
    handleAddToCart();
    navigate('/cart');
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="product-detail container">
      <div className="product-detail__grid">
        <Skeleton.Image height={460} />
        <div style={{ display:'flex', flexDirection:'column', gap: 20 }}>
          <Skeleton.Text lines={1} width="40%" />
          <Skeleton.Text lines={2} />
          <Skeleton.Base height={32} radius="sm" width="60%" />
          <Skeleton.Base height={52} radius="full" width="100%" />
        </div>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="product-detail container product-detail--error">
      <div className="glass product-detail__error-box">
        <span style={{ fontSize: 48 }}>😕</span>
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/products" className="btn btn-primary">← Back to Products</Link>
      </div>
    </div>
  );

  return (
    <main className="product-detail container animate-fade-in">
      {/* Breadcrumb */}
      <nav className="product-detail__breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="breadcrumb__link">Home</Link>
        <span className="breadcrumb__sep">›</span>
        <Link to="/products" className="breadcrumb__link">Products</Link>
        <span className="breadcrumb__sep">›</span>
        <span className="breadcrumb__current">{product.name}</span>
      </nav>

      <div className="product-detail__grid">
        {/* ── Left: Image ── */}
        <div className="product-detail__image-col">
          <div className="product-detail__image-wrap glass">
            <img
              src={product.image_url || 'https://via.placeholder.com/600?text=No+Image'}
              alt={product.name}
              className="product-detail__image"
            />
            {discount > 0 && (
              <span className="product-detail__discount">−{discount}%</span>
            )}
            {isOutOfStock && (
              <div className="product-detail__oos-overlay">Out of Stock</div>
            )}
          </div>

          {/* Perks strip */}
          <div className="product-detail__perks">
            {PERKS.map((p) => (
              <div key={p.text} className="perk-item">
                <span className="perk-item__icon">{p.icon}</span>
                <span className="perk-item__text">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Info ── */}
        <div className="product-detail__info-col">

          {/* Category + wishlist */}
          <div className="product-detail__meta">
            <Badge variant="primary">{product.category}</Badge>
            <button
              className="btn btn-ghost btn-sm product-detail__wishlist"
              aria-label="Add to wishlist"
              onClick={() => toast.info('Wishlist coming soon!')}
            >
              <Heart size={16} /> Wishlist
            </button>
          </div>

          {/* Name */}
          <h1 className="product-detail__name">{product.name}</h1>

          {/* Rating */}
          <div className="product-detail__rating">
            <StarRating value={product.rating} count={product.review_count} size="md" />
            <span className="product-detail__rating-label">
              {product.rating?.toFixed(1)} out of 5
            </span>
          </div>

          {/* Price */}
          <div className="product-detail__price-row">
            <span className="product-detail__price">${Number(product.price).toFixed(2)}</span>
            {product.original_price && (
              <span className="product-detail__original">
                ${Number(product.original_price).toFixed(2)}
              </span>
            )}
            {discount > 0 && (
              <span className="badge badge-success">Save {discount}%</span>
            )}
          </div>

          {/* Description */}
          <p className="product-detail__desc">{product.description}</p>

          {/* Stock indicator */}
          <div className="product-detail__stock">
            <Badge
              variant={isOutOfStock ? 'error' : product.stock < 10 ? 'warning' : 'success'}
              dot
            />
            <span className="product-detail__stock-text">
              {isOutOfStock
                ? 'Out of stock'
                : product.stock < 10
                  ? `Only ${product.stock} left!`
                  : 'In stock'}
            </span>
          </div>

          {/* Qty selector */}
          {!isOutOfStock && (
            <div className="product-detail__qty">
              <label className="product-detail__qty-label">Quantity</label>
              <div className="product-detail__qty-controls">
                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >−</button>
                <span className="qty-val">{qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  aria-label="Increase"
                >+</button>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="product-detail__ctas">
            <Button
              variant="primary"
              fullWidth
              glow
              disabled={isOutOfStock}
              icon={<ShoppingCart size={18} />}
              onClick={handleAddToCart}
            >
              {inCart ? 'Add More to Cart' : 'Add to Cart'}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              disabled={isOutOfStock}
              onClick={handleBuyNow}
            >
              Buy Now →
            </Button>
          </div>

          {/* Back link */}
          <Link to="/products" className="product-detail__back">
            <ArrowLeft size={14} /> Back to Products
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
