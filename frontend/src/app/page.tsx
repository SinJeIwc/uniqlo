import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import categoriesData from "@/data/categories.json";
import homepageData from "@/data/home/women.json";
import { CampaignCard, CampaignGrid } from "@/components/home/CampaignCard";
import { CategoryIconGrid } from "@/components/home/CategoryNav";
import type { Campaign } from "@/components/home/types";

const womenCategories = categoriesData.categories.find(
  (c) => c.id === "women",
)!;

export default function HomePage() {
  const campaigns: Campaign[] = homepageData;
  const hero = campaigns[0];
  const rest = campaigns.slice(1);

  return (
    <>
      <Header />

      {hero && (hero.image || hero.video) && <CampaignCard campaign={hero} />}

      <main>
        <CategoryIconGrid category={womenCategories} />
        <CampaignGrid campaigns={rest} />
      </main>

      <Footer />
    </>
  );
}
