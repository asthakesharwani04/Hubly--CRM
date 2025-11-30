import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onConfirm, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showFooter = true,
  size = 'medium' // small, medium, large
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-container modal-${size}`}>
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
        {showFooter && (
          <div className="modal-footer">
            <button className="modal-btn modal-btn-cancel" onClick={onClose}>
              {cancelText}
            </button>
            {onConfirm && (
              <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;