
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AdvertisementCarouselProps {
  advertisements: any[];
}

const AdvertisementCarousel: React.FC<AdvertisementCarouselProps> = ({ advertisements }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % advertisements.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length);
  };

  if (advertisements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No enabled advertisements to preview</p>
      </div>
    );
  }

  const currentAd = advertisements[currentIndex];

  return (
    <div className="relative">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-0">
            <div className="flex items-center">
              {currentAd.image_url && (
                <div className="w-1/3">
                  <img
                    src={currentAd.image_url}
                    alt={currentAd.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <div className={`${currentAd.image_url ? 'w-2/3' : 'w-full'} p-8`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentAd.headline}
                </h3>
                {currentAd.subtext && (
                  <p className="text-gray-600 mb-4">{currentAd.subtext}</p>
                )}
                {currentAd.cta_text && (
                  <Button className="bg-[#27AE60] hover:bg-[#219653] text-white rounded-xl">
                    {currentAd.cta_text}
                  </Button>
                )}
                <div className="absolute top-4 right-4">
                  <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    {currentAd.placement.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      {advertisements.length > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full w-10 h-10 p-0"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full w-10 h-10 p-0"
            onClick={nextSlide}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {advertisements.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {advertisements.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-[#27AE60]' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvertisementCarousel;
