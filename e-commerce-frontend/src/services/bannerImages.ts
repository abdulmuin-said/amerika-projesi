import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { BannerImage, BannerImageCreateDto, BannerImageUpdateDto } from "@/types/domains/bannerImage";

export const getAllBannerImages: ServiceFunction<void, BannerImage[]> = () => {
  return servicesApiClient.get("/banner-images");
};

export const getDefaultBannerImage: ServiceFunction<void, BannerImage | null> = () => {
  return servicesApiClient.get("/banner-images/default");
};

export const createBannerImage: ServiceFunction<BannerImageCreateDto, BannerImage> = (dto) => {
  return servicesApiClient.post("/banner-images", { data: dto });
};

export const updateBannerImage: ServiceFunction<
  [bannerImageId: number, dto: BannerImageUpdateDto],
  BannerImage
> = (bannerImageId, dto) => {
  return servicesApiClient.put(`/banner-images/${bannerImageId}`, { data: dto });
};

export const deleteBannerImage: ServiceFunction<[bannerImageId: number], void> = (bannerImageId) => {
  return servicesApiClient.delete(`/banner-images/${bannerImageId}`);
};

