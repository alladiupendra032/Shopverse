import { Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useToast } from '../../ui/Toast';
import './CartItem.css';

/**
 * CartItem shared molecule
 * @param {object} item - cart item { id, name, price, image_url, quantity }
 */
const CartItem = ({ item }) => {
  const { updateQty, removeItem } = useCart();
  const toast = useToast();

  const { id, name, price, image_url, quantity } = item;
  const subtotal = (price * quantity).toFixed(2);

  const handleRemove = () => {
    removeItem(id);
    toast.info(`"${name}" removed from cart.`);
  };

  const handleQty = (delta) => {
    const next = quantity + delta;
    if (next < 1) {
      handleRemove();
    } else {
      updateQty(id, next);
    }
  };

  return (
    <div className="cart-item glass animate-fade-in">
      {/* Image */}
      <Link to={`/products/${id}`} className="cart-item__image-wrap">
        <img
          src={image_url || 'https://via.placeholder.com/80?text=No+Img'}
          alt={name}
          className="cart-item__image"
        />
      </Link>

      {/* Info */}
      <div className="cart-item__info">
        <Link to={`/products/${id}`} className="cart-item__name">{name}</Link>
        <p className="cart-item__unit-price">${Number(price).toFixed(2)} each</p>
      </div>

      {/* Qty stepper */}
      <div className="cart-item__qty">
        <button
          className="cart-item__qty-btn"
          onClick={() => handleQty(-1)}
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span className="cart-item__qty-val">{quantity}</span>
        <button
          className="cart-item__qty-btn"
          onClick={() => handleQty(+1)}
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Subtotal */}
      <p className="cart-item__subtotal">${subtotal}</p>

      {/* Remove */}
      <button
        className="cart-item__remove"
        onClick={handleRemove}
        aria-label={`Remove ${name}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default CartItem;
