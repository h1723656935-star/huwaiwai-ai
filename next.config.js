/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'picsum.photos'],
    unoptimized: process.env.CF_BUILD === '1',
  },
  ...(process.env.CF_BUILD === '1' ? {
    output: 'export',
    trailingSlash: true,
  } : {}),
}

export default nextConfig
