export interface Shop {
  id: string;
  name: string;
  image: string;
  createdAt: string;
  productsCount: number;
  userId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  shopId: string;
  userId: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

// Gestion des données avec localStorage
export const database = {
  // Shops
  getShops: (userId: string): Shop[] => {
    if (typeof window === 'undefined') return [];
    
    const shops = localStorage.getItem(`shops_${userId}`);
    if (!shops) return [];
    
    try {
      return JSON.parse(shops);
    } catch {
      return [];
    }
  },

  saveShops: (userId: string, shops: Shop[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`shops_${userId}`, JSON.stringify(shops));
  },

  addShop: (shop: Shop): void => {
    const shops = database.getShops(shop.userId);
    shops.push(shop);
    database.saveShops(shop.userId, shops);
  },

  updateShop: (shopId: string, userId: string, updates: Partial<Shop>): void => {
    const shops = database.getShops(userId);
    const index = shops.findIndex(shop => shop.id === shopId);
    
    if (index !== -1) {
      shops[index] = { ...shops[index], ...updates };
      database.saveShops(userId, shops);
    }
  },

  deleteShop: (shopId: string, userId: string): void => {
    const shops = database.getShops(userId);
    const filteredShops = shops.filter(shop => shop.id !== shopId);
    database.saveShops(userId, filteredShops);
  },

  // Products
  getProducts: (shopId: string): Product[] => {
    if (typeof window === 'undefined') return [];
    
    const products = localStorage.getItem(`products_${shopId}`);
    if (!products) return [];
    
    try {
      return JSON.parse(products);
    } catch {
      return [];
    }
  },

  saveProducts: (shopId: string, products: Product[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`products_${shopId}`, JSON.stringify(products));
  },

  addProduct: (product: Product): void => {
    const products = database.getProducts(product.shopId);
    products.push(product);
    database.saveProducts(product.shopId, products);
    
    // Mettre à jour le nombre de produits dans la boutique
    const shops = database.getShops(product.userId || '');
    const shopIndex = shops.findIndex(shop => shop.id === product.shopId);
    if (shopIndex !== -1) {
      shops[shopIndex].productsCount = products.length;
      database.saveShops(product.userId || '', shops);
    }
  },

  updateProduct: (productId: string, shopId: string, updates: Partial<Product>): void => {
    const products = database.getProducts(shopId);
    const index = products.findIndex(product => product.id === productId);
    
    if (index !== -1) {
      products[index] = { ...products[index], ...updates };
      database.saveProducts(shopId, products);
    }
  },

  deleteProduct: (productId: string, shopId: string, userId: string): void => {
    const products = database.getProducts(shopId);
    const filteredProducts = products.filter(product => product.id !== productId);
    database.saveProducts(shopId, filteredProducts);
    
    // Mettre à jour le nombre de produits dans la boutique
    const shops = database.getShops(userId);
    const shopIndex = shops.findIndex(shop => shop.id === shopId);
    if (shopIndex !== -1) {
      shops[shopIndex].productsCount = filteredProducts.length;
      database.saveShops(userId, shops);
    }
  },

  // Générer un ID unique
  generateId: (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}; 