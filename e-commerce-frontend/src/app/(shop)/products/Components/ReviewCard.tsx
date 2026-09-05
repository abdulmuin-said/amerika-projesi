import { Edit2, Trash2, Shield, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Rating, RatingButton } from "@/components/ui/rating";

interface ReviewCardProps {
  review: {
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
  };
  onEdit?: (reviewId: number) => void;
  onDelete?: (reviewId: number) => void;
  isOwner?: boolean;
  isModerator?: boolean;
  canModerate?: boolean;
}

export const ReviewCard = ({
  review,
  onEdit,
  onDelete,
  isOwner = false,
  canModerate = false,
}: ReviewCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.reviewText.length > 220;

  const customerInitials = review.customer.customerName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  const showEditButton = onEdit && (isOwner || canModerate);
  const showDeleteButton = onDelete && (isOwner || canModerate);

  const reviewDate = typeof review.dateOfSubmission === 'string'
    ? new Date(review.dateOfSubmission)
    : review.dateOfSubmission;

  return (
    <div className="py-5 border-b border-border last:border-b-0">
      <div className="flex items-start justify-between gap-3">

        {/* Left: avatar + name + date */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {customerInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-foreground">{review.customer.customerName}</span>
              {isOwner && (
                <Badge variant="default" className="text-xs py-0 h-5">You</Badge>
              )}
              {review.verifiedPurchase && (
                <Badge variant="outline" className="text-xs py-0 h-5 border-green-500/40 text-green-600 bg-green-50 dark:bg-green-950/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </Badge>
              )}
              {canModerate && !isOwner && (
                <Badge variant="outline" className="text-xs py-0 h-5 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Mod
                </Badge>
              )}
            </div>
            {/* Stars on mobile — shown under name to avoid overlap */}
            <Rating readOnly value={review.rating} className="flex gap-0.5 mt-1 sm:hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <RatingButton key={i} />
              ))}
            </Rating>
            <p className="text-xs text-muted-foreground mt-0.5">
              {reviewDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Right: stars (desktop) + action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Rating readOnly value={review.rating} className="hidden sm:flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <RatingButton key={i} />
            ))}
          </Rating>

          {(showEditButton || showDeleteButton) && (
            <div className="flex gap-1 ml-1">
              {showEditButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit!(review.reviewId)}
                  className="h-7 w-7 p-0 hover:bg-muted"
                  title={isOwner ? "Edit your review" : "Moderate review"}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
              {showDeleteButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete!(review.reviewId)}
                  className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                  title={isOwner ? "Delete your review" : "Delete review (Admin)"}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review text indented under avatar */}
      <div className="mt-3 ml-12">
        <p className={`text-sm text-foreground leading-relaxed ${!expanded && isLong ? "line-clamp-4" : ""}`}>
          {review.reviewText}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="mt-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
};
