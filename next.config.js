/** @type {import('next').NextConfig} */
const isCfBuild = process.env.CF_BUILD === '1';

const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'picsum.photos'],
    unoptimized: isCfBuild,
  },
  ...(isCfBuild ? {
    output: 'export',
    trailingSlash: true,
  } : {}),
}

export default nextConfig
