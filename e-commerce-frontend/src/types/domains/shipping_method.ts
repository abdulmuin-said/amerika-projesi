export interface ShippingOption {
  id?: number;
  shippingMethodId?: number;
  destinationCountry: string;
  carrier: string;
  costFirstItem: number;
  costAdditionalItem: number;
  estimatedDeliveryMin: number;
  estimatedDeliveryMax: number;
}

export interface ShippingMethod {
  shippingMethodId: number;
  name: string;
  originCountry: string;
  originPostalCode: string;
  processingTimeMin: number;
  processingTimeMax: number;
  shippingOptions: ShippingOption[];
}

export interface ShippingMethodDTO {
  name: string;
  originCountry: string;
  originPostalCode: string;
  processingTimeMin: number;
  processingTimeMax: number;
  shippingOptions: ShippingOption[];
}