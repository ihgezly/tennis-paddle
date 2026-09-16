import DynamicCategories from "@/components/home/dynamic-categories/dynamic-categories";
import ExploreMore from "@/components/home/explore-more/explore-more";
import FinalCta from "@/components/home/final-cta/final-cta";
import Hero from "@/components/home/hero/hero";
import NewArrivals from "@/components/home/new-arrivals/new-arrivals";
import ShopBySport from "@/components/home/shop-by-sport/shop-by-sport";

export default async function MainPage() {
  return (
    <>
      <Hero />
      <NewArrivals />
      <ExploreMore />
      <ShopBySport />
      <DynamicCategories />
      <FinalCta />
    </>
  );
}