import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

type PageProps = {
	params: Promise<{ slug: string }>
}

export default async function FeaturePage({ params }: PageProps) {
	const { slug } = await params

	return (
		<>
			<Header />
			<main className="container mx-auto px-4 py-12 min-h-[60vh] flex flex-col items-center justify-center">
				<div className="text-center max-w-md">
					<h1 className="text-4xl font-bold mb-4">В разработке</h1>
					<p className="text-muted-foreground mb-2">
						Страница <span className="font-mono text-sm">/{slug}</span> скоро будет доступна
					</p>
					<p className="text-sm text-muted-foreground">
						Мы работаем над добавлением этого раздела
					</p>
				</div>
			</main>
			<Footer />
		</>
	)
}
