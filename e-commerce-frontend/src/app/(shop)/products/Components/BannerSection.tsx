export default function BannerSection() {
  return (
    <section className="bg-[oklch(0.92_0.022_75)] border-b border-border/60">
      <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 py-12 md:py-16">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#c9a84c] mb-3">
          Original Wall Art
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-light text-foreground tracking-wide mb-3">
          Shop All Works
        </h1>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          Discover our curated collection of canvas prints, fine art reproductions, and original pieces for every space.
        </p>
      </div>
    </section>
  );
}
