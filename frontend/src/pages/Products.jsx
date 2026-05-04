import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import useProducts from '../hooks/useProducts';
import { ProductCard, Skeleton } from '../components';
import './Products.css';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated' },
];

const PRICE_RANGES = [
  { label: 'Under $50',    min: 0,   max: 50  },
  { label: '$50 – $100',   min: 50,  max: 100 },
  { label: '$100 – $200',  min: 100, max: 200 },
  { label: 'Over $200',    min: 200, max: 9999},
];

const RATING_OPTIONS = [4, 3, 2];

const Products = () => {
  // Filter state
  const [search,       setSearch]       = useState('');
  const [category,     setCategory]     = useState('');
  const [priceRange,   setPriceRange]   = useState(null);   // { min, max }
  const [minRating,    setMinRating]    = useState(null);
  const [sortBy,       setSortBy]       = useState('newest');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useMemo(() => {
    let timer;
    return (val) => {
      clearTimeout(timer);
      timer = setTimeout(() => setDebouncedSearch(val), 400);
    };
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    debounceRef(e.target.value);
  };

  const filters = useMemo(() => ({
    category,
    search:   debouncedSearch,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    minRating,
    sortBy,
  }), [category, debouncedSearch, priceRange, minRating, sortBy]);

  const { products, loading, error, categories } = useProducts(filters);

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('');
    setPriceRange(null);
    setMinRating(null);
    setSortBy('newest');
  };

  const activeFilterCount = [category, priceRange, minRating].filter(Boolean).length;

  return (
    <div className="products-page">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="products-topbar container">
        <div className="products-topbar__left">
          <h1 className="products-topbar__title">
            All <span className="gradient-text">Products</span>
          </h1>
          {!loading && (
            <span className="badge badge-muted">
              {products.length} result{products.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="products-topbar__right">
          {/* Search */}
          <div className="products-search">
            <Search size={16} className="products-search__icon" />
            <input
              type="search"
              className="input products-search__input"
              placeholder="Search products..."
              value={search}
              onChange={handleSearch}
              aria-label="Search products"
            />
            {search && (
              <button className="products-search__clear" onClick={() => { setSearch(''); setDebouncedSearch(''); }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="products-sort">
            <ChevronDown size={14} className="products-sort__chevron" />
            <select
              className="input products-sort__select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Mobile filter toggle */}
          <button
            className="btn btn-ghost btn-sm products-filter-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open filters"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="badge badge-primary" style={{ padding: '2px 7px' }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Layout ──────────────────────────────────────────── */}
      <div className="products-layout container">

        {/* Sidebar */}
        <aside className={`products-sidebar glass ${sidebarOpen ? 'products-sidebar--open' : ''}`}>
          <div className="products-sidebar__header">
            <h2 className="products-sidebar__heading">Filters</h2>
            <div className="products-sidebar__header-actions">
              {activeFilterCount > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear all</button>
              )}
              <button className="products-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Close filters">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="filter-group">
            <h3 className="filter-group__label">Category</h3>
            <div className="filter-group__options">
              <label className="filter-option">
                <input
                  type="radio" name="category" value=""
                  checked={category === ''}
                  onChange={() => setCategory('')}
                  className="filter-option__radio"
                />
                <span className="filter-option__text">All Categories</span>
              </label>
              {categories.map((cat) => (
                <label key={cat} className="filter-option">
                  <input
                    type="radio" name="category" value={cat}
                    checked={category === cat}
                    onChange={() => setCategory(cat)}
                    className="filter-option__radio"
                  />
                  <span className="filter-option__text">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="filter-group">
            <h3 className="filter-group__label">Price Range</h3>
            <div className="filter-group__options">
              <label className="filter-option">
                <input
                  type="radio" name="price" value=""
                  checked={priceRange === null}
                  onChange={() => setPriceRange(null)}
                  className="filter-option__radio"
                />
                <span className="filter-option__text">Any Price</span>
              </label>
              {PRICE_RANGES.map((r) => (
                <label key={r.label} className="filter-option">
                  <input
                    type="radio" name="price" value={r.label}
                    checked={priceRange?.label === r.label}
                    onChange={() => setPriceRange(r)}
                    className="filter-option__radio"
                  />
                  <span className="filter-option__text">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="filter-group">
            <h3 className="filter-group__label">Min. Rating</h3>
            <div className="filter-group__options">
              <label className="filter-option">
                <input
                  type="radio" name="rating" value=""
                  checked={minRating === null}
                  onChange={() => setMinRating(null)}
                  className="filter-option__radio"
                />
                <span className="filter-option__text">Any Rating</span>
              </label>
              {RATING_OPTIONS.map((r) => (
                <label key={r} className="filter-option">
                  <input
                    type="radio" name="rating" value={r}
                    checked={minRating === r}
                    onChange={() => setMinRating(r)}
                    className="filter-option__radio"
                  />
                  <span className="filter-option__text">{'★'.repeat(r)} & above</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Backdrop (mobile) */}
        {sidebarOpen && (
          <div className="products-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Grid */}
        <section className="products-grid-wrap">
          {error && (
            <div className="products-error glass">
              <p>⚠️ {error}</p>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Reset filters</button>
            </div>
          )}

          {loading ? (
            <div className="products-grid stagger">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton.ProductCard key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="products-empty">
              <span className="products-empty__icon">🔍</span>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term.</p>
              <button className="btn btn-ghost" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="products-grid stagger">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Products;
