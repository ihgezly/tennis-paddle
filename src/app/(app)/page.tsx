import BrandsSection from "@/components/home/brands/brands-section";
import CtaPair from "@/components/home/cta-pair";
import DynamicCategories from "@/components/home/dynamic-categories/dynamic-categories";
import ExploreMore from "@/components/home/explore-more/explore-more";
import Hero from "@/components/home/hero/hero";
import NewArrivals from "@/components/home/new-arrivals/new-arrivals";
import ShopBySport from "@/components/home/shop-by-sport/shop-by-sport";
import SourcesSection from "@/components/home/sources/sources-section";

export default async function MainPage() {
  return (
    <>
      <Hero />
      <NewArrivals />
      <ExploreMore />
      <ShopBySport />
      <SourcesSection />
      <BrandsSection />
      <DynamicCategories />
      <CtaPair />
    </>
  );
}