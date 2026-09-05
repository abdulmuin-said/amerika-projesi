export default function ProductCardSkeleton() {
   return (
      <div className="w-full">

         {/* Image area */}
         <div className="relative aspect-square bg-[oklch(0.92_0.022_75)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
            {/* Wishlist dot */}
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/30" />
         </div>

         {/* Info */}
         <div className="pt-3 pb-1">

            {/* Stars row */}
            <div className="flex items-center gap-1 mb-1.5" style={{ minHeight: "1.25rem" }}>
               {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-2.5 w-2.5 rounded-sm bg-muted animate-pulse" />
               ))}
               <div className="h-2.5 w-5 bg-muted animate-pulse ml-0.5 rounded-sm" />
            </div>

            {/* Title — 2 lines */}
            <div className="space-y-2 mb-2" style={{ minHeight: "3.375rem" }}>
               <div className="h-5 w-full bg-muted animate-pulse rounded-sm" />
               <div className="h-5 w-3/4 bg-muted animate-pulse rounded-sm" />
            </div>

            {/* Discount badge slot */}
            <div className="mb-2" style={{ minHeight: "1.5rem" }}>
               <div className="h-5 w-16 bg-muted animate-pulse rounded-sm" />
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
               <div className="h-4 w-8 bg-muted animate-pulse rounded-sm" />
               <div className="h-4 w-20 bg-muted animate-pulse rounded-sm" />
            </div>

         </div>
      </div>
   );
}
