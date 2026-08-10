import { CuratedPicks } from "@/components/storefront/CuratedPicks";
import { FeaturedCollection } from "@/components/storefront/FeaturedCollection";
import { HeroSection } from "@/components/storefront/HeroSection";
import { NewsletterSignup } from "@/components/storefront/NewsletterSignup";
import { getTrendingProducts } from "@/lib/db/queries/products";

export default async function HomePage() {
  const trending = await getTrendingProducts(8);

  return (
    <>
      <HeroSection />
      <CuratedPicks products={trending} />
      <FeaturedCollection />
      <NewsletterSignup />
    </>
  );
}
