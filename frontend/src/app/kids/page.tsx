import { GenderPageContent } from "@/app/men/page";
import homepageData from "@/data/home/kids.json";

export default function KidsPage() {
  return <GenderPageContent gender="kids" campaigns={homepageData} />;
}
