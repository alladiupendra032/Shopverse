import { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

/**
 * Modal molecule
 * @param {boolean}  isOpen   - controls visibility
 * @param {function} onClose  - called on backdrop click or X
 * @param {string}   title    - modal heading
 * @param {string}   size     - 'sm' | 'md' | 'lg' | 'xl'
 * @param {node}     footer   - optional footer content
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size      = 'md',
  className = '',
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    // Prevent body scroll while open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`modal-box glass-elevated modal-box--${size} ${className}`}>
        {/* Header */}
        <div className="modal-header">
          {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">{children}</div>

        {/* Footer */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
