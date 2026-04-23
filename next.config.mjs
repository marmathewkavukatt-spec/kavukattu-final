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
    // Attachment can prevent some browsers from rendering images inline.
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

  // Prevent browsers from caching HTML pages so stale chunk references never cause errors
  async headers() {
    return [
      {
        // Match all HTML pages (not static assets)
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        // Allow long-term caching for Next.js static assets (they have content hashes)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: ['framer-motion'],
    // PDFKit loads built-in font metric files (e.g. Helvetica.afm) from its package data directory.
    // When bundled into Next server chunks, those assets can be missing, causing ENOENT at runtime.
    // Keep pdfkit as a server external so it can access its packaged data files.
    serverComponentsExternalPackages: ["pdfkit"],
  },

  // Webpack configuration for additional security
  webpack: (config, { isServer }) => {
    // Security-related webpack configurations
    if (isServer) {
      // Server-side security configurations
      config.externals = config.externals || [];
      config.externals.push('bcryptjs');
    }

    // Remove source maps in production for security
    if (process.env.NODE_ENV === 'production') {
      config.devtool = false;
    }

    return config;
  },

  // Output configuration
  // `output: 'standalone'` breaks `next start` and requires `node .next/standalone/server.js`
  // plus copying `public/` and `.next/static/` into the standalone folder.
  // Keep the default dev/prod workflow working unless explicitly enabled.
  output: process.env.NEXT_STANDALONE === 'true' ? 'standalone' : undefined,
  
  // Disable x-powered-by header
  generateEtags: false,
};

export default nextConfig;
