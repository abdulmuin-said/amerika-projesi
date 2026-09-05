"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NotificationCard from '@/app/components/NotificationCard';
import { Product } from '@/types/domains/product';
import { FaShoppingCart } from 'react-icons/fa';

const ProductGrid: React.FC<{
  products: Product[];
  onProductClick: (productId: number) => void;
}> = ({ products, onProductClick }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});
  const [showNotification, setShowNotification] = useState(false);
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);

  const getProductImage = (productId: number) => {
    // Use images from public/product-image directory
    return `/product-image/canvas${productId % 4 + 1}.jpg`;
  };

  const handleImageError = (productId: string) => {
    setImageError(prev => ({ ...prev, [productId]: true }));
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setAddedProduct(product);
    setShowNotification(true);
  };

  const handleViewCart = () => {
    router.push('/cart');
  };

  return (
    <>
      <div className="px-4 lg:w-3/4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div 
              key={product.productId} 
              className="group relative cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden" 
              onClick={() => onProductClick(product.productId)}
            >
              <div className="relative overflow-hidden">
                {product.variants.length > 1 && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 text-xs font-semibold z-10 rounded-full shadow-md">
                    SALE
                  </div>
                )}
                <div className="aspect-w-4 aspect-h-5 h-[300px]">
                  {imageError[product.productId] ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-500 p-4">
                      <div className="text-center">
                        <div className="text-6xl mb-2">🎨</div>
                        <div className="text-sm text-gray-600">{product.title}</div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={getProductImage(product.productId)}
                      alt={product.title}
                      width={400}
                      height={500}
                      className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-110"
                      onError={() => handleImageError(product.productId.toString())}
                      priority={product.productId <= 4}
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-lg font-semibold">{product.title}</h3>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <h3 className="text-gray-900 font-medium text-lg transition-colors duration-200 group-hover:text-blue-600">
                  {product.title}
                </h3>
                <div className="space-y-3">
                  <span className="block font-semibold text-gray-900 text-lg">
                    ${Math.min(...product.variants.map((v: { price: number }) => v.price)).toFixed(2)} - ${Math.max(...product.variants.map((v: { price: number }) => v.price)).toFixed(2)}
                  </span>
                  <button 
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium 
                             transform transition-all duration-300 
                             hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    <FaShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NotificationCard
        message={addedProduct ? `${addedProduct.title} added to cart` : ''}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        action={{
          label: "View Cart",
          onClick: handleViewCart
        }}
      />
    </>
  );
};

export default ProductGrid;