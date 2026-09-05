"use client";
import React from 'react';
import { FaDollarSign, FaShoppingCart, FaUserPlus, FaBoxOpen } from 'react-icons/fa';

interface StatCard {
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
    changeColor: string;
    trend: 'up' | 'down';
}

const stats: StatCard[] = [
    {
        title: 'Total Sales',
        value: '$24,500',
        change: '+12% from last month',
        icon: <FaDollarSign className="w-6 h-6 text-blue-500" />,
        changeColor: 'text-green-500',
        trend: 'up'
    },
    {
        title: 'Total Orders',
        value: '1,245',
        change: '+8% from last month',
        icon: <FaShoppingCart className="w-6 h-6 text-purple-500" />,
        changeColor: 'text-green-500',
        trend: 'up'
    },
    {
        title: 'New Customers',
        value: '156',
        change: '+5% from last month',
        icon: <FaUserPlus className="w-6 h-6 text-green-500" />,
        changeColor: 'text-green-500',
        trend: 'up'
    },
    {
        title: 'Low Stock Items',
        value: '12',
        change: 'Need attention',
        icon: <FaBoxOpen className="w-6 h-6 text-orange-500" />,
        changeColor: 'text-red-500',
        trend: 'down'
    }
];

const StatsGrid: React.FC = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {stats.map((stat, index) => (
                <div 
                    key={index} 
                    className="bg-white p-4 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <h3 className="text-sm md:text-base text-gray-500 font-medium">{stat.title}</h3>
                        <div className="p-2 rounded-lg bg-gray-50">
                            {stat.icon}
                        </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                        <p className={`text-xs md:text-sm ${stat.changeColor} font-medium`}>
                            {stat.change}
                        </p>
                        {stat.trend === 'up' ? (
                            <span className="ml-1 text-green-500">↑</span>
                        ) : (
                            <span className="ml-1 text-red-500">↓</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid; 