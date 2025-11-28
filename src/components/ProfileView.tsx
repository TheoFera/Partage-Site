import React from 'react';
import { MapPin, Shield, Grid, Bookmark, ShoppingBag, X, Check, Sparkles } from 'lucide-react';
import { DeckCard, GroupOrder, Product, User } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

type TabKey = 'products' | 'orders' | 'selection';

const statusLabels: Record<GroupOrder['status'], string> = {
  open: 'Ouverte',
  closed: 'Fermee',
  completed: 'Terminee',
};

interface ProfileViewProps {
  user: User;
  producerProducts: Product[];
  deck: DeckCard[];
  orders: GroupOrder[];
  producerOrders: GroupOrder[];
  isOwnProfile?: boolean;
  onUpdateUser: (user: Partial<User>) => void;
  onRemoveFromDeck: (productId: string) => void;
  onOpenOrder?: (orderId: string) => void;
}

export function ProfileView({
  user,
  producerProducts,
  deck,
  producerOrders,
  orders,
  isOwnProfile = true,
  onUpdateUser,
  onRemoveFromDeck,
  onOpenOrder,
}: ProfileViewProps) {
  const [mode, setMode] = React.useState<'view' | 'edit'>('view');
  const [activeTab, setActiveTab] = React.useState<TabKey>('orders');

  const orderCards = React.useMemo(() => {
    const mergedMap = new Map<string, GroupOrder>();
    const source = user.role === 'producer' ? [...producerOrders, ...orders] : orders;
    const visible = isOwnProfile ? source : source.filter((order) => order.visibility === 'public');
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
        badge: order.visibility === 'private' ? 'Prive' : 'Public',
        price: `${order.participants} participant${order.participants > 1 ? 's' : ''}`,
        meta: `Cloture ${deadlineDate.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
        })}`,
        status: statusLabels[order.status],
      };
    });
  }, [producerOrders, orders, user.role, isOwnProfile]);

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

  const renderTabContent = () => {
    if (activeTab === 'products') {
      return producerProducts.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {producerProducts.map((product) => (
            <ProductTile
              key={product.id}
              title={product.name}
              subtitle={product.producerLocation}
              imageUrl={product.imageUrl}
              price={`${product.price.toFixed(2)} EUR`}
              badge="Produit"
              meta={product.unit}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Aucun produit"
          subtitle="Ajoutez un produit pour afficher votre vitrine."
        />
      );
    }

    if (activeTab === 'orders') {
      return orderCards.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {orderCards.map((item) => (
            <ProductTile
              key={item.key}
              title={item.title}
              subtitle={item.subtitle}
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
          subtitle="Vos commandes passees et actives apparaitront ici."
        />
      );
    }

    if (activeTab === 'selection') {
      return deck.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {deck.map((card) => (
            <ProductTile
              key={card.id}
              title={card.name}
              subtitle={card.producerName}
              imageUrl={card.imageUrl}
              price={`${card.price.toFixed(2)} EUR`}
              badge="Sélection"
              meta={card.producerLocation}
              onRemove={() => onRemoveFromDeck(card.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Aucune sélection"
          subtitle="Sauvegardez un produit depuis le feed ou le swipe pour le retrouver ici."
        />
      );
    }

    return null;
  };

  return (
    <div className="space-y-10 pb-24">
      <div className="bg-white text-[#1F2937] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 relative space-y-6">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF6B4A] to-[#FFD166] flex items-center justify-center text-3xl font-semibold shadow-lg ring-4 ring-[#FFE8D7] flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                {user.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E6F6F0] border border-[#C8EBDD] text-xs text-[#0F5132]">
                    <Check className="w-3 h-3" />
                    Verifie
                  </span>
                )}
              </div>
              <p className="text-sm text-[#6B7280]">@{user.name.toLowerCase().replace(/\s+/g, '')}</p>
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <MapPin className="w-4 h-4" />
                <span>{user.address || 'Adresse non renseignee'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FFF1E6] border border-[#FFE0D1] text-xs text-[#B45309]">
                  {user.role === 'producer' ? 'Producteur' : user.role === 'sharer' ? 'Partageur' : 'Client'}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-xs text-[#374151]">
                  Profil public
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setMode('edit')}
              className="px-4 py-2 rounded-full bg-[#FF6B4A] text-white font-semibold shadow-md hover:bg-[#FF5A39] transition-all"
            >
              Modifier le profil
            </button>
            <button className="px-4 py-2 rounded-full bg-white border border-[#FF6B4A] text-[#FF6B4A] font-semibold hover:bg-[#FFF1E6] transition-all">
              Partager
            </button>
          </div>
        </div>

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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}

function ProductTile({
  title,
  subtitle,
  imageUrl,
  price,
  badge,
  meta,
  onRemove,
  onClick,
}: {
  title: string;
  subtitle?: string;
  imageUrl: string;
  price?: string;
  badge?: string;
  meta?: string;
  onRemove?: () => void;
  onClick?: () => void;
}) {
  const cardClasses = 'relative rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md h-full flex flex-col';
  const clickable = Boolean(onClick);
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
      <div className="aspect-square relative">
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
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#1F2937] truncate">{title}</p>
          {subtitle && <p className="text-xs text-[#6B7280] truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center justify-between text-xs text-[#6B7280] mt-auto">
          {price && <span className="text-[#FF6B4A] font-semibold truncate">{price}</span>}
          {meta && (
            <span className="px-2 py-0.5 rounded-full bg-[#F9FAFB] border border-gray-200 text-[#1F2937] truncate">
              {meta}
            </span>
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
  const [name, setName] = React.useState(user.name);
  const [address, setAddress] = React.useState(user.address || '');
  const [role, setRole] = React.useState<'producer' | 'sharer' | 'client'>(user.role);

  const handleSave = () => {
    onUpdateUser({ name, address, role });
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

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B4A] to-[#FFD166] flex items-center justify-center text-xl text-white">
              {user.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xl px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
              />
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#FF6B4A]/10 text-[#FF6B4A] text-xs rounded-full">
                  {role === 'producer' ? 'Producteur' : role === 'sharer' ? 'Partageur' : 'Client'}
                </span>
                {user.verified && (
                  <span className="px-3 py-1 bg-[#28C1A5]/10 text-[#28C1A5] text-xs rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verifie
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[#FF6B4A] text-white hover:bg-[#FF5A39] transition-colors"
          >
            Enregistrer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <RoleButton label="Client" active={role === 'client'} onClick={() => setRole('client')} />
          <RoleButton label="Partageur" active={role === 'sharer'} onClick={() => setRole('sharer')} />
          <RoleButton label="Producteur" active={role === 'producer'} onClick={() => setRole('producer')} />
        </div>

        <div>
          <label className="block text-sm text-[#6B7280] mb-2">Adresse</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Entrez votre adresse complete"
            rows={2}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A] resize-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#28C1A5]" />
          <div>
            <h3 className="text-[#1F2937] font-semibold">Verification</h3>
            <p className="text-sm text-[#6B7280]">
              Rassurez vos voisins avec une identite verifiee.
            </p>
          </div>
        </div>
        {!user.verified && (
          <button className="w-full py-2 bg-[#28C1A5] text-white rounded-lg hover:bg-[#23A88F] transition-colors">
            Verifier mon identite
          </button>
        )}
      </div>

      {role === 'sharer' && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#FFD166]" />
            <div>
              <h3 className="text-[#1F2937] font-semibold">Statut entreprise</h3>
              <p className="text-sm text-[#6B7280]">
                Enregistrez votre statut pour recevoir une remuneration en euros.
              </p>
            </div>
          </div>
          <input
            type="text"
            placeholder="Numero SIRET"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
          />
          <button className="w-full py-2 bg-[#FFD166] text-[#1F2937] rounded-lg hover:bg-[#FFC64D] transition-colors">
            Enregistrer mon entreprise
          </button>
        </div>
      )}
    </div>
  );
}

function RoleButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 px-4 rounded-lg border-2 transition-colors ${
        active ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-[#FF6B4A]' : 'border-gray-200 text-[#6B7280] hover:border-[#FFD166]'
      }`}
    >
      {label}
    </button>
  );
}
