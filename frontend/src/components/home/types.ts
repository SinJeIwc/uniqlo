export type Campaign = {
	image: string | null;
	imageMobile?: string | null;
	video: string | null;
	videoMobile?: string | null;
	badge: string | null;
	badgeImage?: string | null;
	title: string | null;
	description: string | null;
	price: string | null;
	saleText: string | null;
	note?: string | null;
	link: string | null;
};

export function formatPrice(price: string | null): string {
	if (!price) return "";
	return `${price.replace("¥", "").replace(/,/g, "").trim()} KGS`;
}
