
import React from 'react';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isProfilePage = location.pathname === '/profile';

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-green-600 hover:text-green-700"
            >
              HealthCareWorld
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => navigate('/')}
              className={`text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium ${
                location.pathname === '/' ? 'text-green-600' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/shop')}
              className={`text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium ${
                location.pathname === '/shop' ? 'text-green-600' : ''
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => navigate('/about-us')}
              className={`text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium ${
                location.pathname === '/about-us' ? 'text-green-600' : ''
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => navigate('/contact-us')}
              className={`text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium ${
                location.pathname === '/contact-us' ? 'text-green-600' : ''
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 text-gray-700 hover:text-green-600"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2 text-gray-700 hover:text-green-600"
                >
                  <User className="h-6 w-6" />
                </button>
                {isProfilePage && (
                  <button
                    onClick={() => navigate('/')}
                    className="p-2 text-gray-700 hover:text-red-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                )}
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="bg-green-600 hover:bg-green-700"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
