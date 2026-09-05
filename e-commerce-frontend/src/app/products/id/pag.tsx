'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProductById } from '@/services/product';
import { addCartItem } from '@/services/cart';
import { addToWishlist } from '@/services/wishlist';
import { ProductDetails, ProductVariant } from '@/types/domains/product';
import Image from 'next/image';

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<ProductDetails | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await getProductById(Number(id));
                if (response.success && response.data) {
                    const productData = response.data;
                    setProduct(productData);
                    if (productData.images && productData.images.length > 0) {
                        setSelectedImage(productData.images[0].imageUrl);
                    }
                    if (productData.variants && productData.variants.length > 0) {
                        setSelectedVariant(productData.variants[0] as unknown as ProductVariant);
                    }
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleAddToCart = async () => {
        if (selectedVariant) {
            try {
                await addCartItem({
                    productVariantId: selectedVariant.productVariantId,
                    quantity: 1
                });
                // Could show a success toast here
            } catch (error) {
                console.error('Error adding to cart:', error);
            }
        }
    };

    const handleAddToWishlist = async () => {
        if (selectedVariant) {
            try {
                await addToWishlist(selectedVariant.productVariantId);
                // Could show a success toast here
            } catch (error) {
                console.error('Error adding to wishlist:', error);
            }
        }
    };

    if (!product) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square overflow-hidden rounded-lg border">
                        {selectedImage ? (
                            <Image
                                src={selectedImage}
                                alt={product.title}
                                width={500}
                                height={500}
                                className="w-full h-full object-cover"
                            />
                        ) : null}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {product.images.map((image) => (
                            <div
                                key={image.productImageId}
                                className={`aspect-square overflow-hidden rounded-md border cursor-pointer
                  ${selectedImage === image.imageUrl ? 'ring-2 ring-primary' : ''}`}
                                onClick={() => setSelectedImage(image.imageUrl)}
                            >
                                <Image
                                    src={image.imageUrl}
                                    alt={product.title}
                                    width={100}
                                    height={100}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                        <p className="text-gray-600">{product.description}</p>
                    </div>

                    {/* Variants */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Variant</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                                {product.variants.map((variant) => (
                                    <Button
                                        key={variant.productVariantId}
                                        variant={selectedVariant?.productVariantId === variant.productVariantId ? 'default' : 'outline'}
                                        onClick={() => setSelectedVariant(variant as unknown as ProductVariant)}
                                        disabled={variant.disabled || variant.quantityInStock === 0}
                                    >
                                        ${variant.price}
                                        {Object.values((variant as unknown as { variantProperties: Record<string, { variationOptionId: number; name: string }> }).variantProperties || {}).map((option) => (
                                            <span key={option.variationOptionId}> - {option.name}</span>
                                        ))}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button
                            size="lg"
                            onClick={handleAddToCart}
                            disabled={!selectedVariant || selectedVariant.quantityInStock === 0}
                        >
                            Add to Cart
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleAddToWishlist}
                            disabled={!selectedVariant}
                        >
                            Add to Wishlist
                        </Button>
                    </div>

                    {/* Stock Status */}
                    {selectedVariant && (
                        <div className="text-sm">
                            {selectedVariant.quantityInStock > 0 ? (
                                <span className="text-green-600">{selectedVariant.quantityInStock} in stock</span>
                            ) : (
                                <span className="text-red-600">Out of stock</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}