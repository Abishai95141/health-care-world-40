
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBanners } from '@/contexts/BannerContext';

interface AdvertisementBannerProps {
  placement: string;
  className?: string;
}

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({ 
  placement, 
  className = '' 
}) => {
  const { getBannersByPlacement } = useBanners();
  const [currentIndex, setCurrentIndex] = useState(0);
  const advertisements = getBannersByPlacement(placement);

  useEffect(() => {
    if (advertisements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % advertisements.length);
      }, 5000); // Auto-advance every 5 seconds

      return () => clearInterval(interval);
    }
  }, [advertisements.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % advertisements.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length);
  };

  const handleCTAClick = (url: string) => {
    if (url) {
      if (url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
    }
  };

  if (advertisements.length === 0) {
    return null;
  }

  const currentAd = advertisements[currentIndex];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentAd.id}-${currentIndex}`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative"
        >
          <div className="relative bg-gradient-to-r from-gray-50 to-white rounded-2xl overflow-hidden shadow-lg">
            <div className="flex items-center min-h-[300px]">
              {currentAd.image_url && (
                <motion.div 
                  className="w-1/2 h-full"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <img
                    src={currentAd.image_url}
                    alt={currentAd.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
              <div className={`${currentAd.image_url ? 'w-1/2' : 'w-full'} p-8 lg:p-12`}>
                <motion.h2 
                  className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  {currentAd.headline}
                </motion.h2>
                {currentAd.subtext && (
                  <motion.p 
                    className="text-lg text-gray-600 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    {currentAd.subtext}
                  </motion.p>
                )}
                {currentAd.cta_text && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <Button
                      onClick={() => handleCTAClick(currentAd.cta_url)}
                      className="bg-[#27AE60] hover:bg-[#219653] text-white px-8 py-3 rounded-2xl text-lg font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {currentAd.cta_text}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {advertisements.length > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full w-12 h-12 p-0 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full w-12 h-12 p-0 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg"
            onClick={nextSlide}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {advertisements.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {advertisements.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-[#27AE60] scale-110' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvertisementBanner;
