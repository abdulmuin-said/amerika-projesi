"use client";
import React from 'react';

interface Order {
    id: number;
    customer: string;
    product: string;
    amount: number;
    status: string;
}

const mockOrders: Order[] = [
    { id: 1, customer: 'John Doe', product: 'Product 1', amount: 299.99, status: 'Delivered' },
    { id: 2, customer: 'Jane Smith', product: 'Product 2', amount: 199.99, status: 'Processing' },
    { id: 3, customer: 'Mike Johnson', product: 'Product 3', amount: 399.99, status: 'Shipped' },
    { id: 4, customer: 'Sarah Williams', product: 'Product 4', amount: 149.99, status: 'Delivered' },
    { id: 5, customer: 'Tom Brown', product: 'Product 5', amount: 249.99, status: 'Pending' }
];

const RecentOrders: React.FC = () => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-gray-500">
                            <th className="pb-4">Order ID</th>
                            <th className="pb-4">Customer</th>
                            <th className="pb-4">Product</th>
                            <th className="pb-4">Amount</th>
                            <th className="pb-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockOrders.map((order) => (
                            <tr key={order.id} className="border-t">
                                <td className="py-4">#ORD-{order.id}</td>
                                <td className="py-4">{order.customer}</td>
                                <td className="py-4">{order.product}</td>
                                <td className="py-4">${order.amount.toFixed(2)}</td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentOrders; 