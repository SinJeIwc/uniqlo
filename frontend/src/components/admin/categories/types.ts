export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  gender: string;
  parentId: number | null;
  order: number | null;
  image: string | null;
  visible: number;
  children?: CategoryNode[];
}
