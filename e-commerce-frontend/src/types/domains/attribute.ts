export interface Attribute {
    attributeId: number;
    name: string;
    type: AttributeType;
    allowedValues: string[];
}

export enum AttributeType {
    ENUMERATED = "ENUMERATED",
    CUSTOM = "CUSTOM"
}

export interface AttributeDTO {
    name: string;
    type: AttributeType;
    allowedValues: string[];
}