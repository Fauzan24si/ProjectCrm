import './Reusable.css';

const Footer = ({ children, className = '', style }) => {
  return (
    <footer className={`reusable-footer ${className}`.trim()} style={style}>
      {children}
    </footer>
  );
};

export default Footer;
