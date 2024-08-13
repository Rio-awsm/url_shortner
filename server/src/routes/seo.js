import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { parse } from 'url';
import { performance } from 'perf_hooks';

const router = express.Router();

const MAX_SCORE = 100;

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
      score: 0
    };
    if (title) {
      details.title.score = Math.min(10, Math.max(0, 10 - Math.abs(55 - title.length) / 5));
      score += details.title.score;
    }

    // 2. Meta Description
    const description = $('meta[name="description"]').attr('content');
    details.description = {
      content: description,
      length: description ? description.length : 0,
      score: 0
    };
    if (description) {
      details.description.score = Math.min(10, Math.max(0, 10 - Math.abs(150 - description.length) / 10));
      score += details.description.score;
    }

    // 3. Headers (H1, H2, H3)
    details.headers = {};
    ['h1', 'h2', 'h3'].forEach(tag => {
      const headers = $(tag);
      details.headers[tag] = {
        count: headers.length,
        content: headers.map((i, el) => $(el).text().trim()).get(),
        score: 0
      };
      if (tag === 'h1') {
        details.headers[tag].score = headers.length === 1 ? 10 : (headers.length === 0 ? 0 : 5);
      } else {
        details.headers[tag].score = Math.min(5, headers.length);
      }
      score += details.headers[tag].score;
    });

    // 4. Image optimization
    const images = $('img');
    details.images = {
      total: images.length,
      withAlt: 0,
      withLazyLoading: 0,
      score: 0
    };
    images.each((i, img) => {
      if ($(img).attr('alt')) details.images.withAlt++;
      if ($(img).attr('loading') === 'lazy') details.images.withLazyLoading++;
    });
    details.images.score = Math.min(10, 
      ((details.images.withAlt / details.images.total) * 5) + 
      ((details.images.withLazyLoading / details.images.total) * 5) || 0
    );
    score += details.images.score;

    // 5. Internal and External Links
    details.links = {
      internal: 0,
      external: 0,
      score: 0
    };
    $('a').each((i, link) => {
      const href = $(link).attr('href');
      if (href && !href.startsWith('#')) {
        if (href.includes(parsedUrl.hostname)) details.links.internal++;
        else details.links.external++;
      }
    });
    details.links.score = Math.min(10, (details.links.internal * 0.5) + (details.links.external * 0.25));
    score += details.links.score;

    // 6. URL Structure
    details.url = {
      length: url.length,
      includesKeywords: /[a-z0-9]+(?:-[a-z0-9]+)*/.test(parsedUrl.pathname),
      score: 0
    };
    details.url.score = Math.min(5, Math.max(0, 5 - (url.length - 50) / 20));
    if (details.url.includesKeywords) details.url.score += 5;
    score += details.url.score;

    // 7. Mobile Responsiveness
    const viewport = $('meta[name="viewport"]').attr('content');
    details.mobileResponsive = {
      hasViewport: !!viewport,
      score: viewport ? 10 : 0
    };
    score += details.mobileResponsive.score;

    // 8. SSL Certificate
    details.ssl = {
      present: url.startsWith('https'),
      score: url.startsWith('https') ? 10 : 0
    };
    score += details.ssl.score;

    // 9. Page Load Speed
    details.loadSpeed = {
      time: loadTime,
      score: Math.max(0, 10 - (loadTime / 100))
    };
    score += details.loadSpeed.score;

    // 10. Content Length
    const contentLength = $('body').text().length;
    details.contentLength = {
      length: contentLength,
      score: Math.min(10, contentLength / 200)
    };
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
      score: Math.min(5, topKeywords.reduce((acc, kw) => acc + (kw.density < 0.03 ? 1 : 0), 0))
    };
    score += details.keywordDensity.score;

    // 12. Social Media Meta Tags
    details.socialMeta = {
      ogTags: $('meta[property^="og:"]').length,
      twitterTags: $('meta[name^="twitter:"]').length,
      score: 0
    };
    details.socialMeta.score = Math.min(5, (details.socialMeta.ogTags + details.socialMeta.twitterTags) / 2);
    score += details.socialMeta.score;

    // Normalize score to be out of MAX_SCORE
    score = Math.min(MAX_SCORE, Math.round(score));

    res.json({
      score,
      maxScore: MAX_SCORE,
      details
    });
  } catch (error) {
    console.error('Error checking SEO:', error);
    res.status(500).json({ error: 'An error occurred while checking SEO' });
  }
});

export default router;