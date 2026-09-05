"use client";
import { useState } from "react";
import { Search, Filter, MoreVertical } from "lucide-react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered";

interface Order {
    id: string;
    customer: string;
    date: string;
    status: OrderStatus;
    total: string;
    items: number;
}

const orders: Order[] = [
    { id: "ORD001", customer: "John Doe",   date: "2024-03-15", status: "pending",    total: "$299.99", items: 3 },
    { id: "ORD002", customer: "Jane Smith", date: "2024-03-14", status: "processing", total: "$199.99", items: 2 },
];

const statusColors: Record<OrderStatus, string> = {
    pending:    "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped:    "bg-purple-100 text-purple-800",
    delivered:  "bg-green-100 text-green-800",
};

export default function OrdersPage() {
    const [search, setSearch] = useState("");

    return (
        <>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Orders</h1>

            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                </div>
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-600">
                    <Filter className="h-4 w-4" /> Filter
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            {["Order ID", "Customer", "Date", "Status", "Total", "Items", ""].map((h) => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{order.total}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{order.items}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
