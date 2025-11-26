import React from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ProductCard } from './components/ProductCard';
import { DeckView } from './components/DeckView';
import { CreateOrderForm } from './components/CreateOrderForm';
import { ProfileView } from './components/ProfileView';
import { MessagesView } from './components/MessagesView';
import { AddProductForm } from './components/AddProductForm';
import { ClientSwipeView } from './components/ClientSwipeView';
import { ProducerOrdersView } from './components/ProducerOrdersView';
import { ProducerProductsView } from './components/ProducerProductsView';
import { mockProducts, mockUser, mockGroupOrders } from './data/mockData';
import { Product, DeckCard, User } from './types';
import { toast, Toaster } from 'sonner';

export default function App() {
  const [activeTab, setActiveTab] = React.useState(() => (mockUser.role === 'client' ? 'create' : 'home'));
  const [user, setUser] = React.useState<User>(mockUser);
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [deck, setDeck] = React.useState<DeckCard[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const prevRoleRef = React.useRef(user.role);

  React.useEffect(() => {
    if (prevRoleRef.current !== user.role) {
      setActiveTab(user.role === 'client' ? 'create' : 'home');
      prevRoleRef.current = user.role;
    }
  }, [user.role]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.producerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentProducerId = user.producerId ?? 'current-user';
  const producerProducts = React.useMemo(
    () => products.filter((product) => product.producerId === currentProducerId),
    [products, currentProducerId]
  );
  const producerOrders = React.useMemo(
    () => mockGroupOrders.filter((order) => order.producerId === currentProducerId),
    [currentProducerId]
  );

  const handleAddToDeck = (product: Product) => {
    if (deck.find((card) => card.id === product.id)) {
      toast.info('Ce produit est déjà dans votre sélection');
      return;
    }

    const newCard: DeckCard = {
      ...product,
      addedAt: new Date(),
    };
    setDeck([...deck, newCard]);
    toast.success(`${product.name} ajouté à votre sélection !`);
  };

  const handleRemoveFromDeck = (productId: string) => {
    setDeck(deck.filter((card) => card.id !== productId));
    toast.success('Produit retiré de votre sélection');
  };

  const handleCreateOrder = (orderData: any) => {
    console.log('Creating order:', orderData);
    toast.success('Commande créée avec succès !');
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
    const updatedUser = { ...user, ...userData };
    if (userData.role === 'producer') {
      updatedUser.producerId = updatedUser.producerId ?? 'current-user';
    }
    setUser(updatedUser);
    toast.success('Profil mis à jour !');
  };

  const locationLabel = user.address?.split(',')[0] ?? 'votre quartier';
  const canSaveProduct = user.role !== 'producer';
  const swipeProducts = filteredProducts.length > 0 ? filteredProducts : products;

  const renderProductGrid = () => {
    if (filteredProducts.length === 0) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <p className="text-sm text-[#6B7280]">Aucun produit ne correspond à votre recherche.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToDeck={canSaveProduct ? handleAddToDeck : undefined}
            inDeck={deck.some((card) => card.id === product.id)}
            showAddButton={canSaveProduct}
          />
        ))}
      </div>
    );
  };

  const renderHomeContent = () => {
    if (user.role === 'producer') {
      return <ProducerProductsView products={producerProducts} />;
    }
    return renderProductGrid();
  };

  const renderDeckContent = () => {
    if (user.role === 'producer') {
      return <ProducerOrdersView orders={producerOrders} />;
    }
    return <DeckView deck={deck} onRemoveFromDeck={handleRemoveFromDeck} />;
  };

  const renderCreateContent = () => {
    if (user.role === 'producer') {
      return <AddProductForm onAddProduct={handleAddProduct} />;
    }
    if (user.role === 'client') {
      return (
        <ClientSwipeView
          products={swipeProducts}
          onSave={handleAddToDeck}
          locationLabel={locationLabel}
        />
      );
    }
    return <CreateOrderForm deck={deck} onCreateOrder={handleCreateOrder} />;
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'deck':
        return renderDeckContent();
      case 'create':
        return renderCreateContent();
      case 'messages':
        return <MessagesView />;
      case 'profile':
        return <ProfileView user={user} onUpdateUser={handleUpdateUser} />;
      default:
        return null;
    }
  };

  const getHomeHeading = () => {
    if (user.role === 'client') {
      return {
        title: 'Rechercher',
        subtitle: `Découvrez les produits autour de ${locationLabel}.`,
      };
    }
    if (user.role === 'producer') {
      return {
        title: 'Vos produits',
        subtitle: 'Gérez vos offres et préparez vos commandes partagées.',
      };
    }
    return {
      title: `Bonjour, ${user.name.split(' ')[0]}`,
      subtitle: 'Créez des commandes groupées entre amis ou voisins.',
    };
  };

  const getPageTitle = () => {
    if (activeTab === 'deck') {
      if (user.role === 'client') return 'Enregistré';
      if (user.role === 'producer') return 'Commandes en cours';
      return 'Votre sélection';
    }
    if (activeTab === 'create') {
      if (user.role === 'client') return 'Swipe';
      if (user.role === 'producer') return 'Produit';
      return 'Nouvelle commande';
    }
    if (activeTab === 'messages') return 'Messages';
    if (activeTab === 'profile') return 'Mon Profil';
    return '';
  };

  const homeHeading = getHomeHeading();
  const pageTitle = getPageTitle();

  return (
    <div className="min-h-screen bg-[#F9F2E4]">
      <Toaster position="top-center" richColors />
      <Header showSearch={activeTab === 'home'} onSearch={setSearchQuery} />

      <main className="max-w-screen-xl mx-auto px-4 pt-20 pb-24">
        {activeTab === 'home' ? (
          <div className="mb-8">
            <h1 className="text-[#1F2937] mb-2">{homeHeading.title}</h1>
            <p className="text-[#6B7280]">{homeHeading.subtitle}</p>
          </div>
        ) : (
          <div className="mb-6">
            <h1 className="text-[#1F2937]">{pageTitle}</h1>
          </div>
        )}

        {renderActiveContent()}
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} userRole={user.role} />
    </div>
  );
}
