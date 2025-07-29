
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useBanners } from '@/contexts/BannerContext';
import { Mail, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CheckoutConfirmationBanner = () => {
  const { getBannersByPlacement } = useBanners();
  const banners = getBannersByPlacement('checkout_confirmation');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  if (banners.length === 0) return null;

  const banner = banners[0];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Mock subscription logic
    setIsSubscribed(true);
    toast({
      title: "Success!",
      description: "You're subscribed! Check your email for the discount code.",
    });
  };

  if (isSubscribed) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 rounded-2xl p-6 mt-6 animate-scale-in">
        <div className="flex items-center space-x-3">
          <Gift className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">You're all set!</h3>
            <p className="text-green-700 text-sm">Discount code sent to your email.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200 rounded-2xl shadow-lg p-6 mt-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-3 rounded-xl">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{banner.headline}</h3>
            {banner.subtext && (
              <p className="text-gray-600 text-sm">{banner.subtext}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubscribe} className="flex flex-1 max-w-md space-x-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
            required
          />
          <Button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 rounded-xl transition-all duration-300 hover:scale-105"
          >
            Subscribe
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default CheckoutConfirmationBanner;
