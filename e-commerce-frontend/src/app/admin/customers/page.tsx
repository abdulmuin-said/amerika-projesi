"use client";
import { useState } from "react";
import { Search, Filter, MoreVertical, MapPin } from "lucide-react";

const customers = [
    { id: "CUST001", name: "John Doe",   email: "john@example.com",  phone: "+1 234 567 8900", location: "New York, USA",       orders: 12, totalSpent: "$1,299.99", status: "active" },
    { id: "CUST002", name: "Jane Smith", email: "jane@example.com",  phone: "+1 234 567 8901", location: "Los Angeles, USA",    orders: 8,  totalSpent: "$899.99",   status: "active" },
];

export default function CustomersPage() {
    const [search, setSearch] = useState("");

    return (
        <>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Customers</h1>

            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search customers..."
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
                            {["Customer", "Contact", "Location", "Orders", "Total Spent", "Status", ""].map((h) => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {customers.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-semibold text-gray-600">{c.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{c.name}</p>
                                            <p className="text-xs text-gray-400">ID: {c.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-900">{c.email}</p>
                                    <p className="text-xs text-gray-500">{c.phone}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" /> {c.location}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{c.orders}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.totalSpent}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                        {c.status}
                                    </span>
                                </td>
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
