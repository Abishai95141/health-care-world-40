
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import EnhancedCarousel from '@/components/EnhancedCarousel';
import FeaturedProducts from '@/components/FeaturedProducts';
import ServiceHighlights from '@/components/ServiceHighlights';
import StickyOfferBanner from '@/components/StickyOfferBanner';
import AdvertisementBanner from '@/components/AdvertisementBanner';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleServiceClick = (message: string) => {
    toast({
      title: "Service Information",
      description: message,
    });
  };

  const handleShopNow = () => {
    navigate('/shop');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel */}
      <EnhancedCarousel />

      {/* Service Highlights - moved from bottom to replace the dedicated section */}
      <ServiceHighlights onServiceClick={handleServiceClick} />

      {/* Advertisement Banner - Home Placement */}
      <section className="py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AdvertisementBanner placement="home_hero" />
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Sticky Offer Banner */}
      <StickyOfferBanner onShopNow={handleShopNow} />
    </div>
  );
};

export default Index;
