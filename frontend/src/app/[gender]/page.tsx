import { notFound, redirect } from "next/navigation"
import { CampaignCard, CampaignGrid } from "@/components/home/CampaignCard"
import { CategoryNav } from "@/components/home/CategoryNav"
import type { Campaign, CategoryNavItem } from "@/components/home/types"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"

import menCategories from "@/data/categories/men-nav.json"
import kidsCategories from "@/data/categories/kids-nav.json"
import babyCategories from "@/data/categories/baby-nav.json"
import menHomepage from "@/data/home/men.json"
import kidsHomepage from "@/data/home/kids.json"
import babyHomepage from "@/data/home/baby.json"

type PageProps = {
  params: Promise<{ gender: string }>
}

const GENDER_DATA = {
  men: { homepage: menHomepage, categories: menCategories },
  kids: { homepage: kidsHomepage, categories: kidsCategories },
  baby: { homepage: babyHomepage, categories: babyCategories },
} as const

type ValidGender = keyof typeof GENDER_DATA

function isValidGender(gender: string): gender is ValidGender {
  return gender in GENDER_DATA
}

export default async function GenderHomePage({ params }: PageProps) {
  const { gender } = await params

  if (gender === "women") {
    redirect("/")
  }

  if (!isValidGender(gender)) {
    notFound()
  }

  const data = GENDER_DATA[gender]
  const campaigns: Campaign[] = data.homepage
  const hero = campaigns[0]
  const rest = campaigns.slice(1)
  const categories: CategoryNavItem[] = data.categories

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

export function generateStaticParams() {
  return [{ gender: "men" }, { gender: "kids" }, { gender: "baby" }]
}
