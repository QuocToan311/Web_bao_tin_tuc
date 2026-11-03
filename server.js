/**
 * ============================================================================
 * VNEWS 24H - High-Performance News Server & Reverse Proxy
 * Features: Multi-Source RSS Ingestion, XML Parser, In-Memory TTL Cache,
 *           Article Full-Text Web Crawler, and Static File Delivery.
 * Zero external npm dependencies (Vanilla Node.js 18+).
 * ============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// ============================================================================
// 1. Cấu hình Nguồn Báo & Danh mục RSS
// ============================================================================
const RSS_FEEDS = {
  vnexpress: {
    name: 'VnExpress',
    home: 'https://vnexpress.net/rss/tin-moi-nhat.rss',
    thoisu: 'https://vnexpress.net/rss/thoi-su.rss',
    kinhdoanh: 'https://vnexpress.net/rss/kinh-doanh.rss',
    congnghe: 'https://vnexpress.net/rss/khoa-hoc.rss',
    thethao: 'https://vnexpress.net/rss/the-thao.rss',
    giaitri: 'https://vnexpress.net/rss/giai-tri.rss',
    doisong: 'https://vnexpress.net/rss/gia-dinh.rss'
  },
  tuoitre: {
    name: 'Tuổi Trẻ',
    home: 'https://tuoitre.vn/rss/tin-moi-nhat.rss',
    thoisu: 'https://tuoitre.vn/rss/thoi-su.rss',
    kinhdoanh: 'https://tuoitre.vn/rss/kinh-doanh.rss',
    congnghe: 'https://tuoitre.vn/rss/nhip-song-so.rss',
    thethao: 'https://tuoitre.vn/rss/the-thao.rss',
    giaitri: 'https://tuoitre.vn/rss/giai-tri.rss',
    doisong: 'https://tuoitre.vn/rss/van-hoa.rss'
  },
  thanhnien: {
    name: 'Thanh Niên',
    home: 'https://thanhnien.vn/rss/home.rss',
    thoisu: 'https://thanhnien.vn/rss/thoi-su.rss',
    kinhdoanh: 'https://thanhnien.vn/rss/kinh-te.rss',
    congnghe: 'https://thanhnien.vn/rss/cong-nghe.rss',
    thethao: 'https://thanhnien.vn/rss/the-thao.rss',
    giaitri: 'https://thanhnien.vn/rss/giai-tri.rss',
    doisong: 'https://thanhnien.vn/rss/doi-song.rss'
  },
  dantri: {
    name: 'Dân Trí',
    home: 'https://dantri.com.vn/rss/home.rss',
    thoisu: 'https://dantri.com.vn/rss/xa-hoi.rss',
    kinhdoanh: 'https://dantri.com.vn/rss/kinh-doanh.rss',
    congnghe: 'https://dantri.com.vn/rss/suc-manh-so.rss',
    thethao: 'https://dantri.com.vn/rss/the-thao.rss',
    giaitri: 'https://dantri.com.vn/rss/giai-tri.rss',
    doisong: 'https://dantri.com.vn/rss/doi-song.rss'
  }
};

const CATEGORY_LABELS = {
  home: 'Trang chủ',
  thoisu: 'Thời sự',
  kinhdoanh: 'Kinh doanh',
  congnghe: 'Công nghệ AI',
  thethao: 'Thể thao',
  giaitri: 'Giải trí',
  doisong: 'Đời sống'
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ============================================================================
// 2. Bộ đệm In-Memory Cache (TTL) & Tự Dọn Dẹp
// ============================================================================
const memoryCache = new Map();
const RSS_CACHE_TTL_MS = 5 * 60 * 1000;       // 5 phút
const ARTICLE_CACHE_TTL_MS = 30 * 60 * 1000;   // 30 phút

function getCache(key) {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > item.ttl) {
    memoryCache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data, ttl) {
  memoryCache.set(key, { data, timestamp: Date.now(), ttl });
}

function cleanupExpiredCache() {
  const now = Date.now();
  for (const [key, item] of memoryCache.entries()) {
    if (now - item.timestamp > item.ttl) {
      memoryCache.delete(key);
    }
  }
}
setInterval(cleanupExpiredCache, 10 * 60 * 1000).unref();

// ============================================================================
// 3. Tiện ích Xử Lý Chuỗi & Thời Gian
// ============================================================================
function unescapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function formatRelativeTime(pubDateStr) {
  try {
    const date = new Date(pubDateStr);
    if (isNaN(date.getTime())) return 'Vừa xong';
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    const days = Math.floor(diff / 86400);
    if (days < 7) return `${days} ngày trước`;
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  } catch {
    return 'Vừa xong';
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// ============================================================================
// 4. Parser XML RSS Chuẩn Hóa
// ============================================================================
function parseRssXml(xmlText, category = 'home', sourceKey = 'vnexpress') {
  const items = [];
  const itemRegex = /<item[\s\S]*?>([\s\S]*?)<\/item>/gi;
  let match;

  const categoryName = CATEGORY_LABELS[category] || 'Tin tức';
  const sourceName = RSS_FEEDS[sourceKey]?.name || sourceKey;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || block.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = block.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) || block.match(/<link>([\s\S]*?)<\/link>/i);
    const descMatch = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || block.match(/<description>([\s\S]*?)<\/description>/i);
    const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const enclosureMatch = block.match(/<enclosure[^>]+url=["']([^"']+)["']/i);

    if (!titleMatch || !linkMatch) continue;

    const rawTitle = unescapeHtml(titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, ''));
    const rawLink = linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    if (!rawTitle || !rawLink) continue;

    const rawDesc = descMatch ? descMatch[1] : '';
    let imageUrl = enclosureMatch ? enclosureMatch[1] : '';
    if (!imageUrl) {
      const imgInDesc = rawDesc.match(/<img[^>]+(?:src|data-original)=["']([^"']+)["']/i);
      if (imgInDesc) imageUrl = imgInDesc[1];
    }
    if (imageUrl) imageUrl = imageUrl.replace(/&amp;/g, '&');

    const cleanSapo = unescapeHtml(rawDesc.replace(/<[^>]*>/g, ''));
    const articleId = Buffer.from(rawLink).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);

    items.push({
      id: articleId,
      title: rawTitle,
      link: rawLink,
      sapo: cleanSapo || 'Bấm vào bài viết để xem nội dung chi tiết...',
      image: imageUrl || 'assets/images/hero.jpg',
      pubDate: pubDateMatch ? pubDateMatch[1].trim() : '',
      publishedAt: pubDateMatch ? formatRelativeTime(pubDateMatch[1]) : 'Vừa xong',
      source: sourceName,
      sourceKey,
      category: categoryName,
      categoryKey: category
    });
  }

  return items;
}

// ============================================================================
// 5. Trích Xuất & Làm Sạch Thẻ Lồng Nhau (Balanced Tag Extractor)
// ============================================================================
function extractTagContent(html, startTagRegex) {
  const match = startTagRegex.exec(html);
  if (!match) return null;
  const startIndex = match.index + match[0].length;
  let depth = 1;
  const tagType = match[0].match(/<([a-zA-Z0-9]+)/)[1].toLowerCase();
  
  const searchRegex = new RegExp(`(<${tagType}[^>]*>)|(<\\/${tagType}>)`, 'gi');
  searchRegex.lastIndex = startIndex;
  
  let m;
  while ((m = searchRegex.exec(html)) !== null) {
    if (m[1]) depth++;
    else if (m[2]) {
      depth--;
      if (depth === 0) return html.slice(startIndex, m.index);
    }
  }
  return null;
}

function sanitizeArticleHtml(rawHtml) {
  if (!rawHtml) return '';
  let html = rawHtml;

  // Lọc mã thực thi, style, quảng cáo, tracking
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = html.replace(/<div[^>]*class=["'][^"']*(?:banner|ads|ad-|box-category|relate|social|author-info|list-news)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<div[^>]*id=["'][^"']*(?:banner|ads|ad-|box-category|relate)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<table[^>]*class=["'][^"']*(?:video|box-item)[^"']*["'][^>]*>[\s\S]*?<\/table>/gi, '');

  // Xóa tiêu đề và sapo lặp lại ở đầu bài viết vì modal header đã có
  html = html.replace(/<h1[^>]*class=["'][^"']*title[^"']*["'][^>]*>[\s\S]*?<\/h1>/gi, '');
  html = html.replace(/<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>[\s\S]*?<\/p>/gi, '');
  html = html.replace(/<h2[^>]*class=["'][^"']*sapo[^"']*["'][^>]*>[\s\S]*?<\/h2>/gi, '');

  // Chuẩn hóa ảnh: thay thế lazy loading (data-src / data-original) thành src hợp lệ
  html = html.replace(/<img([^>]+)>/gi, (match, attrs) => {
    let src = '';
    const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/i);
    const dataSrcMatch = attrs.match(/\b(?:data-src|data-original)=["']([^"']+)["']/i);

    if (dataSrcMatch && (!srcMatch || srcMatch[1].startsWith('data:image') || srcMatch[1].includes('placeholder') || srcMatch[1].includes('blank.gif'))) {
      src = dataSrcMatch[1];
    } else if (srcMatch) {
      src = srcMatch[1];
    }

    if (!src) return '';
    return `<img src="${src}" class="article-inner-image" loading="lazy" alt="Minh họa bài viết" />`;
  });

  return html.trim();
}

// ============================================================================
// 6. Crawler Bài Viết Toàn Văn Từ URL Gốc
// ============================================================================
async function crawlArticle(targetUrl) {
  const cached = getCache(`article:${targetUrl}`);
  if (cached) return cached;

  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8'
    }
  });

  if (!response.ok) {
    throw new Error(`Tòa soạn báo phản hồi mã lỗi HTTP: ${response.status}`);
  }

  const html = await response.text();

  // Bóc tách Tiêu đề
  const titleMatch = html.match(/<h1[^>]*class=["'][^"']*(?:title|title-detail|article-title|detail-title)[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
                     html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = titleMatch ? unescapeHtml(titleMatch[1].replace(/<[^>]*>/g, '')) : '';

  // Bóc tách Sapo
  const sapoMatch = html.match(/<p[^>]*class=["'][^"']*(?:description|sapo|article-sapo|detail-sapo)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i) ||
                    html.match(/<h2[^>]*class=["'][^"']*(?:description|sapo|article-sapo|detail-sapo)[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i) ||
                    html.match(/<div[^>]*class=["'][^"']*(?:description|sapo|article-sapo|detail-sapo)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  const sapo = sapoMatch ? unescapeHtml(sapoMatch[1].replace(/<[^>]*>/g, '')) : '';

  // Bóc tách Tác giả
  const authorMatch = html.match(/<(?:p|span|div)[^>]*class=["'][^"']*(?:author|Author|tac-gia)[^"']*["'][^>]*>([\s\S]*?)<\/(?:p|span|div)>/i) ||
                      html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i);
  const author = authorMatch ? unescapeHtml(authorMatch[1].replace(/<[^>]*>/g, '')) : 'Ban Biên Tập';

  // Bóc tách Ngày đăng
  const dateMatch = html.match(/<(?:span|div|p)[^>]*class=["'][^"']*(?:date|time|published|detail-time)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|div|p)>/i) ||
                    html.match(/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i);
  const publishedAt = dateMatch ? unescapeHtml(dateMatch[1].replace(/<[^>]*>/g, '')) : 'Hôm nay';

  // Bóc tách Thân bài theo vùng chứa đa nguồn báo
  let rawBody = extractTagContent(html, /<article[^>]*class=["'][^"']*fck_detail[^"']*["'][^>]*>/i) ||
                extractTagContent(html, /<div[^>]*class=["'][^"']*detail-content[^"']*["'][^>]*>/i) ||
                extractTagContent(html, /<div[^>]*id=["']main-detail-body["'][^>]*>/i) ||
                extractTagContent(html, /<div[^>]*class=["'][^"']*singular-content[^"']*["'][^>]*>/i) ||
                extractTagContent(html, /<div[^>]*class=["'][^"']*detail-cmain[^"']*["'][^>]*>/i);

  if (!rawBody) {
    const paragraphs = [...html.matchAll(/<p[^>]*class=["'][^"']*(?:Normal|content-detail|detail__text)[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi)];
    if (paragraphs.length) {
      rawBody = paragraphs.map(p => `<p>${p[1]}</p>`).join('');
    }
  }

  const cleanBody = sanitizeArticleHtml(rawBody);

  const result = {
    url: targetUrl,
    title: title || 'Nội dung bài viết',
    sapo: sapo || '',
    author,
    publishedAt,
    content: cleanBody || `<p>${sapo}</p><p>Nội dung chi tiết vui lòng xem bài viết gốc tại nguồn báo.</p>`
  };

  setCache(`article:${targetUrl}`, result, ARTICLE_CACHE_TTL_MS);
  return result;
}

// ============================================================================
// 7. HTTP Server & Route Handler
// ============================================================================
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // --- Endpoint: /api/rss ---
  if (pathname === '/api/rss') {
    const source = (searchParams.get('source') || 'vnexpress').toLowerCase();
    const category = (searchParams.get('category') || 'home').toLowerCase();
    const cacheKey = `rss:${source}:${category}`;

    const cachedRss = getCache(cacheKey);
    if (cachedRss) {
      return sendJson(res, 200, cachedRss);
    }

    const sourceConfig = RSS_FEEDS[source] || RSS_FEEDS.vnexpress;
    const feedUrl = sourceConfig[category] || sourceConfig.home;

    try {
      const response = await fetch(feedUrl, { headers: { 'User-Agent': DEFAULT_USER_AGENT } });
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

      const xmlText = await response.text();
      const articles = parseRssXml(xmlText, category, source);

      const payload = {
        success: true,
        source: sourceConfig.name,
        sourceKey: source,
        category,
        categoryName: CATEGORY_LABELS[category] || category,
        feedUrl,
        total: articles.length,
        data: articles
      };

      setCache(cacheKey, payload, RSS_CACHE_TTL_MS);
      return sendJson(res, 200, payload);
    } catch (err) {
      return sendJson(res, 500, { success: false, error: `Không thể tải RSS: ${err.message}` });
    }
  }

  // --- Endpoint: /api/article (Crawler) ---
  if (pathname === '/api/article') {
    const targetUrl = searchParams.get('url');
    if (!targetUrl) {
      return sendJson(res, 400, { success: false, error: 'Thiếu tham số url bài viết' });
    }

    try {
      const data = await crawlArticle(targetUrl);
      return sendJson(res, 200, { success: true, data });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: `Lỗi crawl: ${err.message}` });
    }
  }

  // --- Endpoint: /api/sources ---
  if (pathname === '/api/sources') {
    return sendJson(res, 200, {
      success: true,
      sources: Object.keys(RSS_FEEDS).map(k => ({ key: k, name: RSS_FEEDS[k].name })),
      categories: Object.keys(CATEGORY_LABELS).map(k => ({ key: k, name: CATEGORY_LABELS[k] }))
    });
  }

  // --- Static File Server ---
  const safeReqPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(__dirname, safeReqPath));

  // Chống Directory Traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`📰 VNEWS 24H Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📡 RSS Endpoint:     http://localhost:${PORT}/api/rss?source=vnexpress&category=home`);
  console.log(`🕷️ Crawler Endpoint: http://localhost:${PORT}/api/article?url=...`);
  console.log(`=======================================================`);
});
