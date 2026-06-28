import type { categories } from "@/db/schema"
import { api } from "./client"

export type NavItem = typeof categories.$inferSelect

export function getNavCategories(gender: string) {
  return api<NavItem[]>(`/api/categories?type=nav&gender=${gender}`)
}

export function getAllNavCategories() {
  return api<NavItem[]>(`/api/categories?type=nav`)
}
