import { db } from "@/db";
import { categories, navCategories } from "@/db/schema";
import { eq, isNull, and, asc } from "drizzle-orm";

export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  gender: string;
  parentId: number | null;
  order: number | null;
  image: string | null;
};

export type CategoryTree = {
  parent: CategoryRow;
  children: CategoryRow[];
};

export function getNavCategories(gender: string) {
  return db
    .select()
    .from(navCategories)
    .where(eq(navCategories.gender, gender))
    .orderBy(asc(navCategories.order))
    .all();
}

/** Get parent categories for a gender (tree view) */
export function getParentCategories(gender: string): CategoryRow[] {
  return db
    .select()
    .from(categories)
    .where(and(eq(categories.gender, gender), isNull(categories.parentId)))
    .orderBy(asc(categories.order))
    .all();
}

/** Get ALL categories for a gender (parents + children, flat) */
export function getAllCategories(gender: string): CategoryRow[] {
  return db
    .select()
    .from(categories)
    .where(eq(categories.gender, gender))
    .orderBy(asc(categories.order))
    .all();
}

/** Get full tree: parents with their children (link lists on gender pages) */
export function getCategoryTree(gender: string): CategoryTree[] {
  const all = db
    .select()
    .from(categories)
    .where(eq(categories.gender, gender))
    .orderBy(asc(categories.order))
    .all();

  const parents = all.filter((c) => c.parentId === null);
  return parents.map((parent) => ({
    parent,
    children: all.filter((c) => c.parentId === parent.id),
  }));
}
