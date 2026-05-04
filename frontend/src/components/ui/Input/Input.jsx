import { forwardRef } from 'react';
import './Input.css';

/**
 * Input atom
 * @param {string} label       - field label text
 * @param {string} error       - error message (shows red border + text)
 * @param {string} hint        - hint text below input
 * @param {node}   leftIcon    - icon inside left side
 * @param {node}   rightIcon   - icon inside right side
 * @param {string} variant     - 'default' | 'filled'
 */
const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  id,
  className = '',
  variant = 'default',
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'input-wrapper--error' : ''} ${leftIcon ? 'input-wrapper--left-icon' : ''} ${rightIcon ? 'input-wrapper--right-icon' : ''}`}>
        {leftIcon  && <span className="input-icon input-icon--left">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={`input input--${variant} ${error ? 'input--error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {rightIcon && <span className="input-icon input-icon--right">{rightIcon}</span>}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="input-error" role="alert">{error}</p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="input-hint">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
