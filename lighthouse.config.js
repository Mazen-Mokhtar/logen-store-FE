module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:3000',
        'http://localhost:3000/en',
        'http://localhost:3000/ar',
        'http://localhost:3000/en/products',
        'http://localhost:3000/en/about',
        'http://localhost:3000/en/contact',
        'http://localhost:3000/en/track-order',
      ],
      // Number of runs per URL
      numberOfRuns: 3,
      // Chrome flags for consistent testing
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --headless',
        // Emulate mobile device
        emulatedFormFactor: 'mobile',
        // Throttling settings
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
        // Skip certain audits that might be flaky in CI
        skipAudits: [
          'canonical',
          'uses-http2',
          'uses-long-cache-ttl',
        ],
      },
    },
    assert: {
      // Performance budgets and assertions
      assertions: {
        // Core Web Vitals thresholds
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // Specific metrics
        'metrics:largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'metrics:first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'metrics:cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'metrics:total-blocking-time': ['error', { maxNumericValue: 200 }],
        'metrics:speed-index': ['error', { maxNumericValue: 3400 }],
        
        // Resource budgets
        'resource-summary:document:size': ['error', { maxNumericValue: 50000 }],
        'resource-summary:script:size': ['error', { maxNumericValue: 500000 }],
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 100000 }],
        'resource-summary:image:size': ['error', { maxNumericValue: 1000000 }],
        'resource-summary:font:size': ['error', { maxNumericValue: 200000 }],
        
        // Specific audits
        'unused-css-rules': ['warn', { maxNumericValue: 50000 }],
        'unused-javascript': ['warn', { maxNumericValue: 100000 }],
        'modern-image-formats': 'error',
        'offscreen-images': 'error',
        'render-blocking-resources': 'error',
        'unminified-css': 'error',
        'unminified-javascript': 'error',
        'efficient-animated-content': 'error',
        'uses-optimized-images': 'error',
        'uses-webp-images': 'warn',
        'uses-responsive-images': 'error',
        'dom-size': ['error', { maxNumericValue: 1500 }],
      },
    },
    upload: {
      // Store results for historical tracking
      target: 'temporary-public-storage',
      // Alternative: use filesystem storage
      // target: 'filesystem',
      // outputDir: './lighthouse-results',
    },
    server: {
      // Start server before running tests
      command: 'npm run build && npm start',
      port: 3000,
      // Wait for server to be ready
      waitForServer: {
        url: 'http://localhost:3000',
        timeout: 60000,
      },
    },
  },
  // Custom Lighthouse configuration
  extends: 'lighthouse:default',
  settings: {
    // Additional settings
    onlyAudits: [
      // Performance
      'first-contentful-paint',
      'largest-contentful-paint',
      'speed-index',
      'cumulative-layout-shift',
      'total-blocking-time',
      'max-potential-fid',
      
      // Resource optimization
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'uses-optimized-images',
      'uses-webp-images',
      'uses-responsive-images',
      'efficient-animated-content',
      'offscreen-images',
      'unminified-css',
      'unminified-javascript',
      'uses-text-compression',
      'uses-rel-preconnect',
      'uses-rel-preload',
      'font-display',
      'dom-size',
      
      // Best practices
      'uses-https',
      'uses-http2',
      'no-vulnerable-libraries',
      'image-aspect-ratio',
      'image-size-responsive',
      
      // SEO
      'document-title',
      'meta-description',
      'http-status-code',
      'link-text',
      'crawlable-anchors',
      'is-crawlable',
      'robots-txt',
      'tap-targets',
      'hreflang',
      'canonical',
      
      // Accessibility
      'color-contrast',
      'image-alt',
      'label',
      'link-name',
      'list',
      'meta-viewport',
      'heading-order',
      'duplicate-id-active',
      'duplicate-id-aria',
      'aria-allowed-attr',
      'aria-required-attr',
      'aria-valid-attr-value',
      'aria-valid-attr',
      'button-name',
      'bypass',
      'focus-traps',
      'focusable-controls',
      'interactive-element-affordance',
      'logical-tab-order',
      'managed-focus',
      'offscreen-content-hidden',
      'use-landmarks',
      'visual-order-follows-dom',
      
      // PWA
      'service-worker',
      'offline-start-url',
      'apple-touch-icon',
      'splash-screen',
      'themed-omnibox',
      'content-width',
      'viewport',
      'without-javascript',
      'maskable-icon',
    ],
  },
};