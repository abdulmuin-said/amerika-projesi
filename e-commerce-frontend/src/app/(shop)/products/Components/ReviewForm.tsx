import { useEffect, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Rating, RatingButton } from "@/components/ui/rating";
import { Send, Pencil } from "lucide-react";
import Link from "next/link";
import { useLocalization } from "@/lib/useLocalization";

interface ReviewFormProps {
  productId: number;
  mode: "create" | "edit";
  initialData?: {
    rating: number;
    reviewText: string;
  };
  onSubmit: (reviewData: {
    productId: number;
    rating: number;
    reviewText: string;
  }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  loginRequired?: boolean;
}

export const ReviewForm = ({
  productId,
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  loginRequired = false,
}: ReviewFormProps) => {
  const { t } = useLocalization();

  const reviewFormSchema = useMemo(() => z.object({
    rating: z.number().min(1, t("reviews.selectRating")),
    reviewText: z.string().min(10, t("reviews.minChars")),
  }), [t]);

  type ReviewFormData = z.infer<typeof reviewFormSchema>;

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: initialData?.rating || 0,
      reviewText: initialData?.reviewText || "",
    },
    mode: "onChange",
  });

  const { control, watch, reset } = form;

  const watchedRating = watch("rating");
  const watchedReviewText = watch("reviewText") || "";
  const isFormValid =
    watchedRating > 0 && watchedReviewText.trim().length >= 10;

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        rating: initialData.rating,
        reviewText: initialData.reviewText,
      });
    }
  }, [initialData, mode, reset]);

  const onFormSubmit = (data: ReviewFormData) => {
    onSubmit({
      productId,
      rating: data.rating,
      reviewText: data.reviewText.trim(),
    });

    // Reset form only in create mode
    if (mode === "create") {
      reset({ rating: 0, reviewText: "" });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFormSubmit)}
        className="space-y-6"
      >
        {/* Rating Field */}
        <FormField
          control={control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Rating
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex gap-1"
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <RatingButton key={index} />
                  ))}
                </Rating>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Textarea Field */}
        <FormField
          control={control}
          name="reviewText"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t("reviews.reviewPlaceholder")}
                  rows={5}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Login notice */}
        {loginRequired && (
          <p className="text-sm text-muted-foreground">
            {t("reviews.loginRequired")}{" "}
            <Link href="/auth/login" className="text-foreground underline underline-offset-2 font-medium">
              {t("reviews.login")}
            </Link>
          </p>
        )}

        {/* Submit & Cancel Buttons */}
        <div className="flex items-center gap-2">
          <Button type="submit" className="rounded-none" disabled={isSubmitting || !isFormValid || loginRequired}>
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mr-2" />
                {mode === "edit" ? t("reviews.updating") : t("reviews.submitting")}
              </>
            ) : (
              <>
                {mode === "edit" ? (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    {t("reviews.editReview")}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t("reviews.submitReview")}
                  </>
                )}
              </>
            )}
          </Button>

          {onCancel && (
            <Button type="button" variant="outline" className="rounded-none" onClick={onCancel}>
              {t("reviews.cancel")}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};