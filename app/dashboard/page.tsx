'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingBag, Plus, Settings, LogOut, Store, Edit, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useShopsContext } from '@/contexts/shops-context';
import { useProducts } from '@/hooks/use-products';
import ImageUpload from '@/components/image-upload';
import DeleteShopDialog from '@/components/delete-shop-dialog';
import LoadingSkeleton from '@/components/loading-skeleton';
import NavigationGuard from '@/components/navigation-guard';
import { supabase } from '@/lib/supabase';



export default function DashboardPage() {
  return (
    <NavigationGuard>
      <DashboardContent />
    </NavigationGuard>
  );
}

function DashboardContent() {
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const { shops, loading: shopsLoading, error, refreshShops, updateShopInCache, removeShopFromCache, addShopToCache } = useShopsContext();
  
  // Calculer le total des produits en temps réel
  const totalProducts = shops.reduce((total, shop) => {
    // Utiliser products_count si disponible, sinon 0
    return total + (shop.products_count || 0);
  }, 0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<any>(null);
  const [selectedEditImage, setSelectedEditImage] = useState<File | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<any>(null);
  const [newShopName, setNewShopName] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingShop, setIsCreatingShop] = useState(false);
  const [isUpdatingShop, setIsUpdatingShop] = useState(false);

  // Rediriger si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [authLoading, isAuthenticated]);

  const handleCreateShop = async () => {
    if (!newShopName.trim() || !user || isCreatingShop) return;

    setIsCreatingShop(true);
    try {
      let imageUrl = selectedImage || 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=400';

      // Si c'est un fichier, uploader l'image
      if (selectedImage instanceof File) {
        const timestamp = Date.now();
        const fileName = `${Date.now()}-${timestamp}.png`;
        const filePath = `${user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('shop-images')
          .upload(filePath, selectedImage);

        if (uploadError) {
          throw new Error(`Erreur upload image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = await supabase.storage
          .from('shop-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('shops')
        .insert({
          name: newShopName,
          image: imageUrl,
          user_id: user.id,
          products_count: 0
        })
        .select()
        .single();

      if (error) {
        throw new Error('Erreur lors de la création de la boutique');
      }

      // Ajouter au cache
      addShopToCache(data);
      
      setNewShopName('');
      setSelectedImage(null);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erreur création boutique:', error);
      alert(`Erreur lors de la création de la boutique: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsCreatingShop(false);
    }
  };

  const handleEditShop = (shop: any) => {
    setEditingShop(shop);
    setSelectedEditImage(null);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingShop || !user || isUpdatingShop) return;

    setIsUpdatingShop(true);
    try {
      let imageUrl = editingShop.image;

      // Si une nouvelle image a été sélectionnée, l'uploader
      if (selectedEditImage) {
        const timestamp = Date.now();
        const fileName = `${editingShop.id}-${timestamp}.png`;
        const filePath = `${user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('shop-images')
          .upload(filePath, selectedEditImage);

        if (uploadError) {
          throw new Error(`Erreur upload image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = await supabase.storage
          .from('shop-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('shops')
        .update({
          name: editingShop.name,
          image: imageUrl
        })
        .eq('id', editingShop.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error('Erreur lors de la mise à jour de la boutique');
      }

      // Mettre à jour le cache
      updateShopInCache(editingShop.id, data);

      setIsEditDialogOpen(false);
      setEditingShop(null);
      setSelectedEditImage(null);
    } catch (error) {
      console.error('Erreur modification boutique:', error);
      alert(`Erreur lors de la modification de la boutique: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsUpdatingShop(false);
    }
  };

  const handleDeleteShop = async (shopId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    try {
      // Récupérer la boutique pour supprimer l'image
      const { data: shop } = await supabase
        .from('shops')
        .select('image')
        .eq('id', shopId)
        .eq('user_id', user.id)
        .single();

      // Supprimer la boutique
      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('id', shopId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error('Erreur lors de la suppression de la boutique');
      }

      // Supprimer l'image si elle a été uploadée
      if (shop?.image && shop.image.includes('supabase.co')) {
        const filePath = shop.image.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('shop-images')
            .remove([`${user.id}/${filePath}`]);
        }
      }

      // Retirer du cache
      removeShopFromCache(shopId);

      return { success: true };
    } catch (error) {
      console.error('Erreur suppression boutique:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  };

  const handleOpenDeleteDialog = (shop: any) => {
    setShopToDelete(shop);
    setIsDeleteDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">Chargement...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DropFlow
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{user?.user_metadata?.first_name} {user?.user_metadata?.last_name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <Link href="/dashboard/profile">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Tableau de bord
          </h1>
          <p className="text-slate-600">
            Gérez vos boutiques et développez votre business dropshipping
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Boutiques Actives
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-slate-900">{shops.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Produits
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-slate-900">
                {totalProducts}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Dernière Mise à Jour
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-slate-900">Aujourd'hui</div>
            </CardContent>
          </Card>
        </div>

        {/* Shops Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Mes Boutiques ({shops.length})
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher une boutique..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-white/60 backdrop-blur-sm border-slate-300"
              />
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Boutique
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle boutique</DialogTitle>
                  <DialogDescription>
                    Donnez un nom à votre nouvelle boutique dropshipping
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Nom de la boutique</Label>
                    <Input
                      id="shopName"
                      placeholder="Ex: Ma Boutique Mode"
                      value={newShopName}
                      onChange={(e) => setNewShopName(e.target.value)}
                    />
                  </div>
                  
                  <ImageUpload
                    onImageSelect={setSelectedImage}
                    onImageRemove={() => setSelectedImage(null)}
                    selectedImage={selectedImage}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleCreateShop} 
                    disabled={!newShopName.trim() || isCreatingShop}
                    className={isCreatingShop ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    {isCreatingShop ? 'Création...' : 'Créer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Dialog de modification */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier la boutique</DialogTitle>
              <DialogDescription>
                Modifiez les informations de votre boutique
              </DialogDescription>
            </DialogHeader>
            {editingShop && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editShopName">Nom de la boutique</Label>
                  <Input
                    id="editShopName"
                    placeholder="Ex: Ma Boutique Mode"
                    value={editingShop.name}
                    onChange={(e) => setEditingShop({...editingShop, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Image de la boutique</Label>
                  <div className="mb-2">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200">
                      <img
                        src={editingShop.image}
                        alt={editingShop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <ImageUpload
                    onImageSelect={setSelectedEditImage}
                    onImageRemove={() => setSelectedEditImage(null)}
                    selectedImage={selectedEditImage}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setEditingShop(null);
                setSelectedEditImage(null);
              }}>
                Annuler
              </Button>
              <Button 
                onClick={handleSaveEdit} 
                disabled={!editingShop?.name.trim() || isUpdatingShop}
                className={isUpdatingShop ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {isUpdatingShop ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Shops Grid */}
        {shopsLoading ? (
          <LoadingSkeleton type="shops" />
        ) : filteredShops.length === 0 ? (
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchQuery ? 'Aucune boutique trouvée' : 'Aucune boutique pour le moment'}
              </h3>
              <p className="text-slate-600 text-center mb-6">
                {searchQuery 
                  ? 'Essayez de modifier votre recherche'
                  : 'Créez votre première boutique pour commencer à gérer vos produits'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer ma première boutique
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <Card key={shop.id} className="bg-white/60 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                        <img
                          src={shop.image}
                          alt={shop.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {shop.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {shop.products_count} produits
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditShop(shop)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenDeleteDialog(shop)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-xs text-slate-500">
                      Créée le {new Date(shop.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    
                    <Link href={`/dashboard/shop/${shop.id}`}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                        Gérer les produits
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de suppression de boutique */}
        {shopToDelete && (
          <DeleteShopDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onDeleteShop={handleDeleteShop}
            shopName={shopToDelete.name}
            shopId={shopToDelete.id}
          />
        )}
      </div>
    </div>
  );
}