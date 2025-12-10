import React from 'react';
import {
  MapPin,
  Shield,
  Grid,
  Bookmark,
  ShoppingBag,
  X,
  Check,
  Sparkles,
  Globe,
  Lock,
  Link2,
  Upload,
  Phone,
  Building2,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { DeckCard, GroupOrder, Product, User } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

type TabKey = 'products' | 'orders' | 'selection';

const statusLabels: Record<GroupOrder['status'], string> = {
  open: 'Ouverte',
  closed: 'Fermée',
  completed: 'Terminée',
};

const DEFAULT_PROFILE_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="80" fill="#E5E7EB" />
      <circle cx="80" cy="64" r="30" fill="#9CA3AF" />
      <ellipse cx="80" cy="118" rx="42" ry="32" fill="#6B7280" />
    </svg>`
  );

const stripDistance = (value?: string) => {
  if (!value) return '';
  return value.replace(/\s*[-\u2013]?\s*\d+(?:[.,]\d+)?\s*km/gi, '').replace(/\s*[-\u2013]\s*$/, '').trim();
};

interface ProfileViewProps {
  user: User;
  producerProducts: Product[];
  deck: DeckCard[];
  orders: GroupOrder[];
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  onMessageUser?: () => void;
  mode?: 'view' | 'edit';
  onModeChange?: (mode: 'view' | 'edit') => void;
  onShareProfile?: () => void;
  onUpdateUser: (user: Partial<User>) => void;
  onRemoveFromDeck: (productId: string) => void;
  onAddToDeck?: (product: Product) => void;
  selectionIds?: Set<string>;
  onOpenOrder?: (orderId: string) => void;
  onStartOrderFromProduct?: (product: Product) => void;
  onAddProductClick?: () => void;
  onOpenProduct?: (productId: string) => void;
}

export function ProfileView({
  user,
  producerProducts,
  deck,
  orders,
  isOwnProfile = true,
  isFollowing,
  onToggleFollow,
  onMessageUser,
  mode: modeProp,
  onModeChange,
  onShareProfile,
  onUpdateUser,
  onRemoveFromDeck,
  onAddToDeck,
  selectionIds,
  onOpenOrder,
  onStartOrderFromProduct,
  onAddProductClick,
  onOpenProduct,
}: ProfileViewProps) {
  const [internalMode, setInternalMode] = React.useState<'view' | 'edit'>('view');
  const mode = modeProp ?? internalMode;
  const setMode = onModeChange ?? setInternalMode;
  const [activeTab, setActiveTab] = React.useState<TabKey>('orders');
  const profileHandle = user.handle ?? user.name.toLowerCase().replace(/\s+/g, '');
  const profileVisibility = user.profileVisibility ?? 'public';
  const addressVisibility = user.addressVisibility ?? 'public';
  const isProfilePublic = profileVisibility === 'public';
  const canShowAddress = isOwnProfile || addressVisibility === 'public';
  const addressLabel = canShowAddress ? user.address || 'Adresse non renseignée' : 'Adresse masquée';
  const profileTagline = user.tagline ?? '';
  const accountTypeLabel =
    user.accountType === 'company'
      ? 'Entreprise'
      : user.accountType === 'association'
      ? 'Association'
      : user.accountType === 'public_institution'
      ? 'Collectivité / service public'
      : 'Particulier';
  const following = Boolean(isFollowing);
  const profileImageSrc = user.profileImage?.trim() || DEFAULT_PROFILE_AVATAR;

  const handleFollowClick = React.useCallback(() => {
    if (!onToggleFollow) {
      toast.info('Fonction de suivi bientôt disponible.');
      return;
    }
    onToggleFollow();
  }, [onToggleFollow]);

  const handleMessageClick = React.useCallback(() => {
    if (onMessageUser) {
      onMessageUser();
    } else {
      toast.info('La messagerie arrive bientôt.');
    }
  }, [onMessageUser]);

  const orderCards = React.useMemo(() => {
    const mergedMap = new Map<string, GroupOrder>();
    const visible = isOwnProfile ? orders : orders.filter((order) => order.visibility === 'public');
    visible.forEach((order) => {
      if (!mergedMap.has(order.id)) mergedMap.set(order.id, order);
    });

    return Array.from(mergedMap.values()).map((order) => {
      const deadlineDate = order.deadline instanceof Date ? order.deadline : new Date(order.deadline);
      const cover = order.products[0]?.imageUrl ?? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
      const subtitle = order.products[0]?.producerName || order.producerName || order.sharerName;
      return {
        order,
        key: order.id,
        title: order.title,
        subtitle,
        imageUrl: cover,
        badge: order.visibility === 'private' ? 'Privé' : 'Public',
        price: `${order.participants} participant${order.participants > 1 ? 's' : ''}`,
        meta: `Clôture ${deadlineDate.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
        })}`,
        status: statusLabels[order.status],
      };
    });
  }, [orders, isOwnProfile]);

  const tabOptions = React.useMemo(
    () =>
      [
        { id: 'products' as TabKey, label: 'Produits', icon: Grid, visible: user.role === 'producer' },
        {
          id: 'orders' as TabKey,
          label: 'Commandes',
          icon: ShoppingBag,
          visible: true,
        },
        {
          id: 'selection' as TabKey,
          label: 'Sélection',
          icon: Bookmark,
          visible: true,
        },
      ].filter((tab) => tab.visible),
    [user.role]
  );

  React.useEffect(() => {
    const firstVisible = tabOptions[0]?.id;
    if (!tabOptions.find((tab) => tab.id === activeTab) && firstVisible) {
      setActiveTab(firstVisible);
    }
  }, [tabOptions, activeTab]);

  if (mode === 'edit') {
    return (
      <ProfileEditPanel
        user={user}
        onUpdateUser={onUpdateUser}
        onClose={() => setMode('view')}
      />
    );
  }

  const tabCounts: Record<TabKey, { value: number; meta: string }> = {
    products: { value: producerProducts.length, meta: '' },
    orders: { value: orderCards.length, meta: '' },
    selection: { value: deck.length, meta: '' },
  };
  const tabStats = tabOptions.map((tab) => ({
    ...tab,
    value: tabCounts[tab.id]?.value ?? 0,
    meta: tabCounts[tab.id]?.meta ?? tab.label,
  }));
  const selectionSet = React.useMemo(() => selectionIds ?? new Set(deck.map((card) => card.id)), [deck, selectionIds]);
  const handleToggleSelection = React.useCallback(
    (product: Product) => {
      if (selectionSet.has(product.id)) {
        onRemoveFromDeck(product.id);
        return;
      }
      if (onAddToDeck) {
        onAddToDeck(product);
      }
    },
    [onAddToDeck, onRemoveFromDeck, selectionSet]
  );
  const showAddProductCta = isOwnProfile && user.role === 'producer' && Boolean(onAddProductClick);

  const renderTabContent = () => {
    if (activeTab === 'products') {
      const addButton = showAddProductCta ? (
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={onAddProductClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6B4A] text-white text-sm font-semibold hover:bg-[#FF5A39] transition-colors"
          >
            Ajouter un produit
          </button>
        </div>
      ) : null;

      return producerProducts.length ? (
        <div className="space-y-4">
          {addButton}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {producerProducts.map((product) => (
              <ProductTile
                key={product.id}
                product={product}
                title={product.name}
                producerName={product.producerName}
                location={stripDistance(product.producerLocation)}
                imageUrl={product.imageUrl}
                price={product.price}
                badge="Produit"
                unit={product.unit}
                measurement={product.measurement}
                inStock={product.inStock}
                inSelection={selectionSet.has(product.id)}
                onToggleSelection={handleToggleSelection}
                onClick={onOpenProduct ? () => onOpenProduct(product.id) : undefined}
                onCreateOrder={onStartOrderFromProduct ? () => onStartOrderFromProduct(product) : undefined}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {addButton}
          <EmptyState
            title="Aucun produit"
            subtitle="Ajoutez un produit pour afficher votre vitrine."
          />
        </div>
      );
    }

    if (activeTab === 'orders') {
      return orderCards.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {orderCards.map((item) => (
            <ProductTile
              key={item.key}
              title={item.title}
              producerName={item.subtitle}
              location={stripDistance(item.subtitle)}
              imageUrl={item.imageUrl}
              price={item.price}
              badge={item.badge}
              meta={`${item.status} - ${item.meta}`}
              onClick={onOpenOrder ? () => onOpenOrder(item.order.id) : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Aucune commande"
          subtitle="Vos commandes passées et actives apparaîtront ici."
        />
      );
    }

    if (activeTab === 'selection') {
      const addButton = showAddProductCta ? (
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={onAddProductClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6B4A] text-white text-sm font-semibold hover:bg-[#FF5A39] transition-colors"
          >
            Ajouter un produit
          </button>
        </div>
      ) : null;

      return deck.length ? (
        <div className="space-y-4">
          {addButton}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {deck.map((card) => (
              <ProductTile
                key={card.id}
                product={card}
                title={card.name}
                producerName={card.producerName}
                location={stripDistance(card.producerLocation)}
                imageUrl={card.imageUrl}
                price={card.price}
                badge="Selection"
                unit={card.unit}
                measurement={card.measurement}
                inStock={card.inStock}
                inSelection={selectionSet.has(card.id)}
                meta={stripDistance(card.producerLocation)}
                onToggleSelection={handleToggleSelection}
                onRemove={isOwnProfile ? () => onRemoveFromDeck(card.id) : undefined}
                onClick={onOpenProduct ? () => onOpenProduct(card.id) : undefined}
                onCreateOrder={onStartOrderFromProduct ? () => onStartOrderFromProduct(card) : undefined}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {addButton}
          <EmptyState
            title="Aucune sélection"
            subtitle="Sauvegardez un produit depuis les produits ou le swipe pour le retrouver ici."
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8 md:space-y-10 pb-24">
      <div className="bg-white text-[#1F2937] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 relative space-y-6">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 rounded-full ring-4 ring-[#FFE8D7] shadow-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#FF6B4A] to-[#FFD166]">
              <ImageWithFallback
                src={profileImageSrc}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                {user.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E6F6F0] border border-[#C8EBDD] text-xs text-[#0F5132]">
                    <Check className="w-3 h-3" />
                    Vérifié
                  </span>
                )}
              </div>
              <p className="text-sm text-[#6B7280]">@{profileHandle}</p>
              {profileTagline && <p className="text-sm text-[#374151]">{profileTagline}</p>}
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <MapPin className="w-4 h-4" />
                <span>{addressLabel}</span>
                {!canShowAddress && <Lock className="w-4 h-4 text-[#9CA3AF]" />}
              </div>
              {(user.city || user.postcode) && (
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Building2 className="w-4 h-4" />
                  <span>{[user.postcode, user.city].filter(Boolean).join(' ')}</span>
                </div>
              )}
              {user.phonePublic && (
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Phone className="w-4 h-4" />
                  <span>{user.phonePublic}</span>
                </div>
              )}
              {(user.website || isOwnProfile) && (
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Link2 className="w-4 h-4" />
                  {user.website ? (
                    <a href={user.website} className="text-[#FF6B4A] hover:underline" target="_blank" rel="noreferrer">
                      {user.website}
                    </a>
                  ) : (
                    <span>Ajoutez votre site web</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FFF1E6] border border-[#FFE0D1] text-xs text-[#B45309]">
                  {user.role === 'producer' ? 'Producteur' : user.role === 'sharer' ? 'Partageur' : 'Participant'}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#E0F2FE] border border-[#BFDBFE] text-xs text-[#1D4ED8]">
                  {accountTypeLabel}
                </span>
                <span
                  className={`px-3 py-1 rounded-full border text-xs ${
                    isProfilePublic
                      ? 'bg-[#F3F4F6] border-[#E5E7EB] text-[#374151]'
                      : 'bg-[#FFF6F2] border-[#FFE0D1] text-[#B45309]'
                  }`}
                >
                  {isProfilePublic ? 'Profil public' : 'Profil privé'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full border text-xs ${
                    addressVisibility === 'public'
                      ? 'bg-[#E6F6F0] border-[#C8EBDD] text-[#0F5132]'
                      : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#374151]'
                  }`}
                >
                  {addressVisibility === 'public' ? 'Adresse visible' : 'Adresse masquée'}
                </span>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex items-center gap-3 sm:ml-auto">
              <button
                type="button"
                onClick={handleFollowClick}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  following
                    ? 'bg-[#E6F6F0] border-[#C8EBDD] text-[#0F5132]'
                    : 'bg-[#FF6B4A] border-[#FF6B4A] text-white shadow-sm hover:bg-[#FF5A39]'
                }`}
                aria-pressed={following}
              >
                {following ? 'Suivi' : 'Suivre'}
              </button>
              <button
                type="button"
                onClick={handleMessageClick}
                className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 text-[#1F2937] bg-white hover:border-[#FF6B4A] hover:text-[#FF6B4A] transition-colors"
              >
                Message
              </button>
            </div>
          )}

        </div>

        {(user.freshProductsCertified || user.socialLinks || user.openingHours) && (
          <div className="flex flex-col gap-2 text-sm text-[#374151]">
            {user.freshProductsCertified && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F6F0] border border-[#C8EBDD] text-[#0F5132] w-fit">
                <Shield className="w-4 h-4" /> Accreditations produits frais
              </span>
            )}
            {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase text-[#6B7280]">Réseaux :</span>
                {Object.entries(user.socialLinks)
                  .filter(([, v]) => Boolean(v))
                  .map(([key, value]) => (
                    <a
                      key={key}
                      href={value as string}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded-full bg-[#F3F4F6] text-[#1F2937] border border-gray-200 text-xs hover:border-[#FF6B4A]"
                    >
                      {key}
                    </a>
                  ))}
              </div>
            )}
            {user.openingHours && Object.keys(user.openingHours).length > 0 && (
              <div className="flex flex-col gap-1 text-sm text-[#6B7280]">
                <span className="text-xs uppercase text-[#9CA3AF]">Horaires</span>
                {Object.entries(user.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex gap-2">
                    <span className="w-24 font-semibold text-[#374151] capitalize">{day}</span>
                    <span>{hours}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tabStats.map((stat) => {
            const showMeta = stat.meta && stat.meta !== stat.label;
            return (
            <button
              key={stat.id}
              type="button"
              onClick={() => setActiveTab(stat.id)}
              className={`text-left rounded-2xl border px-4 py-3 transition-colors flex flex-col gap-1 ${
                activeTab === stat.id
                  ? 'border-[#FF6B4A] bg-[#FFF6F2]'
                  : 'border-gray-200 bg-white hover:border-[#FF6B4A]/60'
              }`}
            >
              {(() => {
                const Icon = stat.icon;
                return (
                  <div className="flex items-center justify-between text-xs text-[#6B7280] uppercase tracking-wide">
                    <span className="flex items-center gap-1">
                      <Icon className="w-4 h-4" />
                      {stat.label}
                    </span>
                    {stat.id === activeTab && (
                      <span className="text-[#FF6B4A] font-semibold">Actif</span>
                    )}
                  </div>
                );
              })()}
              <p className="text-3xl font-semibold text-[#1F2937]">{stat.value}</p>
              {showMeta && <p className="text-xs text-[#6B7280]">{stat.meta}</p>}
            </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mt-6 md:mt-8">
        {renderTabContent()}
      </div>
    </div>
  );
}

function ProductTile({
  title,
  producerName,
  location,
  imageUrl,
  price,
  badge,
  meta,
  unit,
  measurement,
  inStock,
  product,
  inSelection,
  onToggleSelection,
  onRemove,
  onClick,
  onCreateOrder,
}: {
  title: string;
  producerName?: string;
  location?: string;
  imageUrl: string;
  price?: string | number;
  badge?: string;
  meta?: string;
  unit?: string;
  measurement?: Product['measurement'];
  inStock?: boolean;
  product?: Product;
  inSelection?: boolean;
  onToggleSelection?: (product: Product) => void;
  onRemove?: () => void;
  onClick?: () => void;
  onCreateOrder?: () => void;
}) {
  const cardClasses =
    'relative rounded-2xl overflow-hidden border border-[#F1E3DA] bg-white shadow-[0_12px_30px_-18px_rgba(31,41,55,0.35)] transition-all hover:shadow-lg hover:-translate-y-0.5 h-full flex flex-col';
  const clickable = Boolean(onClick);
  const priceLabel = typeof price === 'number' ? `${price.toFixed(2)} EUR` : price;
  const locationLabel = stripDistance(location || '');
  const producerLabel = producerName ? producerName.trim() : '';
  const headerParts: string[] = [];
  if (producerLabel) headerParts.push(producerLabel);
  if (locationLabel && locationLabel.toLowerCase() !== producerLabel.toLowerCase()) {
    headerParts.push(locationLabel);
  }
  const headerText = headerParts.join(' · ');
  const quantityLabel = unit?.trim();
  const measurementLabel =
    measurement === 'kg' ? 'Au kilo' : measurement === 'unit' ? "A l'unite" : undefined;
  const quantityPill =
    quantityLabel && measurementLabel
      ? `${quantityLabel} - ${measurementLabel}`
      : quantityLabel || measurementLabel;
  const stockLabel = typeof inStock === 'boolean' ? (inStock ? 'En stock' : 'Rupture') : undefined;
  const metaLabel = meta?.trim();
  const showHeart = Boolean(onToggleSelection && product);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`${cardClasses} ${clickable ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="relative aspect-[4/3]">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        {badge && (
          <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full bg-black/70 text-white">
            {badge}
          </span>
        )}
        {showHeart && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (product && onToggleSelection) {
                onToggleSelection(product);
              }
            }}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:shadow-md transition"
            aria-pressed={Boolean(inSelection)}
            aria-label={inSelection ? 'Retirer de la selection' : 'Ajouter a la selection'}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                inSelection ? 'text-[#FF6B4A] fill-[#FF6B4A]' : 'text-[#FF6B4A] fill-white stroke-[#FF6B4A]'
              }`}
              strokeWidth={1.8}
            />
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#1F2937] text-xs font-semibold shadow-sm border border-gray-200 hover:border-[#FF6B4A]"
          >
            <X className="w-3 h-3" />
            Retirer
          </button>
        )}
      </div>
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {headerText && (
          <p className="text-[12px] text-[#6B7280] flex items-center gap-2 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{headerText}</span>
          </p>
        )}
        <div className="space-y-1">
          <p className="text-base font-semibold text-[#1F2937] line-clamp-2">{title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {priceLabel && <span className="text-lg font-semibold text-[#FF6B4A]">{priceLabel}</span>}
          {quantityPill && (
            <span className="text-[11px] px-2 py-1 rounded-full bg-[#F9FAFB] border border-gray-200 text-[#374151]">
              {quantityPill}
            </span>
          )}
          {stockLabel && (
            <span
              className={`text-[11px] px-2 py-1 rounded-full border ${
                inStock
                  ? 'bg-[#E6F6F0] border-[#C8EBDD] text-[#0F5132]'
                  : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              {stockLabel}
            </span>
          )}
          {metaLabel && (
            <span className="text-[11px] px-2 py-1 rounded-full bg-[#FFF1E6] border border-[#FFE0D1] text-[#B45309] truncate">
              {metaLabel}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-1 mt-auto">
          {onCreateOrder && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCreateOrder();
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#FF6B4A] text-white text-xs font-semibold hover:bg-[#FF5A39] transition-colors shadow-sm"
            >
              Creer
            </button>
          )}
          {clickable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#FF6B4A] hover:text-[#FF5A39]"
            >
              Voir la fiche
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="w-12 h-12 rounded-full bg-[#FFD166]/30 text-[#FF6B4A] flex items-center justify-center">
        <Sparkles className="w-6 h-6" />
      </div>
      <p className="text-[#1F2937] font-semibold">{title}</p>
      <p className="text-sm text-[#6B7280] max-w-md">{subtitle}</p>
    </div>
  );
}

function ProfileEditPanel({
  user,
  onUpdateUser,
  onClose,
}: {
  user: User;
  onUpdateUser: (user: Partial<User>) => void;
  onClose: () => void;
}) {
  const defaultHandle = user.handle ?? user.name.toLowerCase().replace(/\s+/g, '');
  const [name, setName] = React.useState(user.name);
  const [address, setAddress] = React.useState(user.address || '');
  const [role, setRole] = React.useState<'producer' | 'sharer' | 'participant'>(user.role);
  const [handleValue, setHandleValue] = React.useState(defaultHandle);
  const [profileImage, setProfileImage] = React.useState(user.profileImage ?? '');
  const [profileVisibility, setProfileVisibility] = React.useState<User['profileVisibility']>(
    user.profileVisibility ?? 'public'
  );
  const [addressVisibility, setAddressVisibility] = React.useState<User['addressVisibility']>(
    user.addressVisibility ?? 'public'
  );
  const [tagline, setTagline] = React.useState(user.tagline ?? '');
  const [website, setWebsite] = React.useState(user.website ?? '');
  const [phone, setPhone] = React.useState(user.phone ?? '');
  const [city, setCity] = React.useState(user.city ?? '');
  const [postcode, setPostcode] = React.useState(user.postcode ?? '');
  const [accountType, setAccountType] = React.useState<User['accountType']>(
    user.accountType ?? 'individual'
  );
  const [phonePublic, setPhonePublic] = React.useState(user.phonePublic ?? '');
  const [contactEmailPublic, setContactEmailPublic] = React.useState(user.contactEmailPublic ?? '');
  const [offersOnSitePickup, setOffersOnSitePickup] = React.useState<boolean>(Boolean(user.offersOnSitePickup));
  const [freshProductsCertified, setFreshProductsCertified] = React.useState<boolean>(
    Boolean(user.freshProductsCertified)
  );
  const [socialInstagram, setSocialInstagram] = React.useState(user.socialLinks?.instagram ?? '');
  const [socialFacebook, setSocialFacebook] = React.useState(user.socialLinks?.facebook ?? '');
  const [socialTiktok, setSocialTiktok] = React.useState(user.socialLinks?.tiktok ?? '');
  const [openingHoursText, setOpeningHoursText] = React.useState(
    user.openingHours
      ? Object.entries(user.openingHours)
          .map(([day, value]) => `${day}:${value}`)
          .join('\n')
      : ''
  );
  const [legalName, setLegalName] = React.useState(user.legalEntity?.legalName ?? '');
  const [siret, setSiret] = React.useState(user.legalEntity?.siret ?? '');
  const [vatNumber, setVatNumber] = React.useState(user.legalEntity?.vatNumber ?? '');
  const [legalEntityType, setLegalEntityType] =
    React.useState<'company' | 'association' | 'public_institution'>(
      (user.legalEntity?.entityType as any) ?? 'company'
    );
  const previewImageSrc = profileImage.trim() || DEFAULT_PROFILE_AVATAR;
  const handleProfileImageUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const hasAddress = Boolean(address.trim() && city.trim() && postcode.trim());
    const hasIdentity = Boolean(user.verified);
    const hasLegalInfo = accountType !== 'individual' && Boolean(legalName.trim() && siret.trim());

    if (role === 'sharer' && (!hasIdentity || !hasAddress)) {
      toast.error('Pour devenir partageur, vérifiez votre identité et complétez votre adresse.');
      return;
    }
    if (role === 'producer' && !hasLegalInfo) {
      toast.error("Pour devenir producteur, complétez les informations d'entreprise (raison sociale et SIRET).");
      return;
    }

    const socialLinks: Record<string, string | null> = {
      instagram: socialInstagram.trim() || null,
      facebook: socialFacebook.trim() || null,
      tiktok: socialTiktok.trim() || null,
    };
    const filteredSocials = Object.fromEntries(
      Object.entries(socialLinks).filter(([, v]) => Boolean(v))
    );

    const opening: Record<string, string> = {};
    openingHoursText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        const [day, hours] = line.split(':');
        if (day && hours) {
          opening[day.toLowerCase()] = hours.trim();
        }
      });

    const legalEntity =
      accountType !== 'individual' && legalName.trim() && siret.trim()
        ? {
            legalName: legalName.trim(),
            siret: siret.trim(),
            vatNumber: vatNumber.trim() || undefined,
            entityType: (legalEntityType as 'company' | 'association' | 'public_institution') ?? 'company',
          }
        : undefined;

    onUpdateUser({
      name: name.trim() || user.name,
      address: address.trim(),
      city: city.trim(),
      postcode: postcode.trim(),
      phone: phone.trim(),
      accountType,
      role,
      handle: handleValue.trim() || defaultHandle,
      profileImage: profileImage || undefined,
      profileVisibility,
      addressVisibility,
      tagline: tagline.trim(),
      website: website.trim(),
      phonePublic: phonePublic.trim() || undefined,
      contactEmailPublic: contactEmailPublic.trim() || undefined,
      offersOnSitePickup,
      freshProductsCertified,
      socialLinks: Object.keys(filteredSocials).length ? filteredSocials : undefined,
      openingHours: Object.keys(opening).length ? opening : undefined,
      legalEntity,
    });
    onClose();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#1F2937] text-xl font-semibold">Modifier le profil</h2>
          <p className="text-sm text-[#6B7280]">Retrouvez les reglages de l ancien profil.</p>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded-lg border border-gray-200 text-[#1F2937] hover:border-[#FF6B4A]"
        >
          Retour
        </button>
      </div>


      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-[#FFE8D7] bg-gradient-to-br from-[#FF6B4A] to-[#FFD166] flex items-center justify-center text-xl text-white">
              <ImageWithFallback
                src={previewImageSrc}
                alt={name || user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="text-xl font-semibold text-[#1F2937]">{name || user.name}</div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#FF6B4A]/10 text-[#FF6B4A] text-xs rounded-full">
                  {role === 'producer' ? 'Producteur' : role === 'sharer' ? 'Partageur' : 'Participant'}
                </span>
                {user.verified && (
                  <span className="px-3 py-1 bg-[#28C1A5]/10 text-[#28C1A5] text-xs rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Vérifié
                  </span>
                )}
              </div>
              <p className="text-sm text-[#6B7280]">Edition du profil</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[#FF6B4A] text-white hover:bg-[#FF5A39] transition-colors"
          >
            Enregistrer
          </button>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-[#1F2937] font-semibold">Identité et visibilité</h3>
            <p className="text-xs text-[#6B7280]">Nom, identifiant, bio, image et visibilité du profil.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-[#6B7280]">Nom complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                  placeholder="Nom complet"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#6B7280]">Identifiant profil</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#9CA3AF]">@</span>
                  <input
                    type="text"
                    value={handleValue}
                    onChange={(e) => setHandleValue(e.target.value.replace(/\s+/g, ''))}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A] text-sm"
                    placeholder="votrepseudo"
                  />
                </div>
                <p className="text-xs text-[#9CA3AF]">Utilise pour le lien du profil.</p>
              </div>
              <div>
                <label className="block text-sm text-[#6B7280]">Bio / phrase</label>
                <textarea
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Quelques mots sur vous..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A] resize-none"
                />
              </div>
            </div>
            <div className="space-y-3 rounded-xl bg-[#F9FAFB] p-4 border border-gray-200">
              <div className="space-y-2">
                <label className="block text-sm text-[#6B7280]">Photo de profil</label>
                <label
                  htmlFor="profile-image-upload"
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#FF6B4A] transition-colors cursor-pointer flex flex-col items-center gap-2 bg-white"
                >
                  <Upload className="w-8 h-8 text-[#6B7280]" />
                  <div className="text-sm text-[#6B7280]">Cliquez pour telecharger ou glissez une image</div>
                  <div className="text-xs text-[#9CA3AF]">Le fichier sera ajoute lors de l'enregistrement du profil.</div>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleProfileImageUpload(e.target.files?.[0])}
                  />
                </label>
                {profileImage && (
                  <p className="text-xs text-[#9CA3AF]">Apercu mis a jour (non envoye cote serveur).</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-[#6B7280]">Visibilite du profil</label>
                <div className="flex items-center gap-2">
                  <VisibilityButton
                    label="Public"
                    icon={Globe}
                    active={profileVisibility === 'public'}
                    onClick={() => setProfileVisibility('public')}
                  />
                  <VisibilityButton
                    label="Privé"
                    icon={Lock}
                    active={profileVisibility === 'private'}
                    onClick={() => setProfileVisibility('private')}
                  />
                </div>
                <p className="text-xs text-[#9CA3AF]">Le mode prive limite la visibilité de votre profil et de vos informations.</p>
                {!user.verified && (
                  <button className="w-full py-2 bg-[#28C1A5] text-white rounded-lg hover:bg-[#23A88F] transition-colors">
                    Vérifiér mon identité
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#FFE0D1] bg-[#FFF6F0] p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-[#1F2937] font-semibold">Role et type de compte</h3>
            <p className="text-xs text-[#6B7280]">Choisissez le role pour debloquer les actions correspondantes.</p>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <RoleButton label="Participant" active={role === 'participant'} onClick={() => setRole('participant')} />
                <RoleButton
                  label="Partageur"
                  active={role === 'sharer'}
                  disabled={!(user.verified && address.trim() && city.trim() && postcode.trim())}
                  onClick={() => {
                    if (user.verified && address.trim() && city.trim() && postcode.trim()) setRole('sharer');
                  }}
                  hint="Vérifiez votre identité et complétez votre adresse pour passer partageur."
                />
                <RoleButton
                  label="Producteur"
                  active={role === 'producer'}
                  disabled={accountType === 'individual' || !legalName.trim() || !siret.trim()}
                  onClick={() => {
                    if (accountType !== 'individual' && legalName.trim() && siret.trim()) setRole('producer');
                  }}
                  hint="Renseignez votre entreprise (type != particulier, raison sociale et SIRET)."
                />
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Partageur: identité vérifiée + adresse complète. Producteur: compte non particulier avec raison sociale et SIRET.
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-[#6B7280]">Type de compte</label>
              <select
                value={accountType}
                onChange={(e) =>
                  setAccountType(
                    (e.target.value as 'individual' | 'company' | 'association' | 'public_institution') ?? 'individual'
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
              >
                <option value="individual">Particulier</option>
                <option value="company">Entreprise</option>
                <option value="association">Association</option>
                <option value="public_institution">Collectivité / service public</option>
              </select>
              <p className="text-xs text-[#9CA3AF]">Determine si les sections entreprise sont affichees.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-[#374151]">
              <input
                type="checkbox"
                checked={freshProductsCertified}
                onChange={(e) => setFreshProductsCertified(e.target.checked)}
                className="rounded border-gray-300 text-[#FF6B4A] focus:ring-[#FF6B4A]"
              />
              Habilitation a partager des produits frais
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-[#1F2937] font-semibold">Coordonnees obligatoires</h3>
            <p className="text-xs text-[#6B7280]">Pour sécuriser les echanges et votre visibilité locale.</p>
          </div>
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#1F2937]">Confirmez vos coordonnees</p>
            <div className="space-y-3">
              <label className="block text-sm text-[#6B7280]">Adresse *</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="12 Rue Caldagues"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                />
                {address.trim() ? (
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6F6F0] border border-[#C8EBDD] text-[#0F5132]">
                    <Check className="w-4 h-4" />
                  </span>
                ) : null}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-[#6B7280]">Code postal *</label>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="75001"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6B7280]">Ville *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Paris"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6B7280]">Pays</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A] bg-white"
                    defaultValue="France"
                    disabled
                  >
                    <option>France</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <VisibilityButton
                  label="Adresse visible"
                  icon={MapPin}
                  active={addressVisibility === 'public'}
                  onClick={() => setAddressVisibility('public')}
                />
                <VisibilityButton
                  label="Adresse masquée"
                  icon={Lock}
                  active={addressVisibility === 'private'}
                  onClick={() => setAddressVisibility('private')}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <label className="block text-sm text-[#6B7280]">Telephone (obligatoire)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                  placeholder="06 75 02 63 91"
                />
                <p className="text-xs text-[#9CA3AF]">
                  Stocke dans profiles.phone. Option future: auth.users.phone avec OTP.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 rounded-xl bg-[#F9FAFB] p-4 border border-gray-200">
              <h3 className="text-[#1F2937] font-semibold">Contacts publics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#6B7280]">Telephone public</label>
                  <input
                    type="text"
                    value={phonePublic}
                    onChange={(e) => setPhonePublic(e.target.value)}
                    placeholder="+33..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6B7280]">Email public</label>
                  <input
                    type="email"
                    value={contactEmailPublic}
                    onChange={(e) => setContactEmailPublic(e.target.value)}
                    placeholder="contact@votre-site.fr"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-[#6B7280]">Horaires (ex: lundi:08h-12h)</label>
                <textarea
                  value={openingHoursText}
                  onChange={(e) => setOpeningHoursText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A] resize-none"
                />
                <p className="text-xs text-[#9CA3AF]">Une ligne par jour, format jour:plage horaire.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-[#374151]">
                  <input
                    type="checkbox"
                    checked={offersOnSitePickup}
                    onChange={(e) => setOffersOnSitePickup(e.target.checked)}
                    className="rounded border-gray-300 text-[#FF6B4A] focus:ring-[#FF6B4A]"
                  />
                  Retrait sur place proposé
                </label>
              </div>
            </div>
            <div className="space-y-3 rounded-xl bg-[#FFF8F3] p-4 border border-[#FFE0D1]">
              <h3 className="text-[#1F2937] font-semibold">Réseaux et liens</h3>
              <div className="space-y-2">
                <label className="block text-sm text-[#6B7280]">Site web</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://votresite.fr"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                />
              </div>
              <div className="space-y-2">
                <input
                  type="url"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  placeholder="Lien Instagram"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                />
                <input
                  type="url"
                  value={socialFacebook}
                  onChange={(e) => setSocialFacebook(e.target.value)}
                  placeholder="Lien Facebook"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                />
                <input
                  type="url"
                  value={socialTiktok}
                  onChange={(e) => setSocialTiktok(e.target.value)}
                  placeholder="Lien TikTok"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                />
                <p className="text-xs text-[#9CA3AF]">Laissez vide si vous ne souhaitez pas afficher ces liens.</p>
              </div>
            </div>
          </div>
        </section>

        {accountType !== 'individual' && (
          <section className="rounded-2xl border border-[#D7E3FF] bg-[#F6F8FF] p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-[#1F2937] font-semibold">Informations légales</h3>
              <span className="text-xs text-[#6B7280]">Visible pour les comptes entreprise / association / public</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm text-[#6B7280]">Raison sociale</label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Votre entreprise"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#6B7280]">SIRET</label>
                <input
                  type="text"
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                  placeholder="123 456 789 00012"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#6B7280]">TVA (optionnel)</label>
                <input
                  type="text"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  placeholder="FRXX999999999"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#6B7280]">Type de structure</label>
                <select
                  value={legalEntityType}
                  onChange={(e) =>
                    setLegalEntityType(
                      (e.target.value as 'company' | 'association' | 'public_institution') ?? 'company'
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                >
                  <option value="company">Entreprise</option>
                  <option value="association">Association</option>
                  <option value="public_institution">Collectivité / service public</option>
                </select>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function RoleButton({
  label,
  active,
  onClick,
  disabled,
  hint,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={hint}
      className={`py-2 px-4 rounded-lg border-2 transition-colors ${
        active
          ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-[#FF6B4A]'
          : 'border-gray-200 text-[#6B7280] hover:border-[#FFD166]'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {label}
    </button>
  );
}

function VisibilityButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-colors ${
        active ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-[#FF6B4A]' : 'border-gray-200 text-[#6B7280] hover:border-[#FFD166]'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
