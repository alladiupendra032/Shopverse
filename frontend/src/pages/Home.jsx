import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Lock, Target, RefreshCw } from 'lucide-react';
import useProducts from '../hooks/useProducts';
import { ProductCard, Skeleton } from '../components';
import './Home.css';

const STATS = [
  { label: 'Products',   value: '12K+' },
  { label: 'Customers',  value: '50K+' },
  { label: 'Categories', value: '200+' },
];

const FEATURES = [
  { icon: <Zap size={24} />,       title: 'Fast Delivery',   desc: 'Express delivery in under 2 days.' },
  { icon: <Lock size={24} />,      title: 'Secure Payments', desc: 'JWT-secured checkout every time.' },
  { icon: <Target size={24} />,    title: 'Curated Picks',   desc: '12K+ premium products, handpicked.' },
  { icon: <RefreshCw size={24} />, title: 'Easy Returns',    desc: 'Hassle-free 30-day return policy.' },
];

const CATEGORY_CARDS = [
  { name: 'Electronics', icon: '🖥️', color: 'violet' },
  { name: 'Fashion',     icon: '👟', color: 'cyan'   },
  { name: 'Home',        icon: '🏡', color: 'green'  },
];

const Home = () => {
  // Fetch top-rated featured products (max 4)
  const { products: featured, loading: featuredLoading } = useProducts({ sortBy: 'rating' });
  const showcaseProducts = featured.slice(0, 4);

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content animate-fade-in">
            <span className="badge badge-primary hero__eyebrow">✦ New Collection 2026</span>
            <h1 className="hero__headline">
              Shop the Future,<br />
              <span className="gradient-text">Delivered Today.</span>
            </h1>
            <p className="hero__sub">
              Discover premium products with a next-gen shopping experience.
            </p>
            <div className="hero__ctas">
              <Link to="/products" className="btn btn-primary btn-lg animate-glow-pulse">
                Explore Now →
              </Link>
              <Link to="/products?sort=price_asc" className="btn btn-ghost btn-lg">
                View Deals 🏷️
              </Link>
            </div>

            {/* Stats */}
            <div className="hero__stats stagger">
              {STATS.map((s) => (
                <div key={s.label} className="glass hero__stat animate-fade-in">
                  <span className="hero__stat-value gradient-text">{s.value}</span>
                  <span className="hero__stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating visual */}
          <div className="hero__visual animate-float">
            <div className="hero__visual-card glass-accent">
              <span className="hero__visual-icon">🛍️</span>
              <p>Premium Shopping</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="home-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-heading">Shop by <span className="gradient-text">Category</span></h2>
            <Link to="/products" className="section-link">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="category-grid">
            {CATEGORY_CARDS.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className={`category-card glass category-card--${cat.color}`}
              >
                <span className="category-card__icon">{cat.icon}</span>
                <span className="category-card__name">{cat.name}</span>
                <span className="category-card__arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────── */}
      <section className="home-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-heading">
              Top <span className="gradient-text">Picks</span>
            </h2>
            <Link to="/products" className="section-link">
              All products <ArrowRight size={14} />
            </Link>
          </div>

          <div className="home-products-grid stagger">
            {featuredLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton.ProductCard key={i} />)
              : showcaseProducts.map((p) => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="home-section features">
        <div className="container">
          <h2 className="section-heading" style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            Why <span className="gradient-text">ShopVerse?</span>
          </h2>
          <div className="features__grid stagger">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass feature-card animate-fade-in">
                <span className="feature-card__icon">{f.icon}</span>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="home-section">
        <div className="container">
          <div className="cta-banner glass-elevated">
            <div className="cta-banner__content">
              <h2 className="cta-banner__title">Ready to start shopping?</h2>
              <p className="cta-banner__sub">Join 50,000+ happy customers on ShopVerse.</p>
            </div>
            <Link to="/login" className="btn btn-primary btn-lg animate-glow-pulse">
              Create Free Account →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
