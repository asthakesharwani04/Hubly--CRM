import './Button.css';

export const Button = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${loading ? 'btn-loading' : ''}`}
    >
      {loading ? <span className="spinner"></span> : children}
    </button>
  );
};