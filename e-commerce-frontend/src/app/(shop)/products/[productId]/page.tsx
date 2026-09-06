/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Product, ProductDetails, ProductImage } from "@/types/domains/product"
import { Button } from "@/components/ui/button"
import { Variation } from "@/types/domains/variation";
import { ProductReviews } from "../Components/ProductReviews";
import { ProductQA } from "../Components/ProductQA";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types/domains/user";
import ProductCard from "@/app/components/ProductCard";
import * as productServices from "@/services/product";
import * as variationServices from "@/services/variation";
import * as categoryServices from "@/services/category";
import * as shippingMethodServices from "@/services/shippingMethod";
import useDataFetch from "@/hooks/use-data-fetch";
import { addToCart } from "@/store/slices/cartSlice";
import { setBuyNowItem } from "@/store/slices/buyNowSlice";
import { toast } from "sonner";
import CartToast from "@/app/components/CartToast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPromotionForProduct, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PromotionDetails } from "@/types/domains/promotion";
import { ChevronRight, ChevronLeft, Home, Heart, ZoomIn, Truck, ChevronDown, Loader2 } from "lucide-react";
import { Rating, RatingButton } from "@/components/ui/rating";
import { CategoryDetails } from "@/types/domains/category";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addToWishlistAsync, removeFromWishlistAsync } from "@/store/slices/wishlistSlice";
import { ProductDetailPaymentTrustBox } from "@/app/components/PaymentBadges";
import { useLocalization } from "@/lib/useLocalization";

type VariationMap = {
    [variationId: number]: {
        variationName: string;
        selectedOptionId?: number;
        options: {
            [variationOptionId: number]: {
                name: string;
                priceRange: [number, number];
            }
        };
    }
};

type VariantSelectionState = {
    priceRange: [number, number];
    variationMap: VariationMap;
};


const GENERIC_PRODUCT_DETAILS = [
    { key: "SIZE",      value: "Please check variations for large wall painting on canvas for home decoration." },
    { key: "MATERIAL",  value: "Cotton canvas streched on wooden bars for long life." },
    { key: "USAGE",     value: "Decorate your walls in style and luxury with our big size paintings for living room walls, bedroom furnishing or adorn your office reception area or boss cabin wall." },
    { key: "MATERIALS", value: "Good quality canvas printed to last for years to come, non fading. Stretched on real wood to make a complete framed art piece." },
    { key: "DETAILS",   value: "Make a bold statement with this exquisite painting, designed to enhance the ambiance of any room. Made from the finest materials, it showcases rich, vibrant colors that are both eye-catching and long-lasting. Perfect for home or office use, it brings a touch of elegance to any space, from living rooms to hotel lobbies." },
];

const GENERIC_PRODUCT_DETAILS_TR = [
    { key: "EBAT",      value: "Evinizin dekorasyonu için kanvas tablonun farklı boyut seçeneklerini varyasyonlardan inceleyebilirsiniz." },
    { key: "MALZEME",   value: "Uzun ömürlü ve dayanıklı masif ahşap şasi üzerine gerilmiş %100 pamuklu kanvas kumaş." },
    { key: "KULLANIM",  value: "Salon, yatak odası, ofis, otel veya çalışma alanlarınızın duvarlarını modern sanatla taçlandırın." },
    { key: "BASKI",     value: "Yüksek çözünürlüklü UV korumalı solmayan pigment baskı ile canlı ve parlak renkler." },
    { key: "DETAY",     value: "Her mekâna lüks ve estetik katmak için özenle üretilmiştir. El işçiliği germe şasi ile duvara asılmaya hazır halde gönderilir." },
];

export default function ProductDetailsPage({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = React.use(params);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { formatPrice, getLocalizedTitle, getLocalizedDescription, locale, currency } = useLocalization();

    const getProductByIdFetch = useDataFetch(productServices.getProductById);
    const getAllProductsFetch = useDataFetch(productServices.getAllProducts);
    const getAllVariationsFetch = useDataFetch(variationServices.getAllVariations);
    const getCategoryByIdFetch = useDataFetch(categoryServices.getCategoryById);
    const getShippingMethodFetch = useDataFetch(shippingMethodServices.getShippingMethodByVariantId);

    const [product, setProduct] = useState<Product | null>(null);
    const [productRating, setProductRating] = useState<{ averageRating: number; reviewCount: number }>({ averageRating: 0, reviewCount: 0 });
    const [variations, setVariations] = useState<{ [variationId: number]: Omit<Variation, "variationOptions"> }>({});
    const [activeImage, setActiveImage] = useState<ProductImage | null>(null);
    const [categoryPath, setCategoryPath] = useState<{ id: number; name: string }[]>([]);
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [attrsExpanded, setAttrsExpanded] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);
    const swipeTouchStartX = useRef<number | null>(null);
    const swipeTouchStartY = useRef<number | null>(null);

    const [{ priceRange, variationMap }, setVariantSelectionState] = useState<VariantSelectionState>({
        priceRange: [0, 0],
        variationMap: {},
    });

    const initializeVariantSelectionState = useCallback((): VariantSelectionState => {
        const initialPriceRange: [number, number] = [Infinity, -Infinity];
        const initialVariationMap = (product?.variants || []).filter(v => !v.disabled).reduce((acc, cur) => {
            initialPriceRange[0] = Math.min(initialPriceRange[0], cur.price);
            initialPriceRange[1] = Math.max(initialPriceRange[1], cur.price);

            cur.variationOptions.forEach(opt => {
                const variationName = variations[opt.variationId]?.name || `Variation ${opt.variationId}`;
                const variation = acc[opt.variationId] = acc[opt.variationId] ?? {
                    variationName: variationName,
                    options: {}
                };
                const variationOption = variation.options[opt.variationOptionId] = variation.options[opt.variationOptionId] ?? {
                    name: opt.name,
                    priceRange: [cur.price, cur.price],
                };
                variationOption.priceRange = [
                    Math.min(variationOption.priceRange[0], cur.price),
                    Math.max(variationOption.priceRange[1], cur.price)
                ];
            });
            return acc;
        }, {} as VariationMap);

        return {
            priceRange: initialPriceRange,
            variationMap: initialVariationMap,
        };
    }, [product, variations]);

    const onSelectVariation = useCallback((variationId: number, optionId: number) => {
        setAttemptedSubmit(false);
        setVariantSelectionState(prev => {
            const { variationMap: currentVarMap } = prev;
            const newPriceRange: [number, number] = [Infinity, -Infinity];
            currentVarMap[variationId].selectedOptionId = optionId;
            const optionsIncluded: { [varOptId: number]: boolean } = {};
            for (const v of Object.values(currentVarMap)) {
                for (const _optId of Object.keys(v.options)) {
                    const optId = Number(_optId);
                    optionsIncluded[optId] = optionsIncluded[optId] ?? (
                        v.selectedOptionId === undefined || v.selectedOptionId === optId
                    );
                }
            }

            const newVariationMap = (product?.variants || []).filter(v => !v.disabled)
                .reduce((newVarMap, currentVariant) => {
                    const variantOptionsIncluded: { [varOptId: number]: boolean } = {};
                    let i = 0;
                    let acc = true;
                    while (i < currentVariant.variationOptions.length) {
                        const opt = currentVariant.variationOptions[i];
                        variantOptionsIncluded[opt.variationOptionId] = acc;
                        acc = acc && optionsIncluded[opt.variationOptionId];
                        i++;
                    }
                    i--;
                    acc = true;
                    while (i >= 0) {
                        const opt = currentVariant.variationOptions[i];
                        variantOptionsIncluded[opt.variationOptionId] = variantOptionsIncluded[opt.variationOptionId] && acc;
                        acc = acc && optionsIncluded[opt.variationOptionId];
                        i--;
                    }

                    if (acc) {
                        newPriceRange[0] = Math.min(newPriceRange[0], currentVariant.price);
                        newPriceRange[1] = Math.max(newPriceRange[1], currentVariant.price);
                    }

                    currentVariant.variationOptions
                        .forEach(opt => {
                            if (!variantOptionsIncluded[opt.variationOptionId])
                                return;

                            const variation = newVarMap[opt.variationId] = opt.variationId in newVarMap ?
                                newVarMap[opt.variationId] : {
                                    ...currentVarMap[opt.variationId],
                                    options: {}
                                };
                            if (opt.variationOptionId in variation.options) {
                                const variationOption = variation.options[opt.variationOptionId];
                                variationOption.priceRange[0] = Math.min(
                                    variationOption.priceRange[0],
                                    currentVariant.price
                                );
                                variationOption.priceRange[1] = Math.max(
                                    variationOption.priceRange[1],
                                    currentVariant.price
                                );
                            } else {
                                variation.options[opt.variationOptionId] = {
                                    name: opt.name,
                                    priceRange: [currentVariant.price, currentVariant.price]
                                };
                            }
                        });

                    return newVarMap;
                }, {} as VariationMap);

            return {
                priceRange: newPriceRange,
                variationMap: newVariationMap,
            };
        });
    }, [product]);

    // Build category breadcrumb path from CategoryDetails (recursive parent chain)
    const buildCategoryPath = (cat: CategoryDetails): { id: number; name: string }[] => {
        const path: { id: number; name: string }[] = [];
        let current: CategoryDetails | undefined = cat;
        while (current) {
            path.unshift({ id: current.categoryId, name: current.name });
            current = current.parentCategory;
        }
        return path;
    };

    // Fetch product data
    useEffect(() => {
        if (productId) {
            getProductByIdFetch.request(Number(productId))
                .onSuccess((data: ProductDetails) => {
                    const transformedProduct: any = {
                        ...data,
                        productImages: data.images,
                        variants: data.variants.map(variant => ({
                            ...variant,
                            variationOptions: Object.entries(variant.variantProperties).map(([variationId, prop]) => ({
                                variationId: Number(variationId),
                                variationOptionId: prop.variationOptionId,
                                name: prop.name
                            }))
                        }))
                    };

                    setProduct(transformedProduct);
                    setProductRating({
                        averageRating: data.averageRating ?? 0,
                        reviewCount: data.reviewCount ?? 0,
                    });

                    const defaultImg = transformedProduct.productImages?.find((img: ProductImage) => img.isDefault) ?? transformedProduct.productImages?.[0];
                    if (defaultImg) setActiveImage(defaultImg);

                    // Fire variations, related products, and category breadcrumb in parallel
                    getAllVariationsFetch.request(data.categoryId)
                        .onSuccess((variationsData: Variation[]) => {
                            const variationMap = variationsData.reduce((acc, variation) => {
                                acc[variation.variationId] = {
                                    variationId: variation.variationId,
                                    name: variation.name
                                };
                                return acc;
                            }, {} as { [variationId: number]: Omit<Variation, "variationOptions"> });
                            setVariations(variationMap);
                        });

                    getAllProductsFetch.request({ categoryId: data.categoryId, status: true, limit: 4, excludeProductId: data.productId });

                    getCategoryByIdFetch.request(data.categoryId)
                        .onSuccess((cat: CategoryDetails) => {
                            setCategoryPath(buildCategoryPath(cat));
                        });
                });
        }
    }, [productId]);

    useEffect(() => {
        if (product) {
            setVariantSelectionState(initializeVariantSelectionState());
        }
    }, [product, variations, initializeVariantSelectionState]);

    useEffect(() => {
        if (product?.productImages?.length && !activeImage) {
            const defaultImg = product.productImages.find((img: ProductImage) => img.isDefault) ?? product.productImages[0];
            if (defaultImg) setActiveImage(defaultImg);
        }
    }, [product, activeImage]);


    const { user, authenticated } = useAppSelector(state => state.auth);
    const isCustomer = user?.roleName === UserRole.CUSTOMER;
    const currentCustomerId = isCustomer ? user?.userId : undefined;
    const promotions = useAppSelector((state) => state.promotions.items);

    const calculateDiscountedPrice = useCallback((price: number, promo: PromotionDetails | null): number => {
        if (!promo) return price;
        if (promo.promotionType === "PERCENTAGE") {
            return price * (1 - promo.discountValue / 100);
        }
        return Math.max(price - promo.discountValue, 0);
    }, []);

    const productPromo = useMemo(() => {
        if (!product?.categoryId) return null;
        const productPreview = {
            productId: product.productId,
            productVariantId: product.variants[0]?.productVariantId || 0,
            categoryId: product.categoryId,
            price: priceRange[0],
            title: product.title,
            code: product.code,
            rating: productRating.averageRating,
            starred: product.starred,
            dateAdded: new Date(product.dateAdded),
            quantityInStock: product.variants[0]?.quantityInStock || 0,
            imageUrl: product.productImages[0]?.imageUrl || "",
            images: product.productImages.map(img => img.imageUrl),
        };
        return getPromotionForProduct(productPreview, promotions);
    }, [product, promotions, priceRange, productRating]);

    const enabledVariants = useMemo(() => product?.variants.filter(v => !v.disabled) ?? [], [product]);

    const selectedVariant = useMemo(() => {
        if (!enabledVariants.length) return null;
        if (Object.keys(variationMap).length === 0) {
            return enabledVariants[0];
        }
        const allVariationsSelected = Object.values(variationMap).every(
            (variation) => variation.selectedOptionId != null
        );
        if (!allVariationsSelected) return null;
        return enabledVariants.find((variant) =>
            variant.variationOptions.every((opt) =>
                variationMap[opt.variationId]?.selectedOptionId === opt.variationOptionId
            )
        ) || null;
    }, [enabledVariants, variationMap]);

    useEffect(() => { setQuantity(1); }, [selectedVariant?.productVariantId]);

    const shippingVariantId = selectedVariant?.productVariantId ?? enabledVariants[0]?.productVariantId;
    useEffect(() => {
        if (shippingVariantId) {
            getShippingMethodFetch.request(shippingVariantId);
        }
    }, [shippingVariantId]);

    const totalPrice = useMemo(() => {
        return selectedVariant?.price ?? (priceRange[0] === priceRange[1] ? priceRange[0] : null);
    }, [selectedVariant, priceRange]);

    const discountedPrice = useMemo(() => {
        if (totalPrice === null) return null;
        return calculateDiscountedPrice(totalPrice, productPromo);
    }, [totalPrice, productPromo, calculateDiscountedPrice]);

    const discountedPriceRange = useMemo(() => {
        if (!productPromo) return priceRange;
        return [
            calculateDiscountedPrice(priceRange[0], productPromo),
            calculateDiscountedPrice(priceRange[1], productPromo)
        ] as [number, number];
    }, [priceRange, productPromo, calculateDiscountedPrice]);

    const getSelectedVariant = useCallback(() => selectedVariant, [selectedVariant]);

    const relatedProducts = useMemo(() => getAllProductsFetch.data ?? [], [getAllProductsFetch.data]);

    const currentImageIndex = useMemo(() =>
        product ? product.productImages.findIndex(img => img.productImageId === activeImage?.productImageId) : -1,
    [product, activeImage]);

    const cartToastConfig = useMemo(() => ({
        id: "cart-toast" as const,
        position: "bottom-left" as const,
        closeButton: false,
        style: {
            display: "block" as const,
            padding: "0px",
            width: "min(500px, calc(100vw - 24px))",
            maxWidth: "500px",
            height: "auto",
        },
        dismissible: false,
        duration: Infinity,
    }), []);

    const handleAddToCart = useCallback(async () => {
        if (!authenticated) {
            toast.error("Please login to add items to cart");
            router.push(`/auth/login?returnUrl=${encodeURIComponent(`/products/${productId}`)}`);
            return;
        }
        const variant = getSelectedVariant();
        if (!variant) {
            setAttemptedSubmit(true);
            toast.error("Please select all product options");
            return;
        }
        setIsAddingToCart(true);
        try {
            const imageId = activeImage?.productImageId ?? product?.productImages?.[0]?.productImageId;
            await dispatch(addToCart({ productVariantId: variant.productVariantId, quantity, productImageId: imageId }));
            if (!toast.getToasts().find((t) => t.id === "cart-toast")) {
                toast(CartToast, cartToastConfig);
            }
        } finally {
            setIsAddingToCart(false);
        }
    }, [authenticated, getSelectedVariant, dispatch, router, cartToastConfig, productId, activeImage, product, quantity]);

    const handleBuyNow = useCallback(async () => {
        if (!authenticated) {
            toast.error("Please login to place an order");
            router.push(`/auth/login?returnUrl=${encodeURIComponent(`/products/${productId}`)}`);
            return;
        }
        const variant = getSelectedVariant();
        if (!variant) {
            setAttemptedSubmit(true);
            toast.error("Please select all product options");
            return;
        }
        setIsBuyingNow(true);
        dispatch(setBuyNowItem({
            cartItemId: -1,
            productVariantId: variant.productVariantId,
            title: product?.title ?? "",
            sku: variant.sku ?? "",
            price: variant.price,
            quantity,
            quantityInStock: variant.quantityInStock ?? 99,
            imageUrl: activeImage?.imageUrl ?? product?.productImages?.[0]?.imageUrl,
            addedAt: new Date(),
        }));
        router.push("/checkout?mode=buynow");
    }, [authenticated, getSelectedVariant, dispatch, router, productId, product, activeImage]);

    // Stock status helper
    const stockStatus = useMemo(() => {
        const qty = selectedVariant?.quantityInStock ?? enabledVariants.reduce((sum, v) => sum + v.quantityInStock, 0);
        if (qty === 0) return { label: "Out of Stock", color: "text-destructive" };
        if (qty <= 5) return { label: `Only ${qty} left!`, color: "text-amber-500" };
        return { label: "In Stock", color: "text-green-600" };
    }, [selectedVariant, enabledVariants]);

    const isOutOfStock = stockStatus.label === "Out of Stock";
    const maxQty = selectedVariant?.quantityInStock ?? 99;

    // Computed product spec rows for the details table
    const productSpecRows = useMemo(() => {
        // Size: prefer a variation whose name contains "size", else first variation
        const allVariations = Object.values(variationMap);
        const sizeVariation = allVariations.find(v =>
            v.variationName.toLowerCase().includes('size')
        ) ?? allVariations[0];
        const sizeVal = sizeVariation?.selectedOptionId != null
            ? (sizeVariation.options[sizeVariation.selectedOptionId]?.name ?? null)
            : null;

        // Orientation: parse two leading numbers from the size string
        let orientationVal = '—';
        if (sizeVal) {
            const nums = sizeVal.match(/\d+(\.\d+)?/g)?.map(Number);
            if (nums && nums.length >= 2) {
                const [w, h] = nums;
                orientationVal = w === h ? 'Square' : w > h ? 'Landscape' : 'Portrait';
            }
        }

        // Material: most specific category (last in breadcrumb path)
        const material = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].name : '—';

        return [
            { label: 'Size',               value: sizeVal ?? '—' },
            { label: 'Material',           value: material },
            { label: 'Product Dimensions', value: sizeVal ?? '—' },
            { label: 'Number of Items',    value: '1' },
            { label: 'Orientation',        value: orientationVal },
            { label: 'Shape',              value: 'Rectangle' },
            { label: 'Theme',              value: '—' },
            { label: 'Frame Type',         value: 'Framed / Unframed' },
            { label: 'Wall Art Form',      value: 'Art Print' },
        ];
    }, [variationMap, categoryPath]);

    // TODO: dynamic per-product description parsing — wire up when needed
    // const descItems = useMemo(() => {
    //     if (!product?.description) return [];
    //     return product.description
    //         .split('\n')
    //         .map(l => l.trim())
    //         .filter(l => l && !/^about this item$/i.test(l))
    //         .map(line => {
    //             const m = line.match(/^([A-Z][A-Z\s]+):\s*(.+)$/);
    //             return m
    //                 ? { key: m[1] as string | null, value: m[2] }
    //                 : { key: null as string | null, value: line };
    //         });
    // }, [product?.description]);

    // Wishlist
    const wishlistItems = useAppSelector(state => state.wishlist.items);
    const wishlistEntry = wishlistItems.find(item =>
        product?.variants.some(v => v.productVariantId === item.productVariant.productVariantId)
    );
    const isInWishlist = !!wishlistEntry;
    const wishlistVariantId = selectedVariant?.productVariantId ?? enabledVariants[0]?.productVariantId;

    const handleWishlistToggle = useCallback(async () => {
        if (!authenticated) {
            toast.error("Please login to add items to wishlist");
            return;
        }
        if (isInWishlist && wishlistEntry?.wishlistItemId) {
            await dispatch(removeFromWishlistAsync(wishlistEntry.wishlistItemId));
            toast.success("Removed from wishlist");
        } else if (wishlistVariantId) {
            await dispatch(addToWishlistAsync(wishlistVariantId));
            toast.success("Added to wishlist");
        }
    }, [authenticated, isInWishlist, wishlistEntry, wishlistVariantId, dispatch]);

    // Loading skeleton
    if (getProductByIdFetch.isLoading) {
        return (
            <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 py-6">
                {/* Breadcrumb skeleton */}
                <div className="flex items-center gap-2 mb-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                            {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Image skeleton */}
                    <div className="space-y-4">
                        <div className="h-96 md:h-[500px] bg-muted animate-pulse rounded-md" />
                        <div className="flex gap-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-20 w-20 bg-muted animate-pulse rounded-md" />)}
                        </div>
                    </div>
                    {/* Info skeleton */}
                    <div className="space-y-4">
                        <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
                        <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                        <div className="space-y-2">
                            {[1, 2].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}
                        </div>
                        <div className="h-10 bg-muted animate-pulse rounded w-1/3" />
                        <div className="space-y-3">
                            <div className="h-12 bg-muted animate-pulse rounded" />
                            <div className="h-12 bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (getProductByIdFetch.hasError || !product) {
        return (
            <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                        <p className="text-muted-foreground mb-4">{"The product you're looking for doesn't exist."}</p>
                        <Button onClick={() => window.history.back()}>Go Back</Button>
                    </div>
                </div>
            </div>
        );
    }

    const hasVariations = Object.keys(variationMap).length > 0;
    const allVariationsSelected = hasVariations
        ? Object.values(variationMap).every(v => v.selectedOptionId != null)
        : true;

    const normalizeVariationName = (name: string): string => {
        if (/^\d+[:/]\d+/.test(name.trim()) || /frame\s*rate/i.test(name)) return 'Size';
        return name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };

    return (
        <>
        <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground py-4 flex-wrap">
                <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <Home className="h-3.5 w-3.5" />
                    <span>Home</span>
                </Link>
                {categoryPath.map((crumb) => (
                    <React.Fragment key={crumb.id}>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        <Link
                            href={`/products?categoryId=${crumb.id}`}
                            className="hover:text-foreground transition-colors truncate max-w-[160px]"
                        >
                            {crumb.name}
                        </Link>
                    </React.Fragment>
                ))}
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                <span className="text-foreground font-medium truncate max-w-[200px]">{getLocalizedTitle(product.title, product.titleTr)}</span>
            </nav>

            {/* ── Hero: Etsy-style 3-part layout ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-2 pb-6">

                {/* Left — Image gallery */}
                <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
                    <div className="flex items-start" style={{ gap: 0 }}>

                    {/* Vertical thumbnail strip — desktop */}
                    {product.productImages?.length > 1 && (
                        <div className="hidden md:flex flex-col gap-2 overflow-y-auto max-h-[520px] lg:max-h-[580px] xl:max-h-[680px] 2xl:max-h-[780px] thin-scrollbar shrink-0" style={{ width: '60px' }}>
                            {product.productImages.map((img, index) => (
                                <button
                                    key={img.productImageId}
                                    type="button"
                                    onMouseEnter={() => setActiveImage(img)}
                                    onClick={() => setActiveImage(img)}
                                    className={`relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                                        activeImage?.productImageId === img.productImageId
                                            ? "border-primary opacity-100 shadow-sm"
                                            : "border-transparent opacity-55 hover:opacity-90"
                                    }`}
                                >
                                    <Image
                                        src={img.imageUrl}
                                        alt={`${product.title} — image ${index + 1}`}
                                        fill
                                        sizes="60px"
                                        quality={80}
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Main image */}
                    <div
                        className="relative flex-1 overflow-hidden h-[400px] md:h-[520px] lg:h-[580px] xl:h-[680px] 2xl:h-[780px] group cursor-zoom-in"
                        onClick={() => product.productImages.length > 0 && setIsZoomOpen(true)}
                        onTouchStart={(e) => {
                            swipeTouchStartX.current = e.touches[0].clientX;
                            swipeTouchStartY.current = e.touches[0].clientY;
                        }}
                        onTouchEnd={(e) => {
                            if (swipeTouchStartX.current === null || swipeTouchStartY.current === null || product.productImages.length <= 1) {
                                swipeTouchStartX.current = null; swipeTouchStartY.current = null; return;
                            }
                            const dx = swipeTouchStartX.current - e.changedTouches[0].clientX;
                            const dy = swipeTouchStartY.current - e.changedTouches[0].clientY;
                            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                                if (dx > 0 && currentImageIndex < product.productImages.length - 1) setActiveImage(product.productImages[currentImageIndex + 1]);
                                else if (dx < 0 && currentImageIndex > 0) setActiveImage(product.productImages[currentImageIndex - 1]);
                            }
                            swipeTouchStartX.current = null; swipeTouchStartY.current = null;
                        }}
                    >
                        <div className="absolute inset-y-0 left-[16px] right-[16px]">
                            {product.productImages && product.productImages.length > 0 ? (
                                product.productImages.map((img, index) => (
                                    <Image
                                        key={img.productImageId}
                                        src={img.imageUrl}
                                        alt={product.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        quality={85}
                                        priority={index === 0}
                                        loading={index === 0 ? undefined : "eager"}
                                        className={cn(
                                            "object-contain object-center transition-all duration-300",
                                            activeImage?.productImageId === img.productImageId
                                                ? "opacity-100 group-hover:scale-[1.02]"
                                                : "opacity-0 pointer-events-none"
                                        )}
                                    />
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-muted-foreground">No images available</p>
                                </div>
                            )}
                        </div>
                        {/* Zoom hint */}
                        {product.productImages.length > 0 && (
                            <div className="absolute top-2 right-[24px] bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ZoomIn className="h-4 w-4" />
                            </div>
                        )}
                        {/* Image counter — desktop only */}
                        {product.productImages.length > 1 && (
                            <div className="hidden md:block absolute bottom-2 right-[24px] bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                {currentImageIndex + 1} / {product.productImages.length}
                            </div>
                        )}
                        {/* Mobile dot indicators */}
                        {product.productImages.length > 1 && (
                            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 md:hidden pointer-events-none z-10">
                                {product.productImages.map((_, i) => (
                                    <span
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentImageIndex ? "bg-white" : "bg-white/40"}`}
                                    />
                                ))}
                            </div>
                        )}
                        {/* Featured badge */}
                        {product.starred && (
                            <div className="absolute top-2 left-[24px]">
                                <Badge className="bg-primary text-primary-foreground rounded-none text-xs tracking-wide">Featured</Badge>
                            </div>
                        )}
                        {/* Prev / Next arrows */}
                        {product.productImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); if (currentImageIndex > 0) setActiveImage(product.productImages[currentImageIndex - 1]); }}
                                    className={`absolute left-[24px] top-1/2 -translate-y-1/2 z-10 bg-white/85 rounded-full p-1.5 shadow-md transition-all ${currentImageIndex <= 0 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"}`}
                                >
                                    <ChevronLeft className="h-4 w-4 text-foreground" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); if (currentImageIndex < product.productImages.length - 1) setActiveImage(product.productImages[currentImageIndex + 1]); }}
                                    className={`absolute right-[24px] top-1/2 -translate-y-1/2 z-10 bg-white/85 rounded-full p-1.5 shadow-md transition-all ${currentImageIndex >= product.productImages.length - 1 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"}`}
                                >
                                    <ChevronRight className="h-4 w-4 text-foreground" />
                                </button>
                            </>
                        )}
                    </div>
                    </div>

                    {/* Zoom lightbox */}
                    <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
                        <DialogContent className="max-w-4xl w-full p-3 bg-background/98 backdrop-blur">
                            <DialogTitle className="sr-only">{getLocalizedTitle(product.title, product.titleTr)} — image viewer</DialogTitle>
                            <div className="flex items-center justify-center w-full h-[78vh] bg-muted/20 rounded">
                                {activeImage && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={activeImage.imageUrl}
                                        alt={getLocalizedTitle(product.title, product.titleTr)}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                )}
                            </div>
                            {product.productImages.length > 1 && (
                                <div className="flex justify-center gap-2 pt-2 overflow-x-auto">
                                    {product.productImages.map((img, index) => (
                                        <button
                                            key={img.productImageId}
                                            type="button"
                                            onClick={() => setActiveImage(img)}
                                            className={`relative h-14 w-14 shrink-0 overflow-hidden rounded border-2 transition-all ${
                                                activeImage?.productImageId === img.productImageId
                                                    ? "border-primary"
                                                    : "border-border opacity-60 hover:opacity-100"
                                            }`}
                                        >
                                            <Image
                                                src={img.imageUrl}
                                                alt={`${product.title} — image ${index + 1}`}
                                                fill
                                                sizes="56px"
                                                className="object-contain p-0.5"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                    {/* Mobile thumbnail strip — horizontal, hidden on md+ */}
                    <div className="md:hidden mt-3 flex flex-wrap gap-2">
                        {product.productImages?.map((img, index) => (
                            <button
                                key={img.productImageId}
                                type="button"
                                onClick={() => setActiveImage(img)}
                                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                                    activeImage?.productImageId === img.productImageId
                                        ? "border-primary opacity-100 shadow-sm"
                                        : "border-transparent opacity-55 hover:opacity-90"
                                }`}
                            >
                                <Image
                                    src={img.imageUrl}
                                    alt={`${product.title} — image ${index + 1}`}
                                    fill
                                    sizes="56px"
                                    quality={80}
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right — Product info */}
                <div className="min-w-0 space-y-5 lg:pr-4">

                    {/* Title + wishlist */}
                    <div>
                        <div className="flex items-start gap-3">
                            <h1 className="font-display text-3xl font-semibold leading-snug flex-1">{getLocalizedTitle(product.title, product.titleTr)}</h1>
                            <button
                                type="button"
                                onClick={handleWishlistToggle}
                                className="shrink-0 mt-0.5 p-1.5 rounded-full hover:bg-muted transition-colors"
                                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <Heart
                                    className={`h-5 w-5 transition-colors ${
                                        isInWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"
                                    }`}
                                />
                            </button>
                        </div>
                        {productRating.reviewCount > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                                <Rating readOnly value={Math.round(productRating.averageRating)} className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <RatingButton key={i} />
                                    ))}
                                </Rating>
                                <span className="text-sm text-muted-foreground">
                                    {productRating.averageRating.toFixed(1)} ({productRating.reviewCount} {productRating.reviewCount === 1 ? "review" : "reviews"})
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Variation dropdowns */}
                    {hasVariations && (
                        <div className="space-y-3">
                            {Object.entries(variationMap).map(([key, value]) => {
                                const hasError = attemptedSubmit && value.selectedOptionId == null;
                                return (
                                    <div key={key}>
                                        <label className={`text-sm font-medium block mb-1.5 ${hasError ? "text-destructive" : ""}`}>
                                            {normalizeVariationName(value.variationName)}
                                            {hasError && <span className="ml-1.5 font-normal">— required</span>}
                                        </label>
                                        <Select
                                            value={value.selectedOptionId?.toString() ?? ""}
                                            onValueChange={(val) => onSelectVariation(Number(key), Number(val))}
                                        >
                                            <SelectTrigger className={`w-full rounded-sm ${hasError ? "border-destructive ring-1 ring-destructive" : ""}`}>
                                                <SelectValue placeholder={`Select ${normalizeVariationName(value.variationName)}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(value.options)
                                                    .sort(([, a], [, b]) => a.priceRange[0] - b.priceRange[0])
                                                    .map(([optKey, optValue]) => {
                                                        const [lo, hi] = optValue.priceRange;
                                                        const discLo = calculateDiscountedPrice(lo, productPromo);
                                                        const discHi = calculateDiscountedPrice(hi, productPromo);
                                                        const priceLabel = lo === hi
                                                            ? `$${discLo.toFixed(2)}`
                                                            : `$${discLo.toFixed(2)} – $${discHi.toFixed(2)}`;
                                                        return (
                                                            <SelectItem key={optKey} value={optKey}>
                                                                {optValue.name}
                                                                <span className="text-muted-foreground ml-2">{priceLabel}</span>
                                                            </SelectItem>
                                                        );
                                                    })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            })}
                            {!allVariationsSelected && (
                                <p className="text-xs text-muted-foreground">Select all options to see exact price and availability.</p>
                            )}
                        </div>
                    )}

                    {/* Price block */}
                    <div className="space-y-1">
                        {productPromo && (
                            <Badge className="bg-amber-600 hover:bg-amber-600 text-white border-0 rounded-sm text-xs font-semibold tracking-wide px-2 py-0.5">
                                {productPromo.promotionType === "PERCENTAGE"
                                    ? `${productPromo.discountValue}% OFF`
                                    : `$${productPromo.discountValue} OFF`}
                            </Badge>
                        )}
                        <div className="flex items-baseline gap-3">
                            {selectedVariant && totalPrice !== null ? (
                                <>
                                    <span className="text-2xl font-semibold text-primary">
                                        {formatPrice(discountedPrice ?? totalPrice, (selectedVariant as any)?.priceTry)}
                                    </span>
                                    {productPromo && discountedPrice !== null && discountedPrice !== totalPrice && (
                                        <span className="text-sm text-muted-foreground line-through">
                                            {formatPrice(totalPrice, (selectedVariant as any)?.priceTry)}
                                        </span>
                                    )}
                                    {productPromo && discountedPrice !== null && discountedPrice !== totalPrice && (
                                        <span className="text-xs text-amber-700 font-medium">
                                            Save ${(totalPrice - discountedPrice).toFixed(2)}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="text-2xl font-semibold text-primary">
                                        {currency === "TRY" && (product?.variants?.[0] as any)?.priceTry
                                            ? formatPrice(discountedPriceRange[0], (product?.variants?.[0] as any)?.priceTry)
                                            : (discountedPriceRange[0] === discountedPriceRange[1]
                                                ? `$${discountedPriceRange[0].toFixed(2)}`
                                                : `$${discountedPriceRange[0].toFixed(2)} – $${discountedPriceRange[1].toFixed(2)}`)}
                                    </span>
                                    {productPromo && priceRange[0] !== discountedPriceRange[0] && (
                                        <span className="text-sm text-muted-foreground line-through">
                                            {priceRange[0] === priceRange[1]
                                                ? `$${priceRange[0].toFixed(2)}`
                                                : `$${priceRange[0].toFixed(2)} – $${priceRange[1].toFixed(2)}`}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                        {/* Stock status */}
                        <p className={`text-sm font-medium ${stockStatus.color}`}>{stockStatus.label}</p>
                    </div>

                    {/* Quantity selector */}
                    {!isOutOfStock && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">Qty</span>
                            <div className="flex items-center border rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                    className="h-9 w-9 flex items-center justify-center text-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
                                >
                                    −
                                </button>
                                <span className="h-9 w-10 flex items-center justify-center text-sm font-medium border-x select-none">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                                    disabled={quantity >= maxQty}
                                    className="h-9 w-9 flex items-center justify-center text-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
                                >
                                    +
                                </button>
                            </div>
                            {maxQty <= 10 && (
                                <span className="text-xs text-muted-foreground">{maxQty} available</span>
                            )}
                        </div>
                    )}

                    {/* Action buttons — hidden on mobile (sticky bar handles it) */}
                    <div className="hidden md:block space-y-2.5">
                        <Button
                            className="w-full h-11 rounded-none tracking-widest text-sm font-medium"
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || isAddingToCart || isBuyingNow}
                        >
                            {isAddingToCart ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding to Cart...</>
                            ) : isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-11 rounded-none tracking-widest text-sm font-medium"
                            onClick={handleBuyNow}
                            disabled={isOutOfStock || isBuyingNow || isAddingToCart}
                        >
                            {isBuyingNow ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                            ) : "BUY NOW"}
                        </Button>
                    </div>

                    {/* Secure payment trust box with official SVG logos */}
                    <ProductDetailPaymentTrustBox />

                    {/* Shipping & Delivery */}
                    {getShippingMethodFetch.data && (
                        <div className="border rounded-lg px-4 py-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-sm font-medium">{getShippingMethodFetch.data.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground pl-6">
                                Processing: {getShippingMethodFetch.data.processingTimeMin}–{getShippingMethodFetch.data.processingTimeMax} business days
                            </p>
                            {getShippingMethodFetch.data.shippingOptions.length > 0 && (
                                <div className="pl-6 space-y-1">
                                    {getShippingMethodFetch.data.shippingOptions.slice(0, 2).map((opt, i) => (
                                        <p key={i} className="text-xs text-muted-foreground">
                                            {opt.carrier} · {opt.destinationCountry} · {opt.estimatedDeliveryMin}–{opt.estimatedDeliveryMax} days · ${opt.costFirstItem.toFixed(2)}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Product details — below action buttons */}
                    <div>
                        <p className="text-base font-semibold text-foreground mb-3">Product Details</p>
                        <dl className="divide-y divide-border border rounded-sm overflow-hidden text-sm">
                            {(attrsExpanded ? productSpecRows : productSpecRows.slice(0, 7)).map((row) => (
                                <div key={row.label} className="flex px-3 py-2">
                                    <dt className="w-2/5 font-medium text-foreground shrink-0">{row.label}</dt>
                                    <dd className="text-muted-foreground">{row.value}</dd>
                                </div>
                            ))}
                        </dl>
                        {productSpecRows.length > 7 && (
                            <button
                                type="button"
                                onClick={() => setAttrsExpanded(d => !d)}
                                className="mt-2 flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary transition-colors"
                            >
                                {attrsExpanded ? "See less" : `See all ${productSpecRows.length} details`}
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${attrsExpanded ? "rotate-180" : ""}`} />
                            </button>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <p className="text-base font-semibold text-foreground mb-3">
                            {locale === "tr" ? "Ürün Açıklaması & Özellikler" : "Description & Specifications"}
                        </p>
                        {((product as any)?.descriptionTr || product?.description) && (
                            <div className="text-sm leading-relaxed text-muted-foreground mb-4 p-3 bg-muted/40 rounded-lg border border-border/50">
                                {getLocalizedDescription(product?.description, (product as any)?.descriptionTr)}
                            </div>
                        )}
                        <ul className="space-y-2">
                            {(locale === "tr" ? GENERIC_PRODUCT_DETAILS_TR : GENERIC_PRODUCT_DETAILS).map((item) => (
                                <li key={item.key} className="flex gap-2 text-sm leading-relaxed">
                                    <span className="shrink-0 mt-[6px] w-1.5 h-1.5 rounded-full bg-primary/50" />
                                    <span className="text-muted-foreground">
                                        <span className="font-medium text-foreground">{item.key}: </span>
                                        {item.value}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* ── Full-width: Reviews ── */}
            <div className="mb-10">
                <ProductReviews
                    productId={Number(productId)}
                    currentCustomerId={currentCustomerId}
                    serverAverageRating={productRating.averageRating}
                    serverReviewCount={productRating.reviewCount}
                />
            </div>

            {/* ── Full-width: FAQ ── */}
            <div className="mb-10">
                <ProductQA productId={Number(productId)} />
            </div>

            {/* ── Related Products ── */}
            <div className="pb-24 md:pb-8">
                <h2 className="font-display text-2xl md:text-3xl text-center font-semibold mb-6 tracking-wide">Related Products</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
                    {getAllProductsFetch.isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
                        ))
                    ) : relatedProducts.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-muted-foreground">No related products found</p>
                        </div>
                    ) : (
                        relatedProducts.map((relatedProduct) => {
                            const promo = getPromotionForProduct(relatedProduct, promotions);
                            return (
                                <ProductCard
                                    key={relatedProduct.productId}
                                    product={relatedProduct}
                                    promo={promo}
                                />
                            );
                        })
                    )}
                </div>
            </div>

        </div>

        {/* Mobile sticky bottom bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border px-4 py-3 flex items-center gap-3 shadow-lg">
            <div className="flex flex-col shrink-0 min-w-0">
                {productPromo && (
                    <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide leading-tight">
                        {productPromo.promotionType === "PERCENTAGE" ? `${productPromo.discountValue}% OFF` : `$${productPromo.discountValue} OFF`}
                    </span>
                )}
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight">Price</span>
                <span className="text-base font-semibold text-primary leading-tight">
                    {selectedVariant && totalPrice !== null
                        ? `$${(discountedPrice ?? totalPrice).toFixed(2)}`
                        : discountedPriceRange[0] === discountedPriceRange[1]
                            ? `$${discountedPriceRange[0].toFixed(2)}`
                            : `$${discountedPriceRange[0].toFixed(2)}+`}
                </span>
                {productPromo && (
                    <span className="text-[11px] text-muted-foreground line-through leading-tight">
                        {selectedVariant && totalPrice !== null
                            ? `$${totalPrice.toFixed(2)}`
                            : priceRange[0] === priceRange[1]
                                ? `$${priceRange[0].toFixed(2)}`
                                : `$${priceRange[0].toFixed(2)}+`}
                    </span>
                )}
            </div>
            <Button
                className="flex-1 h-10 rounded-none tracking-widest text-xs font-medium"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart || isBuyingNow}
            >
                {isAddingToCart ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Adding...</>
                ) : isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
            </Button>
            <Button
                variant="outline"
                className="flex-1 h-10 rounded-none tracking-widest text-xs font-medium"
                onClick={handleBuyNow}
                disabled={isOutOfStock || isBuyingNow || isAddingToCart}
            >
                {isBuyingNow ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Processing...</>
                ) : "BUY NOW"}
            </Button>
        </div>

        </>
    );
}
