import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Box, Package, Users,
  Plus, Pencil, Trash2, LogOut,
  TrendingUp, RefreshCw, Save, Bot,
  Upload, FileText, Info, X,
} from 'lucide-react';

const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || 'http://127.0.0.1:8000';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Input  from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge  from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import Modal  from '../components/ui/Modal';
import './Admin.css';

/* ── Order status options ──────────────────────────────────── */
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_VARIANT = { pending:'warning', processing:'primary', shipped:'info', delivered:'success', cancelled:'error' };

/* ── Empty product form ────────────────────────────────────── */
const EMPTY_PRODUCT = { name:'', description:'', price:'', original_price:'', stock:'', category:'', image_url:'' };
const CATEGORIES    = ['Electronics', 'Fashion', 'Home'];

/* ================================================================
   ADMIN PAGE
   ================================================================ */
const Admin = () => {
  const { user, role, signOut } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const [activeTab, setActiveTab] = useState('dashboard');

  /* ── Dashboard stats ─────────────────────────────────────── */
  const [stats,        setStats]        = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const [productsRes, ordersRes, usersRes] = await Promise.all([
      supabase.from('products').select('id, price, stock', { count: 'exact' }),
      supabase.from('orders').select('id, total_price', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }),
    ]);

    const totalRevenue = (ordersRes.data || []).reduce((s, o) => s + Number(o.total_price), 0);
    const lowStock     = (productsRes.data || []).filter(p => p.stock < 10).length;

    setStats({
      products: productsRes.count || 0,
      orders:   ordersRes.count   || 0,
      users:    usersRes.count    || 0,
      revenue:  totalRevenue,
      lowStock,
    });
    setStatsLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  /* ── Products ────────────────────────────────────────────── */
  const [products,     setProducts]     = useState([]);
  const [prodLoading,  setProdLoading]  = useState(false);
  const [prodSearch,   setProdSearch]   = useState('');
  const [prodModal,    setProdModal]    = useState(false);
  const [editProduct,  setEditProduct]  = useState(null);   // null = new
  const [prodForm,     setProdForm]     = useState(EMPTY_PRODUCT);
  const [prodSaving,   setProdSaving]   = useState(false);
  const [deleteModal,  setDeleteModal]  = useState(null);   // product to delete

  const fetchProducts = useCallback(async () => {
    setProdLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setProdLoading(false);
  }, []);

  useEffect(() => { if (activeTab === 'products') fetchProducts(); }, [activeTab, fetchProducts]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(prodSearch.toLowerCase())
  );

  const openAddProduct = () => {
    setEditProduct(null);
    setProdForm(EMPTY_PRODUCT);
    setProdModal(true);
  };
  const openEditProduct = (p) => {
    setEditProduct(p);
    setProdForm({
      name: p.name, description: p.description || '', price: p.price,
      original_price: p.original_price || '', stock: p.stock,
      category: p.category, image_url: p.image_url || '',
    });
    setProdModal(true);
  };

  const saveProduct = async () => {
    const { name, price, stock, category } = prodForm;
    if (!name || !price || !stock || !category) { toast.warning('Fill all required fields.'); return; }

    setProdSaving(true);
    const payload = {
      name:           prodForm.name.trim(),
      description:    prodForm.description.trim(),
      price:          Number(prodForm.price),
      original_price: prodForm.original_price ? Number(prodForm.original_price) : null,
      stock:          Number(prodForm.stock),
      category:       prodForm.category,
      image_url:      prodForm.image_url.trim() || null,
      is_active:      true,
    };

    let error;
    if (editProduct) {
      ({ error } = await supabase.from('products').update(payload).eq('id', editProduct.id));
    } else {
      ({ error } = await supabase.from('products').insert([payload]));
    }

    setProdSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editProduct ? 'Product updated!' : 'Product added!');
    setProdModal(false);
    fetchProducts();
    fetchStats();
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    const { error } = await supabase.from('products').delete().eq('id', deleteModal.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`"${deleteModal.name}" deleted.`);
    setDeleteModal(null);
    fetchProducts();
    fetchStats();
  };

  /* ── Orders ──────────────────────────────────────────────── */
  const [orders,       setOrders]       = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSearch,  setOrderSearch]  = useState('');

  const fetchOrders = useCallback(async () => {
    setOrderLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(name, id), order_items(id, name, quantity, price)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setOrderLoading(false);
  }, []);

  useEffect(() => { if (activeTab === 'orders') fetchOrders(); }, [activeTab, fetchOrders]);

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    (o.profiles?.name || '').toLowerCase().includes(orderSearch.toLowerCase())
  );

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) { toast.error(error.message); return; }
    toast.success(`Order status updated to "${newStatus}".`);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  /* ── TABS ────────────────────────────────────────────────── */
  const TABS = [
    { id: 'dashboard', label: 'Dashboard',        icon: <LayoutDashboard size={16} /> },
    { id: 'products',  label: 'Manage Products',  icon: <Box size={16} /> },
    { id: 'orders',    label: 'Manage Orders',    icon: <Package size={16} /> },
    { id: 'users',     label: 'Users',            icon: <Users size={16} /> },
    { id: 'rag-docs',  label: 'RAG Docs',         icon: <Bot size={16} /> },
  ];

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="gradient-text">✦ ShopVerse</span>
          <span className="admin-sidebar__badge badge badge-warning">Admin</span>
        </div>

        <nav className="admin-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav__item ${activeTab === tab.id ? 'admin-nav__item--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__user">
          <div className="admin-sidebar__avatar">
            {(user?.email || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div className="admin-sidebar__user-info">
            <span className="admin-sidebar__user-name">{user?.user_metadata?.name || 'Admin'}</span>
            <span className="admin-sidebar__user-role">{role}</span>
          </div>
        </div>
        <button className="admin-nav__item admin-nav__item--signout" onClick={handleSignOut}>
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="admin-main">
        {/* Header */}
        <div className="admin-topbar">
          <h1 className="admin-topbar__title">
            {TABS.find(t => t.id === activeTab)?.label}
          </h1>
          <div className="admin-topbar__actions">
            <button className="btn btn-ghost btn-sm" onClick={fetchStats}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            TAB: DASHBOARD
        ══════════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="admin-content animate-fade-in">
            <div className="admin-stats stagger">
              {statsLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton.StatCard key={i} />)
              ) : (
                <>
                  <div className="admin-stat-card glass admin-stat-card--violet animate-fade-in">
                    <div className="admin-stat-card__icon"><Box size={22} /></div>
                    <div className="admin-stat-card__body">
                      <span className="admin-stat-card__value">{stats.products}</span>
                      <span className="admin-stat-card__label">Total Products</span>
                    </div>
                    <span className="badge badge-warning admin-stat-card__sub">
                      {stats.lowStock} low stock
                    </span>
                  </div>
                  <div className="admin-stat-card glass admin-stat-card--cyan animate-fade-in">
                    <div className="admin-stat-card__icon"><Package size={22} /></div>
                    <div className="admin-stat-card__body">
                      <span className="admin-stat-card__value">{stats.orders}</span>
                      <span className="admin-stat-card__label">Total Orders</span>
                    </div>
                  </div>
                  <div className="admin-stat-card glass admin-stat-card--green animate-fade-in">
                    <div className="admin-stat-card__icon"><Users size={22} /></div>
                    <div className="admin-stat-card__body">
                      <span className="admin-stat-card__value">{stats.users}</span>
                      <span className="admin-stat-card__label">Registered Users</span>
                    </div>
                  </div>
                  <div className="admin-stat-card glass admin-stat-card--amber animate-fade-in">
                    <div className="admin-stat-card__icon"><TrendingUp size={22} /></div>
                    <div className="admin-stat-card__body">
                      <span className="admin-stat-card__value">${stats.revenue.toFixed(0)}</span>
                      <span className="admin-stat-card__label">Total Revenue</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick links */}
            <div className="admin-quick-links">
              <button className="glass admin-quick-link" onClick={() => { setActiveTab('products'); openAddProduct(); }}>
                <Plus size={20} /> Add New Product
              </button>
              <button className="glass admin-quick-link" onClick={() => setActiveTab('orders')}>
                <Package size={20} /> View All Orders
              </button>
              <button className="glass admin-quick-link" onClick={() => setActiveTab('users')}>
                <Users size={20} /> View Users
              </button>
              <button className="glass admin-quick-link" onClick={() => setActiveTab('rag-docs')}>
                <Bot size={20} /> Manage RAG Docs
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB: PRODUCTS
        ══════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <div className="admin-content animate-fade-in">
            {/* Toolbar */}
            <div className="admin-toolbar">
              <Input
                placeholder="Search products..."
                value={prodSearch}
                onChange={e => setProdSearch(e.target.value)}
                className="admin-search"
              />
              <Button variant="primary" icon={<Plus size={16} />} onClick={openAddProduct}>
                Add Product
              </Button>
            </div>

            {prodLoading ? (
              <div className="admin-table-skeleton">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton.Base key={i} height={52} radius="md" width="100%" />)}
              </div>
            ) : (
              <div className="admin-table-wrap glass">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="admin-table__row">
                        <td className="admin-table__product-cell">
                          <img
                            src={p.image_url || 'https://via.placeholder.com/40'}
                            alt={p.name}
                            className="admin-table__thumb"
                          />
                          <span className="admin-table__product-name">{p.name}</span>
                        </td>
                        <td><Badge variant="primary" size="sm">{p.category}</Badge></td>
                        <td className="admin-table__price">${Number(p.price).toFixed(2)}</td>
                        <td>
                          <span className={`admin-table__stock ${p.stock < 10 ? 'admin-table__stock--low' : ''}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="admin-table__rating">★ {p.rating || '—'}</td>
                        <td>
                          <div className="admin-table__actions">
                            <button className="admin-action-btn admin-action-btn--edit" onClick={() => openEditProduct(p)} title="Edit">
                              <Pencil size={14} />
                            </button>
                            <button className="admin-action-btn admin-action-btn--delete" onClick={() => setDeleteModal(p)} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <div className="admin-table-empty">No products found.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB: ORDERS
        ══════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="admin-content animate-fade-in">
            <div className="admin-toolbar">
              <Input
                placeholder="Search by order ID or customer..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="admin-search"
              />
              <Button variant="ghost" icon={<RefreshCw size={14}/>} onClick={fetchOrders}>Refresh</Button>
            </div>

            {orderLoading ? (
              <div className="admin-table-skeleton">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton.Base key={i} height={52} radius="md" width="100%" />)}
              </div>
            ) : (
              <div className="admin-table-wrap glass">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o.id} className="admin-table__row">
                        <td className="admin-table__mono">#{o.id.slice(0, 8).toUpperCase()}</td>
                        <td>{o.profiles?.name || 'Unknown'}</td>
                        <td>{o.order_items?.length || 0} item(s)</td>
                        <td className="admin-table__price">${Number(o.total_price).toFixed(2)}</td>
                        <td className="admin-table__date">
                          {new Date(o.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </td>
                        <td>
                          <Select
                            value={o.status}
                            onChange={val => updateOrderStatus(o.id, val)}
                            options={ORDER_STATUSES}
                            placeholder="Status"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && (
                  <div className="admin-table-empty">No orders yet.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB: USERS (read-only for now)
        ══════════════════════════════════════════════════ */}
        {activeTab === 'users' && <UsersTab toast={toast} />}

        {/* ══════════════════════════════════════════════════
            TAB: RAG DOCS
        ══════════════════════════════════════════════════ */}
        {activeTab === 'rag-docs' && <RagDocsTab toast={toast} ragApiUrl={RAG_API_URL} />}
      </main>

      {/* ── Add/Edit Product Modal ── */}
      <Modal
        isOpen={prodModal}
        onClose={() => setProdModal(false)}
        title={editProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setProdModal(false)}>Cancel</Button>
            <Button variant="primary" loading={prodSaving} icon={<Save size={16}/>} onClick={saveProduct}>
              {editProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </>
        }
      >
        <div className="product-form">
          <Input label="Product Name *"  value={prodForm.name}          onChange={e => setProdForm(p => ({...p, name:e.target.value}))}  placeholder="e.g. iPhone 15 Pro" />
          <div className="product-form__row">
            <Input label="Price ($) *"           type="number" min="0" value={prodForm.price}          onChange={e => setProdForm(p => ({...p, price:e.target.value}))} placeholder="99.99" />
            <Input label="Original Price ($)"    type="number" min="0" value={prodForm.original_price} onChange={e => setProdForm(p => ({...p, original_price:e.target.value}))} placeholder="129.99" />
          </div>
          <div className="product-form__row">
            <Input label="Stock *" type="number" min="0" value={prodForm.stock} onChange={e => setProdForm(p => ({...p, stock:e.target.value}))} placeholder="100" />
            <Select
              label="Category *"
              value={prodForm.category}
              onChange={val => setProdForm(p => ({...p, category: val}))}
              options={CATEGORIES}
              placeholder="Select category"
            />
          </div>
          <Input label="Image URL" value={prodForm.image_url} onChange={e => setProdForm(p => ({...p, image_url:e.target.value}))} placeholder="https://..." />
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea
              className="input admin-textarea"
              rows={3}
              value={prodForm.description}
              onChange={e => setProdForm(p => ({...p, description:e.target.value}))}
              placeholder="Product description..."
            />
          </div>
          {prodForm.image_url && (
            <div className="product-form__preview">
              <img src={prodForm.image_url} alt="Preview" className="product-form__preview-img" />
            </div>
          )}
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Product"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" icon={<Trash2 size={14}/>} onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p style={{ color:'var(--text-secondary)', lineHeight:1.6 }}>
          Are you sure you want to delete <strong>"{deleteModal?.name}"</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   RAG DOCS TAB
══════════════════════════════════════════════════════════════ */
const fileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return { icon: '📄', cls: 'rag-file-icon--pdf' };
  if (ext === 'txt') return { icon: '📝', cls: 'rag-file-icon--txt' };
  return { icon: '📑', cls: 'rag-file-icon--md' };
};

const RagDocsTab = ({ toast, ragApiUrl }) => {
  const [files,       setFiles]       = useState([]);   // { file, chunks }
  const [listLoading, setListLoading] = useState(true);
  const [uploading,   setUploading]   = useState(false);
  const [uploadFile,  setUploadFile]  = useState(null); // name being uploaded
  const [dragOver,    setDragOver]    = useState(false);
  const [busyFile,    setBusyFile]    = useState(null); // file being deleted/reindexed
  const inputRef = useRef(null);

  /* ── Fetch file list ─────────────────────────────────────── */
  const fetchFiles = useCallback(async () => {
    setListLoading(true);
    try {
      const res  = await fetch(`${ragApiUrl}/ingest/files`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (_) {
      toast.error('Could not reach RAG service.');
    } finally {
      setListLoading(false);
    }
  }, [ragApiUrl, toast]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  /* ── Upload handler ──────────────────────────────────────── */
  const handleUpload = async (file) => {
    if (!file) return;
    const allowed = ['.md', '.txt', '.pdf'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      toast.warning('Only .md, .txt, .pdf files are supported.');
      return;
    }
    setUploading(true);
    setUploadFile(file.name);
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch(`${ragApiUrl}/ingest/upload`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Upload failed');
      toast.success(`✅ "${file.name}" indexed — ${data.chunks_indexed} chunks.`);
      fetchFiles();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      setUploadFile(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  /* ── Delete handler ──────────────────────────────────────── */
  const handleDelete = async (filename) => {
    if (!window.confirm(`Remove all Pinecone vectors for "${filename}"?`)) return;
    setBusyFile(filename);
    try {
      const res  = await fetch(`${ragApiUrl}/ingest/files/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      const data = await res.json();
      toast.success(`🗑️ Removed ${data.chunks_removed} chunks for "${filename}".`);
      fetchFiles();
    } catch (_) {
      toast.error('Delete failed.');
    } finally {
      setBusyFile(null);
    }
  };

  /* ── Re-index: user picks file to replace existing ───────── */
  const handleReindex = (filename) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt,.pdf';
    input.onchange = (e) => {
      const f = e.target.files?.[0];
      if (f) handleUpload(f);
    };
    input.click();
  };

  /* ── Drag & Drop ─────────────────────────────────────────── */
  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleUpload(f);
  };

  return (
    <div className="admin-content animate-fade-in">
      {/* Info banner */}
      <div className="rag-info-banner">
        <Info size={16} />
        <span>
          Upload or update <strong>.md</strong>, <strong>.txt</strong>, or <strong>.pdf</strong> files.
          Each upload automatically replaces old vectors for that filename and re-indexes
          the new content into <strong>Pinecone</strong> — the chatbot will immediately use the updated knowledge.
        </span>
      </div>

      {/* Drop zone */}
      <div
        className={`rag-dropzone${dragOver ? ' rag-dropzone--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".md,.txt,.pdf"
          style={{ display:'none' }}
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />
        <div className="rag-dropzone__icon"><Upload size={28} /></div>
        <div className="rag-dropzone__title">
          {uploading ? `Uploading "${uploadFile}"…` : 'Drop a file here or click to browse'}
        </div>
        <div className="rag-dropzone__sub">.md · .txt · .pdf</div>
        {!uploading && (
          <div className="rag-dropzone__hint">Existing file with same name will be automatically re-indexed</div>
        )}
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="rag-upload-progress">
          <div className="rag-progress-label">
            <span>Embedding &amp; indexing into Pinecone…</span>
            <span>{uploadFile}</span>
          </div>
          <div className="rag-progress-bar-track">
            <div className="rag-progress-bar-fill" style={{ width: '70%' }} />
          </div>
        </div>
      )}

      {/* Indexed files list */}
      <div>
        <div className="rag-files-header">
          <div className="rag-files-title">
            <FileText size={16} />
            Indexed Files
            {!listLoading && <span className="rag-file-count">{files.length}</span>}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={fetchFiles}
            disabled={listLoading}
            title="Refresh list"
          >
            <RefreshCw size={14} className={listLoading ? 'rag-spinning' : ''} />
            Refresh
          </button>
        </div>

        {listLoading ? (
          <div className="rag-file-list">
            {[1,2,3].map(i => (
              <div key={i} className="rag-file-card">
                <div className="skeleton" style={{ width:40, height:40, borderRadius:8 }} />
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                  <div className="skeleton" style={{ height:14, width:'40%', borderRadius:4 }} />
                  <div className="skeleton" style={{ height:11, width:'20%', borderRadius:4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="rag-empty">
            <Bot size={40} style={{ opacity:0.3 }} />
            <span>No files indexed yet. Upload your first document above.</span>
          </div>
        ) : (
          <div className="rag-file-list">
            {files.map(({ file, chunks }) => {
              const { icon, cls } = fileIcon(file);
              const busy = busyFile === file || (uploading && uploadFile === file);
              return (
                <div key={file} className="rag-file-card">
                  <div className={`rag-file-icon ${cls}`}>{icon}</div>
                  <div className="rag-file-info">
                    <div className="rag-file-name" title={file}>{file}</div>
                    <div className="rag-file-meta">{chunks} chunk{chunks !== 1 ? 's' : ''} in Pinecone</div>
                  </div>
                  <div className="rag-file-actions">
                    <button
                      className="rag-reindex-btn"
                      onClick={() => handleReindex(file)}
                      disabled={busy || uploading}
                      title="Re-upload & re-index this file"
                    >
                      <RefreshCw size={12} /> Re-index
                    </button>
                    <button
                      className="rag-delete-btn"
                      onClick={() => handleDelete(file)}
                      disabled={busy || uploading}
                      title="Remove from Pinecone"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Users Tab (separate component for cleanliness) ──────────── */
const UsersTab = ({ toast }) => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false); });
  }, []);

  return (
    <div className="admin-content animate-fade-in">
      {loading ? (
        <div className="admin-table-skeleton">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton.Base key={i} height={52} radius="md" width="100%" />)}
        </div>
      ) : (
        <div className="admin-table-wrap glass">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="admin-table__row">
                  <td>{u.name || '—'}</td>
                  <td className="admin-table__email">{u.email || '—'}</td>
                  <td>
                    <Badge variant={u.role === 'admin' ? 'warning' : 'primary'} size="sm">{u.role}</Badge>
                  </td>
                  <td className="admin-table__date">
                    {new Date(u.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="admin-table-empty">No users found.</div>}
        </div>
      )}
    </div>
  );
};

export default Admin;
