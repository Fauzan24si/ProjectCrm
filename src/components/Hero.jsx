import Container from '../Reusable/Container';
import Button from '../Reusable/Button';
import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';

const slides = [
  {
    image: '/assets/images/hero.png',
    badge: 'LIMITED OFFER',
    subtitle: 'New Year Sale',
    title: 'Up To 50% Off\nFor New Collection',
    description:
      'Mulai tahun dengan suasana baru. Dapatkan diskon hingga 50% untuk koleksi furnitur terbaru kami.',
    cta: 'SHOP THE SALE',
  },
  {
    image: '/assets/images/living_room.png',
    badge: 'BUNDLE DEAL',
    subtitle: 'Living Room Set',
    title: 'Buy 1 Get 1\nLiving Room Series',
    description:
      'Lengkapi ruang keluargamu dengan paket hemat. Beli satu set sofa, gratis meja kopi eksklusif.',
    cta: 'GET THE DEAL',
  },
  {
    image: '/assets/images/bedroom.png',
    badge: 'FREE SHIPPING',
    subtitle: 'Bedroom Collection',
    title: 'Extra 30% Off\n+ Free Delivery',
    description:
      'Wujudkan kamar impianmu dengan potongan ekstra 30% dan gratis ongkir untuk seluruh koleksi bedroom.',
    cta: 'CLAIM OFFER',
  },
];

const Hero = () => {
  const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <>
      <style>{heroStyles}</style>
      <div className="hero-wrapper">
        <Carousel
          className="hero-carousel"
          opts={{ loop: true, align: 'start' }}
          plugins={[autoplay.current]}
        >
          <CarouselContent>
            {slides.map((slide, i) => (
              <CarouselItem key={i}>
                <section
                  className="hero-slide"
                  style={{ backgroundImage: `url('${slide.image}')` }}
                >
                  <Container style={styles.container}>
                    <div style={styles.card}>
                      {slide.badge && (
                        <span style={styles.badge}>{slide.badge}</span>
                      )}
                      <p style={styles.subtitle}>{slide.subtitle}</p>
                      <h1 style={styles.title}>
                        {slide.title.split('\n').map((line, idx) => (
                          <span key={idx}>
                            {line}
                            <br />
                          </span>
                        ))}
                      </h1>
                      <p style={styles.description}>{slide.description}</p>
                      <Button
                        variant="primary"
                        className="btn btn-primary"
                        style={styles.btn}
                      >
                        {slide.cta}
                      </Button>
                    </div>
                  </Container>
                </section>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hero-arrow hero-arrow--prev" />
          <CarouselNext className="hero-arrow hero-arrow--next" />
        </Carousel>
      </div>
    </>
  );
};

const heroStyles = `
  .hero-wrapper {
    background: #ffffff;
    padding: 32px;
  }

  .hero-carousel {
    position: relative;
    width: 100%;
    max-width: var(--max-width);
    margin: 0 auto;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  }

  .hero-slide {
    height: 72vh;
    min-height: 540px;
    background-size: cover;
    background-position: center;
    position: relative;
    display: flex;
    align-items: center;
  }

  @media (max-width: 768px) {
    .hero-wrapper { padding: 16px; }
    .hero-carousel { border-radius: 14px; }
  }

  .hero-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 44px;
    height: 44px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  .hero-arrow--prev {
    left: 32px;
  }

  .hero-arrow--next {
    right: 32px;
  }

  @media (max-width: 768px) {
    .hero-arrow--prev { left: 12px; }
    .hero-arrow--next { right: 12px; }
  }
`;

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    padding: '60px',
    borderRadius: '8px',
    maxWidth: '540px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: 'var(--primary)',
    color: 'var(--text-white)',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    padding: '6px 14px',
    borderRadius: '999px',
    marginBottom: '20px',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: 'var(--text-dark)',
    fontWeight: '600',
    letterSpacing: '2px',
    marginBottom: '16px',
  },
  title: {
    color: 'var(--text-dark)',
    fontSize: '48px',
    fontWeight: '700',
    lineHeight: 1.2,
    marginBottom: '16px',
  },
  description: {
    color: 'var(--text-light)',
    fontSize: '16px',
    marginBottom: '32px',
    lineHeight: 1.5,
  },
  btn: {
    padding: '16px 48px',
    fontSize: '16px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    backgroundColor: 'var(--primary)',
  },
};

export default Hero;
