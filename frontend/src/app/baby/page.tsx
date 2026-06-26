import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import homepageData from "@/data/home/baby.json";
import { CampaignCard, CampaignGrid } from "@/components/home/CampaignCard";
import { CategoryIconGrid } from "@/components/home/CategoryNav";
import { getNavCategories } from "@/components/home/categories";
import type { Campaign } from "@/components/home/types";

export const dynamic = "force-dynamic";

export default function BabyPage() {
  const campaigns: Campaign[] = homepageData;
  const hero = campaigns[0];
  const rest = campaigns.slice(1);
  const parents = getNavCategories("baby");

  return (
    <>
      <Header />
      <main>
        <CampaignCard campaign={hero} />
        <CategoryIconGrid parents={parents} />
        <CampaignGrid campaigns={rest} />
      </main>
      <Footer />
    </>
  );
}
