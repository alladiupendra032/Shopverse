import './Skeleton.css';

/**
 * Skeleton loader collection
 * Use <Skeleton.Text />, <Skeleton.Image />, <Skeleton.Card />, <Skeleton.ProductCard />
 */

// ── Base shimmer block ─────────────────────────────────────────
const Base = ({ width, height, radius = 'md', className = '', style = {} }) => (
  <div
    className={`skeleton skeleton--${radius} ${className}`}
    style={{ width, height, ...style }}
    aria-hidden="true"
  />
);

// ── Text line(s) ───────────────────────────────────────────────
const Text = ({ lines = 1, width = '100%', className = '' }) => (
  <div className={`skeleton-text ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Base
        key={i}
        height={14}
        radius="sm"
        width={i === lines - 1 && lines > 1 ? '70%' : width}
        style={{ marginBottom: i < lines - 1 ? 8 : 0 }}
      />
    ))}
  </div>
);

// ── Image block ────────────────────────────────────────────────
const Image = ({ height = 220, radius = 'md', className = '' }) => (
  <Base height={height} radius={radius} className={className} width="100%" />
);

// ── Avatar circle ──────────────────────────────────────────────
const Avatar = ({ size = 48, className = '' }) => (
  <Base width={size} height={size} radius="full" className={className} />
);

// ── Generic card ───────────────────────────────────────────────
const Card = ({ className = '' }) => (
  <div className={`skeleton-card glass ${className}`}>
    <Base height={200} radius="md" width="100%" />
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Base height={10} radius="sm" width="50%" />
      <Base height={16} radius="sm" width="90%" />
      <Base height={12} radius="sm" width="70%" />
      <Base height={14} radius="sm" width="40%" />
      <Base height={40} radius="md" width="100%" />
    </div>
  </div>
);

// ── Product card skeleton ──────────────────────────────────────
const ProductCard = ({ className = '' }) => (
  <div className={`skeleton-product-card glass ${className}`}>
    <Base height={220} radius="md" width="100%" />
    <div className="skeleton-product-card__body">
      <Base height={10} radius="sm" width="45%" />
      <Base height={18} radius="sm" width="85%" />
      <Base height={12} radius="sm" width="55%" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Base height={20} radius="sm" width="30%" />
        <Base height={14} radius="sm" width="25%" />
      </div>
      <Base height={42} radius="full" width="100%" />
    </div>
  </div>
);

// ── Order row skeleton ─────────────────────────────────────────
const OrderRow = ({ className = '' }) => (
  <div className={`skeleton-order-row glass ${className}`}>
    <Base width={56} height={56} radius="md" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Base height={14} radius="sm" width="60%" />
      <Base height={11} radius="sm" width="40%" />
    </div>
    <Base height={24} radius="full" width={80} />
    <Base height={20} radius="sm" width={60} />
  </div>
);

// ── Stat card skeleton ─────────────────────────────────────────
const StatCard = ({ className = '' }) => (
  <div className={`glass skeleton-stat ${className}`} style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
    <Base width={48} height={48} radius="md" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Base height={28} radius="sm" width="55%" />
      <Base height={10} radius="sm" width="40%" />
    </div>
  </div>
);

// ── Named exports on Skeleton ──────────────────────────────────
const Skeleton = { Base, Text, Image, Avatar, Card, ProductCard, OrderRow, StatCard };
export default Skeleton;
