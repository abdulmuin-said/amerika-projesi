"use client";
import { useState } from "react";
import AdminTopbar from "./AdminTopbar";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleToggle = () => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setMobileOpen((p) => !p);
        } else {
            setCollapsed((p) => !p);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminTopbar onToggleSidebar={handleToggle} />

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <Sidebar
                collapsed={collapsed}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <main
                className={cn(
                    "transition-all duration-300 pt-14 min-h-screen",
                    collapsed ? "md:ml-16" : "md:ml-60"
                )}
            >
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
