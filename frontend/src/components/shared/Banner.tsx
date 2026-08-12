type BannerProps = {
  videoUrl?: string | null
  videoPoster?: string | null
  imagePc?: string | null
  imageSp?: string | null
  title: string
  subtitle?: string | null
}

export function Banner({
  videoUrl,
  videoPoster,
  imagePc,
  imageSp,
  title,
  subtitle,
}: BannerProps) {
  if (!videoUrl && !imagePc && !imageSp) {
    return null
  }

  return (
    <div className="relative w-full mb-8 overflow-hidden rounded-lg">
      {videoUrl ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={videoPoster || undefined}
          className="w-full h-auto"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <picture>
          {imageSp && <source media="(max-width: 640px)" srcSet={imageSp} />}
          {imagePc && <img src={imagePc} alt={title} className="w-full h-auto" />}
        </picture>
      )}
      {subtitle && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <p className="text-white text-lg font-medium">{subtitle}</p>
        </div>
      )}
    </div>
  )
}
