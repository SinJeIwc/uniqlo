import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type IconCategory = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
};

const VISIBLE_COUNT = 18;

export function CategoryIconGrid({ parents }: { parents: IconCategory[] }) {
  const visible = parents.slice(0, VISIBLE_COUNT);
  const hasMore = parents.length > VISIBLE_COUNT;

  return (
    <section className="container mx-auto px-4 sm:px-3 py-4 lg:py-6">
      <h2 className="text-[20px] mb-4">Категории</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-y-4 sm:gap-y-6 gap-x-2">
        {visible.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="flex flex-col items-center gap-1.5 group"
          >
            {cat.image ? (
              <Image
                src={cat.image}
                alt={cat.name}
                width={96}
                height={96}
                unoptimized
                className="size-17 sm:size-21 lg:size-24 object-contain"
              />
            ) : (
              <div className="size-17 sm:size-21 lg:size-24 flex items-center justify-center bg-muted">
                <span className="text-[10px] text-muted-foreground text-center leading-tight px-0.5">
                  {cat.name}
                </span>
              </div>
            )}
            <span className="text-[11px] text-center text-zinc-600 group-hover:text-zinc-900 leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="h-full w-full sm:w-1/2 my-6 text-base font-normal rounded-full border-foreground py-4"
            render={<Link href="/categories" />}
          >
            Посмотреть все категории
          </Button>
        </div>
      )}
    </section>
  );
}
