
import React from 'react';
import { Heart, Shield, Users, Award, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import EnhancedNavigation from '@/components/EnhancedNavigation';
import StickyOfferBanner from '@/components/StickyOfferBanner';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const AboutUs = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const values = [
    {
      icon: Heart,
      title: "Care-First Approach",
      description: "Every decision we make is guided by what's best for our customers' health and wellbeing."
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "We maintain the highest standards of quality and safety in everything we do."
    },
    {
      icon: Users,
      title: "Inclusive Healthcare",
      description: "We believe everyone deserves access to quality healthcare products and information."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We continuously strive to improve our services and exceed expectations."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <EnhancedNavigation />
      <StickyOfferBanner onShopNow={() => navigate('/shop')} />

      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br from-black via-gray-900 to-black py-32 overflow-hidden ${isMobile ? 'mt-40' : 'mt-32'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="w-24 h-0.5 bg-white mx-auto"></div>
            <h1 className="text-5xl lg:text-7xl font-light text-white leading-tight tracking-tight">
              Our Mission is Your Health
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Capsule Care is revolutionizing pharmaceutical access in India through our commitment to quality, convenience, and customer care.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-light text-black tracking-tight">Our Story</h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Founded in 2020, Capsule Care was born from a simple observation: accessing quality healthcare products in India often involved unnecessary hurdles, delays, and uncertainties.
                </p>
                <p>
                  Our founders, a team of healthcare professionals and technology specialists, set out to create a solution that would bring transparency, reliability, and convenience to Indian households.
                </p>
                <p>
                  Today, we serve millions of customers across the country, providing access to authentic medicines, healthcare products, and wellness guidance - all delivered with care to your doorstep.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 h-96 lg:h-[500px] rounded-3xl flex items-center justify-center">
              <span className="text-gray-500 text-xl">Story Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-light text-black mb-6 tracking-tight">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              These principles guide everything we do - from product selection to customer service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 
                                        hover:scale-105 rounded-3xl bg-white">
                <CardContent className="pt-12 px-8 pb-10 text-center">
                  <div className="bg-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8
                                hover:bg-black hover:scale-110 transition-all duration-300 group">
                    <value.icon className="h-10 w-10 text-gray-700 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { value: "1M+", label: "Customers Served" },
              { value: "500+", label: "Cities Reached" },
              { value: "5000+", label: "Products Available" },
              { value: "99%", label: "On-time Delivery" }
            ].map((stat, index) => (
              <div key={index} className="space-y-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <p className="text-5xl lg:text-6xl font-light text-black">{stat.value}</p>
                <p className="text-gray-600 text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-light text-black mb-6 tracking-tight">Our Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Meet the experienced professionals guiding our mission to transform healthcare access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((member, index) => (
              <div key={member} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl 
                                        transition-all duration-300 hover:scale-105 animate-fade-in"
                   style={{ animationDelay: `${index * 200}ms` }}>
                <div className="h-80 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-500 text-xl">Executive Photo</span>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold text-black mb-2">Executive Name</h3>
                  <p className="text-gray-600 mb-4 text-lg">Position Title</p>
                  <p className="text-gray-600 leading-relaxed">Brief description of executive's background and expertise.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-light text-white tracking-tight">Join Our Journey</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Whether you're a customer, healthcare professional, or potential partner - we'd love to connect with you.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center pt-6">
              <Button 
                onClick={() => navigate('/contact-us')}
                variant="outline" 
                className="bg-transparent text-white border-white hover:bg-white hover:text-black 
                         px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105"
              >
                Contact Us
              </Button>
              <Button 
                onClick={() => navigate('/shop')}
                className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg rounded-full 
                         transition-all duration-300 hover:scale-105"
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-light text-black mb-6 tracking-tight">Our Locations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              With fulfillment centers across India, we ensure fast and reliable delivery to your doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Mumbai', 'Delhi', 'Bangalore'].map((city, index) => (
              <Card key={city} className="overflow-hidden hover:shadow-xl transition-all duration-300 
                                       hover:scale-105 rounded-3xl border-0 shadow-lg animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}>
                <div className="h-64 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-500 text-xl">{city} Image</span>
                </div>
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <MapPin className="h-6 w-6 text-black mr-3" />
                    <h3 className="text-2xl font-semibold text-black">{city}</h3>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Our {city} fulfillment center serves the entire {city} metropolitan region.
                  </p>
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>Same-day delivery available</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { title: 'About Us', links: ['Our Story', 'Leadership', 'Careers', 'Press'] },
              { title: 'Customer Service', links: ['Contact Us', 'FAQs', 'Returns', 'Shipping'] },
              { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Compliance'] }
            ].map((section, index) => (
              <div key={section.title} className="space-y-6">
                <h3 className="text-xl font-semibold">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <button className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-200 
                                       focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 
                                       focus:ring-offset-black rounded-sm">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Connect</h3>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social, index) => (
                  <button
                    key={social}
                    className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center 
                             hover:bg-white hover:scale-110 transition-all duration-300 
                             focus:outline-none focus:ring-2 focus:ring-white group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-6 h-6 bg-gray-400 group-hover:bg-black rounded transition-colors duration-200"></div>
                  </button>
                ))}
              </div>
              <p className="text-gray-400 leading-relaxed">
                © 2025 Capsule Care Pharma.<br />All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
