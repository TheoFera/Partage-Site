import React from 'react';
import { DeckCard } from '../types';
import { Calendar, MapPin, Package, Percent } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CreateOrderFormProps {
  products: DeckCard[];
  onCreateOrder: (order: any) => void;
  preselectedProductIds?: string[];
  onCancel?: () => void;
}

type PickupSlot = {
  day: string;
  label: string;
  enabled: boolean;
  start: string;
  end: string;
};

const defaultSlots: PickupSlot[] = [
  { day: 'monday', label: 'Lundi', enabled: false, start: '17:00', end: '19:00' },
  { day: 'tuesday', label: 'Mardi', enabled: false, start: '17:00', end: '19:00' },
  { day: 'wednesday', label: 'Mercredi', enabled: false, start: '17:00', end: '19:00' },
  { day: 'thursday', label: 'Jeudi', enabled: false, start: '17:00', end: '19:00' },
  { day: 'friday', label: 'Vendredi', enabled: true, start: '17:30', end: '19:30' },
  { day: 'saturday', label: 'Samedi', enabled: true, start: '10:00', end: '12:00' },
  { day: 'sunday', label: 'Dimanche', enabled: false, start: '10:00', end: '12:00' },
];

export function CreateOrderForm({ products, onCreateOrder, preselectedProductIds, onCancel }: CreateOrderFormProps) {
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>(preselectedProductIds ?? []);
  const [title, setTitle] = React.useState('');
  const [visibility, setVisibility] = React.useState<'public' | 'private'>('public');
  const [sharerPercentage, setSharerPercentage] = React.useState(10);
  const [minWeight, setMinWeight] = React.useState(5);
  const [maxWeight, setMaxWeight] = React.useState(20);
  const [deadline, setDeadline] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [pickupAddress, setPickupAddress] = React.useState('15 Rue de la République, 75001 Paris');
  const [pickupSlots, setPickupSlots] = React.useState<PickupSlot[]>(defaultSlots);

  const shareFraction = Math.min(Math.max(sharerPercentage / 100, 0), 0.8);

  const selectedProductsData = products.filter((p) => selectedProducts.includes(p.id));
  const totalWeightProducts = selectedProductsData.reduce((sum, p) => sum + (p.weightKg ?? 1), 0);
  const safeMinWeight = Math.max(0, minWeight);
  const effectiveWeight = Math.max(totalWeightProducts, safeMinWeight);

  const logisticCostByWeight = (weightKg: number) => {
    if (!weightKg || weightKg <= 0) return 0;
    const raw = 7 + 8 * Math.sqrt(weightKg);
    return Math.max(15, 5 * Math.round(raw / 5));
  };

  const logTotal = effectiveWeight > 0 ? logisticCostByWeight(effectiveWeight) : 0;
  const logPerKg = effectiveWeight > 0 ? logTotal / effectiveWeight : 0;

  const perProductRows = selectedProductsData.map((p) => {
    const weight = p.weightKg ?? 1;
    const logPerUnit = logPerKg * weight;
    const basePlusLog = p.price + logPerUnit;
    const participantPrice = basePlusLog * (shareFraction > 0 ? 1 / (1 - shareFraction) : 1);
    const sharePerUnit = participantPrice - basePlusLog;
    const priceType = p.measurement === 'kg' ? 'Au kilo' : 'À la pièce';

    return {
      id: p.id,
      name: p.name,
      basePrice: p.price,
      logPerUnit,
      sharePerUnit,
      participantPrice,
      priceType,
    };
  });

  const totalShareBase = perProductRows.reduce((sum, r) => sum + r.sharePerUnit, 0);
  const weightScale = totalWeightProducts > 0 ? effectiveWeight / totalWeightProducts : 1;
  const totalShareEffective = totalShareBase * weightScale;

  const groupedByProducer = products.reduce((acc, card) => {
    const producerId = card.producerId;
    if (!acc[producerId]) {
      acc[producerId] = {
        producerName: card.producerName,
        products: [],
      };
    }
    acc[producerId].products.push(card);
    return acc;
  }, {} as Record<string, { producerName: string; products: DeckCard[] }>);

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  React.useEffect(() => {
    if (preselectedProductIds && preselectedProductIds.length > 0) {
      setSelectedProducts((prev) => {
        const validPrev = prev.filter((id) => products.some((p) => p.id === id));
        const next = [...preselectedProductIds, ...validPrev];
        return Array.from(new Set(next));
      });
    } else {
      setSelectedProducts((prev) => prev.filter((id) => products.some((p) => p.id === id)));
    }
  }, [preselectedProductIds, products]);

  const toggleSlot = (day: string) => {
    setPickupSlots((prev) => prev.map((slot) => (slot.day === day ? { ...slot, enabled: !slot.enabled } : slot)));
  };

  const updateSlotTime = (day: string, key: 'start' | 'end', value: string) => {
    setPickupSlots((prev) => prev.map((slot) => (slot.day === day ? { ...slot, [key]: value } : slot)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      alert('Veuillez sélectionner au moins un produit');
      return;
    }

    const activeSlots = pickupSlots
      .filter((slot) => slot.enabled)
      .map((slot) => ({ day: slot.day, label: slot.label, start: slot.start, end: slot.end }));

    onCreateOrder({
      title,
      products: selectedProductsData,
      visibility,
      sharerPercentage,
      minWeight,
      maxWeight,
      deadline: deadline ? new Date(deadline) : null,
      message,
      pickupAddress,
      pickupSlots: activeSlots,
      totals: {
        baseTotal: perProductRows.reduce((sum, r) => sum + r.basePrice, 0),
        logTotal,
        participantTotal: perProductRows.reduce((sum, r) => sum + r.participantPrice, 0),
        share: totalShareEffective,
        effectiveWeight,
      },
    });
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-24 h-24 rounded-full bg-[#FF6B4A]/20 flex items-center justify-center mb-4">
          <Package className="w-12 h-12 text-[#FF6B4A]" />
        </div>
        <h3 className="text-[#1F2937] mb-2">Votre selection est vide</h3>
        <p className="text-[#6B7280] text-center max-w-sm">
          Utilisez le bouton "Creer" sur une carte produit pour pre-remplir une commande ici.
        </p>
      </div>
    );
  }

  const renderPickupLine = () => {
    const active = pickupSlots.filter((slot) => slot.enabled);
    if (active.length === 0) return 'Non précisé';
    return active
      .map((slot) => `${slot.label} ${slot.start || '??'}-${slot.end || '??'}`)
      .join(' · ');
  };

  return (
    <form onSubmit={handleSubmit} className="pb-6">
      <div className="create-order-layout gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-[#1F2937] mb-2">Nouvelle commande</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Titre</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex : Foie gras - Quartier centre"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Date limite</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#6B7280] mb-2">Visibilité de la commande</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex-1 min-w-[160px] px-4 py-2 rounded-lg border-2 text-sm transition-colors ${
                    visibility === 'public'
                      ? 'border-[#28C1A5] bg-[#28C1A5]/10 text-[#0F5132]'
                      : 'border-gray-200 text-[#1F2937] hover:border-[#FFD166]'
                  }`}
                >
                  Commande publique
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex-1 min-w-[160px] px-4 py-2 rounded-lg border-2 text-sm transition-colors ${
                    visibility === 'private'
                      ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-[#B45309]'
                      : 'border-gray-200 text-[#1F2937] hover:border-[#FFD166]'
                  }`}
                >
                  Commande privée
                </button>
              </div>
              <p className="text-xs text-[#6B7280] mt-2">
                Les commandes privées restent visibles uniquement dans votre profil.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Part partageur (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <input
                    type="number"
                    value={sharerPercentage}
                    onChange={(e) => setSharerPercentage(Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Poids minimum (kg)</label>
                <input
                  type="number"
                  value={minWeight}
                  onChange={(e) => setMinWeight(Number(e.target.value))}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Poids maximum (kg)</label>
                <input
                  type="number"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(Number(e.target.value))}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Adresse de retrait</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Adresse complète"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Message participants</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ex. Retrait chez moi, à l'adresse enregistrée."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-[#1F2937] text-base font-semibold">Retrait</h3>
                <p className="text-sm text-[#6B7280]">Choisissez les jours et créneaux pour récupérer les commandes.</p>
              </div>
              <div className="text-sm text-[#6B7280]">
                Créneaux actifs : <span className="text-[#FF6B4A] font-semibold">{renderPickupLine()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {pickupSlots.map((slot) => (
                  <div key={slot.day} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSlot(slot.day)}
                      className={`px-3 py-1 rounded-full border text-sm ${
                        slot.enabled
                          ? 'border-[#FF6B4A] bg-[#FFF1ED] text-[#FF6B4A]'
                          : 'border-gray-200 text-[#6B7280]'
                      }`}
                    >
                      {slot.label}
                    </button>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateSlotTime(slot.day, 'start', e.target.value)}
                        className="px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                        disabled={!slot.enabled}
                      />
                      <span>—</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateSlotTime(slot.day, 'end', e.target.value)}
                        className="px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                        disabled={!slot.enabled}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#F9FAFB] rounded-xl border border-gray-200 p-4 text-sm text-[#6B7280] space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
                  <span>Activez les jours où vous pouvez distribuer la commande.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#28C1A5]" />
                  <span>Précisez une plage horaire par jour pour éviter les confusions.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-[#1F2937] mb-4">Produits à inclure</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Glissez les cartes des produits que vous souhaitez inclure dans cette commande.
            </p>

            <div className="space-y-4">
              {Object.entries(groupedByProducer).map(([producerId, group]) => (
                <div key={producerId}>
                  <p className="text-sm text-[#6B7280] mb-2" style={{ fontWeight: 500 }}>
                    {group.producerName}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {group.products.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleProduct(product.id)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                          selectedProducts.includes(product.id)
                            ? 'border-[#28C1A5] shadow-lg'
                            : 'border-gray-200 hover:border-[#FFD166]'
                        }`}
                      >
                        <div className="aspect-square">
                          <ImageWithFallback
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 bg-white">
                          <p className="text-sm text-[#1F2937] truncate">{product.name}</p>
                          <div className="flex items-center justify-between text-xs">
                            <p className="text-[#FF6B4A]">{product.price.toFixed(2)} €</p>
                            <span className="px-2 py-0.5 bg-[#F9FAFB] border border-gray-200 rounded-full text-[#1F2937]">
                              {product.measurement === 'kg' ? 'Kg' : 'Unité'}
                            </span>
                          </div>
                          <p className="text-xs text-[#6B7280]">{product.unit}</p>
                        </div>
                        {selectedProducts.includes(product.id) && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-[#28C1A5] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="create-order-summary self-start">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm w-full">
            <h3 className="text-[#1F2937] mb-4">Récapitulatif</h3>
            {selectedProducts.length === 0 ? (
              <p className="text-sm text-[#6B7280]">Ajoutez des produits pour voir le récapitulatif.</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 text-sm text-[#1F2937]">
                  <p>
                    Poids pris pour la logistique :{' '}
                    <span style={{ fontWeight: 600 }}>{effectiveWeight.toFixed(2)} kg</span>
                  </p>
                  <p>
                    Coût livraison total : <span style={{ fontWeight: 600 }}>{logTotal.toFixed(2)} €</span>
                  </p>
                  <p>
                    Part partageur : <span style={{ fontWeight: 600 }}>{sharerPercentage}%</span>
                  </p>
                  <p>
                    Valeur estimée de la part (pour ce poids) :{' '}
                    <span style={{ fontWeight: 600 }}>{totalShareEffective.toFixed(2)} €</span>
                  </p>
                  <p className="text-[#6B7280]">
                    Prix participant = produit + logistique + part du partageur. Créneaux : {renderPickupLine()}.
                  </p>
                </div>
                <div className="w-full overflow-x-auto border border-gray-200 rounded-lg bg-white">
                  <table className="w-full text-sm table-auto">
                    <thead className="bg-[#F9FAFB] text-[#6B7280]">
                      <tr>
                        <th className="px-3 py-2 text-left">Produit</th>
                        <th className="px-3 py-2 text-center">Type prix</th>
                        <th className="px-3 py-2 text-right">Prix producteur</th>
                        <th className="px-3 py-2 text-right">Coût livraison</th>
                        <th className="px-3 py-2 text-right">Part partageur</th>
                        <th className="px-3 py-2 text-right">Prix participant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perProductRows.map((row) => (
                        <tr key={row.id} className="border-t border-gray-100">
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2 text-center">{row.priceType}</td>
                          <td className="px-3 py-2 text-right">{row.basePrice.toFixed(2)} €</td>
                          <td className="px-3 py-2 text-right">{row.logPerUnit.toFixed(2)} €</td>
                          <td className="px-3 py-2 text-right">{row.sharePerUnit.toFixed(2)} €</td>
                          <td className="px-3 py-2 text-right">{row.participantPrice.toFixed(2)} €</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={selectedProducts.length === 0}
          className="w-full sm:flex-1 py-3 bg-[#FF6B4A] text-white rounded-xl hover:bg-[#FF5A39] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          Créer la commande
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#1F2937] hover:border-[#FF6B4A] transition-colors"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
