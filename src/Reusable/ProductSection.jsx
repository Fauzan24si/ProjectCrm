import './Reusable.css';

const ProductSection = ({ title, subtitle, children, className = '', style }) => {
  return (
    <section className={`reusable-product-section ${className}`.trim()} style={style}>
      {title && <h2 className="reusable-section-title">{title}</h2>}
      {subtitle && <p className="reusable-section-subtitle">{subtitle}</p>}
      {children}
    </section>
  );
};

export default ProductSection;
