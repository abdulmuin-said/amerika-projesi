export interface Variation {
    variationId: number;
    name: string;
    variationOptions: VariationOption[];
}

export interface VariationOption {
    variationOptionId: number;
    name: string;
    code: string;
}

export interface VariationCreationPayload {
    name: string;
    variationOptions: {
        name: string;
        code: string;
    }[];
}

export interface VariationUpdationPayload {
    name: string;
    variationOptions: {
        variationOptionId?: number;
        name: string;
        code: string;
    }[];
}