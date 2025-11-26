import React from 'react';
import { DeckCard } from '../types';
import { ProductCard } from './ProductCard';
import { Trash2 } from 'lucide-react';

interface DeckViewProps {
  deck: DeckCard[];
  onRemoveFromDeck: (productId: string) => void;
}

export function DeckView({ deck, onRemoveFromDeck }: DeckViewProps) {
  if (deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-24 h-24 rounded-full bg-[#FFD166]/20 flex items-center justify-center mb-4">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 8L28 16H20L24 8Z" fill="#FFD166" />
            <path d="M24 40L28 32H20L24 40Z" fill="#FFD166" />
            <path d="M8 24L16 28V20L8 24Z" fill="#FFD166" />
            <path d="M40 24L32 28V20L40 24Z" fill="#FFD166" />
          </svg>
        </div>
        <h3 className="text-[#1F2937] mb-2">Votre sélection est vide</h3>
        <p className="text-[#6B7280] text-center max-w-sm">
          Ajoutez des produits à votre sélection pour créer une commande groupée entre amis ou voisins.
        </p>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div className="bg-[#FFD166]/10 border border-[#FFD166]/30 rounded-xl p-4">
        <p className="text-sm text-[#1F2937]">
          💡 <span style={{ fontWeight: 500 }}>Astuce :</span> Vous ne pouvez créer une commande qu'avec des produits du même producteur. Glissez les cartes pour préparer votre commande !
        </p>
      </div>

      {Object.entries(groupedByProducer).map(([producerId, group]) => (
        <div key={producerId} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1F2937]">{group.producerName}</h3>
            <span className="text-sm text-[#6B7280]">
              {group.products.length} produit{group.products.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.products.map((card) => (
              <div key={card.id} className="relative">
                <ProductCard product={card} showAddButton={false} />
                <button
                  onClick={() => onRemoveFromDeck(card.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
