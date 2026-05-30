import ProductSection from '../Reusable/ProductSection';

const Inspiration = () => {
  const images = [
    '/assets/images/living_room.png',
    '/assets/images/bedroom.png',
    '/assets/images/dining_room.png',
  ];

  return (
    <ProductSection style={styles.section}>
      <div className="container text-center">
        <h2 className="section-title">Inspiration Collection</h2>
        <p className="section-subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        
        <div style={styles.grid}>
          {images.map((img, index) => (
            <div key={index} style={styles.imageCard}>
              <img src={img} alt={`Inspiration ${index + 1}`} style={styles.image} />
            </div>
          ))}
        </div>
      </div>
    </ProductSection>
  );
};

const styles = {
  section: {
    padding: '80px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginTop: '40px',
  },
  imageCard: {
    overflow: 'hidden',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  image: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.3s ease',
  }
};

export default Inspiration;
