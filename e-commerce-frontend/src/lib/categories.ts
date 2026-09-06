import { CategoryTree } from "@/types/domains/category";

export interface PillarSubcategory {
    id: number;
    code: string;
    nameEn: string;
    nameTr: string;
    imageUrl: string;
    descriptionEn?: string;
    descriptionTr?: string;
}

export interface PillarCategory {
    id: number;
    code: string;
    nameEn: string;
    nameTr: string;
    sublineEn: string;
    sublineTr: string;
    taglineEn: string;
    taglineTr: string;
    imageUrl: string;
    subcategories: PillarSubcategory[];
}

export const LUXURY_PILLARS: PillarCategory[] = [
    {
        id: 100,
        code: "WALL-ART",
        nameEn: "Wall Art",
        nameTr: "Kanvas Tablolar",
        sublineEn: "Museum Fine Canvas Art",
        sublineTr: "Müze Standartlarında Kanvas",
        taglineEn: "Archival 380gsm cotton canvas with handcrafted floating frames",
        taglineTr: "380 gr/m² saf pamuklu arşiv kanvası ve el işçiliği yüzen çerçeveler",
        imageUrl: "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/cercevesizfon01.webp",
        subcategories: [
            {
                id: 101,
                code: "MODERN-ABSTRACT",
                nameEn: "Modern & Abstract",
                nameTr: "Modern & Soyut Sanat",
                imageUrl: "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/gold01.webp",
                descriptionEn: "Bold contemporary expressions and textured geometric forms",
                descriptionTr: "Cesur çağdaş dokular ve soyut geometrik formlar"
            },
            {
                id: 102,
                code: "NATURE-BOTANICALS",
                nameEn: "Nature & Botanicals",
                nameTr: "Doğa & Botanik",
                imageUrl: "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/cercevesizfon01.webp",
                descriptionEn: "Serene flora, organic landscapes, and misted woodlands",
                descriptionTr: "Dingin flora, organik manzaralar ve sisli ormanlar"
            },
            {
                id: 103,
                code: "PANORAMIC-COLLECTION",
                nameEn: "Panoramic Editions",
                nameTr: "Panoramik Koleksiyon",
                imageUrl: "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/cercevesizfon01.webp",
                descriptionEn: "Wide-format architectural centerpieces up to 240cm",
                descriptionTr: "240 cm'e kadar geniş formatlı mimari başyapıtlar"
            },
            {
                id: 104,
                code: "ARCHITECTURE-CITIES",
                nameEn: "Architecture & Cities",
                nameTr: "Şehir & Mimari Manzaralar",
                imageUrl: "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/cercevesizfon01.webp",
                descriptionEn: "Iconic urban horizons, classical facades, and nightscapes",
                descriptionTr: "İkonik şehir silüetleri, klasik cepheler ve gece manzaraları"
            },
            {
                id: 105,
                code: "HERITAGE-CLASSICS",
                nameEn: "Heritage & Classics",
                nameTr: "Klasik & Kültürel Eserler",
                imageUrl: "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/cercevesizfon01.webp",
                descriptionEn: "Timeless Renaissance reproductions and historic Ottoman art",
                descriptionTr: "Ölümsüz Rönesans reprodüksiyonları ve Osmanlı minyatürleri"
            },
            {
                id: 106,
                code: "CONTEMPORARY-LIVING",
                nameEn: "Contemporary & Living",
                nameTr: "Çağdaş & Özel Tasarım",
                imageUrl: "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/cercevesizfon01.webp",
                descriptionEn: "Minimalist living accents, line art, and typography",
                descriptionTr: "Minimalist yaşam dokunuşları, çizgi sanatı ve tipografi"
            }
        ]
    },
    {
        id: 200,
        code: "GLASS-ART",
        nameEn: "Glass Art",
        nameTr: "Cam Tablolar",
        sublineEn: "Tempered Glass Wall Art",
        sublineTr: "Kırılmaz Temperli Cam",
        taglineEn: "Diamond-cut shatterproof tempered glass with ultra-vibrant UV depth",
        taglineTr: "Elmas kesim kırılmaz temperli cam ve ultra canlı UV derinlik teknolojisi",
        imageUrl: "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/gold01.webp",
        subcategories: [
            {
                id: 201,
                code: "TEMPERED-GLASS-ART",
                nameEn: "Tempered Glass Wall Art",
                nameTr: "Kırılmaz Temperli Cam Tablolar",
                imageUrl: "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/gold01.webp",
                descriptionEn: "Ultra-gloss 4mm tempered glass with luminous depth",
                descriptionTr: "Ultra parlak 4mm kırılmaz temperli cam ve ışıl ışıl derinlik"
            },
            {
                id: 202,
                code: "CULINARY-GLASS",
                nameEn: "Culinary & Decorative Glass",
                nameTr: "Mutfak & Cam Kesme Tahtası",
                imageUrl: "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/gold01.webp",
                descriptionEn: "Functional heat-resistant decorative glass boards",
                descriptionTr: "Fonksiyonel ısıya dayanıklı dekoratif cam kesme tahtaları"
            }
        ]
    },
    {
        id: 300,
        code: "MIRRORS",
        nameEn: "Mirrors & Reflections",
        nameTr: "Tasarım Duvar Aynaları",
        sublineEn: "Architectural Wall Mirrors",
        sublineTr: "Dekoratif Duvar Aynaları",
        taglineEn: "Architectural wall mirrors and ambient touch-sensor LED illuminated designs",
        taglineTr: "Mimari dekoratif duvar aynaları ve dokunmatik sensörlü LED ışıklı tasarımlar",
        imageUrl: "https://www.canvasia.com.tr/uploads/products/kisiye-ozel-instagram-tasarimli-duvar-aynasi-isimli-ve-fotografli-ayna-ana-44aa879d.webp",
        subcategories: [
            {
                id: 301,
                code: "WALL-MIRRORS",
                nameEn: "Architectural Wall Mirrors",
                nameTr: "Dekoratif Duvar Aynaları",
                imageUrl: "https://www.canvasia.com.tr/uploads/products/kisiye-ozel-instagram-tasarimli-duvar-aynasi-isimli-ve-fotografli-ayna-ana-44aa879d.webp",
                descriptionEn: "Precision bevel-cut heirloom frames and geometric silhouettes",
                descriptionTr: "Hassas bizoteli lüks çerçeveler ve geometrik silüetler"
            },
            {
                id: 302,
                code: "LED-MIRRORS",
                nameEn: "Illuminated LED Mirrors",
                nameTr: "Işıklı LED Aynalar",
                imageUrl: "https://www.canvasia.com.tr/uploads/products/kisiye-ozel-instagram-tasarimli-duvar-aynasi-isimli-ve-fotografli-ayna-ana-44aa879d.webp",
                descriptionEn: "Warm ambient touch-sensor backlight for luxury powder rooms",
                descriptionTr: "Lüks mekânlar için dokunmatik sensörlü ambiyans LED aydınlatma"
            }
        ]
    }
];

/**
 * Returns localized category name for a given pillar or subcategory
 */
export function getLocalizedCategoryName(
    category: { nameEn: string; nameTr: string } | { name: string; nameTr?: string },
    locale: "en" | "tr"
): string {
    if ("nameEn" in category && "nameTr" in category) {
        return locale === "tr" ? category.nameTr : category.nameEn;
    }
    if (locale === "tr" && category.nameTr && category.nameTr.trim().length > 0) {
        return category.nameTr;
    }
    return category.name;
}

/**
 * Merges backend category trees into the clean 3-pillar structure.
 * Maps dynamic categoryId from API if matched by code or fallback ID.
 */
export function buildPillarCategoryTree(
    apiCategories: CategoryTree[] | undefined,
    locale: "en" | "tr"
): CategoryTree[] {
    const flatApiMap = new Map<string | number, CategoryTree>();

    const traverse = (list: CategoryTree[]) => {
        for (const item of list) {
            flatApiMap.set(item.categoryId, item);
            if (item.name) flatApiMap.set(item.name.toLowerCase().trim(), item);
            if (item.subcategories?.length) traverse(item.subcategories);
        }
    };

    if (apiCategories && apiCategories.length > 0) {
        traverse(apiCategories);
    }

    return LUXURY_PILLARS.map((pillar) => {
        const apiPillar = flatApiMap.get(pillar.id) ||
            flatApiMap.get(pillar.nameEn.toLowerCase()) ||
            flatApiMap.get(pillar.nameTr.toLowerCase());

        const pillarId = apiPillar ? apiPillar.categoryId : pillar.id;

        const subcategories: CategoryTree[] = pillar.subcategories.map((sub) => {
            const apiSub = flatApiMap.get(sub.id) ||
                flatApiMap.get(sub.nameEn.toLowerCase()) ||
                flatApiMap.get(sub.nameTr.toLowerCase());

            const subId = apiSub ? apiSub.categoryId : sub.id;

            return {
                categoryId: subId,
                name: locale === "tr" ? sub.nameTr : sub.nameEn,
                path: `/products?categoryId=${subId}`,
                imageUrl: sub.imageUrl,
                subcategories: []
            };
        });

        return {
            categoryId: pillarId,
            name: locale === "tr" ? pillar.nameTr : pillar.nameEn,
            path: `/products?categoryId=${pillarId}`,
            imageUrl: pillar.imageUrl,
            subcategories
        };
    });
}
