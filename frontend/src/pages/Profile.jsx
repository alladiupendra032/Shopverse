import { useState } from 'react';
import { User, Package, Settings, LogOut, Camera, ShieldCheck, Mail, Phone, Edit2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import useProfile from '../hooks/useProfile';
import useOrders  from '../hooks/useOrders';
import { Skeleton, Badge } from '../components';
import OrderCard from '../components/shared/OrderCard';
import Button from '../components/ui/Button';
import Input  from '../components/ui/Input';
import './Profile.css';

/* ── Tab definitions ─────────────────────────────────────────── */
const TABS = [
  { id: 'profile',  label: 'Profile',  icon: <User size={16} /> },
  { id: 'orders',   label: 'Orders',   icon: <Package size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
];

const ORDER_STATUS_COUNTS = (orders) => ({
  total:     orders.length,
  pending:   orders.filter(o => o.status === 'pending').length,
  delivered: orders.filter(o => o.status === 'delivered').length,
  cancelled: orders.filter(o => o.status === 'cancelled').length,
});

/* ── Component ───────────────────────────────────────────────── */
const Profile = () => {
  const { user, role, isAdmin, signOut } = useAuth();
  const toast = useToast();

  const { profile, loading: profileLoading, saving, updateProfile } = useProfile();
  const { orders,  loading: ordersLoading  } = useOrders();

  const [activeTab, setActiveTab] = useState('profile');

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  // Settings state
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleEditStart = () => {
    setEditName(profile?.name || '');
    setEditing(true);
  };

  const handleSaveName = async () => {
    const { error } = await updateProfile({ name: editName.trim() });
    if (error) { toast.error('Failed to update name.'); return; }
    toast.success('Name updated!');
    setEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.info('Signed out. See you soon!');
  };

  const counts = ORDER_STATUS_COUNTS(orders);
  const totalSpent = orders.reduce((s, o) => s + Number(o.total_price), 0);
  const initials   = (profile?.name || user?.email || '?').slice(0, 2).toUpperCase();

  /* ── Tab: Profile ── */
  const TabProfile = () => (
    <div className="profile-tab animate-fade-in">
      {/* Avatar + name */}
      <div className="profile-info-card glass">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="Avatar" className="profile-avatar__img" />
              : <span className="profile-avatar__initials">{initials}</span>
            }
          </div>
          <button className="profile-avatar__edit" aria-label="Change photo"
            onClick={() => toast.info('Avatar upload coming soon!')}>
            <Camera size={14} />
          </button>
        </div>

        <div className="profile-info">
          {editing ? (
            <div className="profile-name-edit">
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Your name"
                autoFocus
              />
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button variant="primary" size="sm" loading={saving} icon={<Save size={14} />} onClick={handleSaveName}>Save</Button>
                <Button variant="ghost"   size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="profile-name-row">
              <h2 className="profile-name">{profile?.name || 'Anonymous'}</h2>
              <button className="profile-edit-btn" onClick={handleEditStart} aria-label="Edit name">
                <Edit2 size={14} />
              </button>
            </div>
          )}

          <div className="profile-badges">
            <Badge variant={isAdmin ? 'warning' : 'primary'} icon={isAdmin ? <ShieldCheck size={12}/> : <User size={12}/>}>
              {role}
            </Badge>
            <Badge variant="muted">Member since {new Date(user?.created_at || Date.now()).getFullYear()}</Badge>
          </div>

          <div className="profile-contact">
            <span className="profile-contact__item"><Mail size={14} />{user?.email}</span>
            <span className="profile-contact__item"><Phone size={14} />Not set</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats stagger">
        {[
          { label: 'Total Orders',   value: counts.total,                     color: 'violet' },
          { label: 'Delivered',      value: counts.delivered,                  color: 'green'  },
          { label: 'Pending',        value: counts.pending,                    color: 'amber'  },
          { label: 'Total Spent',    value: `$${totalSpent.toFixed(2)}`,       color: 'cyan'   },
        ].map(s => (
          <div key={s.label} className={`profile-stat glass profile-stat--${s.color} animate-fade-in`}>
            <span className="profile-stat__value">{s.value}</span>
            <span className="profile-stat__label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Tab: Orders ── */
  const TabOrders = () => (
    <div className="profile-tab animate-fade-in">
      <div className="orders-header">
        <h2 className="orders-header__title">Order History</h2>
        <Badge variant="muted">{counts.total} orders</Badge>
      </div>

      {ordersLoading ? (
        <div className="orders-list">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton.OrderRow key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty glass">
          <span className="orders-empty__icon">📦</span>
          <h3>No orders yet</h3>
          <p>Your orders will appear here once you make a purchase.</p>
          <Button variant="primary" onClick={() => window.location.href = '/products'}>
            Start Shopping →
          </Button>
        </div>
      ) : (
        <div className="orders-list stagger">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );

  /* ── Tab: Settings ── */
  const TabSettings = () => (
    <div className="profile-tab animate-fade-in">

      {/* Account info */}
      <div className="settings-section glass">
        <h3 className="settings-section__title">Account Information</h3>
        <div className="settings-field">
          <span className="settings-field__label">Email</span>
          <span className="settings-field__value">{user?.email}</span>
        </div>
        <div className="settings-field">
          <span className="settings-field__label">Role</span>
          <Badge variant={isAdmin ? 'warning' : 'primary'}>{role}</Badge>
        </div>
        <div className="settings-field">
          <span className="settings-field__label">Account ID</span>
          <span className="settings-field__value settings-field__value--mono">
            {user?.id?.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Change password */}
      <div className="settings-section glass">
        <h3 className="settings-section__title">Security</h3>
        <p className="settings-section__desc">
          Password changes are handled via your email. Click below to receive a reset link.
        </p>
        <Button
          variant="ghost"
          onClick={async () => {
            const { error } = await import('../lib/supabase').then(m =>
              m.supabase.auth.resetPasswordForEmail(user?.email)
            );
            if (error) { toast.error(error.message); return; }
            toast.success('Password reset email sent!');
          }}
        >
          Send Reset Email
        </Button>
      </div>

      {/* Danger zone */}
      <div className="settings-section settings-section--danger glass">
        <h3 className="settings-section__title settings-section__title--danger">Danger Zone</h3>
        <p className="settings-section__desc">
          Signing out will clear your session. Type <strong>SIGNOUT</strong> to confirm.
        </p>
        <div className="settings-danger-row">
          <Input
            placeholder='Type "SIGNOUT" to confirm'
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
          />
          <Button
            variant="danger"
            disabled={deleteConfirm !== 'SIGNOUT'}
            icon={<LogOut size={16} />}
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );

  /* ── Render ── */
  return (
    <main className="profile-page container animate-fade-in">
      {/* Page title */}
      <div className="profile-page__header">
        <h1 className="profile-page__title">
          My <span className="gradient-text">Account</span>
        </h1>
      </div>

      <div className="profile-layout">
        {/* ── Sidebar nav ── */}
        <nav className="profile-nav glass">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`profile-nav__item ${activeTab === tab.id ? 'profile-nav__item--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
          <div className="profile-nav__divider" />
          <button className="profile-nav__item profile-nav__item--danger" onClick={handleSignOut}>
            <LogOut size={16} /> Sign Out
          </button>
        </nav>

        {/* ── Content ── */}
        <div className="profile-content">
          {profileLoading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-5)' }}>
              <Skeleton.Base height={180} radius="lg" width="100%" />
              <div className="profile-stats">
                {Array.from({length:4}).map((_,i) => <Skeleton.StatCard key={i} />)}
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'profile'  && <TabProfile />}
              {activeTab === 'orders'   && <TabOrders  />}
              {activeTab === 'settings' && <TabSettings />}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Profile;
