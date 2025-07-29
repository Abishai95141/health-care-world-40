
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, TrendingUp, Clock, Plus, Upload, Eye, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalProducts: number;
  outOfStockItems: number;
  lowStockItems: number;
  recentImports: number;
}

const StaffDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    outOfStockItems: 0,
    lowStockItems: 0,
    recentImports: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: outOfStockItems } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('stock', 0);

      const { count: lowStockItems } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gt('stock', 0)
        .lte('stock', 10);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: recentImports } = await supabase
        .from('product_import_logs')
        .select('*', { count: 'exact', head: true })
        .gte('imported_at', sevenDaysAgo.toISOString());

      setStats({
        totalProducts: totalProducts || 0,
        outOfStockItems: outOfStockItems || 0,
        lowStockItems: lowStockItems || 0,
        recentImports: recentImports || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockItems,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Low Stock',
      value: stats.lowStockItems,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Recent Imports',
      value: stats.recentImports,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Manually add a single product',
      icon: Plus,
      action: () => navigate('/staff/products/new'),
      color: 'bg-[#27AE60] hover:bg-[#219150]'
    },
    {
      title: 'Bulk Import',
      description: 'Import products via CSV',
      icon: Upload,
      action: () => navigate('/staff/products/import'),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'View All Products',
      description: 'Manage existing products',
      icon: Eye,
      action: () => navigate('/staff/products'),
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Inventory Alerts',
      description: 'Check stock levels',
      icon: BarChart3,
      action: () => navigate('/staff/inventory'),
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-[#0B1F45]">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome to your staff portal</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse rounded-2xl">
              <CardContent className="p-8">
                <div className="h-20 bg-gray-200 rounded-xl"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-[#0B1F45]">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your staff portal</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`rounded-2xl shadow-sm border-2 ${card.borderColor} hover:shadow-lg transition-all duration-200`}>
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-light text-[#0B1F45]">{card.value}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${card.bgColor}`}>
                    <Icon className={`w-8 h-8 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-light text-[#0B1F45]">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.title} className="rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={action.action}>
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-xl text-white ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-[#0B1F45] group-hover:text-[#27AE60] transition-colors duration-200">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-light text-[#0B1F45]">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Database Connected</span>
              </div>
              <span className="text-xs text-gray-500">Online</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Last Backup</span>
              </div>
              <span className="text-xs text-gray-500">Today, 2:00 AM</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">Storage Usage</span>
              </div>
              <span className="text-xs text-gray-500">45% of 100GB</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-light text-[#0B1F45]">Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Products</span>
                <span className="font-medium text-[#0B1F45]">{stats.totalProducts}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#27AE60] h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low Stock Items</span>
                <span className="font-medium text-orange-600">{stats.lowStockItems}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min((stats.lowStockItems / Math.max(stats.totalProducts, 1)) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Out of Stock</span>
                <span className="font-medium text-red-600">{stats.outOfStockItems}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.min((stats.outOfStockItems / Math.max(stats.totalProducts, 1)) * 100, 100)}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;
