import Hero from "@/components/home/hero/hero";
import NewArrivals from "@/components/home/new-arrivals/new-arrivals";
import ShopBySport from "@/components/home/shop-by-sport/shop-by-sport";
import DynamicCategories from "@/components/home/dynamic-categories/dynamic-categories";
import FinalCta from "@/components/home/final-cta/final-cta";

export default async function MainPage() {
  return (
    <>
      <Hero />
      <NewArrivals />
      <ShopBySport />
      <DynamicCategories />
      <FinalCta />
    </>
  );
}