"use client";

import { ShieldCheck, Truck, Gift, Star } from "lucide-react";

const items = [
  { label: "Secure Payment", Icon: ShieldCheck },
  { label: "Free Shipping", Icon: Truck },
  { label: "Delivered with Care", Icon: Gift },
  { label: "Excellent Service", Icon: Star },
] as const;

const ValuePropositionBar = () => {
  return (
    <section className="bg-background py-10 md:py-12 border-y border-border/50">
      <div className="max-w-[1536px] mx-auto px-5 sm:px-8 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        {items.map(({ label, Icon }) => (
          <div key={label} className="flex flex-col items-center text-center gap-3">
            <Icon className="w-8 h-8 md:w-9 md:h-9 text-[#c9a84c]" strokeWidth={1.5} />
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-stone-900">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ValuePropositionBar;
