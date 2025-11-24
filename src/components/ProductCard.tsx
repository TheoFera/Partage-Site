import React from 'react';
import { Product } from '../types';
import { Heart, MapPin, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onAddToDeck?: (product: Product) => void;
  inDeck?: boolean;
  showAddButton?: boolean;
}

export function ProductCard({ product, onAddToDeck, inDeck = false, showAddButton = true }: ProductCardProps) {
  const [liked, setLiked] = React.useState(false);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {showAddButton && (
          <button
            onClick={() => onAddToDeck?.(product)}
            disabled={inDeck}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
              inDeck
                ? 'bg-[#28C1A5] text-white'
                : 'bg-white text-[#FF6B4A] hover:bg-[#FF6B4A] hover:text-white'
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-[#1F2937] mb-1">{product.name}</h3>
            <p className="text-sm text-[#6B7280] mb-2">{product.description}</p>
          </div>
        </div>

        {/* Producer info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#FFD166] flex items-center justify-center text-xs">
            {product.producerName.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#1F2937]">{product.producerName}</p>
            <div className="flex items-center gap-1 text-xs text-[#6B7280]">
              <MapPin className="w-3 h-3" />
              <span>{product.producerLocation}</span>
            </div>
          </div>
        </div>

        {/* Price and stock */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg text-[#FF6B4A]" style={{ fontWeight: 600 }}>
              {product.price.toFixed(2)} €
            </p>
            <p className="text-xs text-[#6B7280]">{product.unit}</p>
          </div>
          <div className="flex items-center gap-3">
            {product.inStock ? (
              <span className="text-xs text-[#28C1A5] bg-[#28C1A5]/10 px-2 py-1 rounded-full">
                En stock
              </span>
            ) : (
              <span className="text-xs text-[#6B7280] bg-gray-100 px-2 py-1 rounded-full">
                Rupture
              </span>
            )}
            <button
              onClick={() => setLiked(!liked)}
              className="text-[#FF6B4A]"
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
