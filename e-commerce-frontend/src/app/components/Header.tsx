"use client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, Heart, UserRound, Menu, ChevronRight } from "lucide-react";
import UserMenuContent from "./UserMenuContent";
import CategoriesBar from "./CategoriesBar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NAV_TOP_HEIGHT } from "@/lib/constants";
import WishlistDrawer from "./WishlistDrawer";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CategoryTree } from "@/types/domains/category";
import LanguageCurrencyToggle from "./LanguageCurrencyToggle";
import { useLocalization } from "@/lib/useLocalization";
import { buildPillarCategoryTree } from "@/lib/categories";

// Dark espresso top nav — same warm near-black as brand primary
const NAV_BG = "bg-[oklch(0.42_0.02_55)]";
// Light sidebar keeps readability for the slide-out menu
const SIDEBAR_BG = "bg-[oklch(0.99_0.006_75)]";

function MobileCategoryItem({ cat, onClose }: { cat: CategoryTree; onClose: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = cat.subcategories.length > 0;

    return (
        <div className="border-b border-border/30 last:border-b-0 py-1">
            <div className="flex items-center justify-between">
                <SheetClose asChild>
                    <Link
                        href={`/products?categoryId=${cat.categoryId}`}
                        onClick={onClose}
                        className="flex-1 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                    >
                        {cat.name}
                    </Link>
                </SheetClose>
                {hasChildren && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Toggle subcategories"
                    >
                        <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-90 text-[#c9a84c]")} />
                    </button>
                )}
            </div>
            {hasChildren && expanded && (
                <div className="pl-3 border-l-2 border-[#c9a84c]/40 ml-1 my-1 space-y-1">
                    {cat.subcategories.map((sub) => (
                        <SheetClose asChild key={sub.categoryId}>
                            <Link
                                href={`/products?categoryId=${sub.categoryId}`}
                                onClick={onClose}
                                className="flex items-center gap-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]/60 shrink-0" />
                                {sub.name}
                            </Link>
                        </SheetClose>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Header() {
    const [wishlistOpen, setWishlistOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [categoriesVisible, setCategoriesVisible] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');
    const isProductDetailPage = /^\/products\/[^/]+/.test(pathname);
    const isHomePage = pathname === '/';
    const categories = useAppSelector((state) => state.categories.items);
    const { locale, t } = useLocalization();

    const pillarCategories = buildPillarCategoryTree(categories, locale);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (isAdminPage) {
            setIsVisible(true);
            return;
        }
        const handleScroll = () => {
            const scrolled = window.scrollY > 60;
            if (isProductDetailPage) {
                setIsVisible(!scrolled);
            } else {
                setCategoriesVisible(!scrolled);
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isAdminPage, isProductDetailPage]);

    const wishlistItems = useAppSelector((state) => state.wishlist.items);
    const cartTotalItems = useAppSelector((state) => state.cart.totalItems);
    const { authenticated } = useAppSelector((state) => state.auth);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    if (isAdminPage) return null;

    const accountLinks = [
        { label: t("header.orders"), href: "/account/orders" },
        { label: t("header.wishlist"), href: "/wishlist" },
    ];

    const infoLinks = [
        { label: t("footer.shippingReturns"), href: "/shipping-returns" },
        { label: t("footer.termsConditions"), href: "/terms-and-conditions" },
        { label: t("footer.privacyPolicy"), href: "/privacy-policy" },
    ];

    return (<>
        <header
            style={{ paddingRight: 'var(--removed-body-scroll-bar-size, 0px)' }}
            className={cn(
                "fixed top-0 z-50 w-full transition-transform duration-300",
                isProductDetailPage
                    ? (isVisible ? "translate-y-0" : "-translate-y-full")
                    : "translate-y-0"
            )}
        >
            <nav
                className={cn("w-full border-b-2 border-[#c9a84c]", NAV_BG)}
                style={{ height: NAV_TOP_HEIGHT }}
            >

                {/* ── MOBILE layout (<sm) ── */}
                <div className="relative flex sm:hidden h-full items-center px-3">

                    {/* Left: hamburger */}
                    <div className="flex items-center">
                        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Open menu" className="hover:bg-white/10 text-white h-9 w-9">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className={cn("p-0 w-[85vw] max-w-[340px] border-r border-border flex flex-col", SIDEBAR_BG)}>
                                <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
                                    <SheetTitle className="text-left">
                                        <SheetClose asChild>
                                            <Link href="/" className="flex flex-col items-start leading-none select-none">
                                                <span className="font-display text-xl font-semibold tracking-[0.14em] text-foreground uppercase">
                                                    NovaLux
                                                </span>
                                                <span className="text-[8.5px] font-sans font-medium tracking-[0.42em] text-[#c9a84c] uppercase pl-1 mt-0.5">
                                                    Studios
                                                </span>
                                            </Link>
                                        </SheetClose>
                                    </SheetTitle>
                                </SheetHeader>

                                {/* Quick language switch in drawer */}
                                <div className="px-5 py-3 border-b border-border/40 bg-stone-100/50 flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {locale === "tr" ? "Bölge & Para Birimi" : "Region & Currency"}
                                    </span>
                                    <LanguageCurrencyToggle className="bg-stone-800 text-white border-stone-700 hover:bg-stone-700" />
                                </div>

                                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                                    <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                                        {t("header.account")}
                                    </p>
                                    {accountLinks.map((item) => (
                                        <SheetClose asChild key={item.href}>
                                            <Link href={item.href} className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                                                {item.label}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                    <div className="border-t border-border pt-4 mt-4">
                                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                                            {t("header.categories")}
                                        </p>
                                        <SheetClose asChild>
                                            <Link href="/products?sort=NEWEST" className="block py-2 text-sm font-semibold text-primary hover:text-primary/70 transition-colors">
                                                {t("header.newArrivals")}
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link href="/products?sort=MOST_REVIEWED" className="block py-2 text-sm font-semibold text-primary hover:text-primary/70 transition-colors">
                                                {t("header.bestsellers")}
                                            </Link>
                                        </SheetClose>

                                        {/* 3 Main Luxury Pillars in Mobile Menu */}
                                        <div className="mt-2 space-y-1">
                                            {pillarCategories.map((pillar) => (
                                                <MobileCategoryItem key={pillar.categoryId} cat={pillar} onClose={() => setSidebarOpen(false)} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="border-t border-border pt-4 mt-4">
                                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                                            {t("header.info")}
                                        </p>
                                        {infoLinks.map((item) => (
                                            <SheetClose asChild key={item.href}>
                                                <Link href={item.href} className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                                    {item.label}
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Center: logo cleanly centered without overlap */}
                    <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center leading-none text-center whitespace-nowrap select-none group pointer-events-auto">
                        <span className="font-display text-[17px] font-semibold tracking-[0.14em] text-white uppercase">
                            NovaLux
                        </span>
                        <span className="text-[7.5px] font-sans font-medium tracking-[0.42em] text-[#c9a84c] uppercase pl-1 mt-0.5">
                            Studios
                        </span>
                    </Link>

                    {/* Right: language pill + cart icon */}
                    <div className="ml-auto flex items-center gap-1">
                        <LanguageCurrencyToggle />
                        <Link href="/cart">
                            <Button variant="ghost" size="icon" aria-label={t("header.cart")} className="relative hover:bg-white/10 h-9 w-9">
                                <ShoppingCart className="h-5 w-5 text-white/80" />
                                {mounted && cartTotalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-[#c9a84c] text-[oklch(0.16_0.02_55)] text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium leading-none">
                                        {cartTotalItems > 9 ? "9+" : cartTotalItems}
                                    </span>
                                )}
                                <span className="sr-only">{t("header.cart")}</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* ── DESKTOP layout (sm+) ── */}
                <div className="hidden sm:grid h-full grid-cols-[auto_1fr_auto] items-center gap-8 md:gap-12 max-w-[1600px] mx-auto w-full px-6 md:px-10">

                    {/* Logo */}
                    <Link href="/" className="flex flex-col items-start leading-none group shrink-0 select-none">
                        <span className="font-display text-[26px] md:text-[28px] font-semibold tracking-[0.14em] text-white group-hover:text-[#e4cf8d] transition-colors uppercase">
                            NovaLux
                        </span>
                        <span className="text-[9.5px] font-sans font-medium tracking-[0.45em] text-[#c9a84c] uppercase pl-1 mt-0.5">
                            Studios
                        </span>
                    </Link>

                    {/* Search */}
                    <div className="flex justify-center">
                        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t("header.searchPlaceholder")}
                                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border-transparent focus-visible:border-border text-sm"
                            />
                        </form>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-2">
                        <LanguageCurrencyToggle />
                        {mounted && !authenticated && (
                            <Link
                                href="/auth/login"
                                className="text-xs font-medium text-white/80 hover:text-white transition-colors mr-1 tracking-wide"
                            >
                                {t("header.login")}
                            </Link>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label={t("header.myAccount")} className="hover:bg-white/10">
                                    <UserRound className={cn("h-5 w-5", mounted && authenticated ? "text-[#c9a84c]" : "text-white/80")} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <UserMenuContent />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("header.wishlist")}
                            onClick={() => setWishlistOpen(true)}
                            className="relative hover:bg-white/10"
                        >
                            <Heart className={cn("h-5 w-5", mounted && wishlistItems.length > 0 ? "fill-red-400 text-red-400" : "text-white/80")} />
                            {mounted && wishlistItems.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium leading-none">
                                    {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                                </span>
                            )}
                            <span className="sr-only">{t("header.wishlist")}</span>
                        </Button>

                        <Link href="/cart">
                            <Button variant="ghost" size="icon" aria-label={t("header.cart")} className="relative hover:bg-white/10">
                                <ShoppingCart className="h-5 w-5 text-white/80" />
                                {mounted && cartTotalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-[#c9a84c] text-[oklch(0.16_0.02_55)] text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium leading-none">
                                        {cartTotalItems > 9 ? "9+" : cartTotalItems}
                                    </span>
                                )}
                                <span className="sr-only">{t("header.cart")}</span>
                            </Button>
                        </Link>
                    </div>
                </div>

            </nav>

            {isHomePage && (
                <div className={cn(
                    "hidden lg:block transition-all duration-300",
                    categoriesVisible ? "max-h-16 overflow-visible" : "max-h-0 overflow-hidden"
                )}>
                    <CategoriesBar categories={categories} />
                </div>
            )}
        </header>

        <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
    </>);
}
