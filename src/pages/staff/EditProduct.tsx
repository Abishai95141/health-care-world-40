import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import ImageUpload from '@/components/staff/ImageUpload';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    brand: '',
    tags: '',
    unit: '',
    price: '',
    mrp: '',
    weight_volume: '',
    manufacturer: '',
    requires_prescription: false,
    stock: '',
    expiration_date: '',
    is_active: true,
    image_urls: [] as string[]
  });

  const categories = [
    'Prescription',
    'OTC & Wellness', 
    'Vitamins & Supplements',
    'Medical Devices'
  ];

  const units = [
    'Tablet',
    'Capsule', 
    'Bottle',
    'Syrup',
    'Pack'
  ];

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          category: data.category || '',
          brand: data.brand || '',
          tags: data.tags ? data.tags.join(', ') : '',
          unit: data.unit || '',
          price: data.price ? data.price.toString() : '',
          mrp: data.mrp ? data.mrp.toString() : '',
          weight_volume: data.weight_volume || '',
          manufacturer: data.manufacturer || '',
          requires_prescription: data.requires_prescription || false,
          stock: data.stock ? data.stock.toString() : '',
          expiration_date: data.expiration_date || '',
          is_active: data.is_active !== false,
          image_urls: data.image_urls || []
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch product details",
        variant: "destructive",
      });
      navigate('/staff/products');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name
    if (field === 'name') {
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: generateSlug(value)
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.weight_volume.trim()) newErrors.weight_volume = 'Weight/Volume is required';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price < 1) {
      newErrors.price = 'Price must be ≥ ₹1';
    }

    const stock = parseInt(formData.stock);
    if (formData.stock === '' || isNaN(stock) || stock < 0) {
      newErrors.stock = 'Stock must be ≥ 0';
    }

    if (formData.mrp) {
      const mrp = parseFloat(formData.mrp);
      if (isNaN(mrp) || mrp < price) {
        newErrors.mrp = 'MRP must be ≥ Price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const stock = parseInt(formData.stock);
      const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        category: formData.category,
        brand: formData.brand || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        unit: formData.unit,
        price: parseFloat(formData.price),
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        weight_volume: formData.weight_volume,
        manufacturer: formData.manufacturer,
        requires_prescription: formData.requires_prescription,
        stock: stock,
        expiration_date: formData.expiration_date || null,
        is_active: formData.is_active && stock > 0,
        image_urls: formData.image_urls.length > 0 ? formData.image_urls : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      navigate('/staff/products');

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = !Object.keys(errors).length && 
    formData.name && formData.description && formData.category && 
    formData.unit && formData.price && formData.stock !== '' && 
    formData.weight_volume && formData.manufacturer;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-8">
            <div className="text-center">Loading product details...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#0B1F45]">Edit Product</h1>
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardHeader className="relative">
          <CardTitle className="text-xl">Product Details</CardTitle>
          <button
            onClick={() => navigate('/staff/products')}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="product-slug"
                  className={errors.slug ? 'border-red-500' : ''}
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter product description"
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full h-10 px-3 py-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium mb-2">Brand</label>
                <Input
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="Enter brand name"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <Input
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Unit */}
              <div>
                <label className="block text-sm font-medium mb-2">Unit *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className={`w-full h-10 px-3 py-2 border rounded-md ${errors.unit ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select unit</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
              </div>

              {/* Weight/Volume */}
              <div>
                <label className="block text-sm font-medium mb-2">Weight/Volume *</label>
                <Input
                  value={formData.weight_volume}
                  onChange={(e) => handleInputChange('weight_volume', e.target.value)}
                  placeholder="e.g., 100 ml, 500 mg"
                  className={errors.weight_volume ? 'border-red-500' : ''}
                />
                {errors.weight_volume && <p className="text-red-500 text-sm mt-1">{errors.weight_volume}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              {/* MRP */}
              <div>
                <label className="block text-sm font-medium mb-2">MRP (₹)</label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => handleInputChange('mrp', e.target.value)}
                  placeholder="0.00"
                  className={errors.mrp ? 'border-red-500' : ''}
                />
                {errors.mrp && <p className="text-red-500 text-sm mt-1">{errors.mrp}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manufacturer */}
              <div>
                <label className="block text-sm font-medium mb-2">Manufacturer *</label>
                <Input
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  placeholder="Enter manufacturer name"
                  className={errors.manufacturer ? 'border-red-500' : ''}
                />
                {errors.manufacturer && <p className="text-red-500 text-sm mt-1">{errors.manufacturer}</p>}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="0"
                  className={errors.stock ? 'border-red-500' : ''}
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
              </div>
            </div>

            {/* Expiration Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Expiration Date</label>
                <Input
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => handleInputChange('expiration_date', e.target.value)}
                />
              </div>
            </div>

            {/* Product Images */}
            <ImageUpload
              images={formData.image_urls}
              onImagesChange={(images) => handleInputChange('image_urls', images)}
              maxImages={5}
            />

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={formData.requires_prescription}
                  onCheckedChange={(checked) => handleInputChange('requires_prescription', checked)}
                />
                <label className="text-sm font-medium">Prescription Required</label>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <label className="text-sm font-medium">Is Active</label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full h-11 bg-[#27AE60] hover:bg-[#219150] text-white font-semibold rounded-lg"
            >
              {isLoading ? 'Updating...' : 'Update Product'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProduct;
