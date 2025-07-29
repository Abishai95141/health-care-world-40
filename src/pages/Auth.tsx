
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { addToCart } = useApp();

  // Redirect if already logged in and complete pending actions
  useEffect(() => {
    if (user && location.state) {
      const { from, action, productId, quantity } = location.state;
      
      // Complete the intended action after login
      if (action === 'addToCart' && productId) {
        addToCart(productId, quantity || 1);
        toast({
          title: "Item added to cart!",
          description: "You can now view your cart or continue shopping.",
        });
      }
      
      // Navigate to the intended destination
      const redirectTo = from || '/';
      navigate(redirectTo, { replace: true });
    } else if (user) {
      // Simple redirect if no specific action needed
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location, addToCart, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        
        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } else {
        if (password !== confirmPassword) {
          toast({
            title: "Password mismatch",
            description: "Please make sure your passwords match.",
            variant: "destructive",
          });
          return;
        }

        if (!name.trim()) {
          toast({
            title: "Name required",
            description: "Please enter your full name.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await signUp(email, password, name);
        
        if (error) throw error;
        
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await signInWithGoogle();
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred with Google authentication.",
        variant: "destructive",
      });
    }
  };

  // Show message if user was redirected here
  const showRedirectMessage = location.state?.from;

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero - Hidden on mobile */}
      <div className="relative hidden lg:flex lg:w-1/2 min-h-screen bg-gradient-to-br from-black via-gray-900 to-black 
                    items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="relative z-10 text-center px-8 max-w-lg">
          <div className="mb-6">
            <div className="w-20 h-0.5 bg-white mx-auto mb-6"></div>
            <h1 className="text-4xl lg:text-5xl font-light text-white mb-4 leading-tight tracking-tight">
              Welcome to the Future
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Your health journey starts with premium care.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Right Panel - Authentication Form - Full width on mobile */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6 bg-white min-h-screen">
        <div className="w-full max-w-md sm:max-w-[90vw] sm:w-[90vw]">
          <Card className="w-full border-0 shadow-2xl rounded-3xl bg-white">
            <CardHeader className="text-center pb-4 pt-6 px-4 sm:px-16">
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-light text-black mb-2 tracking-tight">Health Care World</h2>
              </div>
              
              {showRedirectMessage && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                  <p className="text-sm text-gray-800">
                    You must be logged in to add items to your cart or complete checkout.
                  </p>
                </div>
              )}
              
              <h3 className="text-2xl sm:text-3xl font-light text-black mb-2 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                {isLogin ? 'Access your account securely' : 'Join us in minutes'}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4 px-4 sm:px-8 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="w-full h-12 rounded-2xl border-gray-200 focus:border-black focus:ring-black 
                               text-base transition-all duration-200"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 rounded-2xl border-gray-200 focus:border-black focus:ring-black 
                             text-base transition-all duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full h-12 rounded-2xl border-gray-200 focus:border-black focus:ring-black 
                               text-base pr-10 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 
                               hover:text-gray-700 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full h-12 rounded-2xl border-gray-200 focus:border-black focus:ring-black 
                                 text-base pr-10 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 
                                 hover:text-gray-700 transition-colors duration-200"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium 
                           rounded-2xl transition-all duration-300 hover:scale-105 text-base 
                           shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Loading...' : (isLogin ? 'Log In' : 'Create Account')}
                </Button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-black hover:text-gray-600 font-medium text-base 
                           transition-colors duration-200 hover:scale-105"
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                </button>
              </div>

              <div className="relative">
                <Separator className="my-4" />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                               bg-white px-3 text-gray-500 text-sm">
                  or
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleAuth}
                className="w-full h-12 border-gray-200 hover:bg-gray-50 rounded-2xl text-base 
                         transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/shop')}
                  className="w-full h-12 border-gray-200 hover:bg-gray-50 rounded-2xl text-base 
                           transition-all duration-300 hover:scale-105"
                >
                  View Store Without Signing In
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/staff/login')}
                  className="w-full h-12 border-gray-300 text-gray-600 hover:bg-gray-50 
                           hover:border-black hover:text-black rounded-2xl 
                           transition-all duration-300 hover:scale-105 text-base"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Staff Login
                </Button>
              </div>

              <p className="text-center text-xs text-gray-500 pt-2">
                By continuing, you agree to our{' '}
                <button className="text-black hover:underline transition-all duration-200">
                  Privacy Policy
                </button>{' '}
                and{' '}
                <button className="text-black hover:underline transition-all duration-200">
                  Terms of Service
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
