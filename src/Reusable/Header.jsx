import './Reusable.css';

const Header = ({ children, className = '', style }) => {
  return (
    <header className={`reusable-header ${className}`.trim()} style={style}>
      {children}
    </header>
  );
};

export default Header;
