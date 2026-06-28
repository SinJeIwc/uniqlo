import { CampaignCard, CampaignGrid } from "@/components/home/CampaignCard"
import { CategoryIconGrid } from "@/components/home/CategoryNav"
import type { Campaign } from "@/components/home/types"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import homepageData from "@/data/home/women.json"
import { getNavCategories } from "@/lib/api/categories"

export default async function HomePage() {
  const campaigns: Campaign[] = homepageData
  const hero = campaigns[0]
  const rest = campaigns.slice(1)
  const parents = await getNavCategories("women")

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
