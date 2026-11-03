# VNEWS 24H - BÁO ĐIỆN TỬ TRI THỨC & CÔNG NGHỆ SỐ

Trang web báo tin tức điện tử hiện đại, tối ưu SEO, hỗ trợ đa phương tiện, giao diện chuẩn báo chí cao cấp (Editorial Design), tích hợp đầy đủ hệ thống **xử lý RSS đa nguồn, bóc tách XML thời gian thực, tự động crawl bài viết toàn văn** và đọc báo bằng giọng nói AI.

---

## 🌟 Các Tính Năng Đã Hiện Thực

### 1. Phân Hệ Xử Lý RSS Đa Nguồn & Bóc Tách XML Thời Gian Thực
* **Hỗ trợ 4 nguồn báo chí hàng đầu Việt Nam:**
  * **VnExpress** (Tin mới nhất, Thời sự, Kinh doanh, Khoa học công nghệ, Thể thao, Giải trí, Đời sống).
  * **Tuổi Trẻ** (Tin mới nhất, Thời sự, Kinh doanh, Nhịp sống số, Thể thao, Giải trí, Văn hóa).
  * **Thanh Niên** (Trang chủ, Thời sự, Kinh tế, Công nghệ, Thể thao, Giải trí, Đời sống).
  * **Dân Trí** (Trang chủ, Xã hội, Kinh doanh, Sức mạnh số, Thể thao, Giải trí, Đời sống).
* **Bộ Phân Tích XML (Balanced Tag & CDATA Parser):**
  * Tự động bóc tách Title, Link, Description, Sapo, Enclosure image, PubDate.
  * Lọc ảnh chất lượng cao và làm sạch mã HTML thừa.
* **Bộ Đệm Dữ Liệu Bộ Nhớ (In-Memory Cache với TTL):**
  * Cache luồng tin RSS 5 phút giúp website phản hồi siêu tốc (< 15ms) và không bị nguồn báo chặn IP.
  * Cache bài viết chi tiết crawl được 30 phút.
* **Chuyển Đổi Nguồn & Chuyên Mục Linh Hoạt:**
  * Dropdown chọn nguồn báo ngay tại Top Bar và thanh điều hướng danh mục không cần reload trang.
  * Nút làm mới tức thì (`Refresh`) kèm hiệu ứng xoay icon.
  * Tự động làm mới ngầm (Auto-polling) mỗi 5 phút.

### 2. Bộ Tự Động Crawl Bài Viết Toàn Văn (Full Article Crawler)
* Khi độc giả bấm vào bất kỳ bài báo nào trên trang:
  * Trình duyệt gọi Endpoint `/api/article?url=...`.
  * Server tự động tải trang HTML bài viết gốc, bóc tách Tiêu đề, Sapo, Tác giả, Thời gian đăng, và **toàn văn nội dung bài báo** (bao gồm toàn bộ các đoạn văn `<p>`, hình ảnh sắc nét `<img>` kèm chú thích `<figcaption>`).
  * Loại bỏ hoàn toàn mã độc, script, quảng cáo, tracking và banner phiền toái.
  * Hiển thị bài viết sạch đẹp trong **Reader Modal** và cung cấp nút mở bài gốc tại tòa soạn.

### 3. Đổ Dữ Liệu RSS Lên Toàn Bộ Giao Diện (Data Binding)
* **Breaking News Ticker:** Tự động lấy 8 tin nóng nhất từ luồng RSS đang chọn để chạy dòng chữ khẩn cấp.
* **Bố cục Hero 3 Cột Tiêu Điểm:**
  * *Tâm điểm (Super Hero):* Bài viết đầu bảng với ảnh lớn, tiêu đề sang trọng, sapo và nhãn nguồn tin.
  * *Cột trái (Sub-Heroes):* 2 bài tiêu điểm kế tiếp với nhãn màu chuyên mục.
  * *Cột phải (Dòng sự kiện 24/7):* 6 bài viết mới nhất cập nhật theo mốc thời gian giờ:phút.
* **Lưới Bài Viết Chuyên Mục (Magazine Grid):** Hiển thị danh sách các bài viết tiếp theo dạng thẻ bài báo cao cấp kèm nút Bookmark đọc sau.
* **Sidebar Top Đọc Nhiều:** Top 5 bài viết nổi bật được xếp thứ tự trực quan.
* **Skeleton Loading Shimmer:** Hiệu ứng khung xám ánh sáng lượn sóng trong lúc đang tải dữ liệu RSS.

### 4. Tiện Ích Độc Giả & Đọc Báo Bằng Giọng Nói AI
* **AI Text-To-Speech (Báo Nói Thông Minh):**
  * Nghe đọc to toàn bộ nội dung bài viết vừa crawl được bằng giọng tiếng Việt chuẩn.
  * Thanh nghe tin nhanh 60s tích hợp visualizer sóng âm động (CSS Sound Wave).
* **Quản Lý Bài Viết Đọc Sau (Bookmarks Drawer):** Lưu bài viết vào `localStorage`, xem lại và xóa bất cứ lúc nào.
* **Chế Độ Sáng / Tối (Dark & Light Theme):** Chuyển đổi giao diện tức thì với màu sắc êm dịu cho mắt khi đọc đêm.
* **Tùy Chỉnh Cỡ Chữ (A+ / A-):** Tăng giảm kích thước chữ trong cửa sổ đọc bài.
* **Tìm Kiếm Nhanh (Live Search Filter):** Nhập từ khóa và nhấn Enter để tìm kiếm tức thì trên danh sách tin tức.
* **Thăm Dò Ý Kiến Độc Giả (Interactive Poll):** Biểu quyết trực tiếp và cập nhật thanh phần trăm tức thì.

---

## 🚀 Hướng Dẫn Chạy & Trải Nghiệm Cục Bộ

1. Mở cửa sổ dòng lệnh tại thư mục dự án:
   ```bash
   cd d:\study\Web_bao_tin_tuc
   ```
2. Chạy máy chủ tĩnh & API Server:
   ```bash
   node server.js
   ```
3. Mở trình duyệt và truy cập:
   ```
   http://localhost:3000
   ```

### 📡 Danh Sách API Endpoints Cung Cấp
* **Lấy danh sách tin RSS:**
  `GET http://localhost:3000/api/rss?source=vnexpress&category=home`
  *(Hỗ trợ `source`: vnexpress, tuoitre, thanhnien, dantri | `category`: home, thoisu, kinhdoanh, congnghe, thethao, giaitri, doisong)*
* **Crawl toàn văn bài viết:**
  `GET http://localhost:3000/api/article?url=https://vnexpress.net/...`
* **Danh sách nguồn báo & chuyên mục:**
  `GET http://localhost:3000/api/sources`

---

## 📁 Cấu Trúc Mã Nguồn

```
Web_bao_tin_tuc/
├── index.html            # Khung sườn HTML5 chuẩn SEO & Semantic (Containers động)
├── server.js             # Máy chủ Node.js (RSS Proxy, XML Parser, In-Memory Cache & Web Crawler)
├── css/
   └── style.css         # Hệ thống thiết kế (Tokens, Dark/Light, Layout, Skeletons, Animations)
├── js/
   ├── data.js           # Cơ sở dữ liệu dự phòng (Offline fallback)
   └── app.js            # Core App (RSS Data Binding, Crawler Loader, Theme, Bookmark, Audio, Modal)
└── assets/
    └── images/           # Ảnh báo chí chuẩn phân giải cao
        ├── hero.jpg
        ├── business.jpg
        ├── green_tech.jpg
        ├── sports.jpg
        └── lifestyle.jpg
```
