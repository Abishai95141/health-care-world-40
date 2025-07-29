import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Settings, Package, Heart, Camera, Edit2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useOrderCount } from '@/hooks/useOrderCount';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { RecentOrdersList } from '@/components/RecentOrdersList';
import { AddressDrawer } from '@/components/AddressDrawer';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();
  const { totalItems } = useWishlist();
  const { orderCount, loading: orderCountLoading } = useOrderCount();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '+91 98765 43210'
  });
  const [progressValue, setProgressValue] = useState(0);

  // Animate progress bar on mount
  useEffect(() => {
    const timer = setTimeout(() => setProgressValue(80), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileData({
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: '+91 98765 43210'
    });
  };

  const statCards = [
    { 
      icon: Package, 
      label: 'Orders Placed', 
      value: orderCountLoading ? '...' : orderCount.toString(), 
      color: 'text-black',
      loading: orderCountLoading
    },
    { icon: Heart, label: 'Wishlist Items', value: totalItems.toString(), color: 'text-black' },
    { icon: MapPin, label: 'Saved Addresses', value: '0', color: 'text-black' }
  ];

  const memberSince = new Date(user?.created_at || '').toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Cover Banner */}
        <div className="relative h-64 lg:h-80 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative">
          {/* Avatar Section */}
          <div className="relative -mt-20 mb-12 text-center">
            <div className="relative inline-block group">
              <Avatar className="w-36 h-36 lg:w-40 lg:h-40 border-4 border-white shadow-2xl">
                <AvatarImage src="" alt={profileData.fullName} />
                <AvatarFallback className="text-3xl font-light bg-gradient-to-br from-gray-100 to-white text-black">
                  {profileData.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 
                            transition-opacity duration-300 flex items-center justify-center cursor-pointer">
                <Camera className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-light text-black mt-6 tracking-tight">
              {profileData.fullName || 'User'}
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Member since {memberSince}</p>
          </div>

          {/* Profile Completeness */}
          <Card className="mb-12 border-0 shadow-lg rounded-3xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-black">Profile Completeness</span>
                <span className="text-lg font-semibold text-black">{progressValue}% Complete</span>
              </div>
              <Progress value={progressValue} className="h-3 transition-all duration-1000 ease-out rounded-full" />
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {statCards.map((stat, index) => (
              <Card 
                key={stat.label} 
                className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 
                         hover:scale-105 cursor-pointer rounded-3xl animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-8">
                  <div className="bg-gray-50 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl mx-auto mb-6 
                                flex items-center justify-center hover:bg-black hover:scale-110 
                                transition-all duration-300 group">
                    <stat.icon className={`h-8 w-8 lg:h-10 lg:w-10 ${stat.color} group-hover:text-white 
                                         transition-colors duration-300`} />
                  </div>
                  <div className="text-3xl lg:text-4xl font-light text-black mb-2">
                    {stat.loading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 mx-auto rounded"></div>
                    ) : stat.label === 'Orders Placed' ? (
                      <motion.span
                        initial={{ rotateX: -90 }}
                        animate={{ rotateX: 0 }}
                        transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
                        key={stat.value}
                      >
                        {stat.value}
                      </motion.span>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-gray-600 text-lg">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl">
                    <div className="flex items-center">
                      <User className="h-6 w-6 mr-3 text-black" />
                      Personal Information
                    </div>
                    {!isEditing ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEdit}
                        className="hover:bg-gray-100 hover:scale-110 transition-all duration-200 rounded-xl"
                      >
                        <Edit2 className="h-5 w-5 text-gray-600" />
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSave}
                          className="text-black hover:bg-gray-100 hover:scale-110 transition-all duration-200 rounded-xl"
                        >
                          <Save className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancel}
                          className="text-gray-600 hover:bg-gray-100 hover:scale-110 transition-all duration-200 rounded-xl"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 px-8 pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      {isEditing ? (
                        <Input
                          value={profileData.fullName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="h-12 rounded-2xl border-gray-200 focus:border-black focus:ring-black 
                                   transition-all duration-200"
                        />
                      ) : (
                        <p className="text-black p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200 text-lg">
                          {profileData.fullName || 'Not provided'}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      {isEditing ? (
                        <Input
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="h-12 rounded-2xl border-gray-200 focus:border-black focus:ring-black 
                                   transition-all duration-200"
                        />
                      ) : (
                        <p className="text-black p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200 text-lg">
                          {profileData.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      {isEditing ? (
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="h-12 rounded-2xl border-gray-200 focus:border-black focus:ring-black 
                                   transition-all duration-200"
                        />
                      ) : (
                        <p className="text-black p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200 text-lg">
                          {profileData.phone}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Date Joined</label>
                      <p className="text-black p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200 text-lg">
                        {new Date(user?.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders - Updated */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Package className="h-6 w-6 mr-3 text-black" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentOrdersList />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/wishlist')}
                    className="w-full justify-start h-14 border-gray-200 
                             hover:bg-gray-50 hover:border-black hover:scale-105 
                             transition-all duration-200 group rounded-2xl text-lg"
                  >
                    <Heart className="h-5 w-5 mr-4 group-hover:text-black transition-colors duration-200" />
                    Wishlist
                    {totalItems > 0 && (
                      <span className="ml-auto bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddressDrawerOpen(true)}
                    className="w-full justify-start h-14 border-gray-200 
                             hover:bg-gray-50 hover:border-black hover:scale-105 
                             transition-all duration-200 group rounded-2xl text-lg"
                  >
                    <MapPin className="h-5 w-5 mr-4 group-hover:text-black transition-colors duration-200" />
                    Addresses
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-14 border-gray-200 
                                                     hover:bg-gray-50 hover:border-black hover:scale-105 
                                                     transition-all duration-200 group rounded-2xl text-lg">
                    <Settings className="h-5 w-5 mr-4 group-hover:text-black transition-colors duration-200" />
                    Account Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl">Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-lg">Email Verified</span>
                      <Badge variant="secondary" className="bg-black text-white hover:scale-110 
                                                          transition-transform duration-200 px-3 py-1 rounded-full">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-lg">Phone Verified</span>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:scale-110 
                                                          transition-transform duration-200 px-3 py-1 rounded-full">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Address Drawer */}
      <AddressDrawer 
        isOpen={isAddressDrawerOpen} 
        onClose={() => setIsAddressDrawerOpen(false)} 
      />
    </Layout>
  );
};

export default Profile;
