import React from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ProductCard } from './components/ProductCard';
import { CreateOrderForm } from './components/CreateOrderForm';
import { ProfileView } from './components/ProfileView';
import { MessagesView } from './components/MessagesView';
import { AddProductForm } from './components/AddProductForm';
import { ClientSwipeView } from './components/ClientSwipeView';
import { MapView } from './components/MapView';
import { OrderClientView } from './components/OrderClientView';
import { mockProducts, mockUser, mockGroupOrders } from './data/mockData';
import { Product, DeckCard, User, GroupOrder } from './types';
import { toast, Toaster } from 'sonner';

export default function App() {
  const [activeTab, setActiveTab] = React.useState(() => (mockUser.role === 'client' ? 'create' : 'home'));
  const [user, setUser] = React.useState<User>(mockUser);
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [groupOrders, setGroupOrders] = React.useState<GroupOrder[]>(mockGroupOrders);
  const [deck, setDeck] = React.useState<DeckCard[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeOrderId, setActiveOrderId] = React.useState<string | null>(null);
  const prevRoleRef = React.useRef(user.role);
  const lastTabRef = React.useRef<string | null>(null);

  const changeTab = (tab: string) => {
    setActiveOrderId(null);
    lastTabRef.current = null;
    setActiveTab(tab);
  };

  const openOrderView = (orderId: string) => {
    if (!activeOrderId) {
      lastTabRef.current = activeTab;
    }
    setActiveOrderId(orderId);
  };

  const closeOrderView = () => {
    setActiveOrderId(null);
    if (lastTabRef.current) {
      setActiveTab(lastTabRef.current);
      lastTabRef.current = null;
    }
  };

  React.useEffect(() => {
    if (prevRoleRef.current !== user.role) {
      changeTab(user.role === 'client' ? 'create' : 'home');
      prevRoleRef.current = user.role;
    }
  }, [user.role]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.producerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentProducerId =
    user.role === 'producer' ? user.producerId ?? 'current-user' : user.producerId ?? '';
  const producerProducts = React.useMemo(
    () => products.filter((product) => product.producerId === currentProducerId),
    [products, currentProducerId]
  );
  const producerOrders = React.useMemo(
    () => groupOrders.filter((order) => order.producerId === currentProducerId),
    [currentProducerId, groupOrders]
  );
  const sharerOrders = React.useMemo(
    () => groupOrders.filter((order) => order.sharerId === user.id),
    [groupOrders, user.id]
  );
  const profileOrders = React.useMemo(() => {
    const merged = new Map<string, GroupOrder>();
    const source = user.role === 'producer' ? [...producerOrders, ...sharerOrders] : sharerOrders;
    source.forEach((order) => {
      if (!merged.has(order.id)) {
        merged.set(order.id, order);
      }
    });
    return Array.from(merged.values());
  }, [producerOrders, sharerOrders, user.role]);
  const selectedOrder = React.useMemo(
    () => groupOrders.find((order) => order.id === activeOrderId) ?? null,
    [groupOrders, activeOrderId]
  );
  const publicOrderProducts = React.useMemo(() => {
    const seen = new Set<string>();
    const pool: Product[] = [];
    groupOrders
      .filter((order) => order.visibility === 'public' && order.status === 'open')
      .forEach((order) => {
        order.products.forEach((product) => {
          if (seen.has(product.id)) return;
          seen.add(product.id);
          pool.push(product);
        });
      });
    return pool;
  }, [groupOrders]);

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

  const handleUpdateOrderVisibility = (orderId: string, visibility: GroupOrder['visibility']) => {
    setGroupOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, visibility } : order))
    );
  };

  const handlePurchaseOrder = (orderId: string, total?: number) => {
    setGroupOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, participants: order.participants + 1, totalValue: order.totalValue + (total ?? 0) }
          : order
      )
    );
  };

  const handleCreateOrder = (orderData: any) => {
    const now = new Date();
    const firstProduct = orderData.products?.[0];
    const newOrder: GroupOrder = {
      id: `order-${Date.now()}`,
      title: orderData.title,
      sharerId: user.id,
      sharerName: user.name,
      products: orderData.products,
      producerId: firstProduct?.producerId ?? currentProducerId,
      producerName: firstProduct?.producerName ?? 'Producteur',
      sharerPercentage: orderData.sharerPercentage,
      minWeight: orderData.minWeight,
      maxWeight: orderData.maxWeight,
      deadline: orderData.deadline ?? now,
      pickupAddress: orderData.pickupAddress,
      pickupSlots: orderData.pickupSlots,
      message: orderData.message,
      status: 'open',
      visibility: orderData.visibility ?? 'public',
      totalValue: orderData.totals?.clientTotal ?? 0,
      participants: 1,
    };

    setGroupOrders((prev) => [newOrder, ...prev]);
    toast.success('Commande créée avec succès !');
    const usedProductIds = orderData.products.map((p: Product) => p.id);
    setDeck(deck.filter((card) => !usedProductIds.includes(card.id)));
    openOrderView(newOrder.id);
  };

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`,
    };
    setProducts([newProduct, ...products]);
    toast.success('Produit ajouté avec succès !');
    changeTab('home');
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
  const swipeProducts = publicOrderProducts;

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

  const renderDeckContent = () => {
    return (
      <MapView
        orders={groupOrders}
        deck={deck}
        onRemoveFromDeck={handleRemoveFromDeck}
        locationLabel={locationLabel}
        userRole={user.role}
      />
    );
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
    if (selectedOrder) {
      return (
        <OrderClientView
          order={selectedOrder}
          onClose={closeOrderView}
          onVisibilityChange={(visibility) => handleUpdateOrderVisibility(selectedOrder.id, visibility)}
          onPurchase={(payload) => handlePurchaseOrder(selectedOrder.id, payload?.total)}
          isOwner={selectedOrder.sharerId === user.id}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return renderProductGrid();
      case 'deck':
        return renderDeckContent();
      case 'create':
        return renderCreateContent();
      case 'messages':
        return <MessagesView />;
      case 'profile':
        return (
          <ProfileView
            user={user}
            producerProducts={producerProducts}
            deck={deck}
            orders={profileOrders}
            producerOrders={producerOrders}
            isOwnProfile
            onUpdateUser={handleUpdateUser}
            onRemoveFromDeck={handleRemoveFromDeck}
            onOpenOrder={openOrderView}
          />
        );
      default:
        return null;
    }
  };

  const getHomeHeading = () => {
    return {
      title: 'Produits',
      subtitle: `Decouvrez les produits autour de ${locationLabel}.`,
    };
  };
  const getPageTitle = () => {
    if (activeTab === 'deck') {
      if (user.role === 'producer') return 'Commandes en cours';
      return 'Carte';
    }
    if (activeTab === 'create') {
      if (user.role === 'client') return 'Decouvrir';
      if (user.role === 'producer') return 'Produit';
      return 'Nouvelle commande';
    }
    if (activeTab === 'messages') return 'Messages';
    if (activeTab === 'profile') return 'Mon Profil';
    return '';
  };

  const homeHeading = getHomeHeading();
  const pageTitle = getPageTitle();
  const isOrderView = Boolean(selectedOrder);

  return (
    <div className="min-h-screen bg-[#F9F2E4]">
      <Toaster position="top-center" richColors />
      <Header
        showSearch={activeTab === 'home' && !isOrderView}
        onSearch={setSearchQuery}
        onLogoClick={() => changeTab('home')}
      />

      <main className="max-w-screen-xl mx-auto px-4 pt-20 pb-24">
        {isOrderView ? (
          <div className="mb-6">
            <h1 className="text-[#1F2937]">Vue client</h1>
            <p className="text-[#6B7280]">Ajustez les quantites, partagez et changez la visibilite.</p>
          </div>
        ) : activeTab === 'home' ? (
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

      <Navigation activeTab={activeTab} onTabChange={changeTab} userRole={user.role} />
    </div>
  );
}


