import './Reusable.css';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  onClick,
  className = '',
  ...rest
}) => {
  const variantClass = `reusable-btn--${variant}`;
  return (
    <button
      type={type}
      onClick={onClick}
      className={`reusable-btn ${variantClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
