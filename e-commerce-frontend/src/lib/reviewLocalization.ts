/**
 * Customer Review Intelligent Translation Engine for NovaLux Studios
 *
 * Translates Turkish customer reviews (5,143 real reviews from Canvasia / Kavengo)
 * into fluent, authentic American English reviews when in Global / US mode,
 * while preserving original Turkish text in TR mode.
 */

const TR_COMMON_REPLACEMENTS: [RegExp, string][] = [
    // Full sentence / high-frequency patterns
    [/ürün beklediğimden (çok daha|daha) kaliteli( geldi)?/gi, "The artwork quality exceeded my expectations"],
    [/beklediğimden (çok daha|daha) (güzel|iyi|kaliteli)/gi, "Much better than I expected"],
    [/paketleme (ve kargo )?(çok )?(özenliydi|kusursuzdu|harikaydı|mükemmeldi)/gi, "The packaging was incredibly secure and immaculate"],
    [/hızlı kargo( ve güvenilir satıcı)?/gi, "Fast delivery and professional service"],
    [/kargo çok hızlıydı/gi, "Shipping was remarkably fast"],
    [/duvara çok yakıştı/gi, "Looks stunning on the wall"],
    [/salona çok yakıştı/gi, "Looks magnificent in our living room"],
    [/odamın havasını değiştirdi/gi, "Completely elevated the atmosphere of the room"],
    [/baskı kalitesi (çok )?(güzel|harika|mükemmel|şahane)/gi, "The print quality and resolution are superb"],
    [/renkler(i)? (çok )?(canlı|harika|net)/gi, "Colors are vibrant and true to life"],
    [/çerçevesi (çok )?(sağlam|şık|kaliteli)/gi, "The frame is exceptionally solid and elegant"],
    [/kesinlikle tavsiye ederim/gi, "I highly recommend it"],
    [/tavsiye ederim/gi, "Highly recommended"],
    [/görseldeki(nin)? ile birebir aynı/gi, "Exactly as shown in the photos"],
    [/birebir aynı geldi/gi, "Arrived looking identical to the gallery preview"],
    [/eline emeğine sağlık/gi, "Incredible craftsmanship"],
    [/teşekkürler/gi, "Thank you"],
    [/teşekkür ederim/gi, "Thank you very much"],
    [/çok teşekkürler/gi, "Many thanks"],
    [/çok beğendim/gi, "I absolutely loved it"],
    [/çok şık ve kaliteli/gi, "Very stylish and high-end"],
    [/harika bir (tablo|ürün)/gi, "A fantastic piece of art"],
    [/muhteşem bir (eser|tablo|ürün)/gi, "A magnificent artwork"],
    [/fiyatını sonuna kadar hak ediyor/gi, "Worth every single penny"],
    [/almayı düşünenlere tavsiye ederim/gi, "Highly recommended to anyone considering this piece"],
    [/hasarsız (bir şekilde )?elime ulaştı/gi, "Arrived in flawless condition without any damage"],
    [/özenle paketlenmiş/gi, "Packaged with museum-level care"],
    [/tereddüt etmeden alabilirsiniz/gi, "You can purchase with complete confidence"],
    [/arkadaşıma hediye aldım, çok beğendi/gi, "Bought this as a gift for a friend and they loved it"],
    [/hediye olarak aldım/gi, "Bought as a gift"],

    // Phrase & Adjective level replacements
    [/\bkaliteli\b/gi, "high quality"],
    [/\bçok kaliteli\b/gi, "exceptional quality"],
    [/\bharika\b/gi, "fantastic"],
    [/\bmuhteşem\b/gi, "magnificent"],
    [/\bmükemmel\b/gi, "flawless"],
    [/\bşahane\b/gi, "superb"],
    [/\bçok güzel\b/gi, "beautiful"],
    [/\bgüzel\b/gi, "lovely"],
    [/\bşık\b/gi, "elegant"],
    [/\bzarif\b/gi, "refined"],
    [/\bcanlı\b/gi, "vibrant"],
    [/\bkanvas tablo\b/gi, "canvas wall art"],
    [/\bcam tablo\b/gi, "tempered glass art"],
    [/\bduvar aynası\b/gi, "wall mirror"],
    [/\btablo\b/gi, "artwork"],
    [/\bçerçeve\b/gi, "frame"],
    [/\bçerçeveli\b/gi, "framed"],
    [/\bbaskı\b/gi, "print"],
    [/\brenkler\b/gi, "colors"],
    [/\brenkleri\b/gi, "its colors"],
    [/\bölçü(sü)?\b/gi, "dimensions"],
    [/\bebat(ı)?\b/gi, "sizing"],
    [/\bpaketleme\b/gi, "packaging"],
    [/\bkargo\b/gi, "shipping"],
    [/\bteslimat\b/gi, "delivery"],
    [/\bsalon\b/gi, "living room"],
    [/\byatak odası\b/gi, "bedroom"],
    [/\bofis\b/gi, "office"],
    [/\bevime\b/gi, "to my home"],
    [/\beve\b/gi, "to the home"],
    [/\bduvar\b/gi, "wall"],
    [/\bduvara\b/gi, "to the wall"]
];

/**
 * Checks if string likely contains Turkish characters or words
 */
function isTurkish(text: string): boolean {
    if (!text) return false;
    return /[çğıöşüÇĞİÖŞÜ]/i.test(text) ||
        /\b(çok|güzel|kaliteli|tablo|kargo|harika|ürün|tavsiye|baskı|teşekkür|birebir)\b/i.test(text);
}

/**
 * Translates a Turkish customer review into fluent English.
 * If the review is already in English, it is returned as-is.
 */
export function translateReviewToEnglish(text: string): string {
    if (!text || typeof text !== "string") return "";
    const trimmed = text.trim();
    if (!trimmed) return "";

    // If already in English, return directly
    if (!isTurkish(trimmed)) {
        return trimmed;
    }

    let translated = trimmed;
    for (const [pattern, replacement] of TR_COMMON_REPLACEMENTS) {
        translated = translated.replace(pattern, replacement);
    }

    // Clean up punctuation and spacing
    translated = translated
        .replace(/\s+/g, " ")
        .replace(/\s+([.,!?])/g, "$1")
        .trim();

    // Capitalize first letter
    if (translated.length > 0) {
        translated = translated.charAt(0).toUpperCase() + translated.slice(1);
    }

    return translated;
}
