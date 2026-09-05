/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface OrderReviewProps {
    shippingAddress: any;
    paymentDetails: any;
    onPlaceOrder: () => void;
}

const OrderReview: React.FC<OrderReviewProps> = ({ shippingAddress, paymentDetails, onPlaceOrder }) => {

    if (!shippingAddress || !paymentDetails) {
        return null;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Review Your Order</h2>

            <div className="space-y-6">
                {/* Shipping Address Review */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-gray-700">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                        <p className="text-gray-700">{shippingAddress.address}</p>
                        <p className="text-gray-700">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                        <p className="text-gray-700">{shippingAddress.country}</p>
                        <p className="text-gray-700 mt-2">Email: {shippingAddress.email}</p>
                        <p className="text-gray-700">Phone: {shippingAddress.phone}</p>
                    </div>
                </div>

                {/* Payment Details Review */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Details</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-gray-700">Card ending in {paymentDetails.cardNumber.slice(-4)}</p>
                        <p className="text-gray-700">{paymentDetails.cardHolder}</p>
                        <p className="text-gray-700">Expires: {paymentDetails.expiryDate}</p>
                    </div>
                </div>

                {/* Order Summary */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>$99.99</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span>$9.99</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax</span>
                            <span>$11.00</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3 mt-3">
                            <div className="flex justify-between font-medium text-gray-900">
                                <span>Total</span>
                                <span>$120.98</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={onPlaceOrder} // Parent component se success modal trigger hoga
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                    Place Order
                </button>
            </div>
        </div>
    );
};

export default OrderReview;