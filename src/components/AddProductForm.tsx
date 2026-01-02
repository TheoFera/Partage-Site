import React from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CreateProductPayload, Product, ProductDetail } from '../types';
import { ProductDetailView } from './ProductDetailView';
import { PRODUCT_CATEGORIES } from '../constants/productCategories';

interface AddProductFormProps {
  onAddProduct: (payload: CreateProductPayload) => void;
  supabaseClient?: SupabaseClient | null;
}

export function AddProductForm({ onAddProduct, supabaseClient }: AddProductFormProps) {
  const blankProduct = React.useMemo<Product>(
    () => ({
      id: 'draft',
      name: '',
      description: '',
      price: 0,
      unit: 'kg',
      category: '',
      imageUrl: '',
      producerId: 'current-user',
      producerName: 'Ma Ferme',
      producerLocation: 'A proximite',
      inStock: false,
      measurement: 'kg',
    }) as Product,
    []
  );

  const blankDetail = React.useMemo<ProductDetail>(
    () => ({
      productId: blankProduct.id,
      name: '',
      category: '',
      shortDescription: '',
      longDescription: '',
      producer: {
        id: blankProduct.producerId,
        name: blankProduct.producerName,
        city: blankProduct.producerLocation,
      },
      productions: [],
      repartitionValeur: { mode: 'estimatif', uniteReference: 'kg', postes: [] },
    }),
    [blankProduct]
  );

  return (
    <ProductDetailView
      mode="create"
      product={blankProduct}
      detail={blankDetail}
      ordersWithProduct={[]}
      isOwner
      supabaseClient={supabaseClient ?? null}
      onShare={() => {}}
      onCreateOrder={() => {}}
      onParticipate={() => {}}
      onCreateProduct={onAddProduct}
      categoryOptions={PRODUCT_CATEGORIES}
    />
  );
}
