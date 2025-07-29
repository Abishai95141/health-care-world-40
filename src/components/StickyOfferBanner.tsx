
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface StickyOfferBannerProps {
  onShopNow: () => void;
}

const StickyOfferBanner: React.FC<StickyOfferBannerProps> = ({ onShopNow }) => {
  const isMobile = useIsMobile();

  return (
    <div className={`
      z-40 bg-gradient-to-r from-black via-gray-900 to-black shadow-xl backdrop-blur-sm
      ${isMobile ? 'sticky top-16' : 'sticky top-16'}
    `}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <span className="text-white font-medium text-sm lg:text-base tracking-wide">
              Premium Healthcare Collection – Exclusive Access
            </span>
          </div>
          
          <Button 
            onClick={onShopNow}
            variant="ghost"
            className="group text-white hover:bg-white/10 hover:text-white
                       focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black
                       transition-all duration-300 text-sm px-6 py-2 h-auto rounded-full
                       hover:scale-105 border border-white/20 hover:border-white/40"
          >
            Explore Now
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyOfferBanner;
