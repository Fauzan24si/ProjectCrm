import './Reusable.css';

const Cart = ({ children, className = '', style }) => {
  return (
    <div className={`reusable-cart ${className}`.trim()} style={style}>
      {children}
    </div>
  );
};

export default Cart;
