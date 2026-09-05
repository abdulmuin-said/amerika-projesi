"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart2,
    Settings2,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { name: "Dashboard",  href: "/admin",            icon: LayoutDashboard },
    { name: "Products",   href: "/admin/products",   icon: Package },
    { name: "Orders",     href: "/admin/orders",     icon: ShoppingCart },
    { name: "Customers",  href: "/admin/customers",  icon: Users },
    { name: "Analytics",  href: "/admin/analytics",  icon: BarChart2 },
    { name: "Settings",   href: "/admin/settings",   icon: Settings2 },
];

interface SidebarProps {
    collapsed: boolean;
    mobileOpen: boolean;
    onMobileClose: () => void;
}

function NavLink({
    item,
    active,
    collapsed,
    onClick,
}: {
    item: typeof menuItems[0];
    active: boolean;
    collapsed?: boolean;
    onClick?: () => void;
}) {
    return (
        <Link
            href={item.href}
            onClick={onClick}
            title={collapsed ? item.name : undefined}
            className={cn(
                "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
        >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>{item.name}</span>}
        </Link>
    );
}

export default function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) =>
        href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

    return (
        <>
            {/* ── Desktop sidebar ── */}
            <aside
                className={cn(
                    "fixed top-14 left-0 z-30 h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200 transition-all duration-300 hidden md:flex flex-col",
                    collapsed ? "w-16" : "w-60"
                )}
            >
                <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
                    {menuItems.map((item) => (
                        <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />
                    ))}
                </nav>
            </aside>

            {/* ── Mobile drawer ── */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 flex flex-col md:hidden",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
                    <Link href="/" className="flex flex-col items-start leading-none select-none">
                        <span className="font-display text-lg font-semibold tracking-[0.12em] text-gray-900 uppercase">
                            NovaCanvas
                        </span>
                        <span className="text-[7.5px] font-sans font-medium tracking-[0.4em] text-[#c9a84c] uppercase pl-0.5 mt-0.5">
                            Studios
                        </span>
                    </Link>
                    <button
                        onClick={onMobileClose}
                        className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink key={item.href} item={item} active={isActive(item.href)} onClick={onMobileClose} />
                    ))}
                </nav>
            </aside>
        </>
    );
}
