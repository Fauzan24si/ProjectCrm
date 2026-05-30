import './Reusable.css';

const FeatureSection = ({ title, subtitle, children, className = '', style }) => {
  return (
    <section className={`reusable-feature-section ${className}`.trim()} style={style}>
      {title && <h2 className="reusable-section-title">{title}</h2>}
      {subtitle && <p className="reusable-section-subtitle">{subtitle}</p>}
      {children}
    </section>
  );
};

export default FeatureSection;
