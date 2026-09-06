"use client";
import { useLocalization } from "@/lib/useLocalization";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LanguageCurrencyToggle({ className }: { className?: string }) {
    const { locale, switchLocale, t } = useLocalization();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                        "bg-white/10 hover:bg-white/20 text-white/90 border border-white/15",
                        className
                    )}
                    aria-label={t("header.changeLanguageCurrency")}
                >
                    <Globe className="h-3.5 w-3.5 text-[#c9a84c]" />
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                        {locale === "tr" ? "TR · ₺" : "US · $"}
                    </span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[oklch(0.25_0.02_55)] border-white/15 text-white p-1.5 shadow-2xl">
                <DropdownMenuItem
                    onClick={() => switchLocale("en")}
                    className="flex items-center justify-between px-3 py-2 text-xs font-medium cursor-pointer hover:bg-white/10 rounded transition-colors"
                >
                    <div className="flex items-center gap-2.5">
                        <span className="text-sm">🇺🇸</span>
                        <div className="flex flex-col text-left">
                            <span className="font-medium text-white">English</span>
                            <span className="text-[10px] text-white/60">USD ($) · Global</span>
                        </div>
                    </div>
                    {locale === "en" && <Check className="h-3.5 w-3.5 text-[#c9a84c]" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => switchLocale("tr")}
                    className="flex items-center justify-between px-3 py-2 text-xs font-medium cursor-pointer hover:bg-white/10 rounded transition-colors"
                >
                    <div className="flex items-center gap-2.5">
                        <span className="text-sm">🇹🇷</span>
                        <div className="flex flex-col text-left">
                            <span className="font-medium text-white">Türkçe</span>
                            <span className="text-[10px] text-white/60">TRY (₺) · Türkiye</span>
                        </div>
                    </div>
                    {locale === "tr" && <Check className="h-3.5 w-3.5 text-[#c9a84c]" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
