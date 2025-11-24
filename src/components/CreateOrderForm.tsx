import React from 'react';
import { DeckCard, Product } from '../types';
import { Calendar, MapPin, Package, Percent } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CreateOrderFormProps {
  deck: DeckCard[];
  onCreateOrder: (order: any) => void;
}

export function CreateOrderForm({ deck, onCreateOrder }: CreateOrderFormProps) {
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);
  const [title, setTitle] = React.useState('');
  const [sharerPercentage, setSharerPercentage] = React.useState(10);
  const [minWeight, setMinWeight] = React.useState(5);
  const [maxWeight, setMaxWeight] = React.useState(20);
  const [deadline, setDeadline] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [pickupAddress, setPickupAddress] = React.useState('15 Rue de la République, 75001 Paris');

  // Group deck by producer
  const groupedByProducer = deck.reduce((acc, card) => {
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

  const handleToggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectedProductsData = deck.filter((p) => selectedProducts.includes(p.id));
  const totalValue = selectedProductsData.reduce((sum, p) => sum + p.price, 0);
  const sharerValue = (totalValue * sharerPercentage) / 100;
  const logisticsCost = 5.0; // Mock value

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      alert('Veuillez sélectionner au moins un produit');
      return;
    }
    onCreateOrder({
      title,
      products: selectedProductsData,
      sharerPercentage,
      minWeight,
      maxWeight,
      deadline: new Date(deadline),
      message,
      pickupAddress,
    });
  };

  if (deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-24 h-24 rounded-full bg-[#FF6B4A]/20 flex items-center justify-center mb-4">
          <Package className="w-12 h-12 text-[#FF6B4A]" />
        </div>
        <h3 className="text-[#1F2937] mb-2">Aucun produit dans votre deck</h3>
        <p className="text-[#6B7280] text-center max-w-sm">
          Ajoutez des produits à votre deck depuis le feed pour créer une commande groupée
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-[#1F2937] mb-4">Nouvelle commande</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#6B7280] mb-2">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Foie gras – Quartier centre"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                Date limite
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                Part partageur (%)
              </label>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                Poids minimum (kg)
              </label>
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
              <label className="block text-sm text-[#6B7280] mb-2">
                Poids maximum (kg)
              </label>
              <input
                type="number"
                value={maxWeight}
                onChange={(e) => setMaxWeight(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#6B7280] mb-2">
              Message participants
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex. Retrait chez moi, à l'adresse enregistrée."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Product Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-[#1F2937] mb-4">Produits à inclure</h3>
        <p className="text-sm text-[#6B7280] mb-4">
          Glissez les cartes des produits que vous souhaitez inclure dans cette commande
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
                    onClick={() => handleToggleProduct(product.id)}
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
                      <p className="text-xs text-[#FF6B4A]">{product.price.toFixed(2)} €</p>
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

      {/* Summary */}
      {selectedProducts.length > 0 && (
        <div className="bg-[#F9FAFB] rounded-xl p-6 border border-gray-200">
          <h3 className="text-[#1F2937] mb-4">Récap</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Poids pris pour la logistique :</span>
              <span className="text-[#1F2937]" style={{ fontWeight: 500 }}>{totalValue.toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Coût logistique total :</span>
              <span className="text-[#1F2937]" style={{ fontWeight: 500 }}>{logisticsCost.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Part partageur :</span>
              <span className="text-[#1F2937]" style={{ fontWeight: 500 }}>{sharerPercentage} %</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
              <span className="text-[#1F2937]" style={{ fontWeight: 500 }}>
                Valeur estimée de la part (pour ce poids) :
              </span>
              <span className="text-[#FF6B4A]" style={{ fontWeight: 600 }}>
                {sharerValue.toFixed(2)} €
              </span>
            </div>
            <p className="text-xs text-[#6B7280] pt-2">
              Prix client = produit + logistique + part du partageur.
            </p>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={selectedProducts.length === 0}
        className="w-full py-3 bg-[#FF6B4A] text-white rounded-xl hover:bg-[#FF5A39] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
      >
        Créer la commande
      </button>
    </form>
  );
}
