
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBanners } from '@/contexts/BannerContext';

const HomeHeroBanner = () => {
  const { getBannersByPlacement } = useBanners();
  const banners = getBannersByPlacement('home_hero');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full bg-gradient-to-r from-black via-gray-900 to-black overflow-hidden">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              {currentBanner.headline}
            </h2>
            {currentBanner.subtext && (
              <p className="text-lg text-gray-300 leading-relaxed">
                {currentBanner.subtext}
              </p>
            )}
            {currentBanner.cta_text && currentBanner.cta_url && (
              <Button
                asChild
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <a href={currentBanner.cta_url} target="_blank" rel="noopener noreferrer">
                  {currentBanner.cta_text}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>

          {/* Image */}
          {currentBanner.image_url && (
            <div className="relative">
              <div className="aspect-[16/9] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={currentBanner.image_url}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {banners.length > 1 && (
          <>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm rounded-full w-12 h-12"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm rounded-full w-12 h-12"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeHeroBanner;
