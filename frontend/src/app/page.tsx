import { CampaignCard, CampaignGrid } from "@/components/home/CampaignCard"
import { CategoryNav } from "@/components/home/CategoryNav"
import type { Campaign } from "@/components/home/types"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { getHomeNavCategories } from "@/lib/api/categories"
import homepageData from "@/data/home/women.json"

export default async function HomePage() {
	const campaigns: Campaign[] = homepageData
	const hero = campaigns[0]
	const rest = campaigns.slice(1)

	const categories = await getHomeNavCategories("women")

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
