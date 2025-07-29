
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useBanners } from '@/contexts/BannerContext';
import { ExternalLink } from 'lucide-react';

const ShopTopBanner = () => {
  const { getBannersByPlacement } = useBanners();
  const banners = getBannersByPlacement('shop_top');
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.25 }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (banners.length === 0) return null;

  const banner = banners[0]; // Show first enabled banner

  return (
    <div
      ref={bannerRef}
      className={`w-full bg-gradient-to-r from-black via-gray-900 to-black py-4 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📢</span>
            <div>
              <h3 className="text-white font-semibold">{banner.headline}</h3>
              {banner.subtext && (
                <p className="text-gray-300 text-sm">{banner.subtext}</p>
              )}
            </div>
          </div>
          
          {banner.cta_text && banner.cta_url && (
            <Button
              asChild
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <a href={banner.cta_url} target="_blank" rel="noopener noreferrer">
                {banner.cta_text}
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopTopBanner;
