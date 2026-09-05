import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PromotionDetails } from "@/types/domains/promotion";
import { ProductPreview } from "@/types/domains/product";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<F extends (...args: any[]) => any>(func: F, timeout = 300){
  let timer: NodeJS.Timeout;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function(this: any, ...args: Parameters<F>) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), timeout);
  } as F;
}

export function extractConsonants(text: string): string {
  const vowels = 'aeiouAEIOU';
  const consonants = [...text].filter(char =>
    /[0-9a-zA-Z]/.test(char) && !vowels.includes(char)
  );
  return consonants.join('');
}

/**
 * Normalize date to start of day for accurate comparison
 */
function normalizeDate(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Check if promotion is currently valid based on dates
 */
function isPromotionDateValid(promo: PromotionDetails, today: Date): boolean {
  if (promo.validFrom) {
    const validFrom = normalizeDate(promo.validFrom);
    if (today < validFrom) return false;
  }
  
  if (promo.validTill) {
    const validTill = normalizeDate(promo.validTill);
    // Add 1 day to include the entire end date
    validTill.setDate(validTill.getDate() + 1);
    if (today >= validTill) return false;
  }
  
  return true;
}

/**
 * Get active promotion for a category
 * Optimized for performance with early returns and cached date calculations
 */
export function getPromotionForCategory(
  categoryId: number | null | undefined,
  promotions: PromotionDetails[]
): PromotionDetails | null {
  // Early returns for edge cases
  if (!promotions?.length || !categoryId) return null;

  // Cache today's date (calculated once per call)
  const today = normalizeDate(new Date());

  // Find first matching promotion (stops on first match)
  return promotions.find((promo) => {
    // Quick category check first (cheaper operation)
    const categoryMatch = promo.categories.some((cat) => cat.categoryId === categoryId);
    if (!categoryMatch) return false;

    // Date validation only if category matches
    return isPromotionDateValid(promo, today);
  }) || null;
}

/**
 * Get active promotion for a product based on its category
 * Optimized for performance with early returns and cached date calculations
 */
export function getPromotionForProduct(
  product: ProductPreview,
  promotions: PromotionDetails[]
): PromotionDetails | null {
  return getPromotionForCategory(product.categoryId, promotions);
}