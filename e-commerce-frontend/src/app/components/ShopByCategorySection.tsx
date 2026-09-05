/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CategoryTree } from "@/types/domains/category";

/** Fixed frame / photo art imagery for the four category tiles */
const FRAME_CATEGORY_IMAGES = [
  "https://i.pinimg.com/1200x/42/15/50/4215508d64e60b2e268d8f38658753d9.jpg",
  "https://i.pinimg.com/1200x/a6/6d/46/a66d46545c57675eff9d6d2472ff5407.jpg",
  "https://i.pinimg.com/736x/c8/bd/7a/c8bd7accaa4325a8b0a35b712640e27c.jpg",
  "https://i.pinimg.com/736x/b0/1b/09/b01b0990f1ac187bf29d742e53e02e33.jpg",
] as const;

const MAX_CATEGORIES = 4;

const DEFAULT_SUBTITLE = "Curated selection";

type ShopByCategorySectionProps = {
  categories: CategoryTree[] | undefined;
  isLoading: boolean;
  onSelectCategory: (categoryId: number) => void;
};

function EditorialCategorySkeleton() {
  return (
    <div className="relative h-[340px] sm:h-[400px] md:h-[480px] lg:h-[540px] overflow-hidden rounded-2xl bg-stone-200/90 ring-1 ring-stone-300/40">
      <Skeleton className="absolute inset-0 h-full w-full rounded-none bg-stone-300/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-400/30 to-transparent animate-pulse" />
    </div>
  );
}

const ShopByCategorySection = ({
  categories,
  isLoading,
  onSelectCategory,
}: ShopByCategorySectionProps) => {
  const displayCategories = (() => {
    if (!categories || categories.length === 0) return [];
    if (categories.length >= 4) return categories.slice(0, MAX_CATEGORIES);

    const canvas = categories.find((c) => c.name.toUpperCase().includes("CANVAS")) || categories[0];
    if (canvas?.subcategories && canvas.subcategories.length > 0) {
      const pano = canvas.subcategories.find((s) => s.categoryId === 97);
      const others = canvas.subcategories.filter((s) => s.categoryId !== 97);
      const curated = pano ? [pano, ...others] : canvas.subcategories;
      return curated.slice(0, MAX_CATEGORIES);
    }
    return categories.slice(0, MAX_CATEGORIES);
  })();

  return (
    <section className="relative py-16 md:py-24 lg:py-28 overflow-hidden bg-gradient-to-b from-stone-100/80 via-stone-50 to-background">
      <div
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl md:h-96 md:w-96"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-0 h-64 w-64 rounded-full bg-stone-300/30 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 responsive-container">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16 lg:mb-20">
          <span className="mb-3 inline-block font-semibold text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#c9a84c] md:mb-4">
            Browse Our Archive
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Shop by Category
          </h2>
          <div className="mt-5 flex items-center justify-center gap-3 md:mt-6">
            <span className="h-px w-10 bg-stone-300 sm:w-12" aria-hidden />
            <div className="h-1 w-20 rounded-full bg-[#c9a84c] sm:w-24" />
            <span className="h-px w-10 bg-stone-300 sm:w-12" aria-hidden />
          </div>
          <p className="mt-6 text-sm leading-relaxed text-stone-600 sm:text-base md:mt-7">
            Pick a line—each tile opens frames, mounts, and decor curated for that space, with the same
            editorial care as a gallery wall.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => <EditorialCategorySkeleton key={i} />)}

          {!isLoading &&
            displayCategories &&
            displayCategories.length > 0 &&
            displayCategories.map((category, index) => {
              const image = FRAME_CATEGORY_IMAGES[index % FRAME_CATEGORY_IMAGES.length];
              const subtitle = category.subcategories?.length
                ? `${category.subcategories.length} collections`
                : DEFAULT_SUBTITLE;
              const indexLabel = String(index + 1).padStart(2, "0");

              return (
                <button
                  type="button"
                  key={category.categoryId}
                  onClick={() => onSelectCategory(category.categoryId)}
                  aria-label={`Shop ${category.name} category`}
                  className="group relative h-[340px] sm:h-[400px] md:h-[480px] lg:h-[540px] overflow-hidden text-left rounded-2xl bg-stone-900 shadow-[0_20px_50px_-20px_rgba(28,25,23,0.35)] ring-1 ring-stone-900/10 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_28px_60px_-16px_rgba(28,25,23,0.45)] hover:ring-[#c9a84c]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100"
                >
                  <img
                    alt={`${category.name} — frame & decor`}
                    src={image}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95"
                    aria-hidden
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-90"
                    aria-hidden
                  />

                  <span
                    className="absolute left-5 top-5 font-mono text-[11px] font-semibold tracking-[0.25em] text-white/90 sm:left-6 sm:top-6"
                    aria-hidden
                  >
                    {indexLabel}
                  </span>

                  <span
                    className="absolute bottom-[5.25rem] right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-stone-900 shadow-lg opacity-0 translate-y-3 scale-90 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 sm:bottom-[5.5rem] sm:right-6"
                    aria-hidden
                  >
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 md:p-8">
                    <h3 className="text-2xl font-bold tracking-tight text-white sm:text-[1.65rem] md:text-3xl lg:text-[1.85rem] lg:leading-snug">
                      {category.name}
                    </h3>
                    <p className="mt-2 max-w-[18rem] text-[11px] font-medium uppercase tracking-[0.18em] text-stone-300 sm:text-xs">
                      <span className="opacity-90 md:opacity-70 md:transition-opacity md:duration-300 md:group-hover:opacity-100">
                        {subtitle}
                      </span>
                      <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-stone-400/95 md:hidden">
                        Tap to shop this line
                      </span>
                    </p>
                  </div>
                </button>
              );
            })}

          {!isLoading && (!displayCategories || displayCategories.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-16 text-center text-stone-600">
              <p className="font-medium text-stone-800">Categories are on the way</p>
              <p className="mt-2 max-w-md text-sm text-stone-600">
                Once your catalogue is connected, four featured categories will appear here with the same
                studio layout.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategorySection;
