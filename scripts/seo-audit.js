#!/usr/bin/env node

/**
 * SEO Audit Script for Mar Mathew Kavukatt Website
 * 
 * This script analyzes the website for SEO best practices and provides
 * recommendations for improving search engine rankings.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running SEO Audit for Mar Mathew Kavukatt Website...\n');

// SEO audit results
const auditResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  checks: []
};

function addCheck(name, status, message, recommendation = null) {
  auditResults.checks.push({
    name,
    status,
    message,
    recommendation,
    timestamp: new Date().toISOString()
  });
  
  if (status === 'PASS') {
    auditResults.passed++;
    console.log(`✅ ${name}: ${message}`);
  } else if (status === 'FAIL') {
    auditResults.failed++;
    console.log(`❌ ${name}: ${message}`);
    if (recommendation) {
      console.log(`   💡 Recommendation: ${recommendation}`);
    }
  } else if (status === 'WARN') {
    auditResults.warnings++;
    console.log(`⚠️  ${name}: ${message}`);
    if (recommendation) {
      console.log(`   💡 Recommendation: ${recommendation}`);
    }
  }
}

// 1. Check robots.txt
function checkRobotsTxt() {
  console.log('🤖 Checking robots.txt...');
  
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  
  if (fs.existsSync(robotsPath)) {
    const content = fs.readFileSync(robotsPath, 'utf8');
    
    if (content.includes('Sitemap:')) {
      addCheck('Robots.txt Sitemap', 'PASS', 'Sitemap reference found in robots.txt');
    } else {
      addCheck('Robots.txt Sitemap', 'FAIL', 'No sitemap reference in robots.txt', 
        'Add "Sitemap: https://yourdomain.com/sitemap.xml" to robots.txt');
    }
    
    if (content.includes('Disallow: /admin/')) {
      addCheck('Robots.txt Admin Protection', 'PASS', 'Admin routes are properly disallowed');
    } else {
      addCheck('Robots.txt Admin Protection', 'WARN', 'Consider disallowing admin routes');
    }
    
    addCheck('Robots.txt File', 'PASS', 'robots.txt file exists');
  } else {
    addCheck('Robots.txt File', 'FAIL', 'robots.txt file not found', 
      'Create a robots.txt file in the public directory');
  }
}

// 2. Check sitemap
function checkSitemap() {
  console.log('\n🗺️  Checking sitemap...');
  
  const sitemapPath = path.join(process.cwd(), 'src', 'app', 'sitemap.ts');
  
  if (fs.existsSync(sitemapPath)) {
    addCheck('Sitemap Generation', 'PASS', 'Dynamic sitemap generation is implemented');
    
    const content = fs.readFileSync(sitemapPath, 'utf8');
    
    if (content.includes('changeFrequency') && content.includes('priority')) {
      addCheck('Sitemap Metadata', 'PASS', 'Sitemap includes changeFrequency and priority');
    } else {
      addCheck('Sitemap Metadata', 'WARN', 'Sitemap should include changeFrequency and priority');
    }
    
    if (content.includes('lastModified')) {
      addCheck('Sitemap LastModified', 'PASS', 'Sitemap includes lastModified dates');
    } else {
      addCheck('Sitemap LastModified', 'WARN', 'Consider adding lastModified dates to sitemap');
    }
  } else {
    addCheck('Sitemap Generation', 'FAIL', 'No sitemap generation found', 
      'Implement dynamic sitemap generation');
  }
}

// 3. Check manifest.json
function checkManifest() {
  console.log('\n📱 Checking web app manifest...');
  
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      addCheck('Manifest File', 'PASS', 'Web app manifest exists');
      
      if (manifest.name && manifest.short_name) {
        addCheck('Manifest Names', 'PASS', 'Manifest includes name and short_name');
      } else {
        addCheck('Manifest Names', 'FAIL', 'Manifest missing name or short_name');
      }
      
      if (manifest.icons && manifest.icons.length > 0) {
        addCheck('Manifest Icons', 'PASS', 'Manifest includes icons');
      } else {
        addCheck('Manifest Icons', 'FAIL', 'Manifest missing icons');
      }
      
      if (manifest.theme_color && manifest.background_color) {
        addCheck('Manifest Colors', 'PASS', 'Manifest includes theme and background colors');
      } else {
        addCheck('Manifest Colors', 'WARN', 'Consider adding theme and background colors');
      }
    } catch (error) {
      addCheck('Manifest Parsing', 'FAIL', 'Manifest.json is not valid JSON');
    }
  } else {
    addCheck('Manifest File', 'FAIL', 'Web app manifest not found', 
      'Create a manifest.json file for PWA capabilities');
  }
}

// 4. Check SEO configuration
function checkSEOConfig() {
  console.log('\n🎯 Checking SEO configuration...');
  
  const seoConfigPath = path.join(process.cwd(), 'src', 'lib', 'seo-config.ts');
  
  if (fs.existsSync(seoConfigPath)) {
    addCheck('SEO Configuration', 'PASS', 'SEO configuration file exists');
    
    const content = fs.readFileSync(seoConfigPath, 'utf8');
    
    if (content.includes('generatePageMetadata')) {
      addCheck('SEO Metadata Generation', 'PASS', 'Page metadata generation is implemented');
    } else {
      addCheck('SEO Metadata Generation', 'WARN', 'Consider implementing page metadata generation');
    }
    
    if (content.includes('structuredData') || content.includes('JSON-LD')) {
      addCheck('Structured Data', 'PASS', 'Structured data implementation found');
    } else {
      addCheck('Structured Data', 'WARN', 'Consider implementing structured data (JSON-LD)');
    }
    
    if (content.includes('keywords')) {
      addCheck('SEO Keywords', 'PASS', 'SEO keywords configuration found');
    } else {
      addCheck('SEO Keywords', 'WARN', 'Consider adding SEO keywords configuration');
    }
  } else {
    addCheck('SEO Configuration', 'FAIL', 'SEO configuration file not found', 
      'Create a comprehensive SEO configuration file');
  }
}

// 5. Check page metadata
function checkPageMetadata() {
  console.log('\n📄 Checking page metadata...');
  
  const pagesDir = path.join(process.cwd(), 'src', 'app', '(site)');
  
  if (fs.existsSync(pagesDir)) {
    const pages = ['page.tsx', 'about/page.tsx', 'announcements/page.tsx', 'gallery/page.tsx'];
    
    pages.forEach(pagePath => {
      const fullPath = path.join(pagesDir, pagePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        if (content.includes('export const metadata') || content.includes('generatePageMetadata')) {
          addCheck(`Metadata - ${pagePath}`, 'PASS', `Page metadata is configured for ${pagePath}`);
        } else {
          addCheck(`Metadata - ${pagePath}`, 'FAIL', `No metadata found for ${pagePath}`, 
            'Add proper metadata to improve SEO');
        }
      }
    });
  }
}

// 6. Check images optimization
function checkImageOptimization() {
  console.log('\n🖼️  Checking image optimization...');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
  
  if (fs.existsSync(nextConfigPath)) {
    const content = fs.readFileSync(nextConfigPath, 'utf8');
    
    if (content.includes('images:')) {
      addCheck('Next.js Image Config', 'PASS', 'Next.js image configuration found');
      
      if (content.includes('formats:') && content.includes('webp')) {
        addCheck('Image Formats', 'PASS', 'Modern image formats (WebP) are configured');
      } else {
        addCheck('Image Formats', 'WARN', 'Consider enabling modern image formats (WebP, AVIF)');
      }
      
      if (content.includes('deviceSizes') && content.includes('imageSizes')) {
        addCheck('Responsive Images', 'PASS', 'Responsive image sizes are configured');
      } else {
        addCheck('Responsive Images', 'WARN', 'Consider configuring responsive image sizes');
      }
    } else {
      addCheck('Next.js Image Config', 'WARN', 'Consider configuring Next.js image optimization');
    }
  }
}

// 7. Check performance optimizations
function checkPerformanceOptimizations() {
  console.log('\n⚡ Checking performance optimizations...');
  
  const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
  
  if (fs.existsSync(layoutPath)) {
    const content = fs.readFileSync(layoutPath, 'utf8');
    
    if (content.includes('preconnect')) {
      addCheck('DNS Preconnect', 'PASS', 'DNS preconnect is implemented');
    } else {
      addCheck('DNS Preconnect', 'WARN', 'Consider adding DNS preconnect for external resources');
    }
    
    if (content.includes('display: "swap"')) {
      addCheck('Font Display Swap', 'PASS', 'Font display swap is configured');
    } else {
      addCheck('Font Display Swap', 'WARN', 'Consider using font-display: swap for better performance');
    }
  }
  
  // Check for compression
  const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
  if (fs.existsSync(nextConfigPath)) {
    const content = fs.readFileSync(nextConfigPath, 'utf8');
    
    if (content.includes('compress: true')) {
      addCheck('Compression', 'PASS', 'Gzip compression is enabled');
    } else {
      addCheck('Compression', 'WARN', 'Consider enabling gzip compression');
    }
  }
}

// 8. Check RSS feed
function checkRSSFeed() {
  console.log('\n📡 Checking RSS feed...');
  
  const rssPath = path.join(process.cwd(), 'src', 'app', 'rss.xml', 'route.ts');
  
  if (fs.existsSync(rssPath)) {
    addCheck('RSS Feed', 'PASS', 'RSS feed is implemented');
    
    const content = fs.readFileSync(rssPath, 'utf8');
    
    if (content.includes('Cache-Control')) {
      addCheck('RSS Caching', 'PASS', 'RSS feed includes proper caching headers');
    } else {
      addCheck('RSS Caching', 'WARN', 'Consider adding caching headers to RSS feed');
    }
  } else {
    addCheck('RSS Feed', 'WARN', 'Consider implementing an RSS feed for announcements');
  }
}

// 9. Check social media integration
function checkSocialMediaIntegration() {
  console.log('\n📱 Checking social media integration...');
  
  const seoConfigPath = path.join(process.cwd(), 'src', 'lib', 'seo-config.ts');
  
  if (fs.existsSync(seoConfigPath)) {
    const content = fs.readFileSync(seoConfigPath, 'utf8');
    
    if (content.includes('openGraph')) {
      addCheck('Open Graph', 'PASS', 'Open Graph metadata is configured');
    } else {
      addCheck('Open Graph', 'FAIL', 'Open Graph metadata not found', 
        'Add Open Graph tags for better social media sharing');
    }
    
    if (content.includes('twitter')) {
      addCheck('Twitter Cards', 'PASS', 'Twitter Card metadata is configured');
    } else {
      addCheck('Twitter Cards', 'FAIL', 'Twitter Card metadata not found', 
        'Add Twitter Card tags for better Twitter sharing');
    }
  }
}

// 10. Generate SEO report
function generateSEOReport() {
  console.log('\n📊 Generating SEO report...');
  
  const report = {
    summary: {
      totalChecks: auditResults.checks.length,
      passed: auditResults.passed,
      failed: auditResults.failed,
      warnings: auditResults.warnings,
      seoScore: Math.round((auditResults.passed / auditResults.checks.length) * 100),
      timestamp: new Date().toISOString()
    },
    results: auditResults.checks,
    recommendations: generateRecommendations(),
    nextSteps: generateNextSteps()
  };
  
  const reportPath = path.join(process.cwd(), 'seo-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate human-readable report
  const readableReport = generateReadableReport(report);
  const readableReportPath = path.join(process.cwd(), 'SEO-AUDIT-REPORT.md');
  fs.writeFileSync(readableReportPath, readableReport);
  
  addCheck('SEO Report', 'PASS', 'SEO audit report generated');
  
  return report;
}

function generateRecommendations() {
  const recommendations = [];
  
  if (auditResults.failed > 0) {
    recommendations.push('Address all failed SEO checks to improve search engine rankings');
  }
  
  if (auditResults.warnings > 3) {
    recommendations.push('Review and implement warning recommendations for better SEO performance');
  }
  
  recommendations.push('Regularly monitor website performance using Google Search Console');
  recommendations.push('Submit sitemap to Google Search Console and Bing Webmaster Tools');
  recommendations.push('Monitor Core Web Vitals and page loading speed');
  recommendations.push('Regularly update content and maintain fresh, relevant information');
  recommendations.push('Build quality backlinks from relevant websites');
  recommendations.push('Optimize for local SEO if applicable');
  
  return recommendations;
}

function generateNextSteps() {
  const nextSteps = [];
  
  if (auditResults.failed > 0) {
    nextSteps.push('Fix all failed SEO checks');
  }
  
  nextSteps.push('Set up Google Search Console and Bing Webmaster Tools');
  nextSteps.push('Submit sitemap to search engines');
  nextSteps.push('Set up Google Analytics for traffic monitoring');
  nextSteps.push('Configure social media sharing optimization');
  nextSteps.push('Implement schema markup for rich snippets');
  nextSteps.push('Optimize page loading speed');
  nextSteps.push('Create high-quality, SEO-optimized content');
  nextSteps.push('Build a content marketing strategy');
  
  return nextSteps;
}

function generateReadableReport(report) {
  return `# SEO Audit Report - Mar Mathew Kavukatt Website

## Summary
- **Total Checks**: ${report.summary.totalChecks}
- **Passed**: ${report.summary.passed} ✅
- **Failed**: ${report.summary.failed} ❌
- **Warnings**: ${report.summary.warnings} ⚠️
- **SEO Score**: ${report.summary.seoScore}%
- **Generated**: ${report.summary.timestamp}

## Audit Results

${report.results.map(check => {
  const icon = check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : '⚠️';
  return `### ${icon} ${check.name}
**Status**: ${check.status}
**Message**: ${check.message}
${check.recommendation ? `**Recommendation**: ${check.recommendation}` : ''}
`;
}).join('\n')}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps

${report.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## SEO Checklist for Production

### Technical SEO
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Set up Google Analytics
- [ ] Configure Google Search Console
- [ ] Verify website ownership
- [ ] Set up 301 redirects for old URLs
- [ ] Implement HTTPS (SSL certificate)
- [ ] Optimize page loading speed
- [ ] Fix any crawl errors

### Content SEO
- [ ] Optimize page titles and meta descriptions
- [ ] Add alt text to all images
- [ ] Create high-quality, original content
- [ ] Implement internal linking strategy
- [ ] Optimize for target keywords
- [ ] Create location-based content (if applicable)
- [ ] Add FAQ sections
- [ ] Create blog/news section

### Local SEO (if applicable)
- [ ] Create Google My Business listing
- [ ] Add local schema markup
- [ ] Optimize for local keywords
- [ ] Get listed in local directories
- [ ] Encourage customer reviews

### Social Media SEO
- [ ] Optimize social media profiles
- [ ] Share content regularly
- [ ] Encourage social sharing
- [ ] Add social media links to website

---
*Generated by SEO Audit Script v1.0*
`;
}

// Main execution
async function main() {
  try {
    checkRobotsTxt();
    checkSitemap();
    checkManifest();
    checkSEOConfig();
    checkPageMetadata();
    checkImageOptimization();
    checkPerformanceOptimizations();
    checkRSSFeed();
    checkSocialMediaIntegration();
    
    const report = generateSEOReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 SEO AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Checks: ${report.summary.totalChecks}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`🎯 SEO Score: ${report.summary.seoScore}%`);
    
    if (report.summary.seoScore >= 80) {
      console.log('\n🎉 Excellent SEO implementation!');
    } else if (report.summary.seoScore >= 60) {
      console.log('\n👍 Good SEO foundation, some improvements needed');
    } else {
      console.log('\n⚠️  SEO needs significant improvements');
    }
    
    console.log('\n📊 Reports generated:');
    console.log('   - seo-audit-report.json (machine-readable)');
    console.log('   - SEO-AUDIT-REPORT.md (human-readable)');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Review the detailed report');
    console.log('2. Fix any failed checks');
    console.log('3. Set up Google Search Console');
    console.log('4. Submit sitemap to search engines');
    console.log('5. Monitor performance regularly');
    
    process.exit(report.summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ SEO audit failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  checkRobotsTxt,
  checkSitemap,
  checkManifest,
  checkSEOConfig,
  generateSEOReport
};