import React from 'react';
import { Product } from '../types';
import { Upload } from 'lucide-react';

interface AddProductFormProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
}

export function AddProductForm({ onAddProduct }: AddProductFormProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [unit, setUnit] = React.useState('kg');
  const [quantity, setQuantity] = React.useState('');
  const [category, setCategory] = React.useState('Légumes');
  const [imageUrl, setImageUrl] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      name,
      description,
      price: parseFloat(price),
      unit,
      quantity: parseInt(quantity),
      category,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YWJsZXN8ZW58MXx8fHwxNzYzOTY4NTk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      producerId: 'current-user',
      producerName: 'Ma Ferme',
      producerLocation: 'À proximité',
      inStock: true,
    });
    // Reset form
    setName('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setImageUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-[#1F2937] mb-6">Ajouter un produit</h2>

        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm text-[#6B7280] mb-2">
              Photo du produit
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#FF6B4A] transition-colors">
              <Upload className="w-10 h-10 text-[#6B7280] mx-auto mb-2" />
              <p className="text-sm text-[#6B7280] mb-2">
                Cliquez pour télécharger ou glissez une image
              </p>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Ou collez l'URL d'une image"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A] text-center"
              />
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm text-[#6B7280] mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tomates anciennes"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-[#6B7280] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre produit..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A] resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-[#6B7280] mb-2">
              Catégorie *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
              required
            >
              <option value="Légumes">Légumes</option>
              <option value="Fruits">Fruits</option>
              <option value="Fromages">Fromages</option>
              <option value="Viandes">Viandes</option>
              <option value="Épicerie">Épicerie</option>
              <option value="Boulangerie">Boulangerie</option>
            </select>
          </div>

          {/* Price and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                Prix (€) *
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                Unité *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                required
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="pièce">pièce</option>
                <option value="lot">lot</option>
              </select>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm text-[#6B7280] mb-2">
              Quantité disponible *
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-6 py-3 bg-[#FF6B4A] text-white rounded-xl hover:bg-[#FF5A39] transition-colors shadow-lg"
        >
          Publier le produit
        </button>
      </div>
    </form>
  );
}
