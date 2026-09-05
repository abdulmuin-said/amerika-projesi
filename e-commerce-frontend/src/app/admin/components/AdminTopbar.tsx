"use client";
import { Menu, Store, LogOut } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { toast } from "sonner";

export default function AdminTopbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const initials = user?.fullName
        ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : user?.email?.charAt(0).toUpperCase() ?? "A";

    const handleLogout = async () => {
        const t = toast.loading("Logging out...");
        try {
            await dispatch(logout()).unwrap();
            toast.success("Logged out", { id: t });
        } catch {
            toast.error("Logout failed", { id: t });
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
            {/* Hamburger */}
            <button
                onClick={onToggleSidebar}
                className="p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors shrink-0"
                aria-label="Toggle sidebar"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Brand */}
            <div className="flex items-center gap-3 shrink-0">
                <Link href="/" className="flex flex-col items-start leading-none select-none">
                    <span className="font-display text-lg font-semibold tracking-[0.12em] text-gray-900 uppercase">
                        NovaCanvas
                    </span>
                    <span className="text-[7.5px] font-sans font-medium tracking-[0.4em] text-[#c9a84c] uppercase pl-0.5 mt-0.5">
                        Studios
                    </span>
                </Link>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
                    Admin
                </span>
            </div>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-4">
                <Link
                    href="/"
                    className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <Store className="h-4 w-4" />
                    <span>Back to Store</span>
                </Link>

                <div className="h-4 w-px bg-gray-200 hidden sm:block" />

                {/* User pill */}
                {user && (
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {initials}
                        </div>
                        <div className="text-sm leading-tight hidden md:block">
                            <p className="font-medium text-gray-800 leading-none">{user.fullName || user.email}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{user.roleName}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
                    title="Logout"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:block">Logout</span>
                </button>
            </div>
        </header>
    );
}
