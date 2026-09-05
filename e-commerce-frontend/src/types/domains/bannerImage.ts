export type BannerImage = {
  bannerImageId: number;
  imageUrl: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BannerImageCreateDto = {
  imageUrl: string;
  isDefault?: boolean;
};

export type BannerImageUpdateDto = {
  imageUrl?: string;
  isDefault?: boolean;
};

