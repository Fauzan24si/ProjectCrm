import './Reusable.css';

const Container = ({ children, className = '', style }) => {
  return (
    <div className={`reusable-container ${className}`.trim()} style={style}>
      {children}
    </div>
  );
};

export default Container;
