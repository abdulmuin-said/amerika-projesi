import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ReviewDetails } from "@/types/domains/review"

export default function Testimonials({reviews}: {reviews: ReviewDetails[]}) {
    return (
        <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">
                What Our Customers Are Saying
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review) => (
                    <Card key={review.reviewId} className="h-full flex flex-col justify-between">
                        <CardContent className="p-6 flex flex-col gap-3">
                            <div className="flex items-center gap-1 text-sm text-yellow-500">
                                <Star className="h-4 w-4 fill-yellow-500" />
                                <span className="text-foreground font-medium">{review.rating.toFixed(1)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">{review.reviewText}</p>
                            <div className="mt-auto text-sm font-medium text-foreground">
                                — {review.customer.customerName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Review for: {review.productTitle}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
