import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tidy-bobcat-412.convex.cloud',
      },
    ],
  },
}

export default nextConfig
