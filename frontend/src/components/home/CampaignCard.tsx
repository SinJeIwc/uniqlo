import Link from "next/link";
import type { Campaign } from "./types";
import { formatPrice } from "./types";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const href = campaign.link || "#";

  return (
    <Link href={href} className="group relative block w-full overflow-hidden bg-zinc-50">
      <div className="relative w-full h-[90vh]">
        {campaign.video ? (
          <video
            src={campaign.video}
            poster={campaign.image || undefined}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={campaign.image!}
            alt={campaign.title || ""}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 bg-gradient-to-t from-black/60 via-black/15 to-transparent">
          <div className="max-w-[1440px] mx-auto">
            {campaign.badge && (
              <span className="inline-block bg-white text-black text-[10px] font-bold px-2 py-0.5 uppercase mb-2 lg:mb-4">
                {campaign.badge}
              </span>
            )}
            {campaign.title && (
              <p className="text-white text-[22px] font-bold leading-tight">{campaign.title}</p>
            )}
            {campaign.description && (
              <p className="text-white/80 text-base mt-2 lg:mt-4 max-w-lg">{campaign.description}</p>
            )}
            {campaign.price && (
              <p className="text-white text-sm font-bold mt-2 lg:mt-4">{formatPrice(campaign.price)}</p>
            )}
            {campaign.saleText && (
              <p className="text-white/60 text-[11px] mt-2 lg:mt-4">{campaign.saleText}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CampaignGrid({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="flex flex-col gap-4">
      {campaigns
        .filter((c) => c.image || c.video)
        .map((c, i) => (
          <CampaignCard key={i} campaign={c} />
        ))}
    </div>
  );
}
