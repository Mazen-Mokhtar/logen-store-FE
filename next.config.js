const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion', '@tanstack/react-query'],
    serverComponentsExternalPackages: ['sharp'],
    webVitalsAttribution: ['CLS', 'LCP'],
    gzipSize: true,
    // Add performance optimizations
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Optimize font loading
    fontLoaders: [
      { loader: '@next/font/google', options: { subsets: ['latin', 'arabic'] } },
    ],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fra.cloud.appwrite.io',
        port: '',
        pathname: '/v1/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.mobilaty.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.joyroom.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.ijoyroom.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Add domains for backward compatibility
    domains: ['fra.cloud.appwrite.io'],
    loader: 'default',
    unoptimized: false,
  },

  // Compression and caching
  compress: true,
  poweredByHeader: false,

  // Static optimization
  trailingSlash: false,

  // Webpack optimizations
  webpack: (config, { dev, isServer, webpack }) => {
    // Ensure Node core modules aren't polyfilled on the server
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Production optimizations
    // Important: only apply client-side chunk splitting to avoid creating
    // server vendor chunks that may evaluate browser-only code (e.g., referencing 'self').
    if (!dev && !isServer) {
      // Enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Minimize CSS
      config.optimization.minimizer = config.optimization.minimizer || [];
      
      // Advanced chunk splitting for enterprise-grade performance
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          // React core libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react-vendor',
            chunks: 'all',
            priority: 30,
            enforce: true,
          },
          
          // Animation libraries (heavy)
          animations: {
            test: /[\\/]node_modules[\\/](framer-motion|gsap)[\\/]/,
            name: 'animations-vendor',
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          
          // Data fetching libraries
          dataFetching: {
            test: /[\\/]node_modules[\\/](@tanstack[\\/]react-query|swr)[\\/]/,
            name: 'data-vendor',
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          
          // UI component libraries
          ui: {
            test: /[\\/]node_modules[\\/](@headlessui|@heroicons|lucide-react|react-intersection-observer)[\\/]/,
            name: 'ui-vendor',
            chunks: 'all',
            priority: 20,
          },
          
          // Utility libraries
          utils: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|clsx|tailwind-merge|uuid)[\\/]/,
            name: 'utils-vendor',
            chunks: 'all',
            priority: 15,
          },
          
          // Internationalization
          i18n: {
            test: /[\\/]node_modules[\\/](next-intl)[\\/]/,
            name: 'i18n-vendor',
            chunks: 'all',
            priority: 15,
          },
          
          // State management
          state: {
            test: /[\\/]node_modules[\\/](zustand)[\\/]/,
            name: 'state-vendor',
            chunks: 'all',
            priority: 15,
          },
          
          // Common vendor chunk for remaining node_modules
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            minChunks: 2,
          },
          
          // Common application code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          
          // Page-specific chunks
          pages: {
            test: /[\\/](app|pages)[\\/]/,
            name: 'pages',
            chunks: 'all',
            priority: 8,
            minChunks: 2,
          },
          
          // Component chunks
          components: {
            test: /[\\/]components[\\/]/,
            name: 'components',
            chunks: 'all',
            priority: 7,
            minChunks: 2,
          },
          
          // Hooks and utilities
          hooks: {
            test: /[\\/](hooks|lib|utils)[\\/]/,
            name: 'hooks-utils',
            chunks: 'all',
            priority: 6,
            minChunks: 2,
          },
        },
      };
      
      // Runtime chunk optimization
      config.optimization.runtimeChunk = {
        name: 'runtime',
      };
      
      // Module concatenation for better tree shaking
      config.optimization.concatenateModules = true;
      
      // Optimize module IDs for better caching
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
    }

    // Development optimizations
    if (dev) {
      // Faster builds in development
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;
    }

    // Bundle analyzer (optional)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
        })
      );
    }

    // Performance monitoring plugin
    if (!dev && !isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.BUNDLE_ANALYZE': JSON.stringify(process.env.ANALYZE === 'true'),
        })
      );
    }

    return config;
  },

  // Custom headers for caching and compression
  async headers() {
    return [
      // Static assets caching
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // Font files
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      // CSS and JS chunks
      {
        source: '/_next/static/chunks/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Images from API
      {
        source: '/mvp-images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vary',
            value: 'Accept',
          },
        ],
      },
      {
        source: '/api/image/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vary',
            value: 'Accept',
          },
        ],
      },
      // PWA files
      {
        source: '/(favicon\\.ico|manifest\\.json|robots\\.txt|sitemap\\.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      // Security headers
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/products',
        destination: '/collections',
        permanent: true,
      },
    ];
  },

  // Rewrites for API optimization
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health',
      },
    ];
  },
};

module.exports = nextConfig;
