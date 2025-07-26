'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ShoppingBag, 
  Plus, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Search,
  ExternalLink,
  Image as ImageIcon,
  Package,
  DollarSign,
  Tag,
  Upload,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useShopsContext } from '@/contexts/shops-context';
import { useProductsContext, Product, ProductsProvider } from '@/contexts/products-context';
import { supabase } from '@/lib/supabase';
import ProductImageUpload from '@/components/product-image-upload';
import ProductImage from '@/components/product-image';
import LoadingSkeleton from '@/components/loading-skeleton';
import NavigationGuard from '@/components/navigation-guard';
import SuccessToast from '@/components/success-toast';
import PremiumLimitDialog from '@/components/premium-limit-dialog';
import { supabaseStorage } from '@/lib/supabase-storage';
import * as XLSX from 'xlsx';

export default function ShopProductsPage({ params }: { params: { id: string } }) {
  return (
    <NavigationGuard>
      <ProductsProvider shopId={params.id}>
        <ShopProductsContent params={params} />
      </ProductsProvider>
    </NavigationGuard>
  );
}

function ShopProductsContent({ params }: { params: { id: string } }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { shops, refreshShops } = useShopsContext();
  const { products, loading: productsLoading, error, addProductToCache, addMultipleProductsToCache, updateProductInCache, removeProductFromCache, deleteProduct, updateShopProductsCount, getTotalProductsCount, verifyPremiumPassword } = useProductsContext();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedEditImage, setSelectedEditImage] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isImporting, setIsImporting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newProduct, setNewProduct] = useState({
    image: '',
    reference: '',
    name: '',
    price: 0,
    purchase_price: 0,
    etsy_link: '',
    dropshipping_link: '',
    category: '',
    status: 'active' as 'active' | 'draft' | 'inactive'
  });
  const [selectedProductImage, setSelectedProductImage] = useState<File | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  const [isPremiumLoading, setIsPremiumLoading] = useState(false);
  const [premiumError, setPremiumError] = useState<string>('');
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState<boolean>(false);

  // Charger le flag premium au chargement du composant
  useEffect(() => {
    if (user?.id) {
      const unlocked = localStorage.getItem(`premium-unlocked-${user.id}`) === 'true';
      setIsPremiumUnlocked(unlocked);
    }
  }, [user?.id]);

  // Rediriger si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [authLoading, isAuthenticated]);

  // Trouver la boutique actuelle
  const currentShop = shops.find(shop => shop.id === params.id);

  // Gérer le chargement de la page
  useEffect(() => {
    // Réinitialiser le chargement quand on change de boutique
    setIsPageLoading(true);
    
    if (!authLoading && !productsLoading && currentShop) {
      // Délai minimum pour éviter les flashs
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 1200); // Augmenté à 1200ms pour couvrir tout le temps nécessaire
      return () => clearTimeout(timer);
    }
  }, [authLoading, productsLoading, currentShop, params.id]);

  const handleCreateProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.reference.trim()) {
      alert('Veuillez remplir le nom et la référence du produit');
      return;
    }

    try {
      const totalProducts = await getTotalProductsCount();
      if (!isPremiumUnlocked && totalProducts >= 15) {
        setIsPremiumDialogOpen(true);
        return;
      }

      let imageUrl = newProduct.image;

      // Si une image a été uploadée, l'uploader
      if (selectedProductImage && user) {
        const uploadResult = await supabaseStorage.uploadShopImage(selectedProductImage, user.id);
        if (uploadResult.success) {
          imageUrl = uploadResult.url!;
        }
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...newProduct,
          image: imageUrl,
          shop_id: params.id,
          user_id: user!.id
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de la création du produit: ${error.message}`);
      }

      // Ajouter au cache
      addProductToCache(data);
    
      setNewProduct({
        image: '',
        reference: '',
        name: '',
        price: 0,
        purchase_price: 0,
        etsy_link: '',
        dropshipping_link: '',
        category: '',
        status: 'active' as 'active' | 'draft' | 'inactive'
      });
      setSelectedProductImage(null);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erreur création produit:', error);
      alert(`Erreur lors de la création du produit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      // Utiliser la fonction du hook qui met à jour automatiquement le compteur
      const { success, error } = await deleteProduct(productId);
      
      if (!success) {
        throw new Error(error || 'Erreur lors de la suppression du produit');
      }

      // Retirer du cache
      removeProductFromCache(productId);
      
      // Rafraîchir la liste des boutiques pour mettre à jour les compteurs
      await refreshShops();
    } catch (error) {
      console.error('Erreur suppression produit:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setSelectedEditImage(null);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      let imageUrl = editingProduct.image;

      // Si une nouvelle image a été sélectionnée, l'uploader
      if (selectedEditImage) {
        const timestamp = Date.now();
        const fileName = `${editingProduct.id}-${timestamp}.png`;
        const filePath = `${user?.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('shop-images')
          .upload(filePath, selectedEditImage);

        if (uploadError) {
          throw new Error(`Erreur upload image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('shop-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          reference: editingProduct.reference,
          price: editingProduct.price,
          purchase_price: editingProduct.purchase_price,
          category: editingProduct.category,
          status: editingProduct.status,
          etsy_link: editingProduct.etsy_link,
          dropshipping_link: editingProduct.dropshipping_link,
          image: imageUrl
        })
        .eq('id', editingProduct.id)
        .eq('user_id', user!.id)
        .eq('shop_id', params.id)
        .select()
        .single();

      if (error) {
        throw new Error('Erreur lors de la mise à jour du produit');
      }

      // Mettre à jour le cache
      updateProductInCache(editingProduct.id, data);

      console.log('Produit mis à jour:', data);
      console.log('Nouvelle URL image:', imageUrl);

      setIsEditDialogOpen(false);
      setEditingProduct(null);
      setSelectedEditImage(null);
    } catch (error) {
      console.error('Erreur modification produit:', error);
      alert(`Erreur lors de la modification du produit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Nom': 'Exemple Produit',
        'Référence': 'REF001',
        'Prix de vente': 29.99,
        'Prix d\'achat': 15.00,
        'Catégorie': 'Mode',
        'Statut': 'Brouillon',
        'Lien de vente': 'https://etsy.com/listing/...',
        'Lien d\'achat': 'https://supplier.com/product/...',
        'Image URL': 'https://example.com/image.jpg'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produits');
    XLSX.writeFile(wb, 'template-import-produits.xlsx');
  };

  const exportProducts = () => {
    const exportData = filteredProducts.map(product => ({
      'Nom': product.name,
      'Référence': product.reference,
      'Prix de vente': product.price,
      'Prix d\'achat': product.purchase_price || 0,
      'Catégorie': product.category,
      'Statut': product.status === 'active' ? 'En ligne' : product.status === 'draft' ? 'Brouillon' : 'Inactif',
      'Lien de vente': product.etsy_link || '',
      'Lien d\'achat': product.dropshipping_link || '',
      'Image URL': product.image || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produits');
    XLSX.writeFile(wb, `produits-${currentShop?.name || 'boutique'}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // Lire le fichier Excel
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const totalProducts = await getTotalProductsCount();
      if (!isPremiumUnlocked && totalProducts + jsonData.length > 15) {
        setIsPremiumDialogOpen(true);
        return;
      }

      // Préparer tous les produits à insérer
      const productsToInsert = [];
      for (const row of jsonData as any[]) {
        // Convertir le statut du français vers l'anglais
        const statusMapping: { [key: string]: 'active' | 'draft' | 'inactive' } = {
          'En ligne': 'active',
          'Online': 'active',
          'Brouillon': 'draft',
          'Draft': 'draft',
          'Inactif': 'inactive',
          'Inactive': 'inactive'
        };

        const rawStatus = row['Statut'] || row['Status'] || 'Brouillon';
        const status = statusMapping[rawStatus] || 'draft';

        const productData = {
          name: row['Nom'] || row['Name'] || '',
          reference: row['Référence'] || row['Reference'] || '',
          price: parseFloat(row['Prix de vente'] || row['Sale Price'] || '0'),
          purchase_price: parseFloat(row['Prix d\'achat'] || row['Purchase Price'] || '0'),
          category: row['Catégorie'] || row['Category'] || '',
          status: status,
          etsy_link: row['Lien de vente'] || row['Sale Link'] || '',
          dropshipping_link: row['Lien d\'achat'] || row['Purchase Link'] || '',
          image: row['Image URL'] || '',
          shop_id: params.id,
          user_id: user!.id
        };

        if (productData.name && productData.reference) {
          productsToInsert.push(productData);
        }
      }

      // Insérer tous les produits en une seule fois
      if (productsToInsert.length > 0) {
        const { data: insertedProducts, error } = await supabase
          .from('products')
          .insert(productsToInsert)
          .select();

        if (error) {
          console.error('Erreur import produits:', error);
          alert(`Erreur lors de l'import: ${error.message}`);
        } else {
          // Ajouter tous les produits au cache en une seule fois
          if (insertedProducts && insertedProducts.length > 0) {
            addMultipleProductsToCache(insertedProducts);
          }
          
          // Mettre à jour le compteur de produits dans la boutique
          await updateShopProductsCount(params.id);
          
          // Rafraîchir la liste des boutiques pour mettre à jour les compteurs
          await refreshShops();
          
          // Afficher le toast de succès
          setSuccessMessage(`${insertedProducts?.length || 0} produits ont été importés avec succès !`);
          setShowSuccessToast(true);
        }
      } else {
        alert('Aucun produit valide trouvé dans le fichier Excel.');
      }
    } catch (error) {
      console.error('Erreur import Excel:', error);
      alert(`Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const handlePremiumPasswordSubmit = async (password: string) => {
    setIsPremiumLoading(true);
    setPremiumError('');

    try {
      const isValid = await verifyPremiumPassword(password);
      
      if (isValid) {
        if (user?.id) {
          localStorage.setItem(`premium-unlocked-${user.id}`, 'true');
          setIsPremiumUnlocked(true);
        }
        // Mot de passe valide, permettre la création du produit
        setIsPremiumDialogOpen(false);
        setIsPremiumLoading(false);
        
        // Relancer la création du produit
        await handleCreateProduct();
      } else {
        setPremiumError('Code d\'accès incorrect. Vérifiez le code reçu.');
      }
    } catch (error) {
      setPremiumError('Erreur lors de la vérification du code.');
    } finally {
      setIsPremiumLoading(false);
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: 'active' | 'draft' | 'inactive') => {
    try {
      let newStatus: 'active' | 'draft' | 'inactive';
      
      // Cycle: active -> draft -> inactive -> active
      switch (currentStatus) {
        case 'active':
          newStatus = 'draft';
          break;
        case 'draft':
          newStatus = 'inactive';
          break;
        case 'inactive':
          newStatus = 'active';
          break;
        default:
          newStatus = 'draft';
      }

      const { data, error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId)
        .eq('user_id', user!.id)
        .eq('shop_id', params.id)
        .select()
        .single();

      if (error) {
        throw new Error('Erreur lors du changement de statut');
      }

      // Mettre à jour le cache
      updateProductInCache(productId, data);
    } catch (error) {
      console.error('Erreur changement statut:', error);
    }
  };

  const filteredProducts = products
    .filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      // Extraire les nombres de la référence
      const getReferenceNumber = (ref: string) => {
        const match = ref.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };

      const refNumA = getReferenceNumber(a.reference);
      const refNumB = getReferenceNumber(b.reference);
      
      // Trier d'abord par numéro de référence, puis par nom
      if (refNumA !== refNumB) {
        return refNumA - refNumB;
      }
      
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'fr', { sensitivity: 'base' });
    });

  // Calculer les statistiques moyennes
  const stats = filteredProducts.reduce((acc, product) => {
    acc.totalSalePrice += product.price || 0;
    acc.totalPurchasePrice += product.purchase_price || 0;
    acc.count += 1;
    
    // Calculer le pourcentage de marge pour chaque produit
    if (product.price > 0) {
      const marginPercentage = ((product.price - (product.purchase_price || 0)) / product.price) * 100;
      acc.totalMarginPercentage += marginPercentage;
    }
    
    return acc;
  }, { totalSalePrice: 0, totalPurchasePrice: 0, count: 0, totalMarginPercentage: 0 });

  const averageSalePrice = stats.count > 0 ? stats.totalSalePrice / stats.count : 0;
  const averagePurchasePrice = stats.count > 0 ? stats.totalPurchasePrice / stats.count : 0;
  const averageMarginPercentage = stats.count > 0 ? stats.totalMarginPercentage / stats.count : 0;

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  if (authLoading || productsLoading || isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <p className="text-slate-600 text-xl font-semibold">Chargement de la boutique...</p>
          <p className="text-slate-500 text-sm mt-3">Veuillez patienter un instant</p>
        </div>
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Boutique non trouvée</h2>
          <p className="text-slate-600 mb-4">Cette boutique n'existe pas ou vous n'y avez pas accès.</p>
          <Link href="/dashboard">
            <Button>Retour au tableau de bord</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">{currentShop.name}</h1>
                <p className="text-sm text-slate-500">Gestion des produits</p>
              </div>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Produit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau produit</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations du produit
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Colonne gauche */}
                    <div className="space-y-4">
                      <ProductImageUpload
                        onImageSelect={setSelectedProductImage}
                        onImageRemove={() => setSelectedProductImage(null)}
                        selectedImage={selectedProductImage}
                      />
                      
                      <div className="space-y-2">
                        <Label htmlFor="productName">Nom du produit</Label>
                        <Input
                          id="productName"
                          placeholder="Ex: Robe Élégante"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="productReference">Référence</Label>
                        <Input
                          id="productReference"
                          placeholder="Ex: REF001"
                          value={newProduct.reference}
                          onChange={(e) => setNewProduct({...newProduct, reference: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="productCategory">Catégorie</Label>
                        <Input
                          id="productCategory"
                          placeholder="Ex: Mode"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    {/* Colonne droite */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="productPrice">Prix de vente (€)</Label>
                          <Input
                            id="productPrice"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="purchasePrice">Prix d'achat (€)</Label>
                          <Input
                            id="purchasePrice"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={newProduct.purchase_price}
                            onChange={(e) => setNewProduct({...newProduct, purchase_price: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      
                      {newProduct.price > 0 && newProduct.purchase_price > 0 && (
                        <div className={`p-3 border rounded-lg ${
                          (newProduct.price - newProduct.purchase_price) >= 0
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm font-medium ${
                              (newProduct.price - newProduct.purchase_price) >= 0
                                ? 'text-green-800'
                                : 'text-red-800'
                            }`}>Marge calculée :</span>
                            <span className={`text-base font-bold ${
                              (newProduct.price - newProduct.purchase_price) >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {(newProduct.price - newProduct.purchase_price).toFixed(2)}€ 
                              ({(((newProduct.price - newProduct.purchase_price) / newProduct.price) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="productStatus">État de l'article</Label>
                        <Select 
                          value={newProduct.status} 
                          onValueChange={(value) => {
                            setNewProduct({...newProduct, status: value as 'active' | 'draft' | 'inactive'});
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">En ligne</SelectItem>
                            <SelectItem value="draft">Brouillon</SelectItem>
                            <SelectItem value="inactive">Inactif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="etsyLink">Lien de vente</Label>
                        <Input
                          id="etsyLink"
                          placeholder="https://vente.com/listing/..."
                          value={newProduct.etsy_link}
                          onChange={(e) => setNewProduct({...newProduct, etsy_link: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dropshippingLink">Lien d'achat</Label>
                        <Input
                          id="dropshippingLink"
                          placeholder="https://supplier.com/product/..."
                          value={newProduct.dropshipping_link}
                          onChange={(e) => setNewProduct({...newProduct, dropshipping_link: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateProduct} disabled={!newProduct.name.trim() || !newProduct.reference.trim()}>
                    Créer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dialog de modification */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Modifier le produit</DialogTitle>
                  <DialogDescription>
                    Modifiez les informations du produit
                  </DialogDescription>
                </DialogHeader>
                {editingProduct && (
                  <div className="py-4">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Colonne gauche */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Image du produit</Label>
                          <div className="mb-2">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200">
                              <ProductImage
                                src={editingProduct.image || ''}
                                alt={editingProduct.name}
                                className="w-full h-full object-cover"
                                fallbackClassName="w-full h-full"
                              />
                            </div>
                          </div>
                          <ProductImageUpload
                            selectedImage={selectedEditImage}
                            onImageSelect={setSelectedEditImage}
                            onImageRemove={() => setSelectedEditImage(null)}
                            previewUrl={editingProduct.image}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="editProductName">Nom du produit</Label>
                          <Input
                            id="editProductName"
                            placeholder="Ex: Robe Élégante"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="editProductReference">Référence</Label>
                          <Input
                            id="editProductReference"
                            placeholder="Ex: REF001"
                            value={editingProduct.reference}
                            onChange={(e) => setEditingProduct({...editingProduct, reference: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="editProductCategory">Catégorie</Label>
                          <Input
                            id="editProductCategory"
                            placeholder="Ex: Mode"
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      {/* Colonne droite */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="editProductPrice">Prix de vente (€)</Label>
                            <Input
                              id="editProductPrice"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={editingProduct.price}
                              onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="editPurchasePrice">Prix d'achat (€)</Label>
                            <Input
                              id="editPurchasePrice"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={editingProduct.purchase_price}
                              onChange={(e) => setEditingProduct({...editingProduct, purchase_price: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                        
                        {editingProduct.price > 0 && editingProduct.purchase_price > 0 && (
                          <div className={`p-3 border rounded-lg ${
                            (editingProduct.price - editingProduct.purchase_price) >= 0
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}>
                            <div className="flex justify-between items-center">
                              <span className={`text-sm font-medium ${
                                (editingProduct.price - editingProduct.purchase_price) >= 0
                                  ? 'text-green-800'
                                  : 'text-red-800'
                              }`}>Marge calculée :</span>
                              <span className={`text-base font-bold ${
                                (editingProduct.price - editingProduct.purchase_price) >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}>
                                {(editingProduct.price - editingProduct.purchase_price).toFixed(2)}€ 
                                ({(((editingProduct.price - editingProduct.purchase_price) / editingProduct.price) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="editProductStatus">État de l'article</Label>
                          <Select 
                            value={editingProduct.status} 
                            onValueChange={(value) => setEditingProduct({...editingProduct, status: value as 'active' | 'draft' | 'inactive'})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">En ligne</SelectItem>
                              <SelectItem value="draft">Brouillon</SelectItem>
                              <SelectItem value="inactive">Inactif</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="editEtsyLink">Lien de vente</Label>
                          <Input
                            id="editEtsyLink"
                            placeholder="https://vente.com/listing/..."
                            value={editingProduct.etsy_link}
                            onChange={(e) => setEditingProduct({...editingProduct, etsy_link: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="editDropshippingLink">Lien d'achat</Label>
                          <Input
                            id="editDropshippingLink"
                            placeholder="https://supplier.com/product/..."
                            value={editingProduct.dropshipping_link}
                            onChange={(e) => setEditingProduct({...editingProduct, dropshipping_link: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingProduct(null);
                    setSelectedEditImage(null);
                  }}>
                    Annuler
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={!editingProduct?.name.trim() || !editingProduct?.reference.trim()}>
                    Sauvegarder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Statistiques moyennes */}
        {filteredProducts.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                Total Produits
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="text-2xl font-bold text-slate-900">
                  {filteredProducts.length}
                </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Prix de Vente Moyen
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="text-2xl font-bold text-slate-900">
                  {averageSalePrice.toFixed(2)}€
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Prix d'Achat Moyen
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="text-2xl font-bold text-slate-900">
                  {averagePurchasePrice.toFixed(2)}€
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Marge Moyenne (%)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className={`text-2xl font-bold ${
                  averageMarginPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {averageMarginPercentage.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-white/60 backdrop-blur-sm border-slate-300"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 bg-white/60 backdrop-blur-sm border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">En ligne</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-52 bg-white/60 backdrop-blur-sm border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-4">
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="bg-white/60 backdrop-blur-sm border-slate-300 hover:bg-white/80"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  className="hidden"
                  id="excel-import"
                  disabled={isImporting}
                  />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('excel-import')?.click()}
                  disabled={isImporting}
                  className="bg-white/60 backdrop-blur-sm border-slate-300 hover:bg-white/80"
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mr-2"></div>
                      Import...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Importer Excel
                    </>
                  )}
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={exportProducts}
                className="bg-white/60 backdrop-blur-sm border-slate-300 hover:bg-white/80"
                size="sm"
                disabled={filteredProducts.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter Excel
              </Button>
            </div>
          </div>
        </div>

                {/* Products Table */}
        {!currentShop ? (
          <LoadingSkeleton type="products" />
        ) : products.length === 0 && !productsLoading ? (
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchQuery ? 'Aucun produit trouvé' : 'Aucun produit pour le moment'}
                </h3>
                <p className="text-slate-600 text-center mb-6">
                  {searchQuery 
                  ? 'Essayez de modifier vos filtres'
                    : 'Ajoutez votre premier produit pour commencer'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                  Ajouter un produit
                  </Button>
                )}
            </CardContent>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-slate-600 text-center mb-6">
                  Essayez de modifier vos filtres ou votre recherche
                </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-4 px-3 font-medium text-slate-600 w-16">Image</th>
                      <th className="text-left py-4 px-3 font-medium text-slate-600 w-20">Référence</th>
                      <th className="text-left py-4 px-3 font-medium text-slate-600 w-32">Nom</th>
                      <th className="text-left py-4 px-3 font-medium text-slate-600 whitespace-nowrap w-24">Prix Vente</th>
                      <th className="text-left py-4 px-3 font-medium text-slate-600 whitespace-nowrap w-24">Prix Achat</th>
                      <th className="text-left py-4 px-3 font-medium text-slate-600 w-20">Marge</th>
                      <th className="text-left py-4 px-3 font-medium text-slate-600 w-24">Catégorie</th>
                      <th className="text-left py-4 px-3 font-medium text-slate-600 w-20">Statut</th>
                      <th className="text-left py-4 px-3 font-medium text-slate-600 w-16">Liens</th>
                      <th className="text-left py-4 px-3 font-medium text-slate-600 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                        <td className="py-4 px-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                            <ProductImage
                              src={product.image || ''}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              fallbackClassName="w-full h-full"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="w-20">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded truncate block cursor-help">
                                    {product.reference.length > 8 ? `${product.reference.substring(0, 8)}...` : product.reference}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{product.reference}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="w-32">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="font-medium text-slate-900 truncate block cursor-help">
                                    {product.name.length > 10 ? `${product.name.substring(0, 10)}...` : product.name}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{product.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <span className="font-semibold text-slate-900">{product.price.toFixed(2)}€</span>
                        </td>
                        <td className="py-4 px-3">
                          <span className="text-slate-600">
                            {(product.purchase_price || 0).toFixed(2)}€
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          {product.price > 0 && (product.purchase_price || 0) > 0 ? (
                            <div className="text-sm">
                              <div className={`font-semibold ${
                                (product.price - (product.purchase_price || 0)) >= 0 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {(product.price - (product.purchase_price || 0)).toFixed(2)}€
                              </div>
                              <div className={`text-xs ${
                                (product.price - (product.purchase_price || 0)) >= 0 
                                  ? 'text-green-500' 
                                  : 'text-red-500'
                              }`}>
                                ({(((product.price - (product.purchase_price || 0)) / product.price) * 100).toFixed(1)}%)
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-3">
                          {product.category && (
                            <div className="w-24 flex justify-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge 
                                      variant="secondary" 
                                      className="bg-blue-100 text-blue-800 truncate block cursor-help"
                                    >
                                      {product.category.length > 8 ? `${product.category.substring(0, 8)}...` : product.category}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{product.category}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-3">
                          <Badge 
                            variant={product.status === 'active' ? 'default' : 'secondary'}
                            className={
                              product.status === 'active' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : product.status === 'draft'
                                ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }
                          >
                            {product.status === 'active' ? 'En ligne' : product.status === 'draft' ? 'Brouillon' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex space-x-2 justify-center">
                            {product.etsy_link && (
                              <a
                                href={product.etsy_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            {product.dropshipping_link && (
                              <a
                                href={product.dropshipping_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Package className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center justify-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Toast de succès */}
        <SuccessToast
          message={successMessage}
          isVisible={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
          duration={4000}
        />

      {/* Dialog de limite premium */}
      <PremiumLimitDialog
        isOpen={isPremiumDialogOpen}
        onClose={() => setIsPremiumDialogOpen(false)}
        onPasswordSubmit={handlePremiumPasswordSubmit}
        isLoading={isPremiumLoading}
        error={premiumError}
        isSuccess={isPremiumUnlocked}
      />
      </div>
    </div>
  );
}