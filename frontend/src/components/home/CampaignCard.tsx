import Image from "next/image"
import Link from "next/link"
import type { Campaign } from "./types"
import { formatPrice } from "./types"

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const href = campaign.link || "#"

  return (
    <Link href={href} className="group relative block w-full h-[70vh] sm:h-[95vh]">
      {campaign.video ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          poster={campaign.image || undefined}
          autoPlay
          muted
          loop
          playsInline
        >
          {campaign.videoMobile && <source src={campaign.videoMobile} media="(max-width: 767px)" />}
          <source src={campaign.video} />
        </video>
      ) : campaign.image ? (
        <picture>
          {campaign.imageMobile && (
            <source srcSet={campaign.imageMobile} media="(max-width: 767px)" />
          )}
          <Image
            src={campaign.image}
            alt={campaign.title || ""}
            fill
            unoptimized
            className="object-cover"
          />
        </picture>
      ) : null}

      {/* Overlay */}
      <div className="absolute bottom-0 left-0 right-0 ">
        <div className="mx-[8%] mb-[16%] md:mb-[8%]">
          {campaign.badgeImage && (
            <Image
              src={campaign.badgeImage}
              alt={campaign.badge || ""}
              width={90}
              height={30}
              unoptimized
              className="h-7.5 w-22.5 mb-4 sm:mb-6 lg:mb-8"
            />
          )}
          {campaign.title && (
            <p className="text-white text-[22px] sm:text-[28px] lg:text-[32px] mb-2 sm:mb-4 leading-tight md:max-w-1/4 lg:max-w-[50%]">
              {campaign.title}
            </p>
          )}
          {campaign.description && (
            <p className="text-white text-base mb-4 max-w-[75%] md:max-w-1/5 lg:max-w-[40%]">
              {campaign.description}
            </p>
          )}
          {campaign.price && (
            <p
              className={`text-4xl font-bold mb-2 ${
                campaign.saleText ? "text-[#e00]" : "text-white"
              }`}
            >
              {formatPrice(campaign.price)}
            </p>
          )}
          {campaign.saleText && (
            <p className="text-[#e00] text-[13px] font-bold mb-4">{campaign.saleText}</p>
          )}
          {campaign.note && <p className="text-white text-[8px]">{campaign.note}</p>}
        </div>
      </div>
    </Link>
  )
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
  )
}
