const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// ============================================================================
// 1. Cấu hình Nguồn Báo & Danh mục RSS (VnExpress, Tuổi Trẻ, Thanh Niên)
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
    giaitri: 'https://tuoitre.vn/rss/giai-tri.rss'
  },
  thanhnien: {
    name: 'Thanh Niên',
    home: 'https://thanhnien.vn/rss/home.rss',
    thoisu: 'https://thanhnien.vn/rss/thoi-su.rss',
    kinhdoanh: 'https://thanhnien.vn/rss/kinh-te.rss',
    congnghe: 'https://thanhnien.vn/rss/cong-nghe.rss',
    thethao: 'https://thanhnien.vn/rss/the-thao.rss',
    giaitri: 'https://thanhnien.vn/rss/giai-tri.rss'
  }
};

// ============================================================================
// 2. Tiện ích xử lý chuỗi HTML & Thời gian
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
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function formatRelativeTime(pubDateStr) {
  try {
    const date = new Date(pubDateStr);
    if (isNaN(date.getTime())) return 'Vừa xong';
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    if (diffSeconds < 60) return 'Vừa xong';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} phút trước`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} giờ trước`;
    const days = Math.floor(diffSeconds / 86400);
    if (days < 7) return `${days} ngày trước`;
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  } catch (e) {
    return 'Vừa xong';
  }
}

// ============================================================================
// 3. Hàm Phân Tích XML RSS thành Mảng JSON Chuẩn
// ============================================================================
function parseRssXml(xmlText, category = 'Tin Mới', source = 'vnexpress') {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemBlock = match[1];

    // Trích xuất Title (xử lý cả dạng CDATA và dạng thường)
    const titleMatch = itemBlock.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || 
                       itemBlock.match(/<title>([\s\S]*?)<\/title>/i);

    // Trích xuất Link
    const linkMatch = itemBlock.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) || 
                      itemBlock.match(/<link>([\s\S]*?)<\/link>/i);

    // Trích xuất Description
    const descMatch = itemBlock.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || 
                      itemBlock.match(/<description>([\s\S]*?)<\/description>/i);

    // Trích xuất Ngày đăng
    const pubDateMatch = itemBlock.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);

    // Trích xuất Ảnh từ thẻ enclosure (nếu có)
    const enclosureMatch = itemBlock.match(/<enclosure[^>]+url=["']([^"']+)["']/i);

    const rawDesc = descMatch ? descMatch[1] : '';

    // Bóc tách ảnh đại diện (Thumbnail)
    let imageUrl = enclosureMatch ? enclosureMatch[1] : '';
    if (!imageUrl) {
      const imgInDesc = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgInDesc) imageUrl = imgInDesc[1];
    }
    // Lọc lại định dạng ảnh chất lượng cao nếu có query thumbnail nhỏ
    if (imageUrl) {
      imageUrl = imageUrl.replace(/&amp;/g, '&');
    }

    // Làm sạch đoạn tóm tắt (Sapo): xóa toàn bộ HTML tag
    const cleanSapo = unescapeHtml(rawDesc.replace(/<[^>]*>/g, ''));

    if (titleMatch && linkMatch) {
      const rawTitle = unescapeHtml(titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, ''));
      const rawLink = linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();

      // Tạo ID duy nhất từ link bài báo
      const articleId = Buffer.from(rawLink).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);

      items.push({
        id: articleId,
        title: rawTitle,
        link: rawLink,
        sapo: cleanSapo || 'Đang cập nhật tóm tắt nội dung sự kiện...',
        image: imageUrl || 'assets/images/hero.jpg',
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : '',
        publishedAt: pubDateMatch ? formatRelativeTime(pubDateMatch[1]) : 'Vừa xong',
        source: RSS_FEEDS[source]?.name || source,
        category: category
      });
    }
  }

  return items;
}

// ============================================================================
// 4. Máy chủ HTTP Server & Định tuyến
// ============================================================================
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

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Bật CORS cho mọi client
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API Endpoint: /api/rss ---
  if (pathname === '/api/rss') {
    const source = (parsedUrl.query.source || 'vnexpress').toLowerCase();
    const category = (parsedUrl.query.category || 'home').toLowerCase();

    const sourceConfig = RSS_FEEDS[source] || RSS_FEEDS.vnexpress;
    const feedUrl = sourceConfig[category] || sourceConfig.home;

    try {
      console.log(`[RSS Fetch] Đang tải RSS từ ${source} [${category}]: ${feedUrl}`);
      const rssResponse = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!rssResponse.ok) {
        throw new Error(`Nguồn báo phản hồi mã lỗi HTTP: ${rssResponse.status}`);
      }

      const xmlText = await rssResponse.text();
      const articles = parseRssXml(xmlText, category.toUpperCase(), source);

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        source: sourceConfig.name,
        category: category,
        feedUrl: feedUrl,
        total: articles.length,
        data: articles
      }));
    } catch (err) {
      console.error('[RSS Error]', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: false,
        error: `Không thể tải RSS từ nguồn: ${err.message}`
      }));
    }
    return;
  }

  // --- Định tuyến phục vụ file tĩnh (Frontend) ---
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(__dirname, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
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
  console.log(`📡 RSS Endpoint: http://localhost:${PORT}/api/rss?category=home`);
  console.log(`=======================================================`);
});

