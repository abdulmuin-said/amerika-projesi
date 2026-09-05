"use client";
import StatsGrid from "./components/StatsGrid";
import RecentOrders from "./components/RecentOrders";
import { Plus, UserPlus, BarChart2, Settings2 } from "lucide-react";

const quickActions = [
    { label: "Add Product",   icon: Plus,      color: "bg-blue-50 text-blue-600" },
    { label: "Add Customer",  icon: UserPlus,  color: "bg-green-50 text-green-600" },
    { label: "View Reports",  icon: BarChart2, color: "bg-purple-50 text-purple-600" },
    { label: "Settings",      icon: Settings2, color: "bg-orange-50 text-orange-600" },
];

export default function AdminDashboard() {
    return (
        <>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

            <StatsGrid />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View All
                        </button>
                    </div>
                    <RecentOrders />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-5">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map(({ label, icon: Icon, color }) => (
                            <button
                                key={label}
                                className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className={`h-11 w-11 rounded-full flex items-center justify-center mb-2 ${color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
