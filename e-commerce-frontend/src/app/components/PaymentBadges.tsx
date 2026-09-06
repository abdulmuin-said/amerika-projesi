"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { useLocalization } from "@/lib/useLocalization";

export function VisaIcon({ className = "h-4 w-auto" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
            <rect width="36" height="24" rx="3" fill="#ffffff" />
            <path d="M14.7 16.4L16.4 7.6H18.7L17 16.4H14.7Z" fill="#1A1F71" />
            <path d="M23.1 7.8C22.6 7.6 21.9 7.4 21 7.4C18.8 7.4 17.2 8.5 17.2 10.1C17.2 11.3 18.3 12 19.1 12.4C19.9 12.8 20.2 13.1 20.2 13.5C20.2 14.1 19.4 14.4 18.7 14.4C17.7 14.4 17.1 14.2 16.3 13.8L15.9 13.6L15.6 15.4C16.2 15.7 17.3 16 18.4 16C20.8 16 22.3 14.8 22.3 13.1C22.3 11.8 21.1 11.2 20.3 10.8C19.6 10.4 19.3 10.2 19.3 9.7C19.3 9.3 19.8 8.9 20.7 8.9C21.4 8.9 22 9.1 22.5 9.3L22.7 9.4L23.1 7.8Z" fill="#1A1F71" />
            <path d="M26.2 13.5C26.4 13 27.2 10.7 27.2 10.7C27.2 10.7 27.4 10.1 27.5 9.7L27.9 13.5H26.2ZM29.5 16.4H31.5L29.8 7.6H28C27.5 7.6 27.1 7.9 26.9 8.3L23.7 16.4H26L26.5 15H29.1L29.5 16.4Z" fill="#1A1F71" />
            <path d="M12.9 7.6L10.7 13.6L10.5 12.4C10.1 11.2 9.1 9.8 8 9.2L10 16.4H12.4L15.9 7.6H12.9Z" fill="#1A1F71" />
            <path d="M8.9 7.6H5.1L5 7.8C8 8.5 10 10.2 10.5 12.4L9.8 8.6C9.6 7.9 9.3 7.6 8.9 7.6Z" fill="#F7B600" />
        </svg>
    );
}

export function MastercardIcon({ className = "h-4 w-auto" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
            <rect width="36" height="24" rx="3" fill="#ffffff" />
            <circle cx="14" cy="12" r="6.8" fill="#EB001B" />
            <circle cx="22" cy="12" r="6.8" fill="#F79E1B" />
            <path d="M18 7.3C19.4 8.5 20.3 10.1 20.3 12C20.3 13.9 19.4 15.5 18 16.7C16.6 15.5 15.7 13.9 15.7 12C15.7 10.1 16.6 8.5 18 7.3Z" fill="#FF5F00" />
        </svg>
    );
}

export function AmexIcon({ className = "h-4 w-auto" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="American Express">
            <rect width="36" height="24" rx="3" fill="#006FCF" />
            <text x="18" y="15" textAnchor="middle" fill="#ffffff" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="8" letterSpacing="0.5">AMEX</text>
        </svg>
    );
}

export function ApplePayIcon({ className = "h-4 w-auto" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Apple Pay">
            <rect width="36" height="24" rx="3" fill="#000000" />
            <g fill="#ffffff">
                <path d="M12.6 11.2C12.6 10 13.5 9.4 13.6 9.3C13 8.5 12.1 8.3 11.8 8.3C11 8.2 10.2 8.7 9.8 8.7C9.4 8.7 8.8 8.3 8.2 8.3C7.3 8.3 6.5 8.8 6.1 9.6C5.1 11.2 5.8 13.6 6.8 14.9C7.2 15.5 7.7 16.2 8.4 16.2C9.1 16.2 9.4 15.7 10.2 15.7C11.1 15.7 11.3 16.2 12 16.2C12.8 16.2 13.2 15.5 13.7 14.9C14.2 14.1 14.5 13.5 14.5 13.4C14.4 13.3 12.6 12.7 12.6 11.2ZM11.3 7.6C11.7 7.1 11.9 6.4 11.8 5.8C11.2 5.8 10.5 6.2 10.1 6.7C9.7 7.1 9.4 7.8 9.5 8.4C10.1 8.5 10.9 8.1 11.3 7.6Z" />
                <path d="M16.4 9.2H15V15.8H16.4V13.5H17.8C19.4 13.5 20.4 12.5 20.4 11.3C20.4 10.1 19.4 9.2 17.8 9.2H16.4ZM16.4 12.2V10.5H17.7C18.6 10.5 19.1 10.8 19.1 11.3C19.1 11.8 18.6 12.2 17.7 12.2H16.4ZM21.3 14.1C21.3 13.1 22.2 12.5 23.5 12.4L24.7 12.3V11.8C24.7 11.1 24.2 10.7 23.4 10.7C22.7 10.7 22.2 11 22 11.5H21C21.2 10.4 22.2 9.6 23.6 9.6C25.1 9.6 26 10.5 26 11.9V15.8H24.8V14.8C24.4 15.4 23.5 15.8 22.6 15.8C21.7 15.8 21.3 15.1 21.3 14.1ZM24.7 13.5V13.2L23.6 13.3C23 13.4 22.6 13.7 22.6 14.2C22.6 14.6 23 15 23.5 15C24.2 15 24.5 14.6 24.5 13.7ZM26.6 10.2H27.9L29.6 14.8L31.4 10.2H32.7L30.2 15.8L29.9 16.5C29.4 17.4 28.8 17.9 27.8 17.9C27.4 17.9 26.9 17.8 26.7 17.6L27 16.6C27.2 16.7 27.5 16.8 27.8 16.8C28.4 16.8 28.7 16.5 29 15.8L29.2 15.4L26.6 10.2Z" />
            </g>
        </svg>
    );
}

export function GooglePayIcon({ className = "h-4 w-auto" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Google Pay">
            <rect width="36" height="24" rx="3" fill="#ffffff" />
            <path d="M12.4 12C12.4 11.6 12.4 11.2 12.3 10.9H8.5V12.6H10.7C10.6 13.2 10.2 13.8 9.7 14.2V15.5H11.3C12.2 14.6 12.4 13.4 12.4 12Z" fill="#4285F4" />
            <path d="M8.5 16.4C9.6 16.4 10.5 16 11.3 15.5L9.7 14.2C9.3 14.5 8.9 14.6 8.5 14.6C7.5 14.6 6.6 13.9 6.3 13H4.7V14.3C5.5 15.6 6.9 16.4 8.5 16.4Z" fill="#34A853" />
            <path d="M6.3 13C6.1 12.6 6.1 12.3 6.1 12C6.1 11.7 6.1 11.4 6.3 11V9.7H4.7C4.1 10.8 4.1 12.2 4.7 13.3L6.3 13Z" fill="#FBBC04" />
            <path d="M8.5 9.4C9.1 9.4 9.7 9.6 10.1 10L11.4 8.7C10.6 8 9.6 7.6 8.5 7.6C6.9 7.6 5.5 8.4 4.7 9.7L6.3 11C6.6 10.1 7.5 9.4 8.5 9.4Z" fill="#EA4335" />
            <path d="M16.5 9.6H15.1V15.8H16.5V13.7H17.8C19.2 13.7 20.3 12.8 20.3 11.6C20.3 10.5 19.2 9.6 17.8 9.6H16.5ZM16.5 12.5V10.8H17.8C18.5 10.8 19 11.1 19 11.6C19 12.1 18.5 12.5 17.8 12.5H16.5ZM21.2 14.3C21.2 13.3 22.1 12.7 23.4 12.6L24.5 12.5V12.1C24.5 11.4 24 11 23.3 11C22.6 11 22.1 11.3 21.9 11.8H20.7C20.9 10.8 21.9 10 23.3 10C24.8 10 25.7 10.9 25.7 12.2V15.8H24.6V14.9C24.2 15.5 23.3 15.9 22.5 15.9C21.6 15.9 21.2 15.2 21.2 14.3ZM24.5 13.7V13.4L23.6 13.5C22.9 13.6 22.5 13.9 22.5 14.4C22.5 14.8 22.9 15.1 23.5 15.1C24.2 15.1 24.5 14.6 24.5 13.7ZM26.6 10.2H27.9L29.6 14.8L31.4 10.2H32.7L30.2 15.8L29.9 16.5C29.4 17.4 28.8 17.9 27.8 17.9C27.4 17.9 26.9 17.8 26.7 17.6L27 16.6C27.2 16.7 27.5 16.8 27.8 16.8C28.4 16.8 28.7 16.5 29 15.8L29.2 15.4L26.6 10.2Z" fill="#5F6368" />
        </svg>
    );
}

export function PayTRIcon({ className = "h-4 w-auto" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 42 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="PayTR">
            <rect width="42" height="24" rx="3" fill="#0B1A30" />
            <text x="14" y="16.5" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="10" letterSpacing="-0.3">Pay</text>
            <text x="31" y="16.5" textAnchor="middle" fill="#00D09C" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="10" letterSpacing="0.2">TR</text>
        </svg>
    );
}

export function TroyIcon({ className = "h-4 w-auto" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="TROY">
            <rect width="36" height="24" rx="3" fill="#0072CE" />
            <text x="18" y="16" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="8.5" letterSpacing="0.8">TROY</text>
        </svg>
    );
}

export function StripeIcon({ className = "h-4 w-auto" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Stripe">
            <rect width="36" height="24" rx="3" fill="#635BFF" />
            <path d="M15.5 11.2C15.5 10.3 16.3 9.9 17.6 9.9C18.8 9.9 20.2 10.3 21.3 10.9L21.9 8.8C20.6 8.3 19.2 8 17.6 8C14.5 8 12.8 9.5 12.8 11.6C12.8 14.9 17.5 14.2 17.5 15.9C17.5 16.8 16.5 17.2 15.3 17.2C13.8 17.2 12.3 16.6 11.1 15.9L10.5 18C11.9 18.7 13.6 19.1 15.3 19.1C18.6 19.1 20.4 17.6 20.4 15.5C20.4 12 15.5 12.8 15.5 11.2Z" fill="#ffffff" />
        </svg>
    );
}

export function DiscoverIcon({ className = "h-4 w-auto" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Discover">
            <rect width="36" height="24" rx="3" fill="#ffffff" />
            <text x="13" y="14.5" textAnchor="middle" fill="#231F20" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="6.5" letterSpacing="0.2">DISC</text>
            <circle cx="21.5" cy="12" r="3.2" fill="#F47216" />
            <text x="27.5" y="14.5" textAnchor="middle" fill="#231F20" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="6.5" letterSpacing="0.2">VER</text>
        </svg>
    );
}

interface PaymentBadgesGroupProps {
    theme?: "light" | "dark";
    className?: string;
}

export function PaymentBadgesGroup({ theme = "light", className = "" }: PaymentBadgesGroupProps) {
    const badgeClass = theme === "dark"
        ? "inline-flex items-center justify-center h-6 w-9 sm:h-7 sm:w-10 rounded bg-white shadow-sm overflow-hidden shrink-0 border border-white/20 transition-transform hover:scale-105"
        : "inline-flex items-center justify-center h-6 w-9 sm:h-7 sm:w-10 rounded bg-white shadow-2xs overflow-hidden shrink-0 border border-stone-200 hover:border-stone-300 transition-colors";

    return (
        <div className={`flex items-center flex-wrap gap-1.5 sm:gap-2 ${className}`}>
            <span className={badgeClass} title="PayTR Güvenli Ödeme"><PayTRIcon className="h-4 w-auto" /></span>
            <span className={badgeClass} title="TROY Yerli Kart"><TroyIcon className="h-4 w-auto" /></span>
            <span className={badgeClass} title="Visa"><VisaIcon className="h-4 w-auto" /></span>
            <span className={badgeClass} title="Mastercard"><MastercardIcon className="h-4 w-auto" /></span>
            <span className={badgeClass} title="American Express"><AmexIcon className="h-4 w-auto" /></span>
            <span className={badgeClass} title="Apple Pay"><ApplePayIcon className="h-4 w-auto" /></span>
            <span className={badgeClass} title="Google Pay"><GooglePayIcon className="h-4 w-auto" /></span>
            <span className={badgeClass} title="Discover"><DiscoverIcon className="h-4 w-auto" /></span>
        </div>
    );
}

export function ProductDetailPaymentTrustBox() {
    const { locale } = useLocalization();

    return (
        <div className="border border-stone-200/90 rounded-xl p-3 sm:p-3.5 bg-stone-50/70 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1.5">
                <span className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    {locale === "tr" ? "Güvenli ve Korumalı Ödeme Altyapısı" : "Guaranteed Safe & Secure Checkout"}
                </span>
                <span className="text-[10px] text-stone-500 font-medium tracking-wide">
                    {locale === "tr" ? "256-Bit SSL Şifreleme" : "256-Bit SSL Encryption"}
                </span>
            </div>
            <PaymentBadgesGroup theme="light" />
        </div>
    );
}
