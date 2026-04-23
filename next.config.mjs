/** @type {import('next').NextConfig} */
const cloudinaryPath = process.env.CLOUDINARY_CLOUD_NAME
  ? `/${process.env.CLOUDINARY_CLOUD_NAME}/**`
  : "/**";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: cloudinaryPath },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for better performance
    dangerouslyAllowSVG: false,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: 'default',
    unoptimized: false,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,

  // Security redirects
  async redirects() {
    return [
      // Redirect HTTP to HTTPS in production
      ...(process.env.NODE_ENV === 'production' ? [
        {
          source: '/:path*',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http'
            }
          ],
          destination: 'https://:host/:path*',
          permanent: true
        }
      ] : [])
    ];
  },

  // OPTIMIZED: Aggressive caching for static assets, CDN-friendly headers
  async headers() {
    return [
      {
        // Next.js static assets - immutable with long cache (must be first)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Public uploads - long cache
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes - short cache with stale-while-revalidate
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
    serverComponentsExternalPackages: ["pdfkit"],
  },

  // Webpack configuration for additional security and performance
  webpack: (config, { isServer, dev }) => {
    // Security-related webpack configurations
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('bcryptjs');
    }

    // Remove source maps in production for security and performance
    if (!dev) {
      config.devtool = false;
    }

    return config;
  },

  // Output configuration
  output: process.env.NEXT_STANDALONE === 'true' ? 'standalone' : undefined,
  
  // Disable x-powered-by header
  generateEtags: true, // Enable ETags for better caching
  
  // PERFORMANCE: Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production
};

export default nextConfig;
