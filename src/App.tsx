import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
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
import { AuthPage } from './components/AuthPage';
import { mockProducts, mockUser, mockGroupOrders } from './data/mockData';
import { Product, DeckCard, User, GroupOrder } from './types';
import { getSupabaseClient } from './lib/supabaseClient';
import { toast, Toaster } from 'sonner';

const tabRoutes = {
  home: '/',
  deck: '/carte',
  create: '/creer',
  messages: '/messages',
  profile: '/profil',
} as const;

const getTabFromPath = (pathname: string) => {
  if (pathname.startsWith('/carte')) return 'deck';
  if (pathname.startsWith('/creer')) return 'create';
  if (pathname.startsWith('/messages')) return 'messages';
  if (pathname.startsWith('/profil')) return 'profile';
  return 'home';
};

const NotFound = ({ message }: { message: string }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm text-center">
    <p className="text-sm text-[#6B7280]">{message}</p>
  </div>
);

const AuthWall = ({
  onLogin,
  onSignup,
  title = 'Connexion requise',
  description = 'Connectez-vous ou creez un compte pour continuer.',
}: {
  onLogin: () => void;
  onSignup: () => void;
  title?: string;
  description?: string;
}) => (
  <div className="bg-white border border-dashed border-[#FF6B4A]/40 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-4">
    <div className="flex flex-col items-center gap-3">
      <span className="px-3 py-1 rounded-full bg-[#FFF1E6] text-[#B45309] text-xs font-semibold">
        Acces limite
      </span>
      <h2 className="text-xl sm:text-2xl text-[#1F2937] font-semibold">{title}</h2>
      <p className="text-sm text-[#6B7280] max-w-xl">{description}</p>
    </div>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <button
        onClick={onLogin}
        className="px-4 py-2 rounded-lg bg-[#FF6B4A] text-white font-semibold shadow-sm hover:bg-[#FF5A39] transition-colors w-full sm:w-auto"
      >
        Se connecter
      </button>
      <button
        onClick={onSignup}
        className="px-4 py-2 rounded-lg border border-[#FF6B4A] text-[#FF6B4A] font-semibold hover:bg-[#FFF1E6] transition-colors w-full sm:w-auto"
      >
        Creer un compte
      </button>
    </div>
  </div>
);

const mapSupabaseUserToProfile = (authUser: SupabaseAuthUser): User => {
  const fallbackHandle = authUser.email?.split('@')[0] || authUser.id.slice(0, 6);
  const metaRole = authUser.user_metadata?.role as User['role'] | undefined;
  const allowedRoles: Array<User['role']> = ['producer', 'sharer', 'client'];
  const safeRole = allowedRoles.includes(metaRole as User['role']) ? metaRole! : 'sharer';
  return {
    id: authUser.id,
    name: authUser.user_metadata?.full_name || fallbackHandle || 'Profil',
    handle: authUser.user_metadata?.handle || fallbackHandle,
    role: safeRole,
    profileImage: authUser.user_metadata?.avatar_url,
    profileVisibility: authUser.user_metadata?.profileVisibility,
    addressVisibility: authUser.user_metadata?.addressVisibility,
    tagline: authUser.user_metadata?.tagline,
    website: authUser.user_metadata?.website,
    address: authUser.user_metadata?.address,
    verified: Boolean(authUser.user_metadata?.verified),
    businessStatus: authUser.user_metadata?.businessStatus,
    producerId: authUser.user_metadata?.producerId,
  };
};

const sanitizeHandle = (value?: string | null) => {
  const base = (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20);
  return base || 'profil';
};

type ProfileRow = {
  id: string;
  handle: string;
  name: string | null;
  role: string | null;
  profile_visibility: string | null;
  address_visibility: string | null;
  tagline: string | null;
  website: string | null;
  address: string | null;
  verified: boolean | null;
  business_status?: string | null;
  producer_id?: string | null;
  profile_image?: string | null;
};

const mapProfileRowToUser = (row: ProfileRow, authUser?: SupabaseAuthUser | null): User => {
  const metaRole = (row.role as User['role']) || (authUser?.user_metadata?.role as User['role']) || 'sharer';
  const allowedRoles: Array<User['role']> = ['producer', 'sharer', 'client'];
  const safeRole = allowedRoles.includes(metaRole as User['role']) ? metaRole : 'sharer';
  const fallbackName =
    authUser?.user_metadata?.full_name ||
    authUser?.email?.split('@')[0] ||
    row.handle ||
    'Profil';

  return {
    id: row.id,
    name: row.name || fallbackName,
    handle: row.handle || sanitizeHandle(fallbackName),
    role: safeRole,
    profileImage: row.profile_image ?? undefined,
    profileVisibility: (row.profile_visibility as User['profileVisibility']) ?? 'public',
    addressVisibility: (row.address_visibility as User['addressVisibility']) ?? 'private',
    tagline: row.tagline ?? undefined,
    website: row.website ?? undefined,
    address: row.address ?? undefined,
    verified: Boolean(row.verified),
    businessStatus: row.business_status ?? undefined,
    producerId: row.producer_id ?? undefined,
  };
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const supabaseClient = React.useMemo<SupabaseClient | null>(() => {
    try {
      return getSupabaseClient();
    } catch (error) {
      console.warn('Supabase non configure:', error);
      return null;
    }
  }, []);
  const [user, setUser] = React.useState<User | null>(null);
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [groupOrders, setGroupOrders] = React.useState<GroupOrder[]>(mockGroupOrders);
  const [deck, setDeck] = React.useState<DeckCard[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [profileMode, setProfileMode] = React.useState<'view' | 'edit'>('view');
  const prevRoleRef = React.useRef<User['role'] | null>(null);
  const lastTabRef = React.useRef<string | null>(null);

  const orderIdFromPath = React.useMemo(() => {
    const match = location.pathname.match(/^\/commande\/([^/]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);
  const productIdFromPath = React.useMemo(() => {
    const match = location.pathname.match(/^\/produit\/([^/]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  const ensureProfile = React.useCallback(
    async (authUser: SupabaseAuthUser): Promise<User> => {
      if (!supabaseClient) {
        return mapSupabaseUserToProfile(authUser);
      }

      const fetchExisting = async () => {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        if (error) {
          console.warn('profiles fetch error', error);
          return null;
        }
        return data as ProfileRow | null;
      };

      const existing = await fetchExisting();
      if (existing) {
        return mapProfileRowToUser(existing, authUser);
      }

      const baseHandle = sanitizeHandle(authUser.email || authUser.id);
      let attempt = 0;
      let handle = baseHandle;
      while (attempt < 3) {
        const { data, error } = await supabaseClient
          .from('profiles')
          .insert({
            id: authUser.id,
            handle,
            name: authUser.user_metadata?.full_name || authUser.email || handle,
            role: authUser.user_metadata?.role || 'sharer',
            profile_visibility: 'public',
            address_visibility: 'private',
            producer_id: authUser.user_metadata?.producerId,
            profile_image: authUser.user_metadata?.avatar_url,
          })
          .select()
          .maybeSingle();

        if (!error && data) {
          return mapProfileRowToUser(data as ProfileRow, authUser);
        }
        if (error && (error as any).code === '23505') {
          attempt += 1;
          handle = `${baseHandle}${Math.floor(Math.random() * 1000)}`;
          continue;
        }
        console.warn('profiles insert error', error);
        break;
      }

      // Fallback to metadata mapping if insertion failed
      return mapSupabaseUserToProfile(authUser);
    },
    [supabaseClient]
  );

  const fetchProfileByHandle = React.useCallback(
    async (handle: string): Promise<User | null> => {
      if (!supabaseClient) return null;
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('handle', handle.toLowerCase())
        .maybeSingle();
      if (error) {
        console.warn('profiles fetch by handle error', error);
        return null;
      }
      if (!data) return null;
      return mapProfileRowToUser(data as ProfileRow, null);
    },
    [supabaseClient]
  );

  React.useEffect(() => {
    if (!supabaseClient) {
      return;
    }

    supabaseClient.auth
      .getSession()
      .then(({ data }) => {
        if (data.session?.user) {
          ensureProfile(data.session.user)
            .then((profile) => {
              setUser(profile);
              prevRoleRef.current = profile.role;
            })
            .catch(() => {
              setUser(mapSupabaseUserToProfile(data.session!.user));
              prevRoleRef.current = (data.session!.user.user_metadata?.role as User['role']) ?? null;
            });
        }
      })
      .catch(() => null);

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        ensureProfile(session.user)
          .then((profile) => {
            setUser(profile);
            prevRoleRef.current = profile.role;
          })
          .catch(() => {
            setUser(mapSupabaseUserToProfile(session.user));
            prevRoleRef.current = (session.user.user_metadata?.role as User['role']) ?? null;
          });
      } else {
        setUser(null);
        setDeck([]);
        prevRoleRef.current = null;
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, [ensureProfile, supabaseClient]);

  const viewer = user ?? mockUser;
  const isAuthenticated = Boolean(user);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const matchesSearch = React.useCallback(
    (product: Product) => {
      if (!normalizedSearch) return true;
      return (
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch) ||
        product.producerName.toLowerCase().includes(normalizedSearch)
      );
    },
    [normalizedSearch]
  );

  const filteredProducts = React.useMemo(
    () => (normalizedSearch ? products.filter(matchesSearch) : products),
    [matchesSearch, normalizedSearch, products]
  );

  const filteredMapOrders = React.useMemo(() => {
    if (!normalizedSearch) return groupOrders;

    return groupOrders
      .map((order) => {
        const matchingProducts = order.products.filter(matchesSearch);
        if (!matchingProducts.length) return null;
        return { ...order, products: matchingProducts };
      })
      .filter((order): order is GroupOrder => Boolean(order));
  }, [groupOrders, matchesSearch, normalizedSearch]);

  const currentProducerId =
    viewer.role === 'producer' ? viewer.producerId ?? 'current-user' : viewer.producerId ?? '';
  const producerProducts = React.useMemo(
    () => products.filter((product) => product.producerId === currentProducerId),
    [products, currentProducerId]
  );
  const producerOrders = React.useMemo(
    () => groupOrders.filter((order) => order.producerId === currentProducerId),
    [currentProducerId, groupOrders]
  );
  const sharerOrders = React.useMemo(
    () => groupOrders.filter((order) => order.sharerId === viewer.id),
    [groupOrders, viewer.id]
  );
  const profileOrders = React.useMemo(() => {
    const merged = new Map<string, GroupOrder>();
    const source = viewer.role === 'producer' ? [...producerOrders, ...sharerOrders] : sharerOrders;
    source.forEach((order) => {
      if (!merged.has(order.id)) {
        merged.set(order.id, order);
      }
    });
    return Array.from(merged.values());
  }, [producerOrders, sharerOrders, viewer.role]);
  const selectedOrder = React.useMemo(
    () => (orderIdFromPath ? groupOrders.find((order) => order.id === orderIdFromPath) ?? null : null),
    [groupOrders, orderIdFromPath]
  );
  const selectedProduct = React.useMemo(
    () =>
      productIdFromPath ? products.find((product) => product.id === productIdFromPath) ?? null : null,
    [productIdFromPath, products]
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

  const activeTab = React.useMemo(() => getTabFromPath(location.pathname), [location.pathname]);

  const redirectToAuth = (path?: string, mode: 'login' | 'signup' = 'login') => {
    const target = path ?? location.pathname;
    navigate('/connexion', { state: { redirectTo: target, mode } });
  };

  const changeTab = (tab: string) => {
    lastTabRef.current = null;
    const target = tabRoutes[tab as keyof typeof tabRoutes] ?? tabRoutes.home;
    const needsAuth = tab === 'deck' || tab === 'create' || tab === 'messages';
    if (needsAuth && !isAuthenticated) {
      redirectToAuth(target);
      return;
    }
    if (tab !== 'profile') {
      setProfileMode('view');
    }
    navigate(target);
  };

  const openOrderView = (orderId: string) => {
    if (!isAuthenticated) {
      redirectToAuth(`/commande/${orderId}`);
      return;
    }
    if (!lastTabRef.current) {
      lastTabRef.current = location.pathname;
    }
    navigate(`/commande/${orderId}`);
  };

  const closeOrderView = () => {
    const fallback =
      lastTabRef.current ?? (viewer.role === 'client' ? tabRoutes.create : tabRoutes.home);
    lastTabRef.current = null;
    navigate(fallback);
  };

  React.useEffect(() => {
    if (!user) return;
    if (prevRoleRef.current === null) {
      prevRoleRef.current = user.role;
      return;
    }
    if (prevRoleRef.current !== user.role) {
      const target = user.role === 'client' ? tabRoutes.create : tabRoutes.home;
      navigate(target, { replace: true });
      prevRoleRef.current = user.role;
    }
  }, [user, navigate]);

  React.useEffect(() => {
    if (location.pathname === '/' && user?.role === 'client') {
      navigate(tabRoutes.create, { replace: true });
    }
  }, [location.pathname, navigate, user]);

  const handleAddToDeck = (product: Product) => {
    if (!isAuthenticated) {
      toast.info('Connectez-vous pour sauvegarder des produits.');
      redirectToAuth(location.pathname);
      return;
    }
    if (deck.find((card) => card.id === product.id)) {
      toast.info('Ce produit est deja dans votre selection');
      return;
    }

    const newCard: DeckCard = {
      ...product,
      addedAt: new Date(),
    };
    setDeck([...deck, newCard]);
    toast.success(`${product.name} ajoute a votre selection !`);
  };

  const handleRemoveFromDeck = (productId: string) => {
    if (!isAuthenticated) {
      redirectToAuth(location.pathname);
      return;
    }
    setDeck(deck.filter((card) => card.id !== productId));
    toast.success('Produit retire de votre selection');
  };

  const handleUpdateOrderVisibility = (orderId: string, visibility: GroupOrder['visibility']) => {
    if (!isAuthenticated) {
      redirectToAuth(location.pathname);
      return;
    }
    setGroupOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, visibility } : order))
    );
  };

  const handlePurchaseOrder = (orderId: string, total?: number) => {
    if (!isAuthenticated) {
      redirectToAuth(location.pathname);
      return;
    }
    setGroupOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, participants: order.participants + 1, totalValue: order.totalValue + (total ?? 0) }
          : order
      )
    );
  };

  const handleCreateOrder = (orderData: any) => {
    if (!user) {
      toast.info('Connectez-vous pour publier une commande.');
      redirectToAuth(tabRoutes.create);
      return;
    }
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
    toast.success('Commande cree avec succes !');
    const usedProductIds = orderData.products.map((p: Product) => p.id);
    setDeck(deck.filter((card) => !usedProductIds.includes(card.id)));
    openOrderView(newOrder.id);
  };

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    if (!user) {
      toast.info('Connectez-vous pour ajouter un produit.');
      redirectToAuth(tabRoutes.create);
      return;
    }
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`,
    };
    setProducts([newProduct, ...products]);
    toast.success('Produit ajoute avec succes !');
    changeTab('home');
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!user) {
      redirectToAuth(tabRoutes.profile);
      return;
    }

    if (!supabaseClient) {
      const updatedUser = { ...user, ...userData };
      if (userData.role === 'producer') {
        updatedUser.producerId = updatedUser.producerId ?? 'current-user';
      }
      setUser(updatedUser);
      toast.success('Profil mis a jour localement (Supabase non configure)');
      return;
    }

    const payload = {
      name: userData.name ?? user.name,
      handle: userData.handle ?? user.handle,
      role: userData.role ?? user.role,
      tagline: userData.tagline ?? user.tagline,
      website: userData.website ?? user.website,
      address: userData.address ?? user.address,
      profile_visibility: userData.profileVisibility ?? user.profileVisibility ?? 'public',
      address_visibility: userData.addressVisibility ?? user.addressVisibility ?? 'private',
      producer_id: userData.producerId ?? user.producerId,
    };

    const { data, error } = await supabaseClient
      .from('profiles')
      .update(payload)
      .eq('id', user.id)
      .select()
      .maybeSingle();

    if (error) {
      toast.error('Mise a jour du profil impossible.');
      return;
    }

    if (data) {
      const mapped = mapProfileRowToUser(data as ProfileRow, null);
      setUser(mapped);
      prevRoleRef.current = mapped.role;
      toast.success('Profil mis a jour !');
    }
  };

  const handleEditProfile = () => {
    if (!isAuthenticated) {
      redirectToAuth(tabRoutes.profile);
      return;
    }
    changeTab('profile');
    setProfileMode('edit');
  };

  const handleShareProfile = () => {
    if (!user) {
      redirectToAuth(tabRoutes.profile);
      return;
    }
    const profileHandle = user.handle ?? user.name.toLowerCase().replace(/\s+/g, '');
    const shareUrl = `${window.location.origin}/profil/${profileHandle}`;
    navigator.clipboard?.writeText(shareUrl).catch(() => null);
    toast.success('Lien du profil copie !');
  };

  const handleLogout = async () => {
    try {
      if (supabaseClient) {
        await supabaseClient.auth.signOut();
      }
    } catch (error) {
      toast.error('Impossible de se deconnecter pour le moment.');
    }
    setUser(null);
    setDeck([]);
    prevRoleRef.current = null;
    toast.success('Deconnexion reussie.');
    navigate(tabRoutes.home);
  };

  const handleAuthSuccess = (authUser: SupabaseAuthUser) => {
    ensureProfile(authUser)
      .then((profile) => {
        setUser(profile);
        prevRoleRef.current = profile.role;
      })
      .catch(() => {
        const fallback = mapSupabaseUserToProfile(authUser);
        setUser(fallback);
        prevRoleRef.current = fallback.role;
      });
    setDeck([]);
    setProfileMode('view');
  };

  const handleDemoLogin = () => {
    setUser(mockUser);
    setDeck([]);
    setProfileMode('view');
    prevRoleRef.current = mockUser.role;
    toast.success('Connecte en mode demo');
  };

  const locationLabel = viewer.address?.split(',')[0] ?? 'votre quartier';
  const canSaveProduct = isAuthenticated && viewer.role !== 'producer';
  const swipeProducts = publicOrderProducts;
  const renderProductGrid = () => {
    if (filteredProducts.length === 0) {
      return <NotFound message="Aucun produit ne correspond a votre recherche." />;
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
        orders={filteredMapOrders}
        deck={deck}
        onRemoveFromDeck={handleRemoveFromDeck}
        locationLabel={locationLabel}
        userRole={viewer.role}
      />
    );
  };

  const renderCreateContent = () => {
    if (viewer.role === 'producer') {
      return <AddProductForm onAddProduct={handleAddProduct} />;
    }
    if (viewer.role === 'client') {
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

  const getHomeHeading = () => {
    return {
      title: 'Produits',
      subtitle: `Decouvrez les produits autour de ${locationLabel}.`,
    };
  };
  const getPageTitle = () => {
    if (activeTab === 'deck') {
      if (viewer.role === 'producer') return 'Commandes en cours';
      return 'Carte';
    }
    if (activeTab === 'create') {
      if (viewer.role === 'client') return 'Decouvrir';
      if (viewer.role === 'producer') return 'Produit';
      return 'Nouvelle commande';
    }
    if (activeTab === 'messages') return 'Messages';
    if (activeTab === 'profile') return 'Mon Profil';
    if (location.pathname.startsWith('/produit/')) return selectedProduct?.name ?? 'Produit';
    if (location.pathname.startsWith('/commande/')) return 'Commande';
    return '';
  };

  const homeHeading = getHomeHeading();
  const pageTitle = getPageTitle();
  const isOrderView = Boolean(selectedOrder && location.pathname.startsWith('/commande/'));
  const isProductView = Boolean(selectedProduct && location.pathname.startsWith('/produit/'));
  const isAuthPage = location.pathname.startsWith('/connexion');
  const mainPadding = isAuthPage ? 'pt-0 pb-0' : isOrderView ? 'pt-24 pb-24' : 'pt-20 pb-24';
  const mainPaddingBottom = isAuthPage ? '0' : isOrderView ? '12rem' : '10rem';
  const profileHeaderActions =
    activeTab === 'profile' && !isOrderView && isAuthenticated ? (
      <div className="flex items-center gap-2">
        <button
          onClick={handleEditProfile}
          className="px-3 py-2 rounded-full bg-[#FF6B4A] text-white text-sm font-semibold shadow-sm hover:bg-[#FF5A39] transition-colors"
        >
          Modifier le profil
        </button>
        <button
          onClick={handleShareProfile}
          className="px-3 py-2 rounded-full bg-white border border-[#FF6B4A] text-[#FF6B4A] text-sm font-semibold hover:bg-[#FFF1E6] transition-colors"
        >
          Partager
        </button>
      </div>
    ) : null;

  const authButton = isAuthenticated ? (
    <button
      onClick={handleLogout}
      className="px-3 py-2 rounded-full border border-gray-200 bg-white text-[#1F2937] text-sm font-semibold hover:border-[#FF6B4A] transition-colors"
    >
      Se deconnecter
    </button>
  ) : (
    <button
      onClick={() => redirectToAuth(location.pathname)}
      className="px-3 py-2 rounded-full bg-[#FF6B4A] text-white text-sm font-semibold shadow-sm hover:bg-[#FF5A39] transition-colors"
    >
      Se connecter
    </button>
  );

  const headerActions = (
    <>
      {profileHeaderActions}
      {authButton}
    </>
  );

  const renderProtected = (factory: () => React.ReactNode, redirectPath: string) => {
    if (isAuthenticated) return factory();
    return (
      <AuthWall
        onLogin={() => redirectToAuth(redirectPath, 'login')}
        onSignup={() => redirectToAuth(redirectPath, 'signup')}
        description="Connectez-vous ou creez un compte pour acceder a cette page."
      />
    );
  };

  const ProfileRoute = ({ isOwn }: { isOwn?: boolean }) => {
    const params = useParams<{ handle?: string }>();
    const [fetchedProfile, setFetchedProfile] = React.useState<User | null>(null);
    const [loadingProfile, setLoadingProfile] = React.useState(false);

    const profileHandle = user?.handle ?? viewer.handle ?? viewer.name.toLowerCase().replace(/\s+/g, '');
    const resolvedIsOwn =
      Boolean(user) &&
      (typeof isOwn === 'boolean' ? isOwn : !params.handle || params.handle === profileHandle);

    React.useEffect(() => {
      let active = true;
      if (resolvedIsOwn) {
        setFetchedProfile(user ?? null);
        return () => {
          active = false;
        };
      }

      const handleParam = params.handle;
      if (!handleParam) {
        setFetchedProfile(null);
        return () => {
          active = false;
        };
      }

      setLoadingProfile(true);
      fetchProfileByHandle(handleParam)
        .then((profile) => {
          if (!active) return;
          setFetchedProfile(profile);
        })
        .finally(() => {
          if (active) setLoadingProfile(false);
        });

      return () => {
        active = false;
      };
    }, [fetchProfileByHandle, params.handle, resolvedIsOwn, user, viewer.handle, viewer.name]);

    if (!resolvedIsOwn && !loadingProfile && !fetchedProfile) {
      return <NotFound message="Profil introuvable." />;
    }

    const profileUser: User = resolvedIsOwn
      ? (user as User)
      : fetchedProfile || {
          ...viewer,
          handle: params.handle ?? viewer.handle,
          profileVisibility: 'public',
          addressVisibility: 'private',
        };

    const profileDeck = resolvedIsOwn ? deck : [];
    const profileOrdersForView = resolvedIsOwn
      ? profileOrders
      : profileOrders.filter((order) => order.visibility === 'public');

    return (
      <ProfileView
        user={profileUser}
        producerProducts={producerProducts}
        deck={profileDeck}
        orders={profileOrdersForView}
        producerOrders={producerOrders}
        isOwnProfile={resolvedIsOwn}
        mode={resolvedIsOwn ? profileMode : 'view'}
        onModeChange={resolvedIsOwn ? setProfileMode : undefined}
        onShareProfile={resolvedIsOwn ? handleShareProfile : undefined}
        onUpdateUser={resolvedIsOwn ? handleUpdateUser : () => {}}
        onRemoveFromDeck={resolvedIsOwn ? handleRemoveFromDeck : () => {}}
        onOpenOrder={resolvedIsOwn ? openOrderView : undefined}
      />
    );
  };

  const ProductRoute = () => {
    const params = useParams<{ id: string }>();
    const product = products.find((p) => p.id === params.id);
    if (!product) return <NotFound message="Produit introuvable." />;
    const inDeck = deck.some((card) => card.id === product.id);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <img src={product.imageUrl} alt={product.name} className="w-full h-80 object-cover" />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-2xl text-[#1F2937] font-semibold mb-1">{product.name}</h2>
            <p className="text-[#6B7280]">{product.producerName}</p>
          </div>
          <p className="text-[#374151]">{product.description}</p>
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold text-[#FF6B4A]">
              {product.price.toFixed(2)} EUR
            </span>
            <span className="text-sm text-[#6B7280]">/ {product.unit}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-[#FFF1E6] text-[#FF6B4A]">
              {product.category}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              {product.producerLocation}
            </span>
          </div>
          {canSaveProduct && (
            <button
              onClick={() => (inDeck ? handleRemoveFromDeck(product.id) : handleAddToDeck(product))}
              className="px-4 py-2 rounded-lg bg-[#FF6B4A] text-white text-sm font-semibold shadow-sm hover:bg-[#FF5A39] transition-colors"
            >
              {inDeck ? 'Retirer de ma selection' : 'Ajouter a ma selection'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const OrderRoute = () => {
    const params = useParams<{ id: string }>();
    const order = groupOrders.find((o) => o.id === params.id);
    if (!order) return <NotFound message="Commande introuvable." />;

    return (
      <OrderClientView
        order={order}
        onClose={closeOrderView}
        onVisibilityChange={(visibility) => handleUpdateOrderVisibility(order.id, visibility)}
        onPurchase={(payload) => handlePurchaseOrder(order.id, payload?.total)}
        isOwner={Boolean(user && order.sharerId === user.id)}
      />
    );
  };

  const showSearch = (activeTab === 'home' || activeTab === 'deck') && !isOrderView && !isAuthPage;

  return (
    <div className="min-h-screen bg-[#F9F2E4] overflow-x-hidden">
      <Toaster position="top-center" richColors />
      {!isAuthPage && (
        <Header
          showSearch={showSearch}
          onSearch={setSearchQuery}
          onLogoClick={() => changeTab('home')}
          actions={headerActions}
        />
      )}

      <main
        className={`max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 ${mainPadding}`}
        style={{ paddingBottom: mainPaddingBottom }}
      >
        {!isAuthPage &&
          (isOrderView ? (
            <div className="mb-6">
              <h1 className="text-[#1F2937]">Vue client</h1>
              <p className="text-[#6B7280]">Ajustez les quantites, partagez et changez la visibilite.</p>
            </div>
          ) : isProductView && selectedProduct ? (
            <div className="mb-6">
              <h1 className="text-[#1F2937]">{selectedProduct.name}</h1>
              <p className="text-[#6B7280]">{selectedProduct.producerName}</p>
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
          ))}

        <Routes>
          <Route path="/" element={renderProductGrid()} />
          <Route
            path="/connexion"
            element={
              isAuthenticated ? (
                <Navigate to={tabRoutes.home} replace />
              ) : (
                <AuthPage
                  supabaseClient={supabaseClient}
                  onAuthSuccess={handleAuthSuccess}
                  onDemoLogin={handleDemoLogin}
                />
              )
            }
          />
          <Route path="/carte" element={renderProtected(renderDeckContent, tabRoutes.deck)} />
          <Route path="/creer" element={renderProtected(renderCreateContent, tabRoutes.create)} />
          <Route path="/messages" element={renderProtected(() => <MessagesView />, tabRoutes.messages)} />
          <Route path="/profil" element={<ProfileRoute isOwn />} />
          <Route path="/profil/:handle" element={<ProfileRoute />} />
          <Route path="/produit/:id" element={<ProductRoute />} />
          <Route
            path="/commande/:id"
            element={
              isAuthenticated ? (
                <OrderRoute />
              ) : (
                <AuthWall
                  onLogin={() => redirectToAuth(location.pathname, 'login')}
                  onSignup={() => redirectToAuth(location.pathname, 'signup')}
                  description="Connectez-vous pour consulter les details de cette commande."
                />
              )
            }
          />
          <Route path="*" element={<Navigate to={tabRoutes.home} replace />} />
        </Routes>
      </main>

      {!isAuthPage && (
        <Navigation activeTab={activeTab} onTabChange={changeTab} userRole={viewer.role} />
      )}
    </div>
  );
}
