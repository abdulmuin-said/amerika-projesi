"use client";
import React from 'react';

interface PaymentFormData {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
}

interface PaymentFormProps {
    onSubmit: (data: PaymentFormData) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = React.useState<PaymentFormData>({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Format card number with spaces every 4 digits
        if (name === 'cardNumber') {
            formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
        }
        // Format expiry date with slash
        if (name === 'expiryDate') {
            formattedValue = value
                .replace(/\D/g, '')
                .replace(/^(\d{2})/, '$1/')
                .substr(0, 5);
        }

        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Payment Details</h2>

            <div className="space-y-4">
                <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                    </label>
                    <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        maxLength={19}
                        placeholder="1234 5678 9012 3456"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                        Card Holder Name
                    </label>
                    <input
                        type="text"
                        id="cardHolder"
                        name="cardHolder"
                        value={formData.cardHolder}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
                        </label>
                        <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                        </label>
                        <input
                            type="password"
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            maxLength={4}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                    Continue to Review
                </button>
            </div>
        </form>
    );
};

export default PaymentForm;