"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { Rating, RatingButton } from "@/components/ui/rating";
import { MessageCircle, Star, ChevronLeft, ChevronRight } from "lucide-react";
import useDataFetch from "@/hooks/use-data-fetch";
import * as reviewServices from "@/services/review";
import { ReviewDTO } from "@/types/domains/review";
import { useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types/domains/user";
import { toast } from "sonner";

interface Review {
  reviewId: number;
  reviewText: string;
  customer: {
    customerId: number;
    customerName: string;
  };
  productId: number;
  rating: number;
  dateOfSubmission: Date;
  verifiedPurchase?: boolean;
}

interface ProductReviewsProps {
  productId: number;
  currentCustomerId?: number;
  serverAverageRating?: number;
  serverReviewCount?: number;
}

const PAGE_SIZE = 10;

export const ProductReviews = ({
  productId,
  currentCustomerId: propCustomerId = undefined,
  serverAverageRating,
  serverReviewCount,
}: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [sort, setSort] = useState<string>("NEWEST");

  const { user, authenticated } = useAppSelector(state => state.auth);
  const isAdmin = user?.roleName === UserRole.ADMIN;
  const isPlatformAdmin = user?.roleName === UserRole.PLATFORM_ADMIN;
  const canDeleteAnyReview = isAdmin || isPlatformAdmin;
  const currentCustomerId = user?.userId || propCustomerId;

  const getReviews = useDataFetch(reviewServices.getReviews);
  const postReview = useDataFetch(reviewServices.postReview);
  const editReview = useDataFetch(reviewServices.editReview);
  const deleteReview = useDataFetch(reviewServices.deleteReview);

  const loadReviews = useCallback((page: number, currentSort: string) => {
    getReviews.request(productId, undefined, page - 1, PAGE_SIZE, currentSort)
      .onSuccess((data: Review[]) => {
        setReviews(data);
      })
      .onError(() => {
        // silently fail — reviews are public; 401 means backend needs config fix
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [productId, sort]);

  useEffect(() => {
    loadReviews(currentPage, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, currentPage, sort]);

  const handleSubmitReview = (reviewData: { productId: number; rating: number; reviewText: string }) => {
    postReview.request(reviewData)
      .onSuccess((newReview) => {
        const newReviewForList: Review = {
          reviewId: newReview.reviewId,
          reviewText: newReview.reviewText,
          customer: {
            customerId: newReview.user.userId,
            customerName: newReview.user.fullName || newReview.user.email,
          },
          productId: newReview.product.productId,
          rating: newReview.rating,
          dateOfSubmission: new Date(newReview.dateOfSubmission),
        };
        setReviews(prev => [newReviewForList, ...prev]);
        toast.success("Review submitted!");
      })
      .onError((error) => {
        toast.error("Failed to submit review: " + error);
      });
  };

  const handleEditReview = (reviewId: number) => {
    const reviewToEdit = reviews.find(r => r.reviewId === reviewId);
    if (reviewToEdit) {
      setEditingReview(reviewToEdit);
    }
  };

  const handleUpdateReview = (reviewData: { productId: number; rating: number; reviewText: string }) => {
    if (!editingReview) return;
    const editDTO: ReviewDTO = {
      productId: reviewData.productId,
      rating: reviewData.rating,
      reviewText: reviewData.reviewText,
    };
    editReview.request(editingReview.reviewId, editDTO)
      .onSuccess((updatedReview) => {
        setReviews(prev => prev.map(review =>
          review.reviewId === editingReview.reviewId
            ? { ...review, reviewText: updatedReview.reviewText, rating: updatedReview.rating, dateOfSubmission: new Date(updatedReview.dateOfSubmission) }
            : review
        ));
        setEditingReview(null);
        toast.success("Review updated!");
      })
      .onError((error) => {
        toast.error("Failed to update review: " + error);
      });
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId === null) return;
    deleteReview.request(confirmDeleteId)
      .onSuccess(() => {
        setReviews(prev => prev.filter(r => r.reviewId !== confirmDeleteId));
        setConfirmDeleteId(null);
        toast.success("Review deleted.");
      })
      .onError((error) => {
        toast.error("Failed to delete review: " + error);
        setConfirmDeleteId(null);
      });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  const canEditReview = useCallback((review: Review) =>
    review.customer.customerId === currentCustomerId, [currentCustomerId]);

  const canDeleteReview = useCallback((review: Review) =>
    review.customer.customerId === currentCustomerId || isAdmin || isPlatformAdmin,
    [currentCustomerId, isAdmin, isPlatformAdmin]);

  const averageRating = serverAverageRating !== undefined
    ? serverAverageRating
    : reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const totalReviewCount = serverReviewCount !== undefined ? serverReviewCount : reviews.length;

  const totalPages = Math.max(1, Math.ceil(totalReviewCount / PAGE_SIZE));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const rating = 5 - i;
    const count = reviews.filter(r => r.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  const isLoading = getReviews.isLoading || postReview.isLoading || editReview.isLoading || deleteReview.isLoading;

  return (
    <div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteId !== null} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this review? This action cannot be undone.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={deleteReview.isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteReview.isLoading}>
              {deleteReview.isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main two-column split — reviews left, rating+form right */}
      <div className="grid md:grid-cols-[1fr_360px] gap-8 md:gap-12 pt-10">

        {/* Left — reviews list, extends full height */}
        <div className="md:border-r md:border-border md:pr-8 min-w-0 order-last md:order-first">

          {/* Section title */}
          <h2 className="font-display text-3xl font-medium mb-5">Customer Reviews</h2>

          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">All Reviews</h3>
              <Badge variant="secondary">{totalReviewCount}</Badge>
              {canDeleteAnyReview && (
                <Badge variant="outline" className="text-xs">Admin View</Badge>
              )}
              {isLoading && (
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {(["NEWEST", "HIGHEST_RATED", "LOWEST_RATED"] as const).map((option) => {
                const labels: Record<string, string> = {
                  NEWEST: "Newest",
                  HIGHEST_RATED: "Highest",
                  LOWEST_RATED: "Lowest",
                };
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSort(option)}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                      sort === option
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {labels[option]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review list */}
          {getReviews.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-14 text-center border-t border-border">
              <MessageCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience.</p>
            </div>
          ) : (
            <div className="border-t border-border">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.reviewId}
                  review={review}
                  onEdit={canEditReview(review) ? handleEditReview : undefined}
                  onDelete={canDeleteReview(review) ? (id) => setConfirmDeleteId(id) : undefined}
                  isOwner={review.customer.customerId === currentCustomerId}
                  canModerate={canDeleteAnyReview}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border mt-1">
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={!hasPrev || isLoading}>
                <ChevronLeft className="h-4 w-4 mr-1" />Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={!hasNext || isLoading}>
                Next<ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Right — rating summary + write review form (sticky) */}
        <div className="md:sticky md:top-24 md:self-start space-y-6 order-first md:order-last">

          {/* Big rating number */}
          <div>
            <span className="font-display text-5xl md:text-8xl font-light text-foreground leading-none tabular-nums">
              {averageRating.toFixed(1)}
            </span>
            <div className="flex items-center gap-2 mt-3">
              <Rating readOnly value={Math.round(averageRating)} className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <RatingButton key={i} />
                ))}
              </Rating>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Based on {totalReviewCount} {totalReviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>

          {/* Distribution bars */}
          <div className="space-y-2.5">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2.5">
                <span className="text-sm text-muted-foreground w-3 text-right shrink-0">{rating}</span>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-5 text-right shrink-0">{count}</span>
              </div>
            ))}
          </div>

          {/* Write review form — aligned below the bars */}
          <div className="border-t border-border pt-6">
            <h3 className="font-display text-xl font-medium mb-4">
              {editingReview ? "Edit Your Review" : "Share Your Experience"}
            </h3>
            <ReviewForm
              productId={productId}
              mode={editingReview ? "edit" : "create"}
              onSubmit={editingReview ? handleUpdateReview : handleSubmitReview}
              isSubmitting={postReview.isLoading || editReview.isLoading}
              initialData={editingReview ? { rating: editingReview.rating, reviewText: editingReview.reviewText } : undefined}
              onCancel={editingReview ? handleCancelEdit : undefined}
              loginRequired={!authenticated}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
