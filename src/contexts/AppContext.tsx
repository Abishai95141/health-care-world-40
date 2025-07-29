import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  stock: number;
  category: string;
  tags: string[];
  brand: string;
  expiresOn?: string;
}

interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  stock: number;
}

interface Filters {
  categories: {
    prescription: boolean;
    otc: boolean;
    vitamins: boolean;
    devices: boolean;
  };
  price: {
    min: number;
    max: number;
  };
  brands: {
    [key: string]: boolean;
  };
  special: {
    inStock: boolean;
    expiresSoon: boolean;
    autoRefill: boolean;
    requiresPrescription: boolean;
  };
}

interface AppContextType {
  products: Product[];
  visibleProducts: Product[];
  cart: CartItem[];
  filters: Filters;
  selectedProduct: Product | null;
  searchQuery: string;
  currentCategory: string;
  currentSort: string;
  currentPage: number;
  rowsPerPage: number;
  isLoggedIn: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  filterByCategory: (category: string) => void;
  sortProducts: (option: string) => void;
  applyAllFilters: (newFilters: Filters) => void;
  addToCart: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedProduct: (product: Product | null) => void;
  changePage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  navigateTo: (path: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Sample product data
const sampleProducts: Product[] = Array.from({ length: 100 }, (_, i) => ({
  id: `product-${i + 1}`,
  name: i % 4 === 0 ? 'Paracetamol 500mg Tablets' : 
        i % 4 === 1 ? 'Vitamin D3 1000 IU Capsules' :
        i % 4 === 2 ? 'Cough Syrup 100ml' : 'Digital Thermometer',
  price: Math.floor(Math.random() * 200) + 25,
  mrp: Math.floor(Math.random() * 250) + 30,
  images: ['placeholder1.jpg', 'placeholder2.jpg', 'placeholder3.jpg'],
  rating: 4 + Math.random(),
  reviewCount: Math.floor(Math.random() * 200) + 10,
  description: 'Effective medication for your health needs. Always consult your doctor before use.',
  stock: Math.floor(Math.random() * 200) + 10,
  category: i % 4 === 0 ? 'Prescription' : 
           i % 4 === 1 ? 'Vitamins & Supplements' :
           i % 4 === 2 ? 'OTC & Wellness' : 'Medical Devices',
  tags: i % 10 === 0 ? ['SummerFever'] : ['Popular'],
  brand: ['Acme Pharma', 'BioHealth', 'CapsuleCare', 'OmniMeds'][i % 4],
  expiresOn: i % 20 === 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
}));

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [products] = useState<Product[]>(sampleProducts);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>(sampleProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState('All');
  const [currentSort, setCurrentSort] = useState('Popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isLoggedIn] = useState(false); // For demo purposes
  const [toastMessage, setToastMessage] = useState<{ message: string; type: string } | null>(null);

  const [filters, setFilters] = useState<Filters>({
    categories: {
      prescription: false,
      otc: false,
      vitamins: false,
      devices: false
    },
    price: {
      min: 0,
      max: 2000
    },
    brands: {
      'Acme Pharma': false,
      'BioHealth': false,
      'CapsuleCare': false,
      'OmniMeds': false
    },
    special: {
      inStock: false,
      expiresSoon: false,
      autoRefill: false,
      requiresPrescription: false
    }
  });

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (currentCategory && currentCategory !== 'All') {
      filtered = filtered.filter(product => product.category === currentCategory);
    }

    // Apply other filters
    const activeCategories = Object.entries(filters.categories)
      .filter(([_, active]) => active)
      .map(([category]) => {
        const categoryMap: { [key: string]: string } = {
          prescription: 'Prescription',
          otc: 'OTC & Wellness',
          vitamins: 'Vitamins & Supplements',
          devices: 'Medical Devices'
        };
        return categoryMap[category];
      });

    if (activeCategories.length > 0) {
      filtered = filtered.filter(product => activeCategories.includes(product.category));
    }

    // Price filter
    filtered = filtered.filter(product => 
      product.price >= filters.price.min && product.price <= filters.price.max
    );

    // Brand filter
    const activeBrands = Object.entries(filters.brands)
      .filter(([_, active]) => active)
      .map(([brand]) => brand);

    if (activeBrands.length > 0) {
      filtered = filtered.filter(product => activeBrands.includes(product.brand));
    }

    // Special filters
    if (filters.special.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }
    if (filters.special.expiresSoon) {
      filtered = filtered.filter(product => product.expiresOn);
    }

    return filtered;
  };

  const sortProducts = (option: string) => {
    let sorted = [...visibleProducts];
    
    switch (option) {
      case 'Price: Low→High':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High→Low':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'Top Rated':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'New Arrivals':
        sorted.reverse();
        break;
      default: // Popular
        break;
    }
    
    setVisibleProducts(sorted);
    setCurrentSort(option);
  };

  const filterByCategory = (category: string) => {
    setCurrentCategory(category);
    setCurrentPage(1);
  };

  const applyAllFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const addToCart = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      } else {
        return [...prevCart, {
          id: productId,
          name: product.name,
          unitPrice: product.price,
          quantity: Math.min(quantity, product.stock),
          stock: product.stock
        }];
      }
    });

    showToast(`✓ ${quantity} item${quantity > 1 ? 's' : ''} added to cart`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    showToast('Product removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    showToast('Cart cleared', 'info');
  };

  const changePage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Update visible products when filters change
  useEffect(() => {
    const filtered = filterProducts();
    setVisibleProducts(filtered);
  }, [searchQuery, currentCategory, filters, products]);

  const contextValue: AppContextType = {
    products,
    visibleProducts,
    cart,
    filters,
    selectedProduct,
    searchQuery,
    currentCategory,
    currentSort,
    currentPage,
    rowsPerPage,
    isLoggedIn,
    setSearchQuery,
    filterByCategory,
    sortProducts,
    applyAllFilters,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    setSelectedProduct,
    changePage,
    setRowsPerPage,
    navigateTo,
    showToast
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      {toastMessage && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
          toastMessage.type === 'success' ? 'bg-green-600' :
          toastMessage.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          {toastMessage.message}
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
