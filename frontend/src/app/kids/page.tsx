import { CampaignCard, CampaignGrid } from "@/components/home/CampaignCard"
import { CategoryNav } from "@/components/home/CategoryNav"
import type { Campaign, CategoryNavItem } from "@/components/home/types"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import catgoriesData from "@/data/categories/kids-nav.json"
import homepageData from "@/data/home/kids.json"

export default async function HomePage() {
  const campaigns: Campaign[] = homepageData
  const hero = campaigns[0]
  const rest = campaigns.slice(1)
  const categories: CategoryNavItem[] = catgoriesData

  return (
    <>
      <Header />
      <main>
        <CampaignCard campaign={hero} />
        <CategoryNav categories={categories} />
        <CampaignGrid campaigns={rest} />
      </main>
      <Footer />
    </>
  )
}
