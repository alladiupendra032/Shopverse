import './Button.css';

/**
 * Button atom
 * @param {string}  variant   - 'primary' | 'ghost' | 'danger' | 'secondary'
 * @param {string}  size      - 'sm' | 'md' | 'lg'
 * @param {boolean} glow      - adds pulse-glow animation
 * @param {boolean} fullWidth - stretches to 100%
 * @param {boolean} loading   - shows spinner and disables
 * @param {node}    icon      - optional icon before label
 * @param {node}    iconRight - optional icon after label
 */
const Button = ({
  children,
  variant   = 'primary',
  size      = 'md',
  glow      = false,
  fullWidth = false,
  loading   = false,
  icon,
  iconRight,
  className = '',
  disabled,
  type      = 'button',
  ...props
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    glow      ? 'animate-glow-pulse' : '',
    fullWidth ? 'btn--full'          : '',
    loading   ? 'btn--loading'       : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {!loading && icon && <span className="btn__icon">{icon}</span>}
      <span className="btn__label">{children}</span>
      {!loading && iconRight && <span className="btn__icon-right">{iconRight}</span>}
    </button>
  );
};

export default Button;
