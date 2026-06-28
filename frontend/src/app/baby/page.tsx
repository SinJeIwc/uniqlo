import { CampaignCard, CampaignGrid } from "@/components/home/CampaignCard"
import { CategoryIconGrid } from "@/components/home/CategoryNav"
import type { Campaign } from "@/components/home/types"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import homepageData from "@/data/home/baby.json"
import { getNavCategories } from "@/lib/api/categories"

export default async function BabyPage() {
  const campaigns: Campaign[] = homepageData
  const hero = campaigns[0]
  const rest = campaigns.slice(1)
  const parents = await getNavCategories("baby")

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
  )
}
