"use client";

import { ShieldCheck, Truck, Gift, Star } from "lucide-react";
import { useLocalization } from "@/lib/useLocalization";

const ValuePropositionBar = () => {
  const { t } = useLocalization();

  const items = [
    { label: t("home.valueProps.securePayment"), desc: t("home.valueProps.securePaymentDesc"), Icon: ShieldCheck },
    { label: t("home.valueProps.freeShipping"), desc: t("home.valueProps.freeShippingDesc"), Icon: Truck },
    { label: t("home.valueProps.deliveredWithCare"), desc: t("home.valueProps.deliveredWithCareDesc"), Icon: Gift },
    { label: t("home.valueProps.excellentService"), desc: t("home.valueProps.excellentServiceDesc"), Icon: Star },
  ];

  return (
    <section className="bg-background py-10 md:py-12 border-y border-border/50">
      <div className="max-w-[1536px] mx-auto px-5 sm:px-8 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        {items.map(({ label, desc, Icon }) => (
          <div key={label} className="flex flex-col items-center text-center gap-2">
            <Icon className="w-8 h-8 md:w-9 md:h-9 text-[#c9a84c]" strokeWidth={1.5} />
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase text-stone-900">
              {label}
            </span>
            <span className="text-[11px] text-stone-500 max-w-[200px] leading-tight">
              {desc}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ValuePropositionBar;
