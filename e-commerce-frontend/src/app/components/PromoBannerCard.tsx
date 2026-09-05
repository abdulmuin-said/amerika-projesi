/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

const PROMO_IMAGES = [
    "https://i.pinimg.com/736x/f4/5c/36/f45c3603aaf44bf6c97ea64ae0f64c46.jpg",
    "https://i.pinimg.com/736x/a2/04/82/a20482c072133079acca7686428e31ae.jpg",
    "https://i.pinimg.com/736x/98/a5/39/98a539360514ea653e04c55bec6734ee.jpg",
    "https://i.pinimg.com/736x/ab/ce/81/abce81f2c6534c95e60e7c6aa3a807d1.jpg",
] as const;

export default function PromoBannerCard() {
    return (
        <div className="responsive-container w-full py-10 sm:py-14 md:py-16">
            <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:gap-12 lg:gap-16">

                {/* Text side */}
                <div className="flex flex-col items-center text-center md:items-start md:text-left md:w-2/5 shrink-0">
                    <p className="mb-3 text-[11px] font-semibold tracking-[0.25em] uppercase text-[#c9a84c]">
                        Limited Time Offer
                    </p>
                    <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-tight">
                        80% OFF <br className="hidden md:block" />on Figurines
                    </h2>
                    <p className="mt-4 mb-8 text-sm text-muted-foreground max-w-xs">
                        Handcrafted figurines at an unmissable price — while stocks last.
                    </p>
                    <Link
                        href="/products"
                        className="inline-block border border-foreground/25 px-10 py-3 text-xs font-semibold tracking-[0.18em] uppercase text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                    >
                        Shop Now
                    </Link>
                </div>

                {/* Images side */}
                <div className="w-full md:flex-1 grid grid-cols-2 gap-3 sm:gap-4">
                    <img
                        src={PROMO_IMAGES[0]}
                        alt="Figurine promo 1"
                        className="w-full aspect-[3/4] object-cover"
                    />
                    <img
                        src={PROMO_IMAGES[1]}
                        alt="Figurine promo 2"
                        className="w-full aspect-[3/4] object-cover mt-6 sm:mt-10"
                    />
                    <img
                        src={PROMO_IMAGES[2]}
                        alt="Figurine promo 3"
                        className="w-full aspect-[3/4] object-cover -mt-6 sm:-mt-10"
                    />
                    <img
                        src={PROMO_IMAGES[3]}
                        alt="Figurine promo 4"
                        className="w-full aspect-[3/4] object-cover"
                    />
                </div>
            </div>
        </div>
    );
}
