/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";

interface CustomerContact {
    id: number;
    name: string;
    email: string;
    phone?: string;
}

interface Review {
    reviewId: number;
    reviewText: string;
    customer: CustomerContact;
    productId: number;
    productTitle: string;
    rating: number;
    dateOfSubmission: Date;
}

export default function Reviews() {
    const [reviews, setReviews] = useState<Review[]>([
        {
            reviewId: 1,
            productId: 1,
            productTitle: "Canvas Print - Nature",
            rating: 5,
            reviewText: "Beautiful print quality and colors are vibrant. Exactly what I was looking for!",
            dateOfSubmission: new Date("2024-01-10"),
            customer: {
                id: 1,
                name: "John Doe",
                email: "john@example.com"
            }
        }
    ]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center">
                <h2 className="text-3xl font-bold text-gray-900">My Reviews</h2>
            </div>

            <div className="space-y-4">
                {reviews.map((review) => (
                    <div
                        key={review.reviewId}
                        className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-start gap-6">
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-medium text-gray-900">{review.productTitle}</h3>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, index) => (
                                                <Star
                                                    key={index}
                                                    className={`w-4 h-4 ${index < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {review.dateOfSubmission.toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="mt-4 flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                                    <p className="text-gray-600 text-sm">{review.reviewText}</p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="font-medium text-gray-700">{review.customer.name}</span>
                                        <span>•</span>
                                        <span>{review.customer.email}</span>
                                        {review.customer.phone && (
                                            <>
                                                <span>•</span>
                                                <span>{review.customer.phone}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}