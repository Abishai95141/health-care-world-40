
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  stock: number;
  category: string;
  brand: string | null;
}

const InventoryAlerts = () => {
  const { toast } = useToast();
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [outOfStockExpanded, setOutOfStockExpanded] = useState(false);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      // Fetch low stock products (stock between 1 and 10)
      const { data: lowStock, error: lowStockError } = await supabase
        .from('products')
        .select('id, name, stock, category, brand')
        .gt('stock', 0)
        .lte('stock', 10)
        .eq('is_active', true)
        .order('stock', { ascending: true });

      if (lowStockError) throw lowStockError;

      // Fetch out of stock products (stock = 0)
      const { data: outOfStock, error: outOfStockError } = await supabase
        .from('products')
        .select('id, name, stock, category, brand')
        .eq('stock', 0)
        .order('name', { ascending: true });

      if (outOfStockError) throw outOfStockError;

      setLowStockProducts(lowStock || []);
      setOutOfStockProducts(outOfStock || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReorderClick = (productId: string, currentStock: number) => {
    setEditingStock(productId);
    setNewStockValue(currentStock.toString());
  };

  const handleStockUpdate = async (productId: string) => {
    const newStock = parseInt(newStockValue);
    
    if (isNaN(newStock) || newStock < 0) {
      toast({
        title: "Error",
        description: "Stock must be a valid number ≥ 0",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          stock: newStock,
          is_active: newStock > 0 // Reactivate product if stock is added
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock updated successfully",
      });

      // Refresh the data
      await fetchInventoryData();
      setEditingStock(null);
      setNewStockValue('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
    setNewStockValue('');
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock <= 5) {
      return <Badge variant="destructive">Only {stock} left!</Badge>;
    } else if (stock <= 10) {
      return <Badge className="bg-orange-500">Only {stock} left!</Badge>;
    }
    return <Badge variant="default">{stock} in stock</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-[#0B1F45]">Inventory Alerts</h1>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading inventory data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#0B1F45]">Inventory Alerts</h1>
      </div>

      {/* Low Stock Alerts */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-orange-600">
            Low Stock Alerts ({lowStockProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No low stock items</p>
          ) : (
            lowStockProducts.map((product) => (
              <Card key={product.id} className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  {editingStock === product.id ? (
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category} • {product.brand}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Input
                          type="number"
                          min="0"
                          value={newStockValue}
                          onChange={(e) => setNewStockValue(e.target.value)}
                          placeholder="Enter new stock amount"
                          className="w-48"
                        />
                        <Button
                          onClick={() => handleStockUpdate(product.id)}
                          size="sm"
                          className="bg-[#27AE60] hover:bg-[#219150]"
                        >
                          Update Stock
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category} • {product.brand}</p>
                        <div className="mt-2">
                          {getStockBadge(product.stock)}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleReorderClick(product.id, product.stock)}
                        className="bg-[#27AE60] hover:bg-[#219150]"
                      >
                        Reorder
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Out of Stock Section */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => setOutOfStockExpanded(!outOfStockExpanded)}
        >
          <CardTitle className="text-lg text-red-600 flex items-center">
            {outOfStockExpanded ? (
              <ChevronDown className="w-5 h-5 mr-2" />
            ) : (
              <ChevronRight className="w-5 h-5 mr-2" />
            )}
            Out-of-Stock Products ({outOfStockProducts.length})
          </CardTitle>
        </CardHeader>
        
        {outOfStockExpanded && (
          <CardContent className="space-y-4">
            {outOfStockProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No out of stock items</p>
            ) : (
              outOfStockProducts.map((product) => (
                <Card key={product.id} className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    {editingStock === product.id ? (
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category} • {product.brand}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Input
                            type="number"
                            min="0"
                            value={newStockValue}
                            onChange={(e) => setNewStockValue(e.target.value)}
                            placeholder="Enter new stock amount"
                            className="w-48"
                          />
                          <Button
                            onClick={() => handleStockUpdate(product.id)}
                            size="sm"
                            className="bg-[#27AE60] hover:bg-[#219150]"
                          >
                            Update Stock
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category} • {product.brand}</p>
                          <div className="mt-2">
                            {getStockBadge(product.stock)}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleReorderClick(product.id, product.stock)}
                          className="bg-[#27AE60] hover:bg-[#219150]"
                        >
                          Reorder
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default InventoryAlerts;
