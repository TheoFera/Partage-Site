import React from 'react';
import {
  ArrowLeft,
  CalendarClock,
  Globe2,
  Info,
  Leaf,
  Lock,
  MapPin,
  Scale,
  Share2,
  ShoppingCart,
  Users,
} from 'lucide-react';
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

function getProductWeightKg(product: GroupOrder['products'][number]) {
  if (product.weightKg) return product.weightKg;
  const unit = product.unit?.toLowerCase() ?? '';
  const match = unit.match(/([\d.,]+)\s*(kg|g)/);
  if (match) {
    const raw = parseFloat(match[1].replace(',', '.'));
    if (Number.isFinite(raw)) {
      return match[2] === 'kg' ? raw : raw / 1000;
    }
  }
  if (product.measurement === 'kg') return 1;
  return 0.25;
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

  const orderedWeight = React.useMemo(
    () =>
      order.products.reduce((sum, product) => {
        const qty = quantities[product.id] ?? 0;
        const weightPerUnit = getProductWeightKg(product);
        return sum + weightPerUnit * qty;
      }, 0),
    [order.products, quantities]
  );

  const progressPercent = order.minWeight > 0 ? (orderedWeight / order.minWeight) * 100 : 0;
  const progressWidth = Math.min(progressPercent, 100);
  const extraPercent = Math.max(0, progressPercent - 100);
  const remainingWeight = Math.max(order.minWeight - orderedWeight, 0);
  const sharedValue = (totalPrice * order.sharerPercentage) / 100;

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
  const deadlineDate = order.deadline instanceof Date ? order.deadline : new Date(order.deadline);
  const now = React.useMemo(() => new Date(), []);
  const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const hasPassedDeadline = deadlineDate.getTime() < now.getTime();
  const statusLabel =
    order.status === 'completed'
      ? 'Terminee'
      : order.status === 'closed' || hasPassedDeadline
        ? 'Fermee'
        : 'En cours';
  const statusColor =
    order.status === 'completed'
      ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
      : order.status === 'closed' || hasPassedDeadline
        ? 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]'
        : 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]';

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-8">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 text-[#1F2937] bg-white shadow-sm hover:border-[#FF6B4A] hover:bg-gray-50 transition-colors"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF6B4A] text-[#FF6B4A] bg-white shadow-sm hover:bg-[#FFF1E6] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Copier le lien
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={handleVisibilityToggle}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-white text-sm shadow-sm transition-colors ${
                order.visibility === 'public'
                  ? 'border-[#28C1A5] text-[#0F5132] hover:bg-[#F4FFFB]'
                  : 'border-[#FF6B4A] text-[#B45309] hover:bg-[#FFF1E6]'
              }`}
            >
              {order.visibility === 'public' ? <Globe2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {order.visibility === 'public' ? 'Commande publique' : 'Commande privee'}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="relative p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-semibold text-[#1F2937] leading-tight">{order.title}</h2>
                  <p className="text-sm text-[#4B5563]">
                    Par {order.sharerName}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                  <Leaf className="w-4 h-4" />
                  {statusLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/70 border border-gray-100 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-xs uppercase text-[#6B7280] tracking-wide">
                    <Scale className="w-4 h-4 text-[#FF6B4A]" />
                    Capacite
                  </div>
                  <p className="text-[#1F2937] font-semibold text-lg">
                    {order.minWeight} kg - {order.maxWeight} kg
                  </p>
                </div>
                <div className="bg-white/70 border border-gray-100 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-xs uppercase text-[#6B7280] tracking-wide">
                    <CalendarClock className="w-4 h-4 text-[#FF6B4A]" />
                    Cloture
                  </div>
                  <p className="text-[#1F2937] font-semibold text-lg">
                    {deadlineDate.toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {hasPassedDeadline ? 'Echeance depassee' : `Dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="bg-white/70 border border-gray-100 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-xs uppercase text-[#6B7280] tracking-wide">
                    <MapPin className="w-4 h-4 text-[#FF6B4A]" />
                    Retrait
                  </div>
                  <p className="text-[#1F2937] font-semibold text-lg leading-tight">{pickupLine}</p>
                  <p className="text-xs text-[#6B7280]">{order.pickupAddress}</p>
                </div>
              </div>

              {order.message && (
                <div className="bg-white border border-[#FFDCC4] rounded-2xl p-4 text-sm text-[#92400E] shadow-sm">
                  <span className="inline-flex items-center gap-2 font-semibold text-[#B45309]">
                    <Info className="w-4 h-4" />
                  </span>
                  <p className="mt-2 leading-relaxed text-[#92400E]">{order.message}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-px bg-gray-100" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#1F2937]">Choisissez vos produits</h3>
              </div>
            </div>

            {order.products.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 text-sm text-[#6B7280] shadow-sm">
                Aucun produit n'est associé a cette commande pour l'instant.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {order.products.map((product) => (
                  <article
                    key={product.id}
                    className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col"
                  >
                    <div className="relative h-40 bg-[#F3F4F6]">
                      <ImageWithFallback
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-[#1F2937] border border-gray-100">
                        <Scale className="w-3.5 h-3.5 text-[#FF6B4A]" />
                        {product.measurement === 'kg' ? 'Au poids' : 'A la piece'}
                      </div>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-base font-semibold text-[#1F2937] leading-tight">{product.name}</p>
                          <p className="text-[11px] uppercase tracking-wide text-[#6B7280]">
                            {product.producerName} - {product.producerLocation}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-[#F9FAFB] border border-gray-200 text-[#4B5563]">
                          {product.unit}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[#FF6B4A] font-semibold text-lg">{formatPrice(product.price)}</p>
                        <p className="text-[12px] text-[#6B7280]">
                          Environ {getProductWeightKg(product).toFixed(2)} kg par carte
                        </p>
                      </div>

                      <div className="mt-auto space-y-2">
                        <span className="text-sm text-[#1F2937] font-medium">Quantité souhaitée</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product.id, -1)}
                            className="w-9 h-9 rounded-full border border-gray-200 text-[#1F2937] hover:border-[#FF6B4A] transition-colors"
                            aria-label={`Retirer une carte de ${product.name}`}
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
                            className="w-20 text-center border border-gray-200 rounded-lg py-2 focus:outline-none focus:border-[#FF6B4A]"
                            aria-label={`Quantite pour ${product.name}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product.id, 1)}
                            className="w-9 h-9 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/30 hover:bg-[#FF6B4A]/20 transition-colors"
                            aria-label={`Ajouter une carte de ${product.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/20">
                  <Users className="w-4 h-4" />
                </span>
                <p className="text-lg font-semibold text-[#1F2937] leading-snug">Progression de la commande : partagez là autour de vous pour qu'elle soit complétée</p>
              </div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#B45309] border border-[#FFDCC4] font-semibold text-sm shadow-sm">
                {progressPercent.toFixed(0)}%
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#6B7280] font-medium">
                <span>{orderedWeight.toFixed(2)} kg commandés</span>
                <span className="text-[#FF6B4A] font-semibold">Objectif : {order.minWeight} kg</span>
              </div>
              <div
                className="relative w-full h-5 rounded-full bg-[#F3F4F6] overflow-hidden border border-[#E5E7EB]"
                style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)' }}
              >
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-[#FF9F6B] via-[#FF7A5C] to-[#FF4D4F] transition-[width] duration-500 ease-out"
                  style={{
                    width: `${progressWidth}%`,
                    boxShadow: '0 6px 16px -8px rgba(255,107,74,0.8)',
                  }}
                />
              </div>
            </div>

            {extraPercent > 0 && (
              <div className="flex items-start gap-3 text-xs text-[#9A3412] bg-[#FFF7ED] border border-[#FFDCC4] rounded-2xl px-3 py-3 shadow-sm">
                <span className="inline-flex w-2 h-2 mt-1 rounded-full bg-[#FF6B4A]" />
                <span>Les {extraPercent.toFixed(0)}% au-dessus du minimum requis pour lancer la commande vous permettent d'obtenir des avoirs sur des prochaines commandes.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-[#FFF9F3] border border-[#FFDCC4] rounded-2xl p-3 space-y-1 shadow-sm">
                <p className="text-xs text-[#B45309] font-semibold">Poids restant</p>
                <p className="text-xl font-semibold text-[#1F2937]">{remainingWeight.toFixed(2)} kg</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 space-y-4">
            <div className="text-sm text-[#6B7280] space-y-1">
              <p>
                Total : <span className="text-[#1F2937] font-semibold">{totalCards}</span>
              </p>
              <p>
                Montant à payer : <span className="text-[#1F2937] font-semibold">{formatPrice(totalPrice)}</span>
              </p>
              <p className="text-xs text-[#6B7280]">Poids cumulé : {orderedWeight.toFixed(2)} kg</p>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF6B4A] text-[#FF6B4A] bg-white shadow-sm hover:bg-[#FFF1E6] transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </button>
              <button
                type="button"
                onClick={handlePurchase}
                disabled={totalCards === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B4A] text-white font-semibold shadow-md hover:bg-[#FF5A39] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                Acheter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
