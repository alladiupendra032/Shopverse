import './Badge.css';

/**
 * Badge atom
 * @param {string} variant - 'primary' | 'success' | 'warning' | 'error' | 'muted'
 * @param {string} size    - 'sm' | 'md'
 * @param {node}   icon    - optional icon before text
 * @param {boolean} dot    - show a coloured dot indicator instead of text
 */
const Badge = ({
  children,
  variant   = 'primary',
  size      = 'md',
  icon,
  dot       = false,
  className = '',
  ...props
}) => (
  <span
    className={`badge badge-${variant} badge--${size} ${dot ? 'badge--dot' : ''} ${className}`}
    {...props}
  >
    {icon && <span className="badge__icon">{icon}</span>}
    {!dot && children}
  </span>
);

export default Badge;
