/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { ProductPreview } from "@/types/domains/product";
import { Star, MoreVertical, Copy, Pencil, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useDataFetch from "@/hooks/use-data-fetch";
import * as productServices from "@/services/product";
import CategoriesDropdown, { CategoryDropdownNode } from "@/app/components/CategoriesDropdown";
import { useAppSelector } from "@/store/hooks";
import placeholderImage from '@/../public/placeholder-image.jpeg';
import { toast } from "sonner";
import Spinner from "@/components/ui/spinner";

export default function ProductsPage() {

    const router = useRouter();
    const { items: categories, loading: categoriesLoading } = useAppSelector(state => state.categories);
    const [selectedCategory, setSelectedCategory] = useState<CategoryDropdownNode>();
    const productsData = useDataFetch(productServices.getAllProducts);

    // single-delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ProductPreview | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // multi-select state
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isBulkUpdatingStatus, setIsBulkUpdatingStatus] = useState(false);

    const refreshProducts = () =>
        productsData.request(selectedCategory?.categoryId !== undefined ? { categoryId: selectedCategory.categoryId } : {});

    useEffect(() => { refreshProducts(); }, [selectedCategory]);

    // ── selection helpers ──────────────────────────────────────────────────────
    const toggleSelect = (productId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(productId)) next.delete(productId);
            else next.add(productId);
            return next;
        });
    };

    const selectAll = () =>
        setSelectedIds(new Set(productsData.data?.map(p => p.productId) ?? []));

    const clearSelection = () => setSelectedIds(new Set());

    const allSelected =
        (productsData.data?.length ?? 0) > 0 &&
        selectedIds.size === (productsData.data?.length ?? 0);

    // ── derived counts for smart activate/deactivate ──────────────────────────
    const selectedProducts = (productsData.data ?? []).filter(p => selectedIds.has(p.productId));
    const selectedActiveCount = selectedProducts.filter(p => p.status !== false).length;
    const selectedInactiveCount = selectedProducts.filter(p => p.status === false).length;

    // ── bulk actions ───────────────────────────────────────────────────────────
    const handleBulkDelete = async () => {
        setIsBulkDeleting(true);
        try {
            const res = await productServices.bulkDeleteProducts([...selectedIds]);
            if (!res.success) { toast.error(res.error || "Bulk delete failed."); return; }
            const { deleted, failed } = res.data!;
            if (deleted.length > 0) toast.success(`${deleted.length} product(s) deleted.`);
            if (failed.length > 0) toast.warning(`${failed.length} product(s) skipped — they have existing orders.`);
            clearSelection();
            setBulkDeleteOpen(false);
            refreshProducts();
        } catch { toast.error("Bulk delete failed."); }
        finally { setIsBulkDeleting(false); }
    };

    const handleBulkStatus = async (status: boolean) => {
        // Only send products that actually need changing
        const eligible = (productsData.data ?? [])
            .filter(p => selectedIds.has(p.productId) && (p.status !== false) !== status)
            .map(p => p.productId);

        if (eligible.length === 0) {
            toast.info(`All selected products are already ${status ? "active" : "inactive"}.`);
            return;
        }

        setIsBulkUpdatingStatus(true);
        try {
            const res = await productServices.bulkUpdateProductStatus(eligible, status);
            if (!res.success) { toast.error(res.error || "Failed to update status."); return; }
            const skipped = selectedIds.size - eligible.length;
            let msg = `${eligible.length} product(s) ${status ? "activated" : "deactivated"}.`;
            if (skipped > 0) msg += ` ${skipped} already ${status ? "active" : "inactive"} — skipped.`;
            toast.success(msg);
            clearSelection();
            refreshProducts();
        } catch { toast.error("Failed to update status."); }
        finally { setIsBulkUpdatingStatus(false); }
    };

    // ── single-product actions ─────────────────────────────────────────────────
    const stopNav = (e: Event) => {
        (e as unknown as { preventDefault?: () => void }).preventDefault?.();
        (e as unknown as { stopPropagation?: () => void }).stopPropagation?.();
    };

    const handleCopy = async (product: ProductPreview, e: Event) => {
        stopNav(e);
        try {
            const res = await productServices.getProductById(product.productId);
            if (!res.success) throw new Error(res.error);
            const fullProduct = res.data;
            const inferredCategoryId =
                (fullProduct as unknown as { categoryId?: number }).categoryId ??
                (fullProduct as unknown as { category?: { categoryId?: number } }).category?.categoryId ??
                product.categoryId;
            localStorage.setItem("copiedProduct", JSON.stringify({ ...fullProduct, categoryId: inferredCategoryId }));
            toast.success(`"${product.title}" copied! Open Add Product to paste.`);
        } catch { toast.error("Failed to copy product details."); }
    };

    const handleEdit = (product: ProductPreview, e: Event) => {
        stopNav(e);
        router.push(`/admin/products/product-form/${product.productId}`);
    };

    const handleDelete = (product: ProductPreview, e: Event) => {
        stopNav(e);
        setDeleteTarget(product);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await productServices.deleteProduct(deleteTarget.productId);
            if (!res.success) { toast.error(res.error || "Failed to delete product."); return; }
            toast.success("Product deleted successfully.");
            setDeleteDialogOpen(false);
            setDeleteTarget(null);
            refreshProducts();
        } catch { toast.error("Failed to delete product."); }
        finally { setIsDeleting(false); }
    };

    const handleToggleActive = async (product: ProductPreview, e: Event) => {
        stopNav(e);
        const currentlyActive = product.status !== false;
        try {
            await productServices.updateProductBasicDetails(product.productId, {
                title: product.title,
                starred: product.starred,
                categoryId: product.categoryId,
                status: !currentlyActive,
            });
            toast.success(currentlyActive ? "Product deactivated." : "Product activated.");
            refreshProducts();
        } catch { toast.error("Failed to update product status."); }
    };

    const busyBulk = isBulkDeleting || isBulkUpdatingStatus;

    return <div className="space-y-4">

        {/* ── single-delete dialog ── */}
        <Dialog open={deleteDialogOpen} onOpenChange={(open) => { if (!isDeleting) { setDeleteTarget(null); setDeleteDialogOpen(open); } }}>
            <DialogContent closeIcon={!isDeleting}>
                <DialogHeader>
                    <DialogTitle>Delete product?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete <span className="font-medium">{deleteTarget?.title}</span>. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting || !deleteTarget}>
                        {isDeleting ? <><Spinner className="mr-2 size-4" />Deleting...</> : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* ── bulk-delete dialog ── */}
        <Dialog open={bulkDeleteOpen} onOpenChange={(open) => { if (!isBulkDeleting) setBulkDeleteOpen(open); }}>
            <DialogContent closeIcon={!isBulkDeleting}>
                <DialogHeader>
                    <DialogTitle>Delete {selectedIds.size} product{selectedIds.size !== 1 ? "s" : ""}?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete the selected products. Products with existing orders will be skipped and reported.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => setBulkDeleteOpen(false)} disabled={isBulkDeleting}>Cancel</Button>
                    <Button variant="destructive" onClick={handleBulkDelete} disabled={isBulkDeleting}>
                        {isBulkDeleting ? <><Spinner className="mr-2 size-4" />Deleting...</> : `Delete ${selectedIds.size}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* ── page header ── */}
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <div className="flex items-center gap-4">
                <CategoriesDropdown
                    selectedCategoryNode={selectedCategory}
                    onSelect={setSelectedCategory}
                    disabled={categoriesLoading}
                    categories={categories}
                />
                <Link href="/admin/products/product-form">
                    <Button variant="default">Add Product</Button>
                </Link>
            </div>
        </div>

        {/* ── selection toolbar ── */}
        {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
                <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => checked ? selectAll() : clearSelection()}
                    className="mr-1"
                />
                <span className="text-sm font-medium">{selectedIds.size} selected</span>

                <div className="flex items-center gap-2 ml-auto flex-wrap">
                    <Button
                        size="sm" variant="outline"
                        onClick={() => handleBulkStatus(true)}
                        disabled={busyBulk || selectedInactiveCount === 0}
                        title={selectedInactiveCount === 0 ? "All selected products are already active" : undefined}
                    >
                        {isBulkUpdatingStatus ? <Spinner className="size-3 mr-1" /> : null}
                        Activate
                        {selectedInactiveCount > 0 && selectedInactiveCount < selectedIds.size && (
                            <span className="ml-1 opacity-60">({selectedInactiveCount})</span>
                        )}
                    </Button>
                    <Button
                        size="sm" variant="outline"
                        onClick={() => handleBulkStatus(false)}
                        disabled={busyBulk || selectedActiveCount === 0}
                        title={selectedActiveCount === 0 ? "All selected products are already inactive" : undefined}
                    >
                        {isBulkUpdatingStatus ? <Spinner className="size-3 mr-1" /> : null}
                        Deactivate
                        {selectedActiveCount > 0 && selectedActiveCount < selectedIds.size && (
                            <span className="ml-1 opacity-60">({selectedActiveCount})</span>
                        )}
                    </Button>
                    <Button
                        size="sm" variant="destructive"
                        onClick={() => setBulkDeleteOpen(true)}
                        disabled={busyBulk}
                    >
                        <Trash2 className="size-3 mr-1" />
                        Delete
                    </Button>
                    <Button size="sm" variant="ghost" onClick={clearSelection} disabled={busyBulk}>
                        <X className="size-4" />
                    </Button>
                </div>
            </div>
        )}

        {/* ── product grid ── */}
        <div className="py-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productsData.isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="rounded-md border overflow-hidden shadow-sm">
                        <div className="relative">
                            <Skeleton className="absolute right-2 top-2 z-10 h-10 w-10 rounded-md bg-muted-foreground/20" />
                            <Skeleton className="w-full aspect-square rounded-none" />
                        </div>
                        <div className="p-2 flex gap-2">
                            <div className="flex-1 pt-2">
                                <Skeleton className="h-4 w-full mb-1" />
                                <Skeleton className="h-4 w-3/4 mb-3" />
                                <div className="flex items-center gap-2 mb-4">
                                    <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                    <Skeleton className="h-3 w-6" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-5 w-16 mb-2" />
                            </div>
                            <div className="pt-2">
                                <Skeleton className="h-10 w-10 rounded-md" />
                            </div>
                        </div>
                    </div>
                ))
            ) : productsData.data?.map((product) => {
                const isSelected = selectedIds.has(product.productId);
                return (
                    <div key={product.productId} className="relative">
                        <Link className="block w-full" href={`/admin/products/product-form/${product.productId}`}>
                            <div className={[
                                "rounded-md border overflow-hidden shadow-sm transition relative w-full",
                                isSelected
                                    ? "ring-2 ring-primary border-primary"
                                    : product.status === false
                                    ? "opacity-80"
                                    : "hover:shadow-md",
                            ].join(" ")}>

                                {/* checkbox — top left */}
                                <div
                                    className="absolute left-2 top-2 z-10"
                                    onClick={(e) => toggleSelect(product.productId, e)}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        className="bg-white/90 border-2 shadow-sm"
                                    />
                                </div>

                                {/* star — top right */}
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="absolute right-2 top-2 z-10"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <Star className={"h-4 w-4 " + (product.starred ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                                </Button>

                                {/* image */}
                                <div className={["relative", product.status === false ? "grayscale" : ""].join(" ")}>
                                    <Image
                                        src={product.imageUrl || placeholderImage}
                                        alt={product.title}
                                        width={210}
                                        height={200}
                                        className="w-full h-auto aspect-square object-cover"
                                    />
                                    {product.status === false && (
                                        <>
                                            <div className="absolute inset-0 bg-black/30" />
                                            <Badge className="absolute top-2 left-2 bg-black text-white border border-white/20">
                                                Deactivated
                                            </Badge>
                                        </>
                                    )}
                                </div>

                                <div className="p-2 flex">
                                    <div className="flex-1 pt-2">
                                        <h3 className="text-sm font-medium leading-tight line-clamp-2 mb-1">
                                            {product.title}
                                        </h3>
                                        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                            <span>{product.rating}</span>
                                            <span className="text-muted-foreground">• {product.quantityInStock} in stock</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-base font-bold text-foreground">
                                                ${product.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 3-dot menu */}
                                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                <DropdownMenuItem onSelect={(e) => handleCopy(product, e)}>
                                                    <Copy className="h-4 w-4" />Copy
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={(e) => handleEdit(product, e)}>
                                                    <Pencil className="h-4 w-4" />Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={(e) => handleToggleActive(product, e)}>
                                                    {product.status !== false
                                                        ? <><ToggleLeft className="h-4 w-4" />Deactivate</>
                                                        : <><ToggleRight className="h-4 w-4" />Activate</>}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem variant="destructive" onSelect={(e) => handleDelete(product, e)}>
                                                    <Trash2 className="h-4 w-4" />Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                );
            })}
        </div>
    </div>;
}
