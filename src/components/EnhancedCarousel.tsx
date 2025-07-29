
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EnhancedCarousel = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      title: "Premium Healthcare",
      subtitle: "Delivered to Your Door",
      description: "Experience the future of pharmacy with our curated selection of premium healthcare products.",
      cta: "Explore Collection",
      background: "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
      textColor: "text-white"
    },
    {
      id: 2,
      title: "Trusted Quality",
      subtitle: "Verified Products",
      description: "Every product in our collection is carefully verified and sourced from certified manufacturers.",
      cta: "Shop Now",
      background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f1f3f4 100%)",
      textColor: "text-black"
    },
    {
      id: 3,
      title: "Fast Delivery",
      subtitle: "48 Hour Guarantee",
      description: "Get your healthcare essentials delivered quickly and safely with our express delivery service.",
      cta: "Order Today",
      background: "linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #2d2d2d 100%)",
      textColor: "text-white"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="relative h-[70vh] lg:h-[80vh] overflow-hidden">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
            style={{ background: slide.background }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                {/* Content container with proper spacing from arrows */}
                <div className="max-w-3xl ml-16 lg:ml-20">
                  <div className={`space-y-8 transform transition-all duration-700 delay-300 ${
                    index === currentSlide 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-8 opacity-0'
                  }`}>
                    <div className="space-y-4">
                      <h2 className={`text-sm font-medium uppercase tracking-wider ${slide.textColor} opacity-80`}>
                        {slide.subtitle}
                      </h2>
                      <h1 className={`text-4xl lg:text-6xl xl:text-7xl font-light ${slide.textColor} leading-tight`}>
                        {slide.title}
                      </h1>
                    </div>
                    
                    <p className={`text-lg lg:text-xl xl:text-2xl ${slide.textColor} opacity-80 leading-relaxed max-w-2xl`}>
                      {slide.description}
                    </p>
                    
                    <div className="pt-6">
                      <Button
                        onClick={() => navigate('/shop')}
                        className={`group px-8 py-4 text-lg font-medium rounded-full transition-all duration-300 
                                  hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          slide.textColor === 'text-white'
                            ? 'bg-white text-black hover:bg-gray-100 focus:ring-white'
                            : 'bg-black text-white hover:bg-gray-800 focus:ring-black'
                        }`}
                      >
                        {slide.cta}
                        <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Repositioned to avoid content overlap */}
      <button
        onClick={prevSlide}
        className="absolute left-4 lg:left-6 top-1/2 transform -translate-y-1/2 z-10 
                 w-10 h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-sm border border-white/20 
                 rounded-full flex items-center justify-center 
                 hover:bg-white/20 hover:scale-110 transition-all duration-200 
                 focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 lg:right-6 top-1/2 transform -translate-y-1/2 z-10 
                 w-10 h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-sm border border-white/20 
                 rounded-full flex items-center justify-center 
                 hover:bg-white/20 hover:scale-110 transition-all duration-200 
                 focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 
                        hover:scale-125 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Auto-play Toggle */}
      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute bottom-8 right-8 z-10 
                 w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 
                 rounded-full flex items-center justify-center 
                 hover:bg-white/20 hover:scale-110 transition-all duration-200 
                 focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <Play className={`h-4 w-4 text-white transition-transform duration-200 ${
          isAutoPlaying ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`} />
        <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-200 ${
          isAutoPlaying ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}>
          <div className="w-1 h-3 bg-white rounded-full mr-0.5" />
          <div className="w-1 h-3 bg-white rounded-full ml-0.5" />
        </div>
      </button>
    </section>
  );
};

export default EnhancedCarousel;
