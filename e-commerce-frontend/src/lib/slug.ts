/**
 * Utility functions for generating SEO-friendly product URLs and slugs (dual-language support)
 */

const TURKISH_CHAR_MAP: Record<string, string> = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i', 'i': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
};

/**
 * Converts any text into a clean URL-friendly slug.
 * Turkish characters and accents are normalized to standard latin characters.
 */
export function slugify(text: string): string {
    if (!text) return "";
    
    // Replace Turkish specific characters first
    const replaced = text.replace(/[çÇğĞıIİiöÖşŞüÜ]/g, (m) => TURKISH_CHAR_MAP[m] || m);

    return replaced
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric except space and hyphen
        .trim()
        .replace(/[\s_]+/g, "-") // replace spaces and underscores with single hyphen
        .replace(/-+/g, "-") // collapse repeated hyphens
        .replace(/^-+|-+$/g, ""); // trim hyphens from ends
}

/**
 * Generates an SEO-friendly URL for a product, e.g. /products/77-ataturk-kanvas-tablosu
 * Supports both Turkish and English titles depending on the active locale.
 */
export function getProductUrl(
    product: { productId: number; title?: string; titleTr?: string },
    locale: "en" | "tr" = "tr"
): string {
    if (!product || !product.productId) return "/products";

    const title = locale === "tr" 
        ? (product.titleTr || product.title || "") 
        : (product.title || product.titleTr || "");

    const slug = slugify(title);
    return slug ? `/products/${product.productId}-${slug}` : `/products/${product.productId}`;
}

/**
 * Extracts numeric product ID from a route param which may be either a raw ID ("77")
 * or a slugged ID ("77-ataturk-kanvas-tablosu").
 */
export function extractProductId(param: string | number): number {
    if (typeof param === "number") return param;
    if (!param) return NaN;
    const rawId = param.toString().split("-")[0];
    return parseInt(rawId, 10);
}
