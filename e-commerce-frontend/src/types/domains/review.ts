import { Product } from "./product";
import { CustomerContact, ShopUser } from "./user";

export interface ReviewDTO {
    productId: number;
    rating: number;
    reviewText: string;
}

export interface ReviewDetails {
    reviewId: number;
    reviewText: string;
    customer: CustomerContact;
    productId: number;
    productTitle: string;
    rating: number;
    dateOfSubmission: Date;
    verifiedPurchase?: boolean;
}

export interface Review {
    reviewId: number;
    product: Product;
    dateOfSubmission: Date;
    rating: number;
    reviewText: string;
    user: ShopUser;
}