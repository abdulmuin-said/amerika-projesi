"use client";
import { useState } from "react";
import { TrendingUp, DollarSign, ShoppingCart, Users, Download } from "lucide-react";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, Title, Tooltip, Legend, ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const stats = [
    { title: "Total Revenue",       value: "$24,500", change: "+12.5%", icon: DollarSign },
    { title: "Total Orders",        value: "1,234",   change: "+8.2%",  icon: ShoppingCart },
    { title: "New Customers",       value: "456",     change: "+5.7%",  icon: Users },
    { title: "Avg. Order Value",    value: "$198.50", change: "+3.2%",  icon: TrendingUp },
];

const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "top" as const } } };

const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ label: "Revenue", data: [3000, 5000, 4000, 6000, 5500, 6500], borderColor: "#1f2937", backgroundColor: "rgba(31,41,55,0.08)", fill: true, tension: 0.4 }],
};

const ordersData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ label: "Orders", data: [150, 200, 180, 250, 220, 280], backgroundColor: "#1f2937" }],
};

const demographicsData = {
    labels: ["18–24", "25–34", "35–44", "45–54", "55+"],
    datasets: [{ data: [15, 30, 25, 20, 10], backgroundColor: ["#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db"] }],
};

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState("week");

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
                <div className="flex items-center gap-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    >
                        <option value="day">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-600">
                        <Download className="h-4 w-4" /> Export
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map(({ title, value, change, icon: Icon }) => (
                    <div key={title} className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-500">{title}</p>
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Icon className="h-4 w-4 text-gray-700" />
                            </div>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{value}</p>
                        <p className="text-sm text-green-600 font-medium mt-1">{change} <span className="text-gray-400 font-normal">vs last period</span></p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                    <div className="h-60"><Line data={revenueData} options={chartOptions} /></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Orders Overview</h3>
                    <div className="h-60"><Bar data={ordersData} options={chartOptions} /></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Top Products</h3>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gray-100 rounded-lg shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Product {i}</p>
                                        <p className="text-xs text-gray-500">Category</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">${(Math.random() * 1000).toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">{Math.floor(Math.random() * 100)} orders</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Customer Demographics</h3>
                    <div className="h-60">
                        <Doughnut data={demographicsData} options={{ ...chartOptions, plugins: { legend: { position: "right" as const } } }} />
                    </div>
                </div>
            </div>
        </>
    );
}
