/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    FaSearch,
    FaFilter,
    FaPlus,
    FaEllipsisV,
    FaEdit,
    FaTrash
} from 'react-icons/fa';
import Image from 'next/image';

type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

interface Product {
    id: string;
    name: string;
    category: string;
    price: string;
    stock: number;
    status: ProductStatus;
    image: string;
}

const ProductsPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Mock data - replace with actual data from your API
    const products: Product[] = [
        {
            id: 'PRD001',
            name: 'Wireless Headphones',
            category: 'Electronics',
            price: '$99.99',
            stock: 150,
            status: 'in_stock',
            image: '/placeholder.png'
        },
        {
            id: 'PRD002',
            name: 'Smart Watch',
            category: 'Electronics',
            price: '$199.99',
            stock: 75,
            status: 'low_stock',
            image: '/placeholder.png'
        },
        // Add more mock products as needed
    ];

    const statusColors: Record<ProductStatus, string> = {
        in_stock: 'bg-green-100 text-green-800',
        low_stock: 'bg-yellow-100 text-yellow-800',
        out_of_stock: 'bg-red-100 text-red-800'
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar collapsed={!isSidebarOpen} mobileOpen={false} onMobileClose={() => {}} />

            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="p-8">
                    <div className="flex justify-between items-center">
                        <Header title="Products" />
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <FaPlus className="w-4 h-4" />
                            Add Product
                        </button>
                    </div>

                    {/* Filters and Search */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                <option value="electronics">Electronics</option>
                                <option value="clothing">Clothing</option>
                                <option value="books">Books</option>
                            </select>
                            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                <FaFilter className="w-4 h-4" />
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="relative h-48">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <button className="p-2 bg-white rounded-full shadow hover:bg-gray-50">
                                            <FaEllipsisV className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-500">{product.category}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-lg font-bold text-gray-900">{product.price}</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[product.status]}`}>
                                            {product.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                        <span>Stock: {product.stock}</span>
                                        <div className="flex gap-2">
                                            <button className="p-1 hover:bg-gray-100 rounded">
                                                <FaEdit className="w-4 h-4" />
                                            </button>
                                            <button className="p-1 hover:bg-gray-100 rounded text-red-500">
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductsPage; 