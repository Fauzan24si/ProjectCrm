import './Reusable.css';

const HeroSection = ({ children, className = '', style }) => {
  return (
    <section className={`reusable-hero ${className}`.trim()} style={style}>
      {children}
    </section>
  );
};

export default HeroSection;
