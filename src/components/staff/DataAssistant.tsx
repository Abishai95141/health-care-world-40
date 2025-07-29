
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { MessageCircle, Send, TrendingUp, Package, Users, ShoppingCart, AlertTriangle, Calendar } from 'lucide-react';

const DataAssistant = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'assistant',
      content: 'Hello! I\'m your AI data assistant. I can help you analyze sales data, inventory levels, customer behavior, and generate reports. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for visualizations
  const salesData = [
    { name: 'Mon', sales: 12000, orders: 45 },
    { name: 'Tue', sales: 19000, orders: 68 },
    { name: 'Wed', sales: 8000, orders: 32 },
    { name: 'Thu', sales: 15000, orders: 55 },
    { name: 'Fri', sales: 22000, orders: 78 },
    { name: 'Sat', sales: 18000, orders: 65 },
    { name: 'Sun', sales: 14000, orders: 48 }
  ];

  const categoryData = [
    { name: 'Prescription', value: 45, color: '#27AE60' },
    { name: 'OTC Medicine', value: 30, color: '#2ECC71' },
    { name: 'Vitamins', value: 15, color: '#58D68D' },
    { name: 'Medical Devices', value: 10, color: '#85E085' }
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        type: 'assistant',
        content: getAIResponse(message),
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const getAIResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('sales') || lowerQuery.includes('revenue')) {
      return 'Based on recent data, your total sales this week are ₹108,000 with 391 orders. Friday was your best day with ₹22,000 in sales. Your average order value is ₹276. Sales are up 15% compared to last week.';
    } else if (lowerQuery.includes('inventory') || lowerQuery.includes('stock')) {
      return 'Current inventory status: 23 products are low in stock, 5 products are out of stock. Top-selling categories need restocking: Prescription medicines (78% sold), OTC medicines (65% sold). I recommend placing orders for Paracetamol, Cough Syrup, and Vitamin D tablets.';
    } else if (lowerQuery.includes('customer') || lowerQuery.includes('users')) {
      return 'Customer insights: You have 1,247 registered customers. 68% are returning customers. Average customer lifetime value is ₹2,450. Most active age group is 25-45 years. Top customer segments prefer prescription medicines and vitamins.';
    } else if (lowerQuery.includes('product') || lowerQuery.includes('top selling')) {
      return 'Top 5 products this month: 1) Paracetamol 500mg (234 units), 2) Vitamin D3 (187 units), 3) Cough Syrup (156 units), 4) Blood Pressure Monitor (89 units), 5) Calcium Tablets (78 units). Prescription medicines account for 45% of total sales.';
    } else {
      return 'I can help you analyze various aspects of your business including sales trends, inventory management, customer behavior, product performance, and financial reports. Try asking about sales data, inventory levels, or customer insights!';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Total Sales</p>
                <p className="text-2xl font-bold text-green-900">₹1,08,000</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Products Sold</p>
                <p className="text-2xl font-bold text-blue-900">2,847</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Customers</p>
                <p className="text-2xl font-bold text-purple-900">1,247</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Orders</p>
                <p className="text-2xl font-bold text-orange-900">391</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#27AE60" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            AI Data Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chat History */}
            <ScrollArea className="h-96 border rounded-lg p-4 bg-gray-50">
              <div className="space-y-4">
                {chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        chat.type === 'user'
                          ? 'bg-[#27AE60] text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{chat.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {chat.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#27AE60]"></div>
                        <span className="text-sm text-gray-600">Analyzing data...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about sales, inventory, customers, or any business insights..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="bg-[#27AE60] hover:bg-[#219a52]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setMessage('Show me today\'s sales summary')}
              >
                Today's Sales
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setMessage('Which products are low in stock?')}
              >
                Low Stock Alert
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setMessage('Show customer behavior trends')}
              >
                Customer Insights
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setMessage('What are the top selling products?')}
              >
                Top Products
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataAssistant;
