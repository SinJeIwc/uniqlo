import { GenderPageContent } from "@/app/men/page";
import homepageData from "@/data/home/baby.json";

export default function BabyPage() {
  return <GenderPageContent gender="baby" campaigns={homepageData} />;
}
