/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Star, CheckCircle, XCircle, Trash2, Edit3, ExternalLink, Search, Filter, RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import useDataFetch from "@/hooks/use-data-fetch";
import * as reviewServices from "@/services/review";
import { ReviewDetails, ReviewDTO } from "@/types/domains/review";
import { toast } from "sonner";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<ReviewDetails[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");
    const [ratingFilter, setRatingFilter] = useState<string>("ALL");

    // Edit modal
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<ReviewDetails | null>(null);
    const [editText, setEditText] = useState("");
    const [editRating, setEditRating] = useState(5);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Delete dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // API fetches
    const getReviewsFetch = useDataFetch(reviewServices.getReviews);
    const toggleApprovalFetch = useDataFetch(reviewServices.toggleReviewApproval);
    const editReviewFetch = useDataFetch(reviewServices.editReview);
    const deleteReviewFetch = useDataFetch(reviewServices.deleteReview);

    const fetchAllReviews = () => {
        getReviewsFetch.request(undefined, undefined, 0, 500, "NEWEST", undefined)
            .onSuccess((data: ReviewDetails[]) => {
                setReviews(data);
            })
            .onError((err) => {
                toast.error("Yorumlar yüklenemedi: " + err);
            });
    };

    useEffect(() => {
        fetchAllReviews();
    }, []);

    // Toggle Approval Handler
    const handleToggleApproval = (review: ReviewDetails) => {
        const newStatus = !(review.isApproved ?? true);
        toggleApprovalFetch.request(review.reviewId)
            .onSuccess(() => {
                setReviews(prev => prev.map(r =>
                    r.reviewId === review.reviewId ? { ...r, isApproved: newStatus } : r
                ));
                toast.success(newStatus ? "Yorum onaylandı ve yayına alındı." : "Yorum gizlendi/onayı kaldırıldı.");
            })
            .onError((err) => {
                toast.error("Durum güncellenirken hata oluştu: " + err);
            });
    };

    // Edit Handler
    const openEditModal = (review: ReviewDetails) => {
        setEditingReview(review);
        setEditText(review.reviewText);
        setEditRating(review.rating);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        if (!editingReview) return;
        if (editText.trim().length < 5) {
            toast.error("Yorum metni en az 5 karakter olmalıdır.");
            return;
        }
        setIsSavingEdit(true);
        const dto: ReviewDTO = {
            productId: editingReview.productId,
            rating: editRating,
            reviewText: editText.trim(),
        };

        editReviewFetch.request(editingReview.reviewId, dto)
            .onSuccess(() => {
                setReviews(prev => prev.map(r =>
                    r.reviewId === editingReview.reviewId
                        ? { ...r, rating: editRating, reviewText: editText.trim() }
                        : r
                ));
                toast.success("Yorum başarıyla güncellendi.");
                setEditDialogOpen(false);
                setIsSavingEdit(false);
            })
            .onError((err) => {
                toast.error("Güncelleme hatası: " + err);
                setIsSavingEdit(false);
            });
    };

    // Delete Handler
    const openDeleteDialog = (id: number) => {
        setDeleteTargetId(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deleteTargetId === null) return;
        setIsDeleting(true);
        deleteReviewFetch.request(deleteTargetId)
            .onSuccess(() => {
                setReviews(prev => prev.filter(r => r.reviewId !== deleteTargetId));
                toast.success("Yorum kalıcı olarak silindi.");
                setDeleteDialogOpen(false);
                setDeleteTargetId(null);
                setIsDeleting(false);
            })
            .onError((err) => {
                toast.error("Silme işlemi başarısız: " + err);
                setIsDeleting(false);
            });
    };

    // Filter reviews
    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            // Status filter
            const isApproved = r.isApproved ?? true;
            if (statusFilter === "APPROVED" && !isApproved) return false;
            if (statusFilter === "PENDING" && isApproved) return false;

            // Rating filter
            if (ratingFilter !== "ALL" && r.rating !== Number(ratingFilter)) return false;

            // Search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const productTitle = (r.productTitle || "").toLowerCase();
                const productTitleTr = (r.productTitleTr || "").toLowerCase();
                const customerName = (r.customer?.customerName || "").toLowerCase();
                const text = (r.reviewText || "").toLowerCase();
                const textTr = (r.reviewTextTr || "").toLowerCase();
                return productTitle.includes(query) ||
                    productTitleTr.includes(query) ||
                    customerName.includes(query) ||
                    text.includes(query) ||
                    textTr.includes(query);
            }
            return true;
        });
    }, [reviews, searchQuery, statusFilter, ratingFilter]);

    // Statistics
    const totalCount = reviews.length;
    const approvedCount = reviews.filter(r => r.isApproved ?? true).length;
    const pendingCount = totalCount - approvedCount;
    const avgRating = totalCount > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1)
        : "0.0";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Müşteri Değerlendirmeleri</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Tüm ürün yorumlarını inceleyin, onay durumunu yönetin, düzenleyin veya kaldırın.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAllReviews}
                    disabled={getReviewsFetch.isLoading}
                    className="self-start sm:self-auto"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${getReviewsFetch.isLoading ? "animate-spin" : ""}`} />
                    Yenile
                </Button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border rounded-xl p-4 shadow-2xs">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Toplam Yorum</span>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{totalCount}</p>
                </div>
                <div className="bg-white border rounded-xl p-4 shadow-2xs">
                    <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Onaylı / Yayında</span>
                    <p className="text-2xl font-bold mt-1 text-emerald-700">{approvedCount}</p>
                </div>
                <div className="bg-white border rounded-xl p-4 shadow-2xs">
                    <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">Gizli / Beklemede</span>
                    <p className="text-2xl font-bold mt-1 text-amber-700">{pendingCount}</p>
                </div>
                <div className="bg-white border rounded-xl p-4 shadow-2xs">
                    <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">Ortalama Puan</span>
                    <p className="text-2xl font-bold mt-1 text-stone-900 flex items-center gap-1.5">
                        {avgRating} <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
                    </p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border rounded-xl p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Eser, müşteri adı veya içerik ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Status filter */}
                    <div className="flex items-center gap-1.5">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">Durum:</span>
                        <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                            <SelectTrigger className="w-36 h-9">
                                <SelectValue placeholder="Durum seç" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tümü ({totalCount})</SelectItem>
                                <SelectItem value="APPROVED">Onaylı ({approvedCount})</SelectItem>
                                <SelectItem value="PENDING">Gizli ({pendingCount})</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Rating filter */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground font-medium">Puan:</span>
                        <Select value={ratingFilter} onValueChange={(val) => setRatingFilter(val)}>
                            <SelectTrigger className="w-28 h-9">
                                <SelectValue placeholder="Puan seç" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tümü</SelectItem>
                                <SelectItem value="5">5 Yıldız</SelectItem>
                                <SelectItem value="4">4 Yıldız</SelectItem>
                                <SelectItem value="3">3 Yıldız</SelectItem>
                                <SelectItem value="2">2 Yıldız</SelectItem>
                                <SelectItem value="1">1 Yıldız</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Reviews Table / List */}
            <div className="bg-white border rounded-xl shadow-2xs overflow-hidden">
                {getReviewsFetch.isLoading ? (
                    <div className="py-16 text-center text-muted-foreground">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                        <p className="text-sm">Yorumlar yükleniyor...</p>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground">
                        <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">Arama kriterlerine uygun değerlendirme bulunamadı.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b bg-stone-50/70 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <th className="py-3 px-4 w-12">ID</th>
                                    <th className="py-3 px-4 min-w-[200px]">Eser Bilgisi</th>
                                    <th className="py-3 px-4 min-w-[140px]">Müşteri</th>
                                    <th className="py-3 px-4 w-28">Puan</th>
                                    <th className="py-3 px-4 min-w-[260px]">Yorum</th>
                                    <th className="py-3 px-4 w-28">Tarih</th>
                                    <th className="py-3 px-4 w-28 text-center">Durum</th>
                                    <th className="py-3 px-4 w-36 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredReviews.map((review) => {
                                    const isApproved = review.isApproved ?? true;
                                    return (
                                        <tr key={review.reviewId} className="hover:bg-stone-50/50 transition-colors">
                                            <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                                                #{review.reviewId}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-900 leading-snug line-clamp-1">
                                                    {review.productTitleTr || review.productTitle || `Ürün #${review.productId}`}
                                                </div>
                                                <Link
                                                    href={`/products/${review.productId}`}
                                                    target="_blank"
                                                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
                                                >
                                                    Ürünü Gör <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-medium text-gray-800">
                                                    {review.customer?.customerName || `Kullanıcı #${review.customer?.customerId}`}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3.5 h-3.5 ${
                                                                i < review.rating
                                                                    ? "fill-amber-400 text-amber-400"
                                                                    : "text-stone-200"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-xs text-stone-800 line-clamp-2 leading-relaxed">
                                                    {review.reviewTextTr || review.reviewText}
                                                </p>
                                                {review.reviewTextTr && review.reviewText && review.reviewTextTr !== review.reviewText && (
                                                    <p className="text-[11px] text-muted-foreground mt-0.5 italic line-clamp-1">
                                                        EN: {review.reviewText}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(review.dateOfSubmission).toLocaleDateString("tr-TR", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {isApproved ? (
                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-normal">
                                                        Onaylı
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-normal">
                                                        Gizli
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Toggle Approval Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggleApproval(review)}
                                                        title={isApproved ? "Onayı Kaldır / Gizle" : "Onayla ve Yayınla"}
                                                        className="h-8 w-8"
                                                    >
                                                        {isApproved ? (
                                                            <XCircle className="w-4 h-4 text-amber-600 hover:text-amber-700" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4 text-emerald-600 hover:text-emerald-700" />
                                                        )}
                                                    </Button>

                                                    {/* Edit Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditModal(review)}
                                                        title="Yorumu Düzenle"
                                                        className="h-8 w-8 text-stone-600 hover:text-stone-900"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>

                                                    {/* Delete Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openDeleteDialog(review.reviewId)}
                                                        title="Yorumu Sil"
                                                        className="h-8 w-8 text-rose-500 hover:text-rose-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Review Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Yorumu Düzenle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                                Puan
                            </label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setEditRating(s)}
                                        className="p-1 rounded hover:bg-stone-100 transition-colors"
                                    >
                                        <Star
                                            className={`w-6 h-6 ${
                                                s <= editRating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-stone-300"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                                Yorum Metni
                            </label>
                            <Textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={5}
                                placeholder="Yorum metnini girin..."
                                className="resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSavingEdit}>
                            İptal
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
                            {isSavingEdit ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Yorumu Sil</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Bu değerlendirmeyi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </p>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                            Vazgeç
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                            {isDeleting ? "Siliniyor..." : "Evet, Sil"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
