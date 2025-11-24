import React from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ProductCard } from './components/ProductCard';
import { DeckView } from './components/DeckView';
import { CreateOrderForm } from './components/CreateOrderForm';
import { ProfileView } from './components/ProfileView';
import { MessagesView } from './components/MessagesView';
import { AddProductForm } from './components/AddProductForm';
import { mockProducts, mockUser } from './data/mockData';
import { Product, DeckCard, User, UserRole } from './types';
import { toast, Toaster } from 'sonner@2.0.3';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('home');
  const [user, setUser] = React.useState<User>(mockUser);
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [deck, setDeck] = React.useState<DeckCard[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.producerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToDeck = (product: Product) => {
    if (deck.find((card) => card.id === product.id)) {
      toast.info('Ce produit est déjà dans votre deck');
      return;
    }
    const newCard: DeckCard = {
      ...product,
      addedAt: new Date(),
    };
    setDeck([...deck, newCard]);
    toast.success(`${product.name} ajouté à votre deck !`);
  };

  const handleRemoveFromDeck = (productId: string) => {
    setDeck(deck.filter((card) => card.id !== productId));
    toast.success('Produit retiré du deck');
  };

  const handleCreateOrder = (orderData: any) => {
    console.log('Creating order:', orderData);
    toast.success('Commande créée avec succès !');
    // Remove used products from deck
    const usedProductIds = orderData.products.map((p: Product) => p.id);
    setDeck(deck.filter((card) => !usedProductIds.includes(card.id)));
    setActiveTab('home');
  };

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`,
    };
    setProducts([newProduct, ...products]);
    toast.success('Produit ajouté avec succès !');
    setActiveTab('home');
  };

  const handleUpdateUser = (userData: Partial<User>) => {
    setUser({ ...user, ...userData });
    toast.success('Profil mis à jour !');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToDeck={user.role === 'sharer' ? handleAddToDeck : undefined}
                inDeck={deck.some((card) => card.id === product.id)}
                showAddButton={user.role === 'sharer'}
              />
            ))}
          </div>
        );

      case 'deck':
        return <DeckView deck={deck} onRemoveFromDeck={handleRemoveFromDeck} />;

      case 'create':
        if (user.role === 'producer') {
          return <AddProductForm onAddProduct={handleAddProduct} />;
        } else if (user.role === 'sharer') {
          return <CreateOrderForm deck={deck} onCreateOrder={handleCreateOrder} />;
        } else {
          return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-24 h-24 rounded-full bg-[#FFD166]/20 flex items-center justify-center mb-4">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 8L28 16H20L24 8Z" fill="#FFD166"/>
                  <path d="M24 40L28 32H20L24 40Z" fill="#FFD166"/>
                </svg>
              </div>
              <h3 className="text-[#1F2937] mb-2">Explorez les produits</h3>
              <p className="text-[#6B7280] text-center max-w-sm">
                Découvrez les produits locaux et les commandes groupées près de chez vous
              </p>
            </div>
          );
        }

      case 'messages':
        return <MessagesView />;

      case 'profile':
        return <ProfileView user={user} onUpdateUser={handleUpdateUser} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Toaster position="top-center" richColors />
      
      <Header 
        showSearch={activeTab === 'home'} 
        onSearch={setSearchQuery}
      />

      <main className="max-w-screen-xl mx-auto px-4 pt-20 pb-24">
        {/* Page Title */}
        {activeTab !== 'home' && (
          <div className="mb-6">
            <h1 className="text-[#1F2937]">
              {activeTab === 'deck' && 'Mon Deck'}
              {activeTab === 'create' && (user.role === 'producer' ? 'Ajouter un produit' : user.role === 'sharer' ? 'Nouvelle commande' : 'Explorer')}
              {activeTab === 'messages' && 'Messages'}
              {activeTab === 'profile' && 'Mon Profil'}
            </h1>
          </div>
        )}

        {/* Welcome Section for Home */}
        {activeTab === 'home' && (
          <div className="mb-8">
            <h1 className="text-[#1F2937] mb-2">
              Bonjour, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-[#6B7280]">
              {user.role === 'producer' && 'Gérez vos produits et vos commandes'}
              {user.role === 'sharer' && 'Créez des commandes groupées pour votre communauté'}
              {user.role === 'client' && 'Découvrez les produits locaux près de chez vous'}
            </p>
          </div>
        )}

        {renderContent()}
      </main>

      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        userRole={user.role}
      />
    </div>
  );
}
