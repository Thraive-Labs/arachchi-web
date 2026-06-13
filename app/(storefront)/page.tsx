import { BrandStatement } from "@/components/storefront/BrandStatement";
import { CuratedPicks } from "@/components/storefront/CuratedPicks";
import { FeaturedCollection } from "@/components/storefront/FeaturedCollection";
import { HeroSection } from "@/components/storefront/HeroSection";
import { LookbookTeaser } from "@/components/storefront/LookbookTeaser";
import { NewsletterSignup } from "@/components/storefront/NewsletterSignup";
import { TrendingNow } from "@/components/storefront/TrendingNow";
import { getFeaturedProducts, getTrendingProducts } from "@/lib/db/queries/products";

export default async function HomePage() {
  const [featured, trending] = await Promise.all([
    getFeaturedProducts(8),
    getTrendingProducts(8),
  ]);

  return (
    <>
      <HeroSection />
      <BrandStatement />
      <FeaturedCollection />
      <CuratedPicks products={featured} />
      <TrendingNow products={trending} />
      <LookbookTeaser />
      <NewsletterSignup />
    </>
  );
}
