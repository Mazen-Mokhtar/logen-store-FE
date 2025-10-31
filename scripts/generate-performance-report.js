#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceReporter {
  constructor() {
    this.reportDir = path.join(process.cwd(), 'performance-reports');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.reportFile = path.join(this.reportDir, `performance-report-${this.timestamp}.json`);
    this.htmlReportFile = path.join(this.reportDir, `performance-report-${this.timestamp}.html`);
  }

  async generateReport() {
    console.log('📊 Generating comprehensive performance report...\n');

    // Ensure report directory exists
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      version: this.getPackageVersion(),
      environment: this.getEnvironmentInfo(),
      lighthouse: await this.getLighthouseResults(),
      bundleAnalysis: await this.getBundleAnalysis(),
      coreWebVitals: await this.getCoreWebVitals(),
      recommendations: this.generateRecommendations()
    };

    // Save JSON report
    fs.writeFileSync(this.reportFile, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    await this.generateHtmlReport(report);

    console.log(`✅ Performance report generated:`);
    console.log(`   JSON: ${this.reportFile}`);
    console.log(`   HTML: ${this.htmlReportFile}`);

    return report;
  }

  getPackageVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return packageJson.version || '1.0.0';
    } catch (error) {
      return '1.0.0';
    }
  }

  getEnvironmentInfo() {
    return {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      timestamp: new Date().toISOString()
    };
  }

  async getLighthouseResults() {
    const lighthouseDir = path.join(process.cwd(), '.lighthouseci');
    
    if (!fs.existsSync(lighthouseDir)) {
      console.log('⚠️  No Lighthouse results found. Run "npm run lighthouse" first.');
      return null;
    }

    try {
      const manifestPath = path.join(lighthouseDir, 'manifest.json');
      if (!fs.existsSync(manifestPath)) {
        return null;
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const results = [];

      manifest.forEach(result => {
        if (fs.existsSync(result.jsonPath)) {
          const report = JSON.parse(fs.readFileSync(result.jsonPath, 'utf8'));
          results.push({
            url: result.url,
            scores: {
              performance: Math.round(report.categories.performance.score * 100),
              accessibility: Math.round(report.categories.accessibility.score * 100),
              bestPractices: Math.round(report.categories['best-practices'].score * 100),
              seo: Math.round(report.categories.seo.score * 100),
              pwa: Math.round(report.categories.pwa.score * 100)
            },
            metrics: {
              lcp: Math.round(report.audits['largest-contentful-paint'].numericValue),
              fcp: Math.round(report.audits['first-contentful-paint'].numericValue),
              cls: report.audits['cumulative-layout-shift'].numericValue,
              tbt: Math.round(report.audits['total-blocking-time'].numericValue),
              si: Math.round(report.audits['speed-index'].numericValue),
              tti: Math.round(report.audits['interactive'].numericValue)
            },
            opportunities: report.audits['unused-javascript'] ? {
              unusedJavaScript: Math.round(report.audits['unused-javascript'].numericValue / 1024),
              unusedCSS: report.audits['unused-css-rules'] ? Math.round(report.audits['unused-css-rules'].numericValue / 1024) : 0,
              imageOptimization: report.audits['uses-optimized-images'] ? Math.round(report.audits['uses-optimized-images'].numericValue / 1024) : 0
            } : {}
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Error reading Lighthouse results:', error.message);
      return null;
    }
  }

  async getBundleAnalysis() {
    const buildDir = path.join(process.cwd(), '.next');
    
    if (!fs.existsSync(buildDir)) {
      console.log('⚠️  No build found. Run "npm run build" first.');
      return null;
    }

    try {
      const staticDir = path.join(buildDir, 'static');
      const analysis = {
        totalSize: 0,
        jsSize: 0,
        cssSize: 0,
        chunks: [],
        assets: []
      };

      if (fs.existsSync(staticDir)) {
        // Analyze JavaScript files
        const jsFiles = this.findFiles(staticDir, '.js');
        jsFiles.forEach(file => {
          const stats = fs.statSync(file);
          const size = stats.size;
          analysis.jsSize += size;
          analysis.totalSize += size;
          
          analysis.chunks.push({
            name: path.relative(buildDir, file),
            size: Math.round(size / 1024),
            type: 'javascript'
          });
        });

        // Analyze CSS files
        const cssFiles = this.findFiles(staticDir, '.css');
        cssFiles.forEach(file => {
          const stats = fs.statSync(file);
          const size = stats.size;
          analysis.cssSize += size;
          analysis.totalSize += size;
          
          analysis.assets.push({
            name: path.relative(buildDir, file),
            size: Math.round(size / 1024),
            type: 'stylesheet'
          });
        });
      }

      // Convert to KB
      analysis.totalSize = Math.round(analysis.totalSize / 1024);
      analysis.jsSize = Math.round(analysis.jsSize / 1024);
      analysis.cssSize = Math.round(analysis.cssSize / 1024);

      return analysis;
    } catch (error) {
      console.error('Error analyzing bundle:', error.message);
      return null;
    }
  }

  async getCoreWebVitals() {
    // This would typically come from real user monitoring (RUM) data
    // For now, we'll use the Lighthouse data as a proxy
    const lighthouse = await this.getLighthouseResults();
    
    if (!lighthouse || lighthouse.length === 0) {
      return null;
    }

    const vitals = lighthouse.map(result => ({
      url: result.url,
      lcp: {
        value: result.metrics.lcp,
        rating: result.metrics.lcp <= 2500 ? 'good' : result.metrics.lcp <= 4000 ? 'needs-improvement' : 'poor'
      },
      fid: {
        value: 0, // FID not available in Lighthouse, would come from RUM
        rating: 'unknown'
      },
      cls: {
        value: result.metrics.cls,
        rating: result.metrics.cls <= 0.1 ? 'good' : result.metrics.cls <= 0.25 ? 'needs-improvement' : 'poor'
      },
      fcp: {
        value: result.metrics.fcp,
        rating: result.metrics.fcp <= 1800 ? 'good' : result.metrics.fcp <= 3000 ? 'needs-improvement' : 'poor'
      },
      ttfb: {
        value: 0, // Would come from RUM data
        rating: 'unknown'
      }
    }));

    return vitals;
  }

  generateRecommendations() {
    const recommendations = [];

    // Add general recommendations
    recommendations.push({
      category: 'Performance',
      priority: 'high',
      title: 'Implement Code Splitting',
      description: 'Use dynamic imports to split your JavaScript bundles and reduce initial load time.',
      impact: 'High - Can reduce initial bundle size by 30-50%'
    });

    recommendations.push({
      category: 'Performance',
      priority: 'high',
      title: 'Optimize Images',
      description: 'Use next/image component and modern image formats (WebP, AVIF) for better compression.',
      impact: 'High - Can reduce image payload by 50-80%'
    });

    recommendations.push({
      category: 'Performance',
      priority: 'medium',
      title: 'Enable Compression',
      description: 'Configure gzip or brotli compression for static assets.',
      impact: 'Medium - Can reduce transfer size by 60-70%'
    });

    recommendations.push({
      category: 'Monitoring',
      priority: 'medium',
      title: 'Set up Real User Monitoring',
      description: 'Implement RUM to collect real Core Web Vitals data from users.',
      impact: 'Medium - Provides accurate performance insights'
    });

    recommendations.push({
      category: 'SEO',
      priority: 'low',
      title: 'Improve Accessibility',
      description: 'Add alt text to images, improve color contrast, and ensure keyboard navigation.',
      impact: 'Low - Improves user experience and SEO rankings'
    });

    return recommendations;
  }

  async generateHtmlReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Report - ${report.timestamp}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #667eea; }
        .metric-label { color: #666; margin-top: 5px; }
        .score-good { color: #28a745; }
        .score-warning { color: #ffc107; }
        .score-poor { color: #dc3545; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .table th { background: #f8f9fa; font-weight: 600; }
        .recommendations { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .recommendation { margin: 15px 0; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #2196f3; }
        .priority-high { border-left-color: #f44336; }
        .priority-medium { border-left-color: #ff9800; }
        .priority-low { border-left-color: #4caf50; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Report</h1>
            <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
            <p>Version: ${report.version} | Environment: ${report.environment.platform}</p>
        </div>
        
        <div class="content">
            ${report.lighthouse ? this.generateLighthouseSection(report.lighthouse) : ''}
            ${report.bundleAnalysis ? this.generateBundleSection(report.bundleAnalysis) : ''}
            ${report.coreWebVitals ? this.generateWebVitalsSection(report.coreWebVitals) : ''}
            ${this.generateRecommendationsSection(report.recommendations)}
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(this.htmlReportFile, html);
  }

  generateLighthouseSection(lighthouse) {
    const avgScores = this.calculateAverageScores(lighthouse);
    
    return `
        <div class="section">
            <h2>🚦 Lighthouse Scores</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value ${this.getScoreClass(avgScores.performance)}">${avgScores.performance}</div>
                    <div class="metric-label">Performance</div>
                </div>
                <div class="metric">
                    <div class="metric-value ${this.getScoreClass(avgScores.accessibility)}">${avgScores.accessibility}</div>
                    <div class="metric-label">Accessibility</div>
                </div>
                <div class="metric">
                    <div class="metric-value ${this.getScoreClass(avgScores.bestPractices)}">${avgScores.bestPractices}</div>
                    <div class="metric-label">Best Practices</div>
                </div>
                <div class="metric">
                    <div class="metric-value ${this.getScoreClass(avgScores.seo)}">${avgScores.seo}</div>
                    <div class="metric-label">SEO</div>
                </div>
            </div>
        </div>`;
  }

  generateBundleSection(bundle) {
    return `
        <div class="section">
            <h2>📦 Bundle Analysis</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">${bundle.totalSize}KB</div>
                    <div class="metric-label">Total Size</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${bundle.jsSize}KB</div>
                    <div class="metric-label">JavaScript</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${bundle.cssSize}KB</div>
                    <div class="metric-label">CSS</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${bundle.chunks.length}</div>
                    <div class="metric-label">Chunks</div>
                </div>
            </div>
        </div>`;
  }

  generateWebVitalsSection(vitals) {
    const avgVitals = this.calculateAverageVitals(vitals);
    
    return `
        <div class="section">
            <h2>📊 Core Web Vitals</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value ${this.getVitalClass(avgVitals.lcp.rating)}">${avgVitals.lcp.value}ms</div>
                    <div class="metric-label">LCP</div>
                </div>
                <div class="metric">
                    <div class="metric-value ${this.getVitalClass(avgVitals.cls.rating)}">${avgVitals.cls.value}</div>
                    <div class="metric-label">CLS</div>
                </div>
                <div class="metric">
                    <div class="metric-value ${this.getVitalClass(avgVitals.fcp.rating)}">${avgVitals.fcp.value}ms</div>
                    <div class="metric-label">FCP</div>
                </div>
            </div>
        </div>`;
  }

  generateRecommendationsSection(recommendations) {
    const recHtml = recommendations.map(rec => `
        <div class="recommendation priority-${rec.priority}">
            <h4>${rec.title}</h4>
            <p><strong>Category:</strong> ${rec.category} | <strong>Priority:</strong> ${rec.priority.toUpperCase()}</p>
            <p>${rec.description}</p>
            <p><strong>Impact:</strong> ${rec.impact}</p>
        </div>
    `).join('');

    return `
        <div class="section">
            <h2>💡 Recommendations</h2>
            <div class="recommendations">
                ${recHtml}
            </div>
        </div>`;
  }

  calculateAverageScores(lighthouse) {
    const totals = lighthouse.reduce((acc, result) => {
      acc.performance += result.scores.performance;
      acc.accessibility += result.scores.accessibility;
      acc.bestPractices += result.scores.bestPractices;
      acc.seo += result.scores.seo;
      return acc;
    }, { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 });

    const count = lighthouse.length;
    return {
      performance: Math.round(totals.performance / count),
      accessibility: Math.round(totals.accessibility / count),
      bestPractices: Math.round(totals.bestPractices / count),
      seo: Math.round(totals.seo / count)
    };
  }

  calculateAverageVitals(vitals) {
    const totals = vitals.reduce((acc, result) => {
      acc.lcp += result.lcp.value;
      acc.cls += result.cls.value;
      acc.fcp += result.fcp.value;
      return acc;
    }, { lcp: 0, cls: 0, fcp: 0 });

    const count = vitals.length;
    return {
      lcp: { value: Math.round(totals.lcp / count), rating: 'good' },
      cls: { value: (totals.cls / count).toFixed(3), rating: 'good' },
      fcp: { value: Math.round(totals.fcp / count), rating: 'good' }
    };
  }

  getScoreClass(score) {
    if (score >= 90) return 'score-good';
    if (score >= 50) return 'score-warning';
    return 'score-poor';
  }

  getVitalClass(rating) {
    if (rating === 'good') return 'score-good';
    if (rating === 'needs-improvement') return 'score-warning';
    return 'score-poor';
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
}

// Run the reporter
const reporter = new PerformanceReporter();
reporter.generateReport().catch(error => {
  console.error('❌ Performance report generation failed:', error);
  process.exit(1);
});