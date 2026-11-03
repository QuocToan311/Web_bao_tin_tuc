/**
 * ============================================================================
 * VNEWS 24H - Core Client Application Logic & UI Controllers
 * Architecture: Event-Driven, Reactive Data Binding with Dynamic RSS & Crawler
 * ============================================================================
 */

(() => {
  'use strict';

  // --- Global Application State ---
  const state = {
    currentSource: localStorage.getItem('vnews-source') || 'vnexpress',
    currentCategory: 'home',
    articles: [],
    articlesMap: new Map(),
    bookmarks: JSON.parse(localStorage.getItem('vnews-bookmarks') || '[]'),
    currentArticle: null,
    fontSize: 17,
    tickerInterval: null,
    audioInterval: null,
    audioSeconds: 0,
    isAudioPlaying: false
  };

  // --- Bootstrap on DOM Ready ---
  document.addEventListener('DOMContentLoaded', initApp);

  function initApp() {
    initClockAndDate();
    initThemeToggle();
    initBookmarks();
    initAudioPlayer();
    initPollWidget();
    initNewsletter();
    initArticleReader();
    initSearch();
    initNavigation();

    // Initial feed fetch
    loadNewsFeed(state.currentSource, state.currentCategory, true);

    // Auto-polling: Background refresh every 5 minutes
    setInterval(() => {
      loadNewsFeed(state.currentSource, state.currentCategory, false);
    }, 5 * 60 * 1000);
  }

  // ==========================================================================
  // 1. Utilities & Security Helpers
  // ==========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent-crimson);"></i> ${escapeHtml(message)}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ==========================================================================
  // 2. Real-Time Clock & Calendar
  // ==========================================================================
  function initClockAndDate() {
    const dateEl = document.getElementById('current-date');
    const clockEl = document.getElementById('current-time');
    if (!dateEl) return;

    const daysVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

    function updateTime() {
      const now = new Date();
      const dayName = daysVi[now.getDay()];
      const dateStr = `${dayName}, ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      dateEl.textContent = dateStr;
      if (clockEl) clockEl.textContent = timeStr;
    }

    updateTime();
    setInterval(updateTime, 1000);
  }

  // ==========================================================================
  // 3. Navigation & Source Selection
  // ==========================================================================
  function initNavigation() {
    const sourceSelect = document.getElementById('news-source-select');
    const refreshBtn = document.getElementById('btn-refresh-feed');

    if (sourceSelect) {
      sourceSelect.value = state.currentSource;
      sourceSelect.addEventListener('change', (e) => {
        state.currentSource = e.target.value;
        localStorage.setItem('vnews-source', state.currentSource);
        showToast(`Đang chuyển sang nguồn báo: ${sourceSelect.options[sourceSelect.selectedIndex].text}`);
        loadNewsFeed(state.currentSource, state.currentCategory, true);
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        showToast('Đang làm mới dữ liệu dòng sự kiện...');
        loadNewsFeed(state.currentSource, state.currentCategory, true);
      });
    }

    const navItems = document.querySelectorAll('#main-nav-links .nav-item');
    navItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        const cat = item.getAttribute('data-category');
        if (!cat) return;

        e.preventDefault();
        navItems.forEach((n) => n.classList.remove('active'));
        item.classList.add('active');

        state.currentCategory = cat;
        loadNewsFeed(state.currentSource, state.currentCategory, true);
      });
    });
  }

  // ==========================================================================
  // 4. Feed Ingestion & Dynamic Data Binding
  // ==========================================================================
  async function loadNewsFeed(source = 'vnexpress', category = 'home', showLoading = true) {
    const refreshIcon = document.getElementById('refresh-icon');
    if (refreshIcon) refreshIcon.parentElement.classList.add('spinning');

    if (showLoading) {
      renderLoadingSkeletons();
    }

    try {
      const apiUrl = `/api/rss?source=${encodeURIComponent(source)}&category=${encodeURIComponent(category)}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

      const result = await response.json();
      if (!result.success || !result.data?.length) {
        throw new Error(result.error || 'Dữ liệu RSS rỗng');
      }

      state.articles = result.data;
      state.articles.forEach((art) => state.articlesMap.set(art.id, art));

      // Update category title banner
      const catTitle = document.getElementById('category-section-title');
      if (catTitle) {
        catTitle.innerHTML = `<i class="fa-solid fa-layer-group" style="color: var(--accent-blue);"></i> ${escapeHtml(result.categoryName || 'Tin Mới')} • ${escapeHtml(result.source)}`;
      }

      // Render components
      renderTicker(state.articles);
      renderHeroSection(state.articles);
      renderMainNewsGrid(state.articles);
      renderTrendingList(state.articles);

      if (showLoading) {
        showToast(`Đã nạp ${state.articles.length} bài báo mới từ ${result.source}`);
      }
    } catch (err) {
      console.warn('[RSS Load Fallback]', err.message);
      showToast('Không thể kết nối máy chủ RSS: Sử dụng dữ liệu dự phòng');
      fallbackToLocalData();
    } finally {
      if (refreshIcon) {
        setTimeout(() => refreshIcon.parentElement.classList.remove('spinning'), 500);
      }
    }
  }

  function fallbackToLocalData() {
    if (typeof NEWS_DATA === 'undefined') return;
    const mockArticles = [
      NEWS_DATA.mainHero,
      ...NEWS_DATA.subHeroes,
      ...NEWS_DATA.businessNews
    ];
    mockArticles.forEach((a) => state.articlesMap.set(a.id, a));
    renderTicker(mockArticles);
  }

  function renderLoadingSkeletons() {
    const mainHero = document.getElementById('main-hero-container');
    const subHero = document.getElementById('sub-hero-container');
    const feed = document.getElementById('feed-list-container');
    const grid = document.getElementById('main-news-grid');

    if (mainHero) {
      mainHero.innerHTML = `
        <article class="main-hero-card" style="padding: 1.5rem;">
          <div class="skeleton skeleton-img" style="height: 320px;"></div>
          <div class="skeleton skeleton-title" style="width: 85%;"></div>
          <div class="skeleton skeleton-title" style="width: 70%;"></div>
          <div class="skeleton skeleton-text" style="width: 100%;"></div>
          <div class="skeleton skeleton-text" style="width: 90%;"></div>
        </article>
      `;
    }

    if (subHero) {
      subHero.innerHTML = `
        <div class="skeleton skeleton-img" style="height: 140px;"></div>
        <div class="skeleton skeleton-title" style="width: 80%;"></div>
        <div class="skeleton skeleton-img" style="height: 140px; margin-top: 1.5rem;"></div>
        <div class="skeleton skeleton-title" style="width: 80%;"></div>
      `;
    }

    if (feed) {
      feed.innerHTML = `
        <div style="padding: 1rem;">
          <div class="skeleton skeleton-text" style="width: 40%; margin-bottom: 1rem;"></div>
          <div class="skeleton skeleton-text" style="width: 90%;"></div>
          <div class="skeleton skeleton-text" style="width: 75%; margin-bottom: 1rem;"></div>
          <div class="skeleton skeleton-text" style="width: 90%;"></div>
          <div class="skeleton skeleton-text" style="width: 80%;"></div>
        </div>
      `;
    }

    if (grid) {
      grid.innerHTML = `
        <div class="news-card"><div class="skeleton skeleton-img"></div><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div></div>
        <div class="news-card"><div class="skeleton skeleton-img"></div><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div></div>
        <div class="news-card"><div class="skeleton skeleton-img"></div><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div></div>
      `;
    }
  }

  // ==========================================================================
  // 5. Component Renderers
  // ==========================================================================
  function renderTicker(articles) {
    const tickerText = document.getElementById('ticker-text');
    const btnPrev = document.getElementById('ticker-prev');
    const btnNext = document.getElementById('ticker-next');
    if (!tickerText || !articles.length) return;

    const list = articles.slice(0, 8);
    let index = 0;

    function showNews(i) {
      const item = list[i];
      tickerText.style.opacity = '0';
      tickerText.style.transform = 'translateY(10px)';
      setTimeout(() => {
        tickerText.textContent = item.title;
        tickerText.onclick = () => openReaderModal(item);
        tickerText.style.opacity = '1';
        tickerText.style.transform = 'translateY(0)';
      }, 200);
    }

    function nextNews() {
      index = (index + 1) % list.length;
      showNews(index);
    }

    function prevNews() {
      index = (index - 1 + list.length) % list.length;
      showNews(index);
    }

    if (state.tickerInterval) clearInterval(state.tickerInterval);
    state.tickerInterval = setInterval(nextNews, 4500);

    showNews(0);

    if (btnNext) btnNext.onclick = nextNews;
    if (btnPrev) btnPrev.onclick = prevNews;

    tickerText.parentElement.onmouseenter = () => clearInterval(state.tickerInterval);
    tickerText.parentElement.onmouseleave = () => {
      state.tickerInterval = setInterval(nextNews, 4500);
    };
  }

  function renderHeroSection(articles) {
    if (!articles?.length) return;

    const mainCol = document.getElementById('main-hero-container');
    const subCol = document.getElementById('sub-hero-container');
    const feedCol = document.getElementById('feed-list-container');

    // 1. Center Super Hero
    const hero = articles[0];
    if (mainCol && hero) {
      mainCol.innerHTML = `
        <article class="main-hero-card">
          <div class="main-hero-media" onclick="window.VNEWS.openReaderById('${hero.id}')">
            <span class="hero-overlay-badge"><i class="fa-solid fa-fire"></i> TIÊU ĐIỂM ${escapeHtml(hero.source.toUpperCase())}</span>
            <img src="${escapeHtml(hero.image)}" alt="${escapeHtml(hero.title)}" onerror="this.src='assets/images/hero.jpg'">
          </div>

          <div class="main-hero-content">
            <h2 class="main-hero-title" onclick="window.VNEWS.openReaderById('${hero.id}')">
              ${escapeHtml(hero.title)}
            </h2>
            
            <p class="main-hero-sapo">
              ${escapeHtml(hero.sapo)}
            </p>

            <div class="hero-actions-row">
              <div class="author-info">
                <div class="author-avatar-badge">${escapeHtml(hero.source.slice(0, 1))}</div>
                <div>
                  <div class="author-name">${escapeHtml(hero.source)}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(hero.publishedAt)} • ${escapeHtml(hero.category)}</div>
                </div>
              </div>

              <div class="hero-btn-group">
                <button class="btn-action-icon" title="Lưu bài viết" onclick="event.stopPropagation(); window.VNEWS.toggleBookmarkById('${hero.id}')">
                  <i class="fa-regular fa-bookmark"></i>
                </button>
                <button class="btn-read-now" onclick="window.VNEWS.openReaderById('${hero.id}')">
                  Đọc toàn bài <i class="fa-solid fa-arrow-right" style="margin-left: 0.25rem;"></i>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }

    // 2. Left Sub-Heroes
    if (subCol) {
      const subs = articles.slice(1, 3);
      subCol.innerHTML = subs.map((art, idx) => `
        <article class="sub-hero-card" onclick="window.VNEWS.openReaderById('${art.id}')">
          <div class="card-media">
            <span class="category-tag ${idx === 0 ? 'blue' : 'gold'}">${escapeHtml(art.category)}</span>
            <img src="${escapeHtml(art.image)}" alt="${escapeHtml(art.title)}" loading="lazy" onerror="this.src='assets/images/business.jpg'">
          </div>
          <div class="card-body">
            <h3 class="card-title">${escapeHtml(art.title)}</h3>
            <div class="card-meta">
              <span class="time-read"><i class="fa-regular fa-clock"></i> ${escapeHtml(art.publishedAt)}</span>
              <span><i class="fa-solid fa-newspaper"></i> ${escapeHtml(art.source)}</span>
            </div>
          </div>
        </article>
      `).join('');
    }

    // 3. Right Live Feed (24/7)
    if (feedCol) {
      const feeds = articles.slice(3, 9);
      feedCol.innerHTML = feeds.map((art) => `
        <div class="feed-item" onclick="window.VNEWS.openReaderById('${art.id}')">
          <span class="feed-item-time">${escapeHtml(art.publishedAt)}</span>
          <p class="feed-item-title">${escapeHtml(art.title)}</p>
        </div>
      `).join('');
    }
  }

  function renderMainNewsGrid(articles) {
    const grid = document.getElementById('main-news-grid');
    if (!grid) return;

    const list = articles.length > 9 ? articles.slice(9, 18) : articles.slice(3, 12);
    const tagColors = ['blue', 'gold', 'red'];

    grid.innerHTML = list.map((art, idx) => `
      <article class="news-card" onclick="window.VNEWS.openReaderById('${art.id}')">
        <div class="card-media">
          <span class="category-tag ${tagColors[idx % 3]}">${escapeHtml(art.category)}</span>
          <img src="${escapeHtml(art.image)}" alt="${escapeHtml(art.title)}" loading="lazy" onerror="this.src='assets/images/green_tech.jpg'">
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(art.title)}</h3>
          <p class="card-sapo">${escapeHtml(art.sapo)}</p>
          <div class="card-meta">
            <span>${escapeHtml(art.publishedAt)} • ${escapeHtml(art.source)}</span>
            <span><i class="fa-regular fa-bookmark" onclick="event.stopPropagation(); window.VNEWS.toggleBookmarkById('${art.id}');" title="Lưu đọc sau"></i></span>
          </div>
        </div>
      </article>
    `).join('');
  }

  function renderTrendingList(articles) {
    const container = document.getElementById('trending-list-container');
    if (!container || !articles.length) return;

    const trending = articles.slice(2, 7);
    container.innerHTML = trending.map((art, idx) => `
      <div class="trending-item" onclick="window.VNEWS.openReaderById('${art.id}')">
        <span class="rank-number">${(idx + 1).toString().padStart(2, '0')}</span>
        <div>
          <h4 class="trending-title">${escapeHtml(art.title)}</h4>
          <span style="font-size: 0.75rem; color: var(--text-muted);">
            <i class="fa-regular fa-clock"></i> ${escapeHtml(art.publishedAt)} • ${escapeHtml(art.source)}
          </span>
        </div>
      </div>
    `).join('');
  }

  // ==========================================================================
  // 6. Reader Modal & Automatic Web Crawler
  // ==========================================================================
  function initArticleReader() {
    const modal = document.getElementById('reader-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const fontPlusBtn = document.getElementById('font-plus-btn');
    const fontMinusBtn = document.getElementById('font-minus-btn');
    const commentForm = document.getElementById('modal-comment-form');

    if (closeBtn) closeBtn.addEventListener('click', closeReaderModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeReaderModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeReaderModal();
    });

    if (fontPlusBtn) {
      fontPlusBtn.addEventListener('click', () => {
        if (state.fontSize < 24) {
          state.fontSize += 2;
          updateFontSize();
        }
      });
    }

    if (fontMinusBtn) {
      fontMinusBtn.addEventListener('click', () => {
        if (state.fontSize > 13) {
          state.fontSize -= 2;
          updateFontSize();
        }
      });
    }

    if (commentForm) {
      commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('comment-input');
        const authorInput = document.getElementById('comment-author-input');
        const content = input ? input.value.trim() : '';
        const author = authorInput && authorInput.value.trim() ? authorInput.value.trim() : 'Bạn đọc ẩn danh';

        if (!content) return;

        const commentsList = document.getElementById('modal-comments-list');
        if (commentsList) {
          const commentEl = document.createElement('div');
          commentEl.className = 'comment-card';
          commentEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="comment-author"><i class="fa-solid fa-user-circle" style="color: var(--accent-crimson); margin-right: 0.35rem;"></i>${escapeHtml(author)}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Vừa xong</span>
            </div>
            <p class="comment-text">${escapeHtml(content)}</p>
          `;
          commentsList.prepend(commentEl);
        }

        if (input) input.value = '';
        showToast('Bình luận của bạn đã được đăng thành công!');
      });
    }
  }

  function updateFontSize() {
    const textEl = document.querySelector('.article-content-text');
    if (textEl) textEl.style.fontSize = `${state.fontSize}px`;
  }

  async function openReaderModal(article) {
    if (!article) return;
    state.currentArticle = article;

    const modal = document.getElementById('reader-modal');
    if (!modal) return;

    // Header info
    document.getElementById('modal-cat-tag').textContent = article.category || 'Tin Tiêu Điểm';
    document.getElementById('modal-title').textContent = article.title;
    document.getElementById('modal-sapo').textContent = article.sapo || '';
    document.getElementById('modal-author').textContent = article.author?.name || article.source || 'Ban Biên Tập';
    document.getElementById('modal-date').textContent = article.publishedAt || 'Hôm nay';
    document.getElementById('modal-read-time').textContent = article.readTime || '3 phút đọc';

    const modalImg = document.getElementById('modal-image');
    if (modalImg && article.image) {
      modalImg.src = article.image;
      modalImg.style.display = 'block';
    } else if (modalImg) {
      modalImg.style.display = 'none';
    }

    const modalCaption = document.getElementById('modal-caption');
    if (modalCaption) {
      modalCaption.textContent = article.imageCaption || article.title;
    }

    const originalLinkBtn = document.getElementById('modal-original-link');
    if (originalLinkBtn && article.link) {
      originalLinkBtn.href = article.link;
    }

    const statusEl = document.getElementById('modal-crawler-status');
    const bodyContent = document.getElementById('modal-body-content');

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // If full content is already cached
    if (article.content && article.content.length > 500) {
      if (statusEl) statusEl.innerHTML = '';
      if (bodyContent) bodyContent.innerHTML = article.content;
      return;
    }

    // Crawl live from original source
    if (article.link && article.link.startsWith('http')) {
      if (statusEl) {
        statusEl.innerHTML = `
          <div class="crawler-loader-box">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Đang tự động bóc tách toàn văn bài viết từ <strong>${escapeHtml(article.source || 'tòa soạn')}</strong>...</span>
          </div>
        `;
      }
      if (bodyContent) {
        bodyContent.innerHTML = `<p style="font-style: italic; color: var(--text-muted);">${escapeHtml(article.sapo)}</p>`;
      }

      try {
        const crawlUrl = `/api/article?url=${encodeURIComponent(article.link)}`;
        const res = await fetch(crawlUrl);
        const data = await res.json();

        if (data.success && data.data?.content) {
          const full = data.data;
          if (full.author && full.author !== 'Ban Biên Tập') {
            document.getElementById('modal-author').textContent = full.author;
          }

          if (statusEl) {
            statusEl.innerHTML = `
              <div class="crawler-success-box">
                <span><i class="fa-solid fa-circle-check"></i> Đã crawl toàn văn bài báo thành công từ ${escapeHtml(article.source || 'nguồn')}</span>
                <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline; font-weight: 600;">Xem bài gốc</a>
              </div>
            `;
          }

          if (bodyContent) bodyContent.innerHTML = full.content;
          article.content = full.content;
        } else {
          throw new Error(data.error || 'Nội dung không hợp lệ');
        }
      } catch (err) {
        if (statusEl) {
          statusEl.innerHTML = `
            <div class="crawler-fallback-box">
              <span><i class="fa-solid fa-circle-info" style="color: var(--accent-blue);"></i> Đang hiển thị bản tóm tắt nhanh.</span>
              <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener" style="color: var(--accent-crimson); font-weight: 600;">Đọc tại ${escapeHtml(article.source || 'báo gốc')} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            </div>
          `;
        }
        if (bodyContent) {
          bodyContent.innerHTML = `<p>${escapeHtml(article.sapo)}</p><p>Độc giả có thể mở bài viết gốc bằng liên kết trên để đọc bài viết đầy đủ.</p>`;
        }
      }
    } else {
      if (statusEl) statusEl.innerHTML = '';
      if (bodyContent) bodyContent.innerHTML = article.content || `<p>${escapeHtml(article.sapo)}</p>`;
    }
  }

  function openReaderModalById(id) {
    let article = state.articlesMap.get(id);
    if (!article) {
      article = state.articles.find((a) => a.id === id);
    }
    if (!article && typeof NEWS_DATA !== 'undefined') {
      if (NEWS_DATA.mainHero.id === id) article = NEWS_DATA.mainHero;
      else if (NEWS_DATA.eMagazine.id === id) article = NEWS_DATA.eMagazine;
      else article = NEWS_DATA.subHeroes.find((a) => a.id === id) || NEWS_DATA.businessNews.find((a) => a.id === id);
    }
    if (article) openReaderModal(article);
  }

  function closeReaderModal() {
    const modal = document.getElementById('reader-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function playModalTTS() {
    if (!('speechSynthesis' in window)) {
      showToast('Trình duyệt không hỗ trợ phát giọng nói');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      showToast('Đã dừng đọc bài báo.');
      return;
    }

    const title = document.getElementById('modal-title')?.textContent || '';
    const sapo = document.getElementById('modal-sapo')?.textContent || '';
    const body = document.getElementById('modal-body-content')?.innerText || '';

    const textToRead = `${title}. ${sapo}. ${body.slice(0, 1000)}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.onend = () => showToast('Đã đọc xong bản tin.');

    window.speechSynthesis.speak(utterance);
    showToast('Đang phát giọng đọc AI cho bài viết...');
  }

  // ==========================================================================
  // 7. Theme Toggle Controller
  // ==========================================================================
  function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.getElementById('theme-label');

    const savedTheme = localStorage.getItem('vnews-theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    applyTheme(savedTheme);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        showToast(`Đã chuyển sang giao diện ${next === 'dark' ? 'Tối' : 'Sáng'}`);
      });
    }

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('vnews-theme', theme);
      if (themeIcon) themeIcon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
      if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Chế độ Tối' : 'Chế độ Sáng';
    }
  }

  // ==========================================================================
  // 8. Bookmarks Controller
  // ==========================================================================
  function initBookmarks() {
    const btn = document.getElementById('bookmark-toggle-btn');
    const backdrop = document.getElementById('drawer-backdrop');
    const closeBtn = document.getElementById('drawer-close-btn');

    updateBookmarkUI();

    if (btn) btn.addEventListener('click', openBookmarksDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeBookmarksDrawer);
    if (backdrop) backdrop.addEventListener('click', closeBookmarksDrawer);
  }

  function openBookmarksDrawer() {
    const drawer = document.getElementById('bookmarks-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer && backdrop) {
      renderBookmarksList();
      drawer.classList.add('active');
      backdrop.classList.add('active');
    }
  }

  function closeBookmarksDrawer() {
    const drawer = document.getElementById('bookmarks-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
    }
  }

  function toggleBookmark(article) {
    if (!article?.id) return;
    const index = state.bookmarks.findIndex((item) => item.id === article.id);
    if (index > -1) {
      state.bookmarks.splice(index, 1);
      showToast('Đã xóa khỏi danh sách đọc sau');
    } else {
      state.bookmarks.unshift(article);
      showToast('Đã lưu bài viết vào danh sách đọc sau');
    }
    localStorage.setItem('vnews-bookmarks', JSON.stringify(state.bookmarks));
    updateBookmarkUI();
  }

  function updateBookmarkUI() {
    const badge = document.getElementById('bookmark-count');
    if (badge) badge.textContent = state.bookmarks.length;
    renderBookmarksList();
  }

  function renderBookmarksList() {
    const listEl = document.getElementById('bookmarks-list');
    if (!listEl) return;

    if (!state.bookmarks.length) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i class="fa-regular fa-bookmark" style="font-size: 2.5rem; margin-bottom: 1rem; display: block; opacity: 0.5;"></i>
          <p style="font-weight: 600;">Chưa có bài viết nào được lưu</p>
          <p style="font-size: 0.8125rem; margin-top: 0.35rem;">Bấm biểu tượng bookmark tại mỗi bài báo để lưu lại đọc sau bất cứ lúc nào.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = state.bookmarks.map((item) => `
      <div class="bookmark-item" style="display: flex; gap: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-subtle); align-items: center;">
        <div style="flex: 1;">
          <span style="font-size: 0.7rem; font-weight: 700; color: var(--accent-crimson); text-transform: uppercase;">${escapeHtml(item.category || item.source || 'Tin tức')}</span>
          <h5 style="font-size: 0.85rem; font-weight: 600; line-height: 1.35; margin: 0.2rem 0; cursor: pointer;" onclick="window.VNEWS.openReaderById('${item.id}'); window.VNEWS.closeBookmarksDrawer();">${escapeHtml(item.title)}</h5>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(item.publishedAt || 'Vừa xong')}</span>
        </div>
        <button onclick="window.VNEWS.toggleBookmarkById('${item.id}')" style="color: var(--text-muted); padding: 0.4rem; border:none; background:transparent; cursor:pointer;" title="Xóa">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  }

  // ==========================================================================
  // 9. Interactive Audio Player
  // ==========================================================================
  function initAudioPlayer() {
    const playBtn = document.getElementById('audio-play-toggle');
    const container = document.getElementById('audio-highlight-bar');
    const timeDisplay = document.getElementById('audio-time-display');
    if (!playBtn) return;

    playBtn.addEventListener('click', () => {
      state.isAudioPlaying = !state.isAudioPlaying;
      if (state.isAudioPlaying) {
        container?.classList.add('audio-playing');
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        showToast('Đang phát bản tin tóm tắt 60s...');

        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const headlines = state.articles.slice(0, 3).map((a) => a.title).join('. ');
          const text = `Đây là bản tin âm thanh nhanh của VNews 24 Giờ. Các tiêu điểm nóng nhất hôm nay: ${headlines || 'Chào mừng quý độc giả đến với thời báo tri thức số.'}`;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'vi-VN';
          utterance.rate = 1.0;
          utterance.onend = stopAudio;
          window.speechSynthesis.speak(utterance);
        }

        state.audioInterval = setInterval(() => {
          state.audioSeconds++;
          const mins = Math.floor(state.audioSeconds / 60).toString().padStart(2, '0');
          const secs = (state.audioSeconds % 60).toString().padStart(2, '0');
          if (timeDisplay) timeDisplay.textContent = `${mins}:${secs} / 01:00`;
          if (state.audioSeconds >= 60) stopAudio();
        }, 1000);
      } else {
        stopAudio();
      }
    });

    function stopAudio() {
      state.isAudioPlaying = false;
      container?.classList.remove('audio-playing');
      playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      if (state.audioInterval) clearInterval(state.audioInterval);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  }

  // ==========================================================================
  // 10. Poll & Newsletter Widgets
  // ==========================================================================
  function initPollWidget() {
    const pollContainer = document.getElementById('poll-widget');
    if (!pollContainer) return;

    const buttons = pollContainer.querySelectorAll('.poll-btn');
    let hasVoted = false;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (hasVoted) {
          showToast('Bạn đã tham gia biểu quyết cho khảo sát này!');
          return;
        }
        hasVoted = true;

        const votes = [64, 26, 10];
        buttons.forEach((b, idx) => {
          const bar = b.querySelector('.poll-bar');
          const percentSpan = b.querySelector('.poll-percent');
          if (bar) bar.style.width = `${votes[idx]}%`;
          if (percentSpan) {
            percentSpan.textContent = `${votes[idx]}%`;
            percentSpan.style.display = 'inline';
          }
        });

        showToast('Cảm ơn bạn đã tham gia khảo sát của Thời Báo!');
      });
    });
  }

  function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input?.value) {
        showToast(`Đã đăng ký nhận bản tin thành công: ${input.value}`);
        input.value = '';
      }
    });
  }

  // ==========================================================================
  // 11. Quick Search Filter
  // ==========================================================================
  function initSearch() {
    const searchInput = document.getElementById('quick-search-input');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const keyword = searchInput.value.trim().toLowerCase();
        if (!keyword) return;

        const matched = state.articles.find((item) =>
          item.title.toLowerCase().includes(keyword) ||
          item.sapo?.toLowerCase().includes(keyword)
        );

        if (matched) {
          openReaderModal(matched);
          showToast(`Tìm thấy bài viết: "${matched.title.slice(0, 40)}..."`);
        } else {
          showToast(`Không tìm thấy bài báo nào khớp với "${keyword}"`);
        }
      }
    });
  }

  // ==========================================================================
  // 12. Global Public Interface (VNEWS namespace)
  // ==========================================================================
  window.VNEWS = {
    openReaderById: (id) => openReaderModalById(id),
    closeReader: () => closeReaderModal(),
    toggleBookmarkById: (id) => {
      const art = state.articlesMap.get(id) || state.bookmarks.find((b) => b.id === id);
      if (art) toggleBookmark(art);
    },
    closeBookmarksDrawer: () => closeBookmarksDrawer(),
    playTTS: () => playModalTTS(),
    showToast: (msg) => showToast(msg)
  };

  // Backwards compatibility for existing inline HTML buttons
  window.openReaderModalById = window.VNEWS.openReaderById;
  window.closeReaderModal = window.VNEWS.closeReader;
  window.toggleBookmark = (art) => toggleBookmark(art);
  window.playModalTTS = window.VNEWS.playTTS;
  window.showToast = window.VNEWS.showToast;

})();
