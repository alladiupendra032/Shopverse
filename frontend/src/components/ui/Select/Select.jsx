import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './Select.css';

/**
 * Custom Select — fully styled, keyboard accessible, theme-aware
 * @param {string}   label     - field label
 * @param {string}   value     - current value
 * @param {function} onChange  - called with new value string
 * @param {array}    options   - [{ value, label }] or ['string', ...]
 * @param {string}   placeholder
 * @param {string}   error
 */
const Select = ({
  label,
  value,
  onChange,
  options  = [],
  placeholder = 'Select an option',
  error,
  id,
  className = '',
}) => {
  const [open, setOpen]   = useState(false);
  const containerRef      = useRef(null);

  // Normalise options to { value, label }
  const normalised = options.map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  );

  const selected = normalised.find(o => o.value === value);
  const inputId  = id || label?.toLowerCase().replace(/\s+/g, '-');

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard support
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(v => !v); }
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = normalised.findIndex(o => o.value === value);
      const next = normalised[idx + 1];
      if (next) onChange(next.value);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = normalised.findIndex(o => o.value === value);
      const prev = normalised[idx - 1];
      if (prev) onChange(prev.value);
    }
  };

  return (
    <div className={`select-group ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}

      <div
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={0}
        className={`select-trigger input ${open ? 'select-trigger--open' : ''} ${error ? 'input--error' : ''}`}
        onClick={() => setOpen(v => !v)}
        onKeyDown={handleKeyDown}
      >
        <span className={selected ? 'select-trigger__value' : 'select-trigger__placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`select-trigger__chevron ${open ? 'select-trigger__chevron--open' : ''}`}
        />
      </div>

      {open && (
        <ul
          className="select-dropdown"
          role="listbox"
          aria-label={label}
        >
          {normalised.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`select-option ${opt.value === value ? 'select-option--active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check size={14} className="select-option__check" />}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="input-error" role="alert">{error}</p>}
    </div>
  );
};

export default Select;
