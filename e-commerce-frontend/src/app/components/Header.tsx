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
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CategoryTree } from "@/types/domains/category";

// Dark espresso top nav — same warm near-black as brand primary
const NAV_BG = "bg-[oklch(0.42_0.02_55)]";
// Light sidebar keeps readability for the slide-out menu
const SIDEBAR_BG = "bg-[oklch(0.99_0.006_75)]";

const accountLinks = [
    { label: "My Orders", href: "/account/orders" },
    { label: "Wishlist", href: "/wishlist" },
];

const infoLinks = [
    { label: "Shipping & Returns", href: "/shipping-returns" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
];

function MobileCategoryItem({ cat, onClose }: { cat: CategoryTree; onClose: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = cat.subcategories.length > 0;

    return (
        <div>
            <div className="flex items-center justify-between">
                <SheetClose asChild>
                    <Link
                        href={`/products?categoryId=${cat.categoryId}`}
                        onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                        {cat.name}
                    </Link>
                </SheetClose>
                {hasChildren && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-90")} />
                    </button>
                )}
            </div>
            {hasChildren && expanded && (
                <div className="pl-4 border-l border-border/50 ml-1 mb-1">
                    {cat.subcategories.map((sub) => (
                        <SheetClose asChild key={sub.categoryId}>
                            <Link
                                href={`/products?categoryId=${sub.categoryId}`}
                                onClick={onClose}
                                className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <span className="w-1 h-1 rounded-full bg-border shrink-0" />
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
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');
    const isProductDetailPage = /^\/products\/[^/]+/.test(pathname);
    const isHomePage = pathname === '/';
    const categories = useAppSelector((state) => state.categories.items);

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

    if (isAdminPage) return null;

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

                {/* ── MOBILE layout (<sm) ──
                    [≡] [♥]   NovaCanvas   [👤] [🛒]
                */}
                <div className="relative flex sm:hidden h-full items-center px-3">

                    {/* Left: hamburger + wishlist */}
                    <div className="flex items-center gap-0.5">
                        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Open menu" className="hover:bg-white/10 text-white">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className={cn("p-0 w-[85vw] max-w-[340px] border-r border-border flex flex-col", SIDEBAR_BG)}>
                                <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
                                    <SheetTitle className="text-left">
                                        <SheetClose asChild>
                                            <Link href="/" className="flex flex-col items-start leading-none select-none">
                                                <span className="font-display text-xl font-semibold tracking-[0.14em] text-foreground uppercase">
                                                    NovaCanvas
                                                </span>
                                                <span className="text-[8.5px] font-sans font-medium tracking-[0.42em] text-[#c9a84c] uppercase pl-1 mt-0.5">
                                                    Studios
                                                </span>
                                            </Link>
                                        </SheetClose>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                                    <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">Account</p>
                                    {accountLinks.map((item) => (
                                        <SheetClose asChild key={item.href}>
                                            <Link href={item.href} className="block py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
                                                {item.label}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                    <div className="border-t border-border pt-4 mt-4">
                                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">Categories</p>
                                        <SheetClose asChild>
                                            <Link href="/products?sort=NEWEST" className="block py-2.5 text-sm font-semibold text-primary hover:text-primary/70 transition-colors">
                                                New Arrivals
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link href="/products?sort=MOST_REVIEWED" className="block py-2.5 text-sm font-semibold text-primary hover:text-primary/70 transition-colors">
                                                Bestsellers
                                            </Link>
                                        </SheetClose>
                                        {categories.length > 0 && (
                                            <div className="mt-1">
                                                {categories.map((cat) => (
                                                    <MobileCategoryItem key={cat.categoryId} cat={cat} onClose={() => setSidebarOpen(false)} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-border pt-4 mt-4">
                                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">Info</p>
                                        {infoLinks.map((item) => (
                                            <SheetClose asChild key={item.href}>
                                                <Link href={item.href} className="block py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                                    {item.label}
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Wishlist"
                            onClick={() => setWishlistOpen(true)}
                            className="relative hover:bg-white/10"
                        >
                            <Heart className={cn("h-5 w-5", mounted && wishlistItems.length > 0 ? "fill-red-400 text-red-400" : "text-white/80")} />
                            {mounted && wishlistItems.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium leading-none">
                                    {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                                </span>
                            )}
                            <span className="sr-only">Wishlist</span>
                        </Button>
                    </div>

                    {/* Center: logo absolutely centered */}
                    <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center leading-none text-center whitespace-nowrap select-none group">
                        <span className="font-display text-[19px] font-semibold tracking-[0.14em] text-white uppercase">
                            NovaCanvas
                        </span>
                        <span className="text-[8px] font-sans font-medium tracking-[0.45em] text-[#c9a84c] uppercase pl-1 mt-0.5">
                            Studios
                        </span>
                    </Link>

                    {/* Right: account + cart */}
                    <div className="ml-auto flex items-center gap-0.5">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="User menu" className="hover:bg-white/10">
                                    <UserRound className={cn("h-5 w-5", mounted && authenticated ? "text-[#c9a84c]" : "text-white/80")} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <UserMenuContent />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link href="/cart">
                            <Button variant="ghost" size="icon" aria-label="Cart" className="relative hover:bg-white/10">
                                <ShoppingCart className="h-5 w-5 text-white/80" />
                                {mounted && cartTotalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-[#c9a84c] text-[oklch(0.16_0.02_55)] text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium leading-none">
                                        {cartTotalItems > 9 ? "9+" : cartTotalItems}
                                    </span>
                                )}
                                <span className="sr-only">Cart</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* ── DESKTOP layout (sm+) ──
                    [NovaCanvas Studios LEFT]   [Search CENTER]   [Icons RIGHT]
                */}
                <div className="hidden sm:grid h-full grid-cols-[auto_1fr_auto] items-center gap-8 md:gap-12 max-w-[1600px] mx-auto w-full px-6 md:px-10">

                    {/* Logo — left, white on dark with stacked luxury subline */}
                    <Link href="/" className="flex flex-col items-start leading-none group shrink-0 select-none">
                        <span className="font-display text-[26px] md:text-[28px] font-semibold tracking-[0.14em] text-white group-hover:text-[#e4cf8d] transition-colors uppercase">
                            NovaCanvas
                        </span>
                        <span className="text-[9.5px] font-sans font-medium tracking-[0.45em] text-[#c9a84c] uppercase pl-1 mt-0.5">
                            Studios
                        </span>
                    </Link>

                    {/* Search — centered, moderate width */}
                    <div className="flex justify-center">
                        <div className="relative w-full max-w-xl">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search for wall art, canvas prints..."
                                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border-transparent focus-visible:border-border text-sm"
                            />
                        </div>
                    </div>

                    {/* Icons — right, white on dark */}
                    <div className="flex items-center gap-0.5">
                        {mounted && !authenticated && (
                            <Link
                                href="/auth/login"
                                className="text-xs font-medium text-white/60 hover:text-white transition-colors mr-1 tracking-wide"
                            >
                                Login
                            </Link>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="User menu" className="hover:bg-white/10">
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
                            aria-label="Wishlist"
                            onClick={() => setWishlistOpen(true)}
                            className="relative hover:bg-white/10"
                        >
                            <Heart className={cn("h-5 w-5", mounted && wishlistItems.length > 0 ? "fill-red-400 text-red-400" : "text-white/80")} />
                            {mounted && wishlistItems.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium leading-none">
                                    {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                                </span>
                            )}
                            <span className="sr-only">Wishlist</span>
                        </Button>

                        <Link href="/cart">
                            <Button variant="ghost" size="icon" aria-label="Cart" className="relative hover:bg-white/10">
                                <ShoppingCart className="h-5 w-5 text-white/80" />
                                {mounted && cartTotalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-[#c9a84c] text-[oklch(0.16_0.02_55)] text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium leading-none">
                                        {cartTotalItems > 9 ? "9+" : cartTotalItems}
                                    </span>
                                )}
                                <span className="sr-only">Cart</span>
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
