"use client";

import React, { useEffect } from "react";
import AdminShell from "./components/AdminShell";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/domains/user";
import Spinner from "@/components/ui/spinner";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, authenticated } = useAppSelector((state) => state.auth);
    const router = useRouter();

    const isAuthorized = authenticated && (user?.roleName === UserRole.ADMIN || user?.roleName === UserRole.PLATFORM_ADMIN);

    useEffect(() => {
        if (loading) return;
        if (!isAuthorized) {
            toast.error("Access denied. Administrator privileges required.");
            router.replace("/auth/login");
        }
    }, [loading, isAuthorized, router]);

    if (loading || !isAuthorized) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 text-center">
                <Spinner className="size-8 text-primary mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Verifying administrator credentials...</p>
            </div>
        );
    }

    return <AdminShell>{children}</AdminShell>;
}

