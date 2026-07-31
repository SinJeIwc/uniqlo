"use client"

import {
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  ImageIcon,
  NavigationIcon,
  PackageIcon,
  PlayIcon,
} from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Separator } from "@/components/ui/separator"
import type { CategoryNode } from "./types"

interface Props {
  category: CategoryNode | null
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="text-[11px] text-muted-foreground w-20 shrink-0 pt-0.5">{label}</span>
      <div className="min-w-0 flex-1 text-sm">{children}</div>
    </div>
  )
}

function MediaSlide({
  type,
  src,
  poster,
}: {
  type: "image" | "video"
  src: string
  poster?: string | null
}) {
  if (type === "video") {
    return (
      <div className="relative w-full aspect-video group">
        <video
          src={src}
          poster={poster || undefined}
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          onMouseEnter={(e) => e.currentTarget.play()}
          onMouseLeave={(e) => {
            e.currentTarget.pause()
            e.currentTarget.currentTime = 0
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors pointer-events-none">
          <PlayIcon className="size-12 text-white/70 drop-shadow-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video">
      <Image src={src} alt="" fill unoptimized className="object-cover" />
    </div>
  )
}

export function CategoryDetail({ category }: Props) {
  if (!category) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[400px]">
        <CardContent className="text-sm text-muted-foreground text-center space-y-3">
          <ImageIcon className="size-10 mx-auto opacity-20" />
          <p>Select a category to view details</p>
        </CardContent>
      </Card>
    )
  }

  const kindVariant =
    category.kind === "section" ? "default" : category.kind === "feature" ? "secondary" : "outline"

  // Build media slides
  const slides: { type: "image" | "video"; src: string; poster?: string | null }[] = []
  if (category.videoUrl) {
    slides.push({ type: "video", src: category.videoUrl, poster: category.videoPoster })
  }
  if (category.imagePc) slides.push({ type: "image", src: category.imagePc })
  if (category.imageSp && category.imageSp !== category.imagePc) {
    slides.push({ type: "image", src: category.imageSp })
  }
  if (category.image && !category.imagePc && !category.imageSp) {
    slides.push({ type: "image", src: category.image })
  }
  const hasGallery = slides.length > 0

  return (
    <Card className="h-full overflow-hidden">
      {/* Media carousel */}
      {hasGallery && (
        <Carousel className="w-full">
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide.src}>
                <MediaSlide {...slide} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {slides.length > 1 && (
            <>
              <CarouselPrevious className="left-3" />
              <CarouselNext className="right-3" />
            </>
          )}
          {/* Dot indicators */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slides.map((slide) => (
                <div key={slide.src} className="size-1.5 rounded-full bg-white/60" />
              ))}
            </div>
          )}
        </Carousel>
      )}

      <CardHeader className={hasGallery ? "pt-4" : "pt-6"}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-lg leading-snug">
              {category.nameRu || category.name}
            </CardTitle>
            {category.nameRu && category.nameRu !== category.name && (
              <p className="text-xs text-muted-foreground mt-0.5">{category.name}</p>
            )}
            {(category.subtitleRu || category.subtitle) && (
              <p className="text-xs text-muted-foreground mt-1.5 whitespace-pre-line leading-relaxed">
                {category.subtitleRu || category.subtitle}
              </p>
            )}
            {category.subtitleRu &&
              category.subtitleRu !== category.subtitle &&
              category.subtitle && (
                <p className="text-[11px] text-muted-foreground/60 mt-0.5 whitespace-pre-line leading-relaxed">
                  {category.subtitle}
                </p>
              )}
          </div>
          <Badge
            variant={kindVariant as "default" | "secondary" | "outline"}
            className="shrink-0 capitalize"
          >
            {category.kind}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-1 pb-6">
        <Separator className="mb-3" />

        <FieldRow label="ID">
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{category.id}</code>
          {category.parentId && (
            <span className="text-xs text-muted-foreground ml-2">
              child of <span className="font-mono">{category.parentId}</span>
            </span>
          )}
        </FieldRow>

        <FieldRow label="Slug">
          <code className="font-mono text-[11px] break-all">{category.slug}</code>
        </FieldRow>

        <FieldRow label="URL">
          <div className="flex items-center gap-1.5">
            <GlobeIcon className="size-3 text-muted-foreground shrink-0" />
            <code className="font-mono text-[11px] break-all">{category.href}</code>
          </div>
        </FieldRow>

        <FieldRow label="Gender">
          <Badge variant="outline" className="text-xs capitalize">
            {category.gender}
          </Badge>
        </FieldRow>

        <Separator className="my-2" />

        <FieldRow label="Name JP">
          <span className="text-sm">{category.name}</span>
        </FieldRow>
        {category.subtitle && (
          <FieldRow label="Subtitle JP">
            <span className="text-xs text-muted-foreground whitespace-pre-line">
              {category.subtitle}
            </span>
          </FieldRow>
        )}

        <Separator className="my-2" />

        <FieldRow label="Navigation">
          {category.nav ? (
            <div className="flex items-center gap-2">
              <NavigationIcon className="size-3 text-primary" />
              <span className="text-xs">shown in nav, position #{category.navOrder}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">hidden from nav</span>
          )}
        </FieldRow>

        <FieldRow label="Visible">
          {category.visible ? (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <EyeIcon className="size-3" />
              <span className="text-xs">visible on site</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <EyeOffIcon className="size-3" />
              <span className="text-xs">hidden</span>
            </div>
          )}
        </FieldRow>

        <FieldRow label="Products">
          {category.productCount != null ? (
            <div className="flex items-center gap-1.5">
              <PackageIcon className="size-3 text-muted-foreground" />
              <span className="font-mono text-xs font-semibold tabular-nums">
                {category.productCount}
              </span>
              <span className="text-xs text-muted-foreground">items total</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </FieldRow>
      </CardContent>
    </Card>
  )
}
