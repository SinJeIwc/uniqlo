// Feature links shown in sidebar navigation, per gender.
// These are NOT categories — they link to special pages.
export const FEATURE_LINKS = [
  { name: "UT", path: "special-feature/ut" },
  { name: "Распродажа", path: "feature/sale" },
  { name: "Новинки", path: "feature/new" },
  { name: "Спецпредложения", path: "feature/limited-offers" },
  { name: "Онлайн эксклюзив", path: "feature/online-exclusive" },
  { name: "Рейтинг", path: "spl/ranking" },
  { name: "Коллекция", path: "special-feature/lifewear-collection" },
] as const

export type FeatureLink = (typeof FEATURE_LINKS)[number]
