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
import { useLocalization } from "@/lib/useLocalization";

export default function UserMenuContent() {
    const dispatch = useAppDispatch();
    const { authenticated, user } = useAppSelector(state => state.auth);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const { t, locale } = useLocalization();

    const isAdmin = user?.roleName === UserRole.ADMIN;
    const isPlatformAdmin = user?.roleName === UserRole.PLATFORM_ADMIN;
    const canShowAdmin = isAdmin || isPlatformAdmin;

    return authenticated ? (
        <>
            <DropdownMenuLabel>{t("header.myAccount")}</DropdownMenuLabel>
            <DropdownMenuItem asChild>
                <Link href="/account/settings" className="flex items-center gap-2">
                    <CircleUserRoundIcon />
                    {t("header.accountSettings")}
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/account/orders" className="flex items-center gap-2">
                    <Package />
                    {t("header.orders")}
                </Link>
            </DropdownMenuItem>
            {canShowAdmin && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="flex items-center gap-2">
                            <Settings />
                            {t("header.adminDashboard")}
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
                    const toastId = toast.loading(locale === "tr" ? "Çıkış yapılıyor..." : "Logging out...");
                    try {
                        await dispatch(logout()).unwrap();
                        toast.success(locale === "tr" ? "Başarıyla çıkış yapıldı" : "Logged out", { id: toastId });
                    } catch {
                        toast.error(locale === "tr" ? "Çıkış başarısız oldu" : "Logout failed", { id: toastId });
                    } finally {
                        setIsLoggingOut(false);
                    }
                }}
            >
                {isLoggingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
                {isLoggingOut ? (locale === "tr" ? "Çıkış yapılıyor..." : "Logging out...") : t("header.logout")}
            </DropdownMenuItem>
        </>
    ) : (
        <>
            <DropdownMenuItem asChild>
                <Link href="/auth/login" className="flex items-center gap-2">
                    <LogIn />
                    {t("header.login")}
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/auth/register" className="flex items-center gap-2">
                    <UserPlus2Icon />
                    {t("header.register")}
                </Link>
            </DropdownMenuItem>
        </>
    );
}
