import React from 'react';
import { Product } from '../types';
import { Check, MapPin, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ClientSwipeViewProps {
  products: Product[];
  onSave: (product: Product) => void;
  locationLabel?: string;
}

export function ClientSwipeView({ products, onSave, locationLabel }: ClientSwipeViewProps) {
  const [index, setIndex] = React.useState(0);

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center space-y-3">
        <p className="text-sm text-[#6B7280]">Aucun produit disponible dans votre zone pour l'instant.</p>
        <p className="text-sm text-[#FF6B4A]">Réessayez un peu plus tard ou ajustez votre position.</p>
      </div>
    );
  }

  const current = products[index % products.length];

  const moveNext = () => {
    setIndex((prev) => (prev + 1) % products.length);
  };

  const handleSave = () => {
    onSave(current);
    moveNext();
  };

  const handleSkip = () => {
    moveNext();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="relative h-72">
          <ImageWithFallback
            src={current.imageUrl}
            alt={current.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs text-white/80">
                <MapPin className="w-4 h-4 text-white/80" />
                {locationLabel ?? 'À proximité de vous'}
              </p>
              <h3 className="text-2xl font-semibold text-[#1F2937]">{current.name}</h3>
            </div>
            <span className="px-3 py-1 border border-white/40 rounded-full text-xs text-white/80 bg-black/30">
              {current.measurement === 'kg' ? 'Kg' : 'Unité'}
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">{current.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-[#FF6B4A]" style={{ fontWeight: 600 }}>
                {current.price.toFixed(2)} €
              </p>
              <p className="text-xs text-[#6B7280]">{current.unit}</p>
            </div>
            <span className="px-3 py-1 text-xs text-[#1F2937] bg-[#F9FAFB] border border-gray-200 rounded-full">
              {current.producerName}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-around">
        <button
          type="button"
          onClick={handleSkip}
          className="flex flex-col items-center gap-1 text-[#6B7280]"
        >
          <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center">
            <X className="w-6 h-6" />
          </div>
          <span className="text-xs">Passer</span>
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex flex-col items-center gap-1 text-[#FF6B4A]"
        >
          <div className="w-14 h-14 bg-[#FF6B4A]/20 text-[#FF6B4A] rounded-full shadow-lg flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
          <span className="text-xs">J'aime</span>
        </button>
      </div>
    </div>
  );
}
