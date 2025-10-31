#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Performance budgets in bytes
const BUDGETS = {
  // JavaScript bundles
  'pages/_app.js': 250 * 1024, // 250KB
  'pages/index.js': 100 * 1024, // 100KB
  'chunks/main.js': 200 * 1024, // 200KB
  'chunks/webpack.js': 50 * 1024, // 50KB
  'chunks/framework.js': 150 * 1024, // 150KB
  
  // CSS bundles
  'static/css': 100 * 1024, // 100KB total CSS
  
  // Total JavaScript
  'total-js': 500 * 1024, // 500KB total JS
  
  // Total assets
  'total-assets': 2 * 1024 * 1024, // 2MB total
};

// Thresholds for warnings and errors
const WARNING_THRESHOLD = 0.8; // 80% of budget
const ERROR_THRESHOLD = 1.0; // 100% of budget

class BundleAnalyzer {
  constructor() {
    this.buildDir = path.join(process.cwd(), '.next');
    this.results = {
      passed: [],
      warnings: [],
      errors: [],
      totalSize: 0,
      totalJsSize: 0,
      totalCssSize: 0
    };
  }

  async analyze() {
    console.log('🔍 Analyzing bundle sizes...\n');

    if (!fs.existsSync(this.buildDir)) {
      console.error('❌ Build directory not found. Please run "npm run build" first.');
      process.exit(1);
    }

    // Analyze JavaScript bundles
    await this.analyzeJavaScript();
    
    // Analyze CSS bundles
    await this.analyzeCss();
    
    // Generate report
    this.generateReport();
    
    // Exit with appropriate code
    if (this.results.errors.length > 0) {
      console.log('\n❌ Bundle size check failed!');
      process.exit(1);
    } else if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Bundle size check passed with warnings.');
      process.exit(0);
    } else {
      console.log('\n✅ All bundle sizes within budget!');
      process.exit(0);
    }
  }

  analyzeJavaScript() {
    const staticDir = path.join(this.buildDir, 'static');
    
    if (!fs.existsSync(staticDir)) {
      console.warn('⚠️  Static directory not found');
      return;
    }

    // Find all JavaScript files
    const jsFiles = this.findFiles(staticDir, '.js');
    let totalJsSize = 0;

    jsFiles.forEach(file => {
      const stats = fs.statSync(file);
      const size = stats.size;
      const relativePath = path.relative(this.buildDir, file);
      
      totalJsSize += size;
      this.checkBudget(relativePath, size);
    });

    this.results.totalJsSize = totalJsSize;
    this.checkBudget('total-js', totalJsSize);
  }

  analyzeCss() {
    const staticDir = path.join(this.buildDir, 'static');
    
    if (!fs.existsSync(staticDir)) {
      return;
    }

    // Find all CSS files
    const cssFiles = this.findFiles(staticDir, '.css');
    let totalCssSize = 0;

    cssFiles.forEach(file => {
      const stats = fs.statSync(file);
      const size = stats.size;
      totalCssSize += size;
    });

    this.results.totalCssSize = totalCssSize;
    this.checkBudget('static/css', totalCssSize);
  }

  findFiles(dir, extension) {
    let files = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        files = files.concat(this.findFiles(fullPath, extension));
      } else if (path.extname(item) === extension) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  checkBudget(bundleName, size) {
    // Find matching budget
    let budget = null;
    let budgetKey = null;

    for (const [key, value] of Object.entries(BUDGETS)) {
      if (bundleName.includes(key) || bundleName === key) {
        budget = value;
        budgetKey = key;
        break;
      }
    }

    if (!budget) {
      return; // No budget defined for this bundle
    }

    const percentage = size / budget;
    const sizeKB = Math.round(size / 1024);
    const budgetKB = Math.round(budget / 1024);

    const result = {
      bundle: bundleName,
      size: sizeKB,
      budget: budgetKB,
      percentage: Math.round(percentage * 100),
      budgetKey
    };

    if (percentage >= ERROR_THRESHOLD) {
      this.results.errors.push(result);
    } else if (percentage >= WARNING_THRESHOLD) {
      this.results.warnings.push(result);
    } else {
      this.results.passed.push(result);
    }
  }

  generateReport() {
    console.log('📊 Bundle Size Report');
    console.log('='.repeat(50));

    // Summary
    console.log(`\n📈 Summary:`);
    console.log(`   Total JavaScript: ${Math.round(this.results.totalJsSize / 1024)}KB`);
    console.log(`   Total CSS: ${Math.round(this.results.totalCssSize / 1024)}KB`);
    console.log(`   Total Assets: ${Math.round((this.results.totalJsSize + this.results.totalCssSize) / 1024)}KB`);

    // Errors
    if (this.results.errors.length > 0) {
      console.log(`\n❌ Budget Exceeded (${this.results.errors.length}):`);
      this.results.errors.forEach(result => {
        console.log(`   ${result.bundle}: ${result.size}KB / ${result.budget}KB (${result.percentage}%)`);
      });
    }

    // Warnings
    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️  Near Budget Limit (${this.results.warnings.length}):`);
      this.results.warnings.forEach(result => {
        console.log(`   ${result.bundle}: ${result.size}KB / ${result.budget}KB (${result.percentage}%)`);
      });
    }

    // Passed
    if (this.results.passed.length > 0) {
      console.log(`\n✅ Within Budget (${this.results.passed.length}):`);
      this.results.passed.forEach(result => {
        console.log(`   ${result.bundle}: ${result.size}KB / ${result.budget}KB (${result.percentage}%)`);
      });
    }

    // Recommendations
    if (this.results.errors.length > 0 || this.results.warnings.length > 0) {
      console.log(`\n💡 Recommendations:`);
      console.log(`   • Enable tree shaking and dead code elimination`);
      console.log(`   • Use dynamic imports for code splitting`);
      console.log(`   • Optimize images and use next/image`);
      console.log(`   • Remove unused dependencies`);
      console.log(`   • Use bundle analyzer: npm run analyze`);
    }
  }
}

// Run the analyzer
const analyzer = new BundleAnalyzer();
analyzer.analyze().catch(error => {
  console.error('❌ Bundle analysis failed:', error);
  process.exit(1);
});