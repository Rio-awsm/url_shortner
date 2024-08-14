import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { parse } from 'url';
import { performance } from 'perf_hooks';

const router = express.Router();

const MAX_SCORE = 100;

const getScoreColor = (score, max) => {
  const percentage = (score / max) * 100;
  if (percentage >= 80) return 'green';
  if (percentage >= 60) return 'yellow';
  return 'red';
};

router.post('/check', async (req, res) => {
  try {
    const { url } = req.body;
    const startTime = performance.now();
    const response = await axios.get(url);
    const loadTime = performance.now() - startTime;
    const $ = cheerio.load(response.data);
    const parsedUrl = parse(url);

    let score = 0;
    let details = {};

    // 1. Title
    const title = $('title').text().trim();
    details.title = {
      content: title,
      length: title.length,
      score: 0,
      maxScore: 10,
      recommendations: []
    };
    if (title) {
      details.title.score = Math.min(10, Math.max(0, 10 - Math.abs(55 - title.length) / 3));
      if (title.length < 30 || title.length > 60) {
        details.title.recommendations.push('Adjust title length to be between 30-60 characters for optimal SEO.');
      }
    } else {
      details.title.recommendations.push('Add a title tag to your page.');
    }
    score += details.title.score;

    // 2. Meta Description
    const description = $('meta[name="description"]').attr('content');
    details.description = {
      content: description,
      length: description ? description.length : 0,
      score: 0,
      maxScore: 10,
      recommendations: []
    };
    if (description) {
      details.description.score = Math.min(10, Math.max(0, 10 - Math.abs(150 - description.length) / 7));
      if (description.length < 120 || description.length > 160) {
        details.description.recommendations.push('Adjust meta description length to be between 120-160 characters.');
      }
    } else {
      details.description.recommendations.push('Add a meta description to your page.');
    }
    score += details.description.score;

    // 3. Headers (H1, H2, H3)
    details.headers = {};
    ['h1', 'h2', 'h3'].forEach(tag => {
      const headers = $(tag);
      details.headers[tag] = {
        count: headers.length,
        content: headers.map((i, el) => $(el).text().trim()).get(),
        score: 0,
        maxScore: tag === 'h1' ? 10 : 5,
        recommendations: []
      };
      if (tag === 'h1') {
        details.headers[tag].score = headers.length === 1 ? 10 : (headers.length === 0 ? 0 : 5);
        if (headers.length !== 1) {
          details.headers[tag].recommendations.push('Use exactly one H1 tag on your page.');
        }
      } else {
        details.headers[tag].score = Math.min(5, headers.length);
        if (headers.length === 0) {
          details.headers[tag].recommendations.push(`Consider using ${tag} tags for better content structure.`);
        }
      }
      score += details.headers[tag].score;
    });

    // 4. Image optimization
    const images = $('img');
    details.images = {
      total: images.length,
      withAlt: 0,
      withLazyLoading: 0,
      score: 0,
      maxScore: 10,
      recommendations: []
    };
    images.each((i, img) => {
      if ($(img).attr('alt')) details.images.withAlt++;
      if ($(img).attr('loading') === 'lazy') details.images.withLazyLoading++;
    });
    details.images.score = Math.min(10, 
      ((details.images.withAlt / details.images.total) * 5) + 
      ((details.images.withLazyLoading / details.images.total) * 5) || 0
    );
    if (details.images.withAlt < details.images.total) {
      details.images.recommendations.push('Add alt text to all images for better accessibility and SEO.');
    }
    if (details.images.withLazyLoading < details.images.total) {
      details.images.recommendations.push('Implement lazy loading for images to improve page load speed.');
    }
    score += details.images.score;

    // 5. Internal and External Links
    details.links = {
      internal: 0,
      external: 0,
      score: 0,
      maxScore: 10,
      recommendations: []
    };
    $('a').each((i, link) => {
      const href = $(link).attr('href');
      if (href && !href.startsWith('#')) {
        if (href.includes(parsedUrl.hostname)) details.links.internal++;
        else details.links.external++;
      }
    });
    details.links.score = Math.min(10, (details.links.internal * 0.5) + (details.links.external * 0.25));
    if (details.links.internal === 0) {
      details.links.recommendations.push('Add internal links to improve site structure and user navigation.');
    }
    if (details.links.external === 0) {
      details.links.recommendations.push('Consider adding some external links to authoritative sources.');
    }
    score += details.links.score;

    // 6. URL Structure
    details.url = {
      length: url.length,
      includesKeywords: /[a-z0-9]+(?:-[a-z0-9]+)*/.test(parsedUrl.pathname),
      score: 0,
      maxScore: 10,
      recommendations: []
    };
    details.url.score = Math.min(5, Math.max(0, 5 - (url.length - 50) / 10));
    if (details.url.includesKeywords) details.url.score += 5;
    if (!details.url.includesKeywords) {
      details.url.recommendations.push('Use keywords in your URL for better SEO.');
    }
    if (url.length > 100) {
      details.url.recommendations.push('Consider shortening your URL for better user experience and SEO.');
    }
    score += details.url.score;

    // 7. Mobile Responsiveness
    const viewport = $('meta[name="viewport"]').attr('content');
    details.mobileResponsive = {
      hasViewport: !!viewport,
      score: viewport ? 10 : 0,
      maxScore: 10,
      recommendations: []
    };
    if (!viewport) {
      details.mobileResponsive.recommendations.push('Add a viewport meta tag to ensure mobile responsiveness.');
    }
    score += details.mobileResponsive.score;

    // 8. SSL Certificate
    details.ssl = {
      present: url.startsWith('https'),
      score: url.startsWith('https') ? 10 : 0,
      maxScore: 10,
      recommendations: []
    };
    if (!details.ssl.present) {
      details.ssl.recommendations.push('Implement SSL (HTTPS) for improved security and SEO.');
    }
    score += details.ssl.score;

    // 9. Page Load Speed
    details.loadSpeed = {
      time: loadTime,
      score: Math.max(0, 10 - (loadTime / 50)),
      maxScore: 10,
      recommendations: []
    };
    if (loadTime > 3000) {
      details.loadSpeed.recommendations.push('Improve page load speed for better user experience and SEO.');
    }
    score += details.loadSpeed.score;

    // 10. Content Length
    const contentLength = $('body').text().length;
    details.contentLength = {
      length: contentLength,
      score: Math.min(10, contentLength / 300),
      maxScore: 10,
      recommendations: []
    };
    if (contentLength < 300) {
      details.contentLength.recommendations.push('Add more content to your page for better SEO.');
    }
    score += details.contentLength.score;

    // 11. Keyword Density
    const bodyText = $('body').text().toLowerCase();
    const words = bodyText.match(/\w+/g) || [];
    const wordCount = words.length;
    const keywordCounts = {};
    words.forEach(word => {
      if (word.length > 3) {
        keywordCounts[word] = (keywordCounts[word] || 0) + 1;
      }
    });
    const topKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count, density: count / wordCount }));
    
    details.keywordDensity = {
      topKeywords,
      score: Math.min(5, topKeywords.reduce((acc, kw) => acc + (kw.density < 0.03 ? 1 : 0), 0)),
      maxScore: 5,
      recommendations: []
    };
    if (topKeywords.some(kw => kw.density > 0.03)) {
      details.keywordDensity.recommendations.push('Avoid keyword stuffing. Aim for a natural keyword density.');
    }
    score += details.keywordDensity.score;

    // 12. Social Media Meta Tags
    details.socialMeta = {
      ogTags: $('meta[property^="og:"]').length,
      twitterTags: $('meta[name^="twitter:"]').length,
      score: 0,
      maxScore: 5,
      recommendations: []
    };
    details.socialMeta.score = Math.min(5, (details.socialMeta.ogTags + details.socialMeta.twitterTags) / 2);
    if (details.socialMeta.ogTags === 0) {
      details.socialMeta.recommendations.push('Add Open Graph meta tags for better social media sharing.');
    }
    if (details.socialMeta.twitterTags === 0) {
      details.socialMeta.recommendations.push('Add Twitter Card meta tags for better Twitter sharing.');
    }
    score += details.socialMeta.score;

    // Normalize score to be out of MAX_SCORE
    score = Math.min(MAX_SCORE, Math.round(score));

    // Generate chart data
    const chartData = Object.entries(details).map(([key, value]) => ({
      category: key,
      score: value.score,
      maxScore: value.maxScore,
      color: getScoreColor(value.score, value.maxScore)
    }));

    res.json({
      score,
      maxScore: MAX_SCORE,
      details,
      chartData,
      overallColor: getScoreColor(score, MAX_SCORE)
    });
  } catch (error) {
    console.error('Error checking SEO:', error);
    res.status(500).json({ error: 'An error occurred while checking SEO' });
  }
});

export default router;