import './Reusable.css';

const NavItem = ({ children, icon, active = false, onClick, className = '', ...rest }) => {
  const activeClass = active ? 'reusable-nav-item--active' : '';
  return (
    <a
      onClick={onClick}
      className={`reusable-nav-item ${activeClass} ${className}`.trim()}
      {...rest}
    >
      {icon && <span className="reusable-nav-item-icon">{icon}</span>}
      <span>{children}</span>
    </a>
  );
};

export default NavItem;
