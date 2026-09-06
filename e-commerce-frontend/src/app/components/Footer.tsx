"use client";
import Link from "next/link";
import { useState } from "react";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { PaymentBadgesGroup } from "./PaymentBadges";
import { useLocalization } from "@/lib/useLocalization";
import { toast } from "sonner";

export default function Footer() {
    const [email, setEmail] = useState("");
    const { t } = useLocalization();

    const shopLinks = [
        { label: t("footer.allProducts"), href: "/products" },
        { label: t("footer.newArrivals"), href: "/products?sort=NEWEST" },
        { label: t("footer.bestsellers"), href: "/products?sort=MOST_REVIEWED" },
    ];

    const infoLinks = [
        { label: t("footer.shippingReturns"), href: "/shipping-returns" },
        { label: t("footer.termsConditions"), href: "/terms-and-conditions" },
        { label: t("footer.privacyPolicy"), href: "/privacy-policy" },
    ];

    const serviceLinks = [
        { label: t("footer.contactUs"), href: "/contact" },
        { label: t("footer.faq"), href: "/faq" },
        { label: t("footer.trackOrder"), href: "/account/orders" },
        { label: t("footer.aboutUs"), href: "/about-us" },
    ];

    const socialLinks = [
        { icon: Instagram, label: "Instagram", href: "#" },
        { icon: Twitter,   label: "Twitter",   href: "#" },
        { icon: Facebook,  label: "Facebook",  href: "#" },
        { icon: Youtube,   label: "YouTube",   href: "#" },
    ];

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim() && email.includes("@")) {
            toast.success(t("footer.subscribedSuccess"));
            setEmail("");
        }
    };

    return (
        <footer className="bg-[oklch(0.42_0.02_55)] border-t-2 border-[#c9a84c]">
            <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 py-16">

                {/* ── Top: brand + newsletter ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 pb-12 border-b border-white/10">

                    {/* Brand */}
                    <div>
                        <Link href="/" className="inline-flex flex-col items-start leading-none group mb-4 select-none">
                            <span className="font-display text-3xl md:text-4xl font-semibold tracking-[0.14em] text-white group-hover:text-[#e4cf8d] transition-colors uppercase">
                                NovaLux
                            </span>
                            <span className="text-[11px] md:text-xs font-sans font-medium tracking-[0.45em] text-[#c9a84c] uppercase pl-1 mt-1">
                                Studios
                            </span>
                        </Link>
                        <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                            {t("footer.brandDescription")}
                        </p>
                        <div className="mt-8">
                            <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c] mb-2.5 flex items-center gap-1.5 font-medium">
                                <span>{t("footer.guaranteedCheckout")}</span>
                            </p>
                            <PaymentBadgesGroup theme="dark" className="pt-1.5" />
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c] mb-3">
                            {t("footer.newsletterTitle")}
                        </p>
                        <p className="text-white/60 text-sm leading-relaxed mb-5">
                            {t("footer.newsletterDesc")}
                        </p>
                        <form onSubmit={handleSubscribe} className="flex">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("footer.newsletterPlaceholder")}
                                required
                                className="flex-1 min-w-0 bg-white/5 border border-white/15 border-r-0 text-white text-sm placeholder:text-white/40 px-4 py-2.5 outline-none focus:border-[#c9a84c]/50 transition-colors"
                            />
                            <button
                                type="submit"
                                className="bg-[#c9a84c] hover:bg-[#b8960c] text-[oklch(0.16_0.02_55)] text-[11px] font-semibold tracking-widest uppercase px-5 py-2.5 transition-colors shrink-0 cursor-pointer"
                            >
                                {t("footer.subscribeButton")}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── Middle: link columns ── */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10 py-12 border-b border-white/10">

                    <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c] mb-5">
                            {t("footer.shopTitle")}
                        </p>
                        <ul className="space-y-3.5">
                            {shopLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c] mb-5">
                            {t("footer.infoTitle")}
                        </p>
                        <ul className="space-y-3.5">
                            {infoLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c] mb-5">
                            {t("footer.serviceTitle")}
                        </p>
                        <ul className="space-y-3.5">
                            {serviceLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ── Bottom bar ── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
                    <p className="text-white/40 text-xs tracking-wide">
                        {t("footer.copyright", { year: new Date().getFullYear() })}
                    </p>
                    <div className="flex items-center gap-5">
                        {socialLinks.map(({ icon: Icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="text-white/40 hover:text-[#c9a84c] transition-colors"
                            >
                                <Icon className="h-4 w-4" />
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    );
}
