import { FiTruck, FiHeadphones, FiCheckCircle, FiShield } from 'react-icons/fi';
import FeatureSection from '../Reusable/FeatureSection';
import Container from '../Reusable/Container';

const Features = () => {
  const features = [
    {
      icon: <FiTruck />,
      title: 'Free Delivery',
      description: 'Lorem ipsum dolor sit amet.'
    },
    {
      icon: <FiHeadphones />,
      title: 'Support 24/7',
      description: 'Lorem ipsum dolor sit amet.'
    },
    {
      icon: <FiCheckCircle />,
      title: '100% Authentic',
      description: 'Lorem ipsum dolor sit amet.'
    },
    {
      icon: <FiShield />,
      title: 'Secure Payment',
      description: 'Lorem ipsum dolor sit amet.'
    }
  ];

  return (
    <FeatureSection style={styles.features}>
      <Container style={styles.container}>
        {features.map((feature, index) => (
          <div key={index} style={styles.featureItem}>
            <div style={styles.iconWrapper}>
              {feature.icon}
            </div>
            <div>
              <h3 style={styles.title}>{feature.title}</h3>
              <p style={styles.description}>{feature.description}</p>
            </div>
          </div>
        ))}
      </Container>
    </FeatureSection>
  );
};

const styles = {
  features: {
    padding: '60px 0',
    backgroundColor: 'var(--bg-light)',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '24px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: '1 1 200px',
  },
  iconWrapper: {
    fontSize: '40px',
    color: 'var(--text-dark)',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '4px',
    color: 'var(--text-dark)',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-light)',
  }
};

export default Features;
