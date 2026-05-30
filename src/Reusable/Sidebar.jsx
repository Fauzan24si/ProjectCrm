import './Reusable.css';

const Sidebar = ({ children, className = '', style }) => {
  return (
    <aside className={`reusable-sidebar ${className}`.trim()} style={style}>
      {children}
    </aside>
  );
};

export default Sidebar;
