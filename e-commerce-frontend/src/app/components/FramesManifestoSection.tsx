/* eslint-disable @next/next/no-img-element */
"use client";

import { useLocalization } from "@/lib/useLocalization";

const MANIFESTO_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDXCACdgH-k2u20bUm2JrpfuYIjOVG9SiJe2wGp6w6BVwHRool_2nQweYt45U3Q3JXTqCtD2eLpjp3h7AtLsqLrdgcGAQhjnfHJMhgJz3gvBe_RxFj755eKFW1QgagC7u3jRoi9SCQq5HSAzat8XxErTy6vivdDZic90pZuhuwtyALZp6gwC0ExablPVlHIRcGXJhJBQB3kJH0A30Xpf_0g1mAd-6Culgn6I3jcAC621qrGtyUfJW4U9wPelCauNsuMPNOXNZrw1O0";

export default function FramesManifestoSection() {
    const { t } = useLocalization();

    return (
        <section className="w-full py-20 md:py-36">
            <div className="responsive-container">
                <div className="flex flex-col items-center gap-16 md:flex-row md:items-center md:gap-24">
                    <div className="w-full md:w-1/2">
                        <img
                            src={MANIFESTO_IMAGE}
                            alt="Architectural artwork installed on luxury gallery wall"
                            className="aspect-[3/4] w-full object-cover grayscale shadow-2xl"
                        />
                    </div>
                    <div className="w-full md:w-1/2">
                        <span className="mb-6 block text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c9a84c]">
                            {t("home.manifesto.badge")}
                        </span>
                        <h2 className="font-display mb-8 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
                            {t("home.manifesto.title")}
                        </h2>
                        <p className="mb-10 text-base md:text-lg leading-relaxed text-foreground/80">
                            {t("home.manifesto.description")}
                        </p>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 border-t border-border/40 pt-8">
                            <div>
                                <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-foreground">
                                    {t("home.manifesto.bespokeSizing")}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    {t("home.manifesto.bespokeSizingDesc")}
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-foreground">
                                    {t("home.manifesto.lifetimeClarity")}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    {t("home.manifesto.lifetimeClarityDesc")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
