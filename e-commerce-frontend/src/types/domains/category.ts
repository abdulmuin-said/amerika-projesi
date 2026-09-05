import { Attribute } from "./attribute";
import { Variation } from "./variation";

export interface Category {
   categoryId: number;
   name: string;
   code: string;
   parentCategory?: Category;
   variations: Variation[];
   attributes: Attribute[];
   imageUrl?: string;
}

export interface CategoryTree {
   categoryId: number;
   name: string;
   path: string;
   subcategories: CategoryTree[];
   imageUrl?: string;
}

export interface CategoryDetails {
   categoryId: number;
   name: string;
   code: string;
   parentCategory?: CategoryDetails;
   variations: VariationDTO[];
   attributes: Attribute[];
   imageUrl?: string;
}

export interface VariationDTO {
   variationId: number;
   name: string;
}

export interface CategoryDTO {
   name: string;
   code: string;
   parentCategoryId?: number;
   variationIds: number[];
   attributeIds: number[];
   imageUrl?: string;
}