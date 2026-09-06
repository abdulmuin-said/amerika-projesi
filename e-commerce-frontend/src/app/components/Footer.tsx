"use client";

import { useLocalization } from "@/lib/useLocalization";

export default function Footer() {
    const { t } = useLocalization();

    return (
        <footer className="bg-[oklch(0.22_0.02_55)] border-t border-[#c9a84c]/20 py-8">
            <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 flex items-center justify-center text-center">
                <p className="text-white/70 text-xs sm:text-sm tracking-widest uppercase font-light">
                    {t("footer.copyright", { year: new Date().getFullYear() })}
                </p>
            </div>
        </footer>
    );
}
