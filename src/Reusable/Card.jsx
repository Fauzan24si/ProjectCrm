import './Reusable.css';

const Card = ({ children, className = '', ...rest }) => {
  return (
    <div className={`reusable-card ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
};

export default Card;
