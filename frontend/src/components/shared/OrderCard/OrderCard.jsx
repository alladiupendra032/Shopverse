import { useState } from 'react';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import Badge from '../../ui/Badge';
import './OrderCard.css';

const STATUS_VARIANT = {
  pending:    'warning',
  processing: 'primary',
  shipped:    'info',
  delivered:  'success',
  cancelled:  'error',
};
const STATUS_ICONS = {
  pending:    '⏳',
  processing: '⚙️',
  shipped:    '🚚',
  delivered:  '✅',
  cancelled:  '❌',
};

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const {
    id, status, total_price,
    created_at, order_items = [],
  } = order;

  const date = new Date(created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className={`order-card glass animate-fade-in ${expanded ? 'order-card--expanded' : ''}`}>
      {/* Header row */}
      <div
        className="order-card__header"
        onClick={() => setExpanded(v => !v)}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(v => !v)}
      >
        {/* Left: icon + info */}
        <div className="order-card__left">
          <div className="order-card__icon glass">
            <Package size={20} />
          </div>
          <div className="order-card__meta">
            <span className="order-card__id">
              #{id.slice(0, 8).toUpperCase()}
            </span>
            <span className="order-card__date">{date}</span>
          </div>
        </div>

        {/* Center: item count */}
        <div className="order-card__items-count">
          {order_items.length} item{order_items.length !== 1 ? 's' : ''}
        </div>

        {/* Right: status + total + toggle */}
        <div className="order-card__right">
          <Badge variant={STATUS_VARIANT[status] || 'muted'}>
            {STATUS_ICONS[status]} {status}
          </Badge>
          <span className="order-card__total">
            ${Number(total_price).toFixed(2)}
          </span>
          <button className="order-card__toggle" aria-label="Toggle details">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded: item list */}
      {expanded && (
        <div className="order-card__body">
          <div className="order-card__items stagger">
            {order_items.map((item) => (
              <div key={item.id} className="order-card__item">
                <img
                  src={item.image_url || 'https://via.placeholder.com/48?text=N/A'}
                  alt={item.name}
                  className="order-card__item-img"
                />
                <div className="order-card__item-info">
                  <p className="order-card__item-name">{item.name}</p>
                  <p className="order-card__item-qty">
                    {item.quantity} × ${Number(item.price).toFixed(2)}
                  </p>
                </div>
                <p className="order-card__item-sub">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="order-card__footer">
            <span className="order-card__footer-label">Order Total</span>
            <span className="order-card__footer-total gradient-text">
              ${Number(total_price).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
