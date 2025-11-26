import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProducerProductsViewProps {
  products: Product[];
}

export function ProducerProductsView({ products }: ProducerProductsViewProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center space-y-2">
        <p className="text-sm text-[#6B7280]">Vous n'avez pas encore listé de produits.</p>
        <p className="text-sm text-[#FF6B4A]">Ajoutez votre première référence pour être visible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showAddButton={false}
          />
        ))}
      </div>
    </div>
  );
}
