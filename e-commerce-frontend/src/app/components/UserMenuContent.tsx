"use client";
import React from 'react';
import { LogIn, UserPlus2Icon, Package, CircleUserRoundIcon, LogOut, Loader2, Settings } from "lucide-react"
import {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import Link from 'next/link';
import { logout } from '@/store/slices/authSlice';
import { toast } from "sonner";
import { UserRole } from "@/types/domains/user";

export default function UserMenuContent() {
    const dispatch = useAppDispatch();
    const { authenticated, user } = useAppSelector(state => state.auth);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const isAdmin = user?.roleName === UserRole.ADMIN;
    const isPlatformAdmin = user?.roleName === UserRole.PLATFORM_ADMIN;
    const canShowAdmin = isAdmin || isPlatformAdmin;

    return authenticated ? (
        <>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem asChild>
                <Link href="/account/settings" className="flex items-center gap-2">
                    <CircleUserRoundIcon />
                    Account Settings
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/account/orders" className="flex items-center gap-2">
                    <Package />
                    Orders
                </Link>
            </DropdownMenuItem>
            {canShowAdmin && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="flex items-center gap-2">
                            <Settings />
                            Admin Dashboard
                        </Link>
                    </DropdownMenuItem>
                </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
                disabled={isLoggingOut}
                onClick={async () => {
                    if (isLoggingOut) return;
                    setIsLoggingOut(true);
                    const t = toast.loading("Logging out...");
                    try {
                        await dispatch(logout()).unwrap();
                        toast.success("Logged out", { id: t });
                    } catch {
                        toast.error("Logout failed", { id: t });
                    } finally {
                        setIsLoggingOut(false);
                    }
                }}
            >
                {isLoggingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
                {isLoggingOut ? "Logging out..." : "Logout"}
            </DropdownMenuItem>
        </>
    ) : (
        <>
            <DropdownMenuItem asChild>
                <Link href="/auth/login" className="flex items-center gap-2">
                    <LogIn />
                    Login
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/auth/register" className="flex items-center gap-2">
                    <UserPlus2Icon />
                    Register
                </Link>
            </DropdownMenuItem>
        </>
    );
}
