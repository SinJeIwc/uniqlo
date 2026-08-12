import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	serverExternalPackages: ["better-sqlite3"],
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "image.uniqlo.com",
			},
		],
	},
}

export default nextConfig
