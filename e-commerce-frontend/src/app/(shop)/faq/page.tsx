"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck, Truck, Palette, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const faqs = [
    {
        category: "Art & Materials",
        icon: Palette,
        items: [
            {
                q: "What materials do you use for your panoramic canvas prints?",
                a: "All NovaCanvas Studios artworks are printed on premium 380gsm museum-grade 100% natural cotton canvas. We use archival pigment inks that are UV-resistant, ensuring vibrant, non-fading colors for decades."
            },
            {
                q: "What is the difference between 'No Frame' and 'Framed' options?",
                a: "'No Frame' refers to a gallery-wrapped canvas stretched tightly over a 1.5-inch solid kiln-dried pine wood chassis, ready to hang immediately with pre-installed hardware. 'Framed' adds a handcrafted floating wooden frame available in Gold, Silver, Black, White, Walnut, and Natural Oak."
            },
            {
                q: "Can I order custom dimensions?",
                a: "Yes! While our catalog offers 6 standardized panoramic proportions from 24x8 inches up to 72x24 inches, our studio can craft custom panoramic dimensions. Please reach out via our Contact page."
            }
        ]
    },
    {
        category: "Shipping & Delivery",
        icon: Truck,
        items: [
            {
                q: "How long does shipping take to the United States and Europe?",
                a: "Each piece is made to order within 1 to 3 business days. Once crafted, we dispatch via Express Air courier (DHL / FedEx Express). Delivery takes 3 to 5 business days to the US and Europe with end-to-end tracking."
            },
            {
                q: "How are the canvases packaged?",
                a: "Artworks are secured in custom high-density protective foam and shipped in reinforced multi-layer timber-backed corrugated boxes to guarantee pristine arrival."
            }
        ]
    },
    {
        category: "Returns & Guarantees",
        icon: RotateCcw,
        items: [
            {
                q: "What happens if my canvas arrives damaged?",
                a: "We provide an unconditional 100% Safe Arrival Guarantee. In the rare event of transit damage, simply take a photo and send it to concierge@novacanvas.com; we will immediately manufacture and rush an identical replacement to you free of charge."
            },
            {
                q: "What is your return policy?",
                a: "We offer a 30-day satisfaction guarantee. If you are not completely delighted with your artwork, you may return it within 30 days of receipt in original packaging for a full refund or exchange."
            }
        ]
    },
    {
        category: "Payments & Orders",
        icon: ShieldCheck,
        items: [
            {
                q: "What currency will I be charged in?",
                a: "All prices on NovaCanvas Studios are listed and charged in US Dollars ($ / USD). If your credit card is issued in another currency (e.g. EUR, GBP, CAD), your bank will automatically convert the charge at the standard market exchange rate."
            },
            {
                q: "Is my payment information secure?",
                a: "Yes. Our checkout utilizes bank-grade 256-bit SSL encryption powered by Stripe. We never store raw card numbers on our servers and support 3D Secure 2.0 authentication."
            }
        ]
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<string | null>("Art & Materials-0");

    const toggle = (id: string) => {
        setOpenIndex(prev => prev === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-stone-50 py-12 md:py-20">
            <div className="responsive-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#c9a84c] mb-3 block">
                        Help Center
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900 mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                        Everything you need to know about our handcrafted panoramic wall art, framing choices, shipping, and guarantees.
                    </p>
                </div>

                {/* FAQ Sections */}
                <div className="space-y-10">
                    {faqs.map((sec) => {
                        const Icon = sec.icon;
                        return (
                            <div key={sec.category} className="space-y-4">
                                <div className="flex items-center gap-3 pb-2 border-b border-stone-200">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/50 flex items-center justify-center text-[#c9a84c]">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-stone-900">{sec.category}</h2>
                                </div>

                                <div className="space-y-3">
                                    {sec.items.map((item, idx) => {
                                        const id = `${sec.category}-${idx}`;
                                        const isOpen = openIndex === id;
                                        return (
                                            <div
                                                key={item.q}
                                                className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-xs transition-all"
                                            >
                                                <button
                                                    onClick={() => toggle(id)}
                                                    className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-medium text-stone-900 hover:text-stone-700 transition-colors"
                                                >
                                                    <span>{item.q}</span>
                                                    <ChevronDown
                                                        className={`w-5 h-5 text-stone-400 shrink-0 ml-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-stone-900" : ""}`}
                                                    />
                                                </button>
                                                {isOpen && (
                                                    <div className="px-5 pb-5 pt-1 text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                                                        {item.a}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Still have questions banner */}
                <div className="mt-16 bg-white rounded-2xl p-8 border border-stone-200 text-center space-y-4 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-[#c9a84c] flex items-center justify-center mx-auto">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900">Still have a question?</h3>
                    <p className="text-sm text-stone-600 max-w-md mx-auto">
                        Cannot find the answer you are looking for? Our art concierge team is always happy to help.
                    </p>
                    <Link href="/contact" className="inline-block">
                        <Button className="bg-[#c9a84c] hover:bg-[#b8960c] text-[oklch(0.16_0.02_55)] font-semibold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider">
                            Contact Our Advisors
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
