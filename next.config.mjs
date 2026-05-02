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
    minimumCacheTTL: 0,
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

  // Disable browser/proxy caching so deployed HTML never points at stale chunks.
  async headers() {
    const noStoreHeaders = [
      {
        key: 'Cache-Control',
        value: 'no-store, no-cache, must-revalidate, max-age=0',
      },
      {
        key: 'Pragma',
        value: 'no-cache',
      },
      {
        key: 'Expires',
        value: '0',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
    ];

    return [
      {
        source: '/:path*',
        headers: noStoreHeaders,
      },
      {
        source: '/_next/static/:path*',
        headers: noStoreHeaders,
      },
      {
        source: '/_next/data/:path*',
        headers: noStoreHeaders,
      },
      {
        source: '/uploads/:path*',
        headers: noStoreHeaders,
      },
      {
        source: '/api/:path*',
        headers: noStoreHeaders,
      },
    ];
  },

  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'react-dom'],
    serverComponentsExternalPackages: ["pdfkit"],
    // optimizeCss: true, // Disabled - requires critters package
    scrollRestoration: true,
  },

  // Optimize imports for better tree-shaking
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // CRITICAL: Ensure proper error handling for production
  onDemandEntries: {
    // Keep pages in memory longer to prevent premature unloading
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
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
  generateEtags: false,
  
  // PERFORMANCE: Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production
};

export default nextConfig;
