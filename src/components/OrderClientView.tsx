import React from 'react';
import { ArrowLeft, CalendarClock, Globe2, Lock, MapPin, Share2, ShoppingCart, Users } from 'lucide-react';
import { GroupOrder } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface OrderClientViewProps {
  order: GroupOrder;
  onClose: () => void;
  onShare?: (order: GroupOrder) => void;
  onVisibilityChange?: (visibility: GroupOrder['visibility']) => void;
  onPurchase?: (payload: { quantities: Record<string, number>; total: number }) => void;
  isOwner?: boolean;
}

function formatPrice(value: number) {
  return `${value.toFixed(2)} EUR`;
}

function labelForDay(day: string) {
  const map: Record<string, string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  };
  return map[day] ?? day;
}

export function OrderClientView({
  order,
  onClose,
  onShare,
  onVisibilityChange,
  onPurchase,
  isOwner = true,
}: OrderClientViewProps) {
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const next: Record<string, number> = {};
    order.products.forEach((product) => {
      next[product.id] = 0;
    });
    setQuantities(next);
  }, [order.id, order.products]);

  const totalCards = React.useMemo(
    () => Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
    [quantities]
  );

  const totalPrice = React.useMemo(
    () =>
      order.products.reduce((sum, product) => {
        const qty = quantities[product.id] ?? 0;
        return sum + product.price * qty;
      }, 0),
    [order.products, quantities]
  );

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] ?? 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/order/${order.id}`;
    navigator.clipboard?.writeText(url).catch(() => undefined);
    toast.success('Lien de commande copie dans le presse-papier');
    onShare?.(order);
  };

  const handleVisibilityToggle = () => {
    if (!isOwner) return;
    const next = order.visibility === 'public' ? 'private' : 'public';
    onVisibilityChange?.(next);
    toast.success(`Commande rendue ${next === 'public' ? 'publique' : 'privee'}`);
  };

  const handlePurchase = () => {
    if (totalCards === 0) {
      toast.info('Ajoutez au moins une carte avant de valider.');
      return;
    }
    onPurchase?.({ quantities, total: totalPrice });
    toast.success('Quantites enregistrees pour cette commande.');
  };

  const pickupLine = order.pickupSlots?.length
    ? order.pickupSlots
        .map((slot) => `${labelForDay(slot.label ?? slot.day)} ${slot.start ?? ''}-${slot.end ?? ''}`)
        .join(' / ')
    : order.message || 'Voir message de retrait';

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 text-[#1F2937] hover:border-[#FF6B4A] transition-colors"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <span className="px-3 py-1 rounded-full bg-[#F3F4F6] text-xs text-[#6B7280] border border-gray-200">
            Vue client
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isOwner && (
            <button
              type="button"
              onClick={handleVisibilityToggle}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${
                order.visibility === 'public'
                  ? 'border-[#28C1A5] bg-[#28C1A5]/10 text-[#0F5132]'
                  : 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-[#B45309]'
              }`}
            >
              {order.visibility === 'public' ? (
                <Globe2 className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {order.visibility === 'public' ? 'Commande publique' : 'Commande privee'}
            </button>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B4A] text-white shadow-md hover:bg-[#FF5A39] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
        <div className="space-y-2">
          <h2 className="text-[#1F2937] text-xl font-semibold">{order.title}</h2>
          <div className="text-sm text-[#6B7280] space-x-2">
            <span>Poids min : {order.minWeight} kg</span>
            <span>• max : {order.maxWeight} kg</span>
            <span>• Part partageur : {order.sharerPercentage}%</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#6B7280] flex-wrap">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F9FAFB] border border-gray-200">
              <CalendarClock className="w-4 h-4" />
              Cloture {order.deadline.toLocaleDateString('fr-FR')}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F9FAFB] border border-gray-200">
              <MapPin className="w-4 h-4" />
              Retrait : {pickupLine}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F9FAFB] border border-gray-200">
              <Users className="w-4 h-4" />
              {order.participants} participant{order.participants > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {order.products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4 items-center"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                <ImageWithFallback
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-[#1F2937] font-semibold">{product.name}</p>
                  <p className="text-sm text-[#6B7280]">{product.producerName}</p>
                </div>
                <p className="text-sm text-[#FF6B4A] font-semibold">
                  Prix par carte : {formatPrice(product.price)}
                </p>
                <p className="text-xs text-[#6B7280]">
                  Inclut logistique et part du partageur. Quantite minimum : 0.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#1F2937]">Quantite souhaitee</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(product.id, -1)}
                      className="w-9 h-9 rounded-full border border-gray-200 text-[#1F2937] hover:border-[#FF6B4A]"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={quantities[product.id] ?? 0}
                      onChange={(e) => {
                        const value = Math.max(0, Number(e.target.value) || 0);
                        setQuantities((prev) => ({ ...prev, [product.id]: value }));
                      }}
                      className="w-16 text-center border border-gray-200 rounded-lg py-1 focus:outline-none focus:border-[#FF6B4A]"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(product.id, 1)}
                      className="w-9 h-9 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/30 hover:bg-[#FF6B4A]/20"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 border-t border-gray-100 pt-3">
          <div className="text-sm text-[#6B7280]">
            <p>
              Total cartes : <span className="text-[#1F2937] font-semibold">{totalCards}</span>
            </p>
            <p>
              Total estime : <span className="text-[#1F2937] font-semibold">{formatPrice(totalPrice)}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePurchase}
              disabled={totalCards === 0}
              className="px-4 py-2 rounded-full bg-[#FF6B4A] text-white font-semibold shadow-md hover:bg-[#FF5A39] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Acheter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
