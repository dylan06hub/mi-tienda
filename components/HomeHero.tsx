import { connection } from "next/server";
import { getProductos } from "@/lib/productos";
import { getHomeCampaigns } from "@/lib/home-campaigns";
import { BannerCarousel } from "./BannerCarousel";

export async function HomeHero() {
  await connection();
  return <BannerCarousel banners={getHomeCampaigns(await getProductos())} />;
}
