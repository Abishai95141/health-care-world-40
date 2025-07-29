
import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Shield, Truck, MessageCircle, CreditCard } from 'lucide-react';

interface ServiceHighlight {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  message: string;
}

const services: ServiceHighlight[] = [
  {
    icon: RotateCcw,
    title: 'Quick Refill',
    subtitle: 'Auto-refill system',
    message: 'Auto-refill setup coming soon!'
  },
  {
    icon: Shield,
    title: 'Verified Quality',
    subtitle: 'Authentic Products',
    message: 'All products are 100% genuine'
  },
  {
    icon: Truck,
    title: 'Express Delivery',
    subtitle: 'Within 48 Hours',
    message: 'Free delivery on orders over ₹500'
  },
  {
    icon: MessageCircle,
    title: '24/7 Support',
    subtitle: 'Expert Assistance',
    message: 'Chat support coming soon!'
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    subtitle: 'Protected & Safe',
    message: 'Your payments are 100% secure'
  }
];

interface ServiceHighlightsProps {
  onServiceClick: (message: string) => void;
}

const ServiceHighlights: React.FC<ServiceHighlightsProps> = ({ onServiceClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-4xl lg:text-5xl font-light text-black mb-6 tracking-tight">
            Dedicated to Your Well-being
          </h2>
          <p className="text-gray-600 text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            We provide a seamless and trustworthy healthcare experience with services designed around you.
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <button
                key={index}
                onClick={() => onServiceClick(service.message)}
                className={`
                  group text-center p-6 lg:p-8 rounded-2xl bg-white border border-gray-100
                  transition-all duration-500 ease-out hover:shadow-xl hover:scale-105
                  hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-black 
                  focus:ring-offset-2
                  ${isVisible 
                    ? `animate-fade-in opacity-100 translate-y-0` 
                    : 'opacity-0 translate-y-8'
                  }
                `}
                style={{
                  animationDelay: `${index * 150}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-50 rounded-2xl mx-auto mb-6 
                              flex items-center justify-center group-hover:bg-black 
                              transition-all duration-300 group-hover:scale-110">
                  <IconComponent className="w-8 h-8 lg:w-10 lg:h-10 text-gray-700 
                                         group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="font-semibold text-black mb-2 text-lg lg:text-xl 
                             group-hover:text-black transition-colors duration-200">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 text-sm lg:text-base group-hover:text-gray-700 
                             transition-colors duration-200">
                  {service.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceHighlights;
