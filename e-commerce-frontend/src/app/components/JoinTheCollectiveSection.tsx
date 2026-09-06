"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocalization } from "@/lib/useLocalization";

export default function JoinTheCollectiveSection() {
    const [email, setEmail] = useState("");
    const [fieldReady, setFieldReady] = useState(false);
    const { t } = useLocalization();

    useEffect(() => {
        setFieldReady(true);
    }, []);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!email.trim() || !email.includes("@")) {
            toast.error(t("common.error"));
            return;
        }
        toast.success(t("footer.subscribedSuccess"));
        setEmail("");
    }

    return (
        <section className="w-full bg-[oklch(0.16_0.02_55)] py-20 text-center text-neutral-100 md:py-28">
            <div className="responsive-container">
                <div className="mx-auto max-w-2xl">
                    <p className="mb-3 text-[11px] font-semibold tracking-[0.25em] uppercase text-[#c9a84c]">
                        {t("home.collective.badge")}
                    </p>
                    <h2 className="font-display mb-5 text-3xl font-bold tracking-tight text-white md:text-4xl">
                        {t("home.collective.title")}
                    </h2>
                    <p className="mb-8 text-sm text-white/60 max-w-md mx-auto leading-relaxed">
                        {t("home.collective.description")}
                    </p>
                    <form
                        onSubmit={handleSubmit}
                        className="mx-auto flex max-w-lg flex-col gap-0 border border-white/20 md:flex-row shadow-xl"
                    >
                        {fieldReady ? (
                            <input
                                type="email"
                                name="collective-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("home.collective.placeholder")}
                                autoComplete="email"
                                required
                                className="w-full border-0 bg-white/5 px-6 py-4 text-xs font-semibold tracking-wider text-white placeholder:text-white/40 focus:ring-0 focus-visible:outline-none"
                            />
                        ) : (
                            <div className="w-full min-h-[52px] bg-transparent px-6 py-4" aria-hidden />
                        )}
                        <button
                            type="submit"
                            className="bg-[#c9a84c] px-8 py-4 text-xs font-bold uppercase tracking-widest text-[oklch(0.16_0.02_55)] transition-colors hover:bg-[#d9b85c] shrink-0 cursor-pointer"
                        >
                            {t("home.collective.cta")}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
