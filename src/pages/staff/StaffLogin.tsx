import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Eye, EyeOff, Shield, Building2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useStaffAuth } from '@/contexts/StaffAuthContext';
const StaffLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const {
    signIn,
    user
  } = useStaffAuth();
  const redirectMessage = location.state?.message;
  useEffect(() => {
    if (user) {
      const redirectTo = location.state?.from || '/staff/dashboard';
      navigate(redirectTo, {
        replace: true
      });
    }
  }, [user, navigate, location]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const {
        error
      } = await signIn(email, password);
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in to the staff portal."
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const isFormValid = email.trim() && password.trim();
  return <div className="min-h-screen flex">
      {/* Left Panel - Hero */}
      <div className="relative lg:w-1/2 h-screen bg-gradient-to-br from-[#27AE60] via-[#219150] to-[#1e8449] 
                    flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-light text-white mb-6 leading-tight">
              Staff Portal
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Manage your pharmacy operations with precision and care
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl bg-white">
          <CardHeader className="text-center pb-8 pt-12">
            <div className="mb-8">
              <div className="w-16 h-16 bg-[#27AE60]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#27AE60]" />
              </div>
              <h2 className="text-2xl font-light text-[#27AE60] mb-2">Capsule Care</h2>
              <span className="text-sm text-gray-500 uppercase tracking-wider">Staff Portal</span>
            </div>
            
            {redirectMessage && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-sm text-red-800">{redirectMessage}</p>
              </div>}
            
            <h3 className="text-3xl font-light text-[#0B1F45] mb-3">
              Welcome Back
            </h3>
            <p className="text-gray-500">
              Enter your credentials to access the staff portal
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8 px-12 pb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-[#0B1F45]">
                  Email Address
                </label>
                <Input id="email" type="email" placeholder="staff@capsulecare.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-14 rounded-2xl border-gray-200 focus:border-[#27AE60] focus:ring-[#27AE60] 
                           text-lg transition-all duration-200" />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-[#0B1F45]">
                  Password
                </label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="h-14 rounded-2xl border-gray-200 focus:border-[#27AE60] focus:ring-[#27AE60] 
                             text-lg pr-12 transition-all duration-200" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 
                             hover:text-gray-700 transition-colors duration-200">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading || !isFormValid} className="w-full h-14 bg-[#27AE60] hover:bg-[#219150] text-white font-medium 
                         rounded-2xl transition-all duration-300 hover:scale-105 text-lg 
                         shadow-lg hover:shadow-xl disabled:opacity-50">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center pt-6">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs text-gray-600 mb-2 font-medium">Default Test Credentials</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-700">Email: tastetotheworld123@gmail.com</p>
                  <p className="text-xs text-gray-700">Password: abi07040</p>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/')} className="text-gray-600 hover:text-[#27AE60] border-gray-200 hover:border-[#27AE60] 
                         rounded-2xl transition-all duration-200">
                ← Back to Main Site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default StaffLogin;