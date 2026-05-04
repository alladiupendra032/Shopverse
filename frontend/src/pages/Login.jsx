import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldCheck, User } from 'lucide-react';
import './Login.css';

const ROLES = [
  {
    id: 'user',
    label: 'Customer',
    icon: <User size={20} />,
    desc: 'Browse products, add to cart & place orders.',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: <ShieldCheck size={20} />,
    desc: 'Manage products, orders & users.',
  },
];

const Login = () => {
  const [isLogin,  setIsLogin]  = useState(true);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [role,     setRole]     = useState('user');   // 'user' | 'admin'
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const switchTab = (login) => {
    setIsLogin(login);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Redirect based on stored role in user metadata
        const userRole = data.user?.user_metadata?.role;
        navigate(userRole === 'admin' ? '/admin' : '/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, role },   // role saved in user_metadata
          },
        });
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="glass-elevated login-card animate-fade-in">

        {/* Logo */}
        <Link to="/" className="login-card__logo gradient-text">✦ ShopVerse</Link>

        {/* Tab switcher */}
        <div className="login-card__tabs">
          <button
            className={`login-card__tab ${isLogin ? 'active' : ''}`}
            onClick={() => switchTab(true)}
          >Sign In</button>
          <button
            className={`login-card__tab ${!isLogin ? 'active' : ''}`}
            onClick={() => switchTab(false)}
          >Sign Up</button>
        </div>

        <h1 className="login-card__heading">
          {isLogin ? 'Welcome Back 👋' : 'Create Account ✨'}
        </h1>
        <p className="login-card__sub">
          {isLogin
            ? 'Sign in to continue to your dashboard'
            : 'Choose your role and join ShopVerse'}
        </p>

        {/* Alerts */}
        {error   && <div className="login-alert login-alert--error">{error}</div>}
        {success && <div className="login-alert login-alert--success">{success}</div>}

        <form onSubmit={handleSubmit} className="login-card__form">

          {/* ── Register-only fields ── */}
          {!isLogin && (
            <>
              {/* Full name */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  className="input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Role selector */}
              <div className="form-group">
                <label className="form-label">Select Your Role</label>
                <div className="role-selector">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`role-card ${role === r.id ? 'role-card--active' : ''}`}
                      onClick={() => setRole(r.id)}
                    >
                      <span className="role-card__icon">{r.icon}</span>
                      <span className="role-card__label">{r.label}</span>
                      <span className="role-card__desc">{r.desc}</span>
                      {role === r.id && (
                        <span className="role-card__check">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary animate-glow-pulse"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Sign In'
                : `Sign Up as ${role === 'admin' ? 'Admin' : 'Customer'}`}
          </button>
        </form>

        <p className="login-card__footer">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button className="login-card__switch" onClick={() => switchTab(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
