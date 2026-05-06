import { ShoppingCart, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../ui/Toast';
import Badge from '../../ui/Badge';
import StarRating from '../../ui/StarRating';
import './ProductCard.css';

/**
 * ProductCard shared molecule
 * Renders a single product in the listing grid.
 * @param {object} product - { id, name, price, original_price, image_url, category, rating, review_count, stock }
 */
const ProductCard = ({ product }) => {
  const { addItem, cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    id, name, price, original_price,
    image_url, category, rating = 0,
    review_count = 0, stock = 0,
  } = product;

  const discount     = original_price ? Math.round((1 - price / original_price) * 100) : 0;
  const isOutOfStock = stock === 0;
  const inCart       = cart.some((i) => i.id === id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    if (!user) {
      toast.info('Please sign in to add items to your cart.');
      navigate('/login');
      return;
    }
    addItem({ id, name, price, image_url, stock });
    toast.success(`"${name}" added to cart! 🛒`);
  };

  return (
    <Link to={`/products/${id}`} className="product-card glass animate-fade-in">
      {/* Image */}
      <div className="product-card__image-wrap">
        <img
          src={image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={name}
          className="product-card__image"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="product-card__discount">−{discount}%</span>
        )}
        {isOutOfStock && (
          <div className="product-card__out-of-stock">Out of Stock</div>
        )}
        <button
          className="product-card__wishlist"
          onClick={(e) => { e.preventDefault(); toast.info('Wishlist coming in a future update!'); }}
          aria-label="Add to wishlist"
        >
          <Heart size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="product-card__body">
        <Badge variant="primary" size="sm">{category}</Badge>

        <h3 className="product-card__name">{name}</h3>

        <StarRating value={rating} count={review_count} size="sm" />

        <div className="product-card__price-row">
          <span className="product-card__price">${Number(price).toFixed(2)}</span>
          {original_price && (
            <span className="product-card__original">${Number(original_price).toFixed(2)}</span>
          )}
        </div>

        <button
          className={`btn btn-primary product-card__cta ${inCart ? 'product-card__cta--in-cart' : ''}`}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={inCart ? 'Already in cart' : `Add ${name} to cart`}
        >
          <ShoppingCart size={16} />
          {inCart ? 'In Cart ✓' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
