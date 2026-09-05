"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import * as bannerImagesService from "@/services/bannerImages";

const HERO_LEFT =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC84UWnQ9TTXJj0iVO0xX63Kip-_UqcfyVRnailflVn50Zd-y8rNYm99ytqKWFLoNqmQsWl70fP-12Tb58JLkxmEguQS4JHHBQ6I-1R_5UQCRh7FOFNb2z7TwRl2XFMrVtQjZFZULWEgp4ZSnlPjk0Er64RJPFw5gFLUn8E34F9qxJpKAWXAIM-0gp1jXwaCgc_hATupWxBC6qnX-Pcf35zkeT2--Gk6a6UUR9VSO3RNefu093I1Wr8lXtPNahh0iNtAPf0DGNUglU";

const HERO_RIGHT =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDT2mxfqyKBne6ZkgeS8tnatrp73Uglh2_P3Q22SiAMd1pHaQ34bdpJIMVGp0snHbz3SZnhYWUG_kuWAhhnI_uroL_dUe4DQcp65pb9O2g24zTeFebZXZM_sEPL6eNxBXn0_b0gzl71W3VmQJZi2vfA9ei4HmIFaNUiZT3J6xc6_DhC4iA90560m4dj1j3sN1CcPQ9myT3GduRqMJ_BQUiur0kXiFMgGJ0vbLKNtO185spwfJRvpVl2eFgB5ONtAylvr_k90zfIkrU";

const Banner = () => {
  const [defaultUrl, setDefaultUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await bannerImagesService.getDefaultBannerImage();
      if (!mounted) return;
      if (res.success && res.data && typeof res.data.imageUrl === "string" && res.data.imageUrl.trim()) {
        setDefaultUrl(res.data.imageUrl);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const leftUrl = HERO_LEFT;
  const rightUrl = useMemo(() => defaultUrl ?? HERO_RIGHT, [defaultUrl]);

  return (
    <section className="relative flex items-start sm:items-center overflow-hidden bg-stone-100 min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-9rem)]">

      {/* Background — stacked on mobile, split on sm+ */}
      <div className="absolute inset-0 flex flex-col sm:flex-row">
        <div className="relative flex-1 sm:h-full sm:w-1/2 overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Minimalist decor and sculpture in soft light"
            src={leftUrl}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative flex-1 sm:w-1/2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Luxury living space with neutral tones"
            src={rightUrl}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" aria-hidden />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1536px] mx-auto px-5 sm:px-8 md:px-12 pt-7 pb-10 sm:py-10 md:py-14">
        <div className="bg-white/45 backdrop-blur-md p-6 sm:p-8 md:p-10 lg:p-12 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg shadow-[0_12px_40px_rgba(78,70,57,0.10)]">

          <span className="block mb-3 text-[11px] font-semibold tracking-[0.25em] uppercase text-[oklch(0.16_0.02_55)]">
            New Arrivals / Autumn 24
          </span>

          <h1 className="font-display text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-stone-900 leading-[1.08] mb-4 sm:mb-5">
            The NovaCanvas<br />Signature
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-6 sm:mb-7">
            Museum-grade panoramic wall art, crafted on 380gsm archival cotton canvas and hand-stretched over heirloom solid pine chassis.
          </p>

          <Button
            asChild
            className="rounded-none bg-[oklch(0.16_0.02_55)] text-white hover:bg-[oklch(0.24_0.02_55)] px-7 sm:px-9 py-4 h-auto text-[11px] tracking-[0.2em] uppercase font-semibold"
          >
            <Link href="/products">Explore Now</Link>
          </Button>

        </div>
      </div>
    </section>
  );
};

export default Banner;
