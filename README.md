# VNEWS 24H - BÁO ĐIỆN TỬ TRI THỨC & CÔNG NGHỆ SỐ

Trang web báo tin tức điện tử hiện đại, tối ưu SEO, hỗ trợ đa phương tiện, giao diện chuẩn báo chí cao cấp (Editorial Design), tích hợp đầy đủ các tính năng độc giả tương tác và khả năng đọc báo bằng giọng nói AI.

---

## 🌟 Các Tính Năng Đã Hiện Thực

### 1. Phân Hệ Độc Giả & Giao Diện Trang Chủ (Client UI)
* **Thanh tiện ích đầu trang (Top Bar):**
  * Lịch và đồng hồ thời gian thực (Hà Nội, giờ:phút:giây).
  * Tiện ích thời tiết theo khu vực.
  * Chỉ số thị trường cập nhật (VN-Index, Vàng miếng SJC, Tỷ giá USD).
  * Nút chuyển đổi giao diện **Chế độ Sáng / Tối (Dark / Light Mode)** với lưu trữ trạng thái tự động (`localStorage`).
  * Nút xem danh sách bài viết đã lưu để đọc sau (**Bookmarks Drawer**).
* **Masthead & Nhận diện thương hiệu:**
  * Logo thương hiệu báo chí nổi bật với khẩu hiệu tòa soạn.
  * Thanh tìm kiếm thông minh (Live Search Filter) lọc tức thì theo từ khóa.
  * Đường dây nóng Tòa soạn (Hotline 24/7).
* **Thanh điều hướng dính (Sticky Mega-Nav):**
  * Danh mục chuyên môn: Thời sự, Kinh doanh, Công nghệ AI, Năng lượng Xanh, Thể thao, E-Magazine, Góc nhìn, Đời sống.
  * Nút hành động nhanh: **Nghe Tin Nhanh 60s**.
* **Dòng tin nóng chạy tự động (Breaking News Ticker):**
  * Tự động chuyển đổi tin khẩn mỗi 4.5 giây với hiệu ứng mượt mà, có nút chuyển tiếp/lùi và tự dừng khi rê chuột.
* **Bản tin Âm thanh Tóm tắt 60s (Smart AI Audio Bar):**
  * Trình phát âm thanh mini tích hợp visualizer sóng âm động (CSS Sound Wave) và đọc bản tin ngắn qua giọng AI.
* **Bố cục Tiêu điểm 3 Cột (Hero Section 3-Column Grid):**
  * *Cột trái:* 2 bài tiêu điểm phụ với hình ảnh sắc nét, phân loại chuyên mục và thời gian đăng.
  * *Cột giữa:* Tin tiêu điểm đặc biệt (Super Hero) với ảnh khổ lớn chất lượng cao, tiêu đề sang trọng, sapo và thông tin tác giả.
  * *Cột phải:* **Dòng sự kiện 24/7** cập nhật tin vắn theo từng phút với chấm xanh trạng thái trực tiếp.
* **Chuyên mục Kinh Doanh & Công Nghệ:**
  * Lưới bài viết dạng Magazine Card có gắn nhãn phân loại, lượt xem, thời gian đọc và nút lưu nhanh.
* **Chuyên đề Đa Phương Tiện E-Magazine (Longform Special):**
  * Thiết kế tràn viền nghệ thuật, nền ảnh phủ gradient điện ảnh và typography chuẩn tạp chí.
* **Góc Nhìn & Đối Thoại (Editorial Columnists):**
  * Thẻ trích dẫn ý kiến nổi bật của các chuyên gia đầu ngành kèm avatar và học vị.
* **Sidebar Tương Tác Cao (High-Engagement Sidebar):**
  * **Top 5 Đọc Nhiều Nhất 24h:** Xếp hạng với số thứ tự lớn cách điệu.
  * **Bảng Giá Thị Trường:** Tỷ giá ngoại tệ, giá vàng, dầu thô và chứng khoán.
  * **Khảo Sát Độc Giả (Interactive Poll):** Độc giả biểu quyết trực tiếp, hệ thống tự động tính toán và hiển thị thanh tỷ lệ phần trăm động.
  * **Hộp Đăng Ký Bản Tin Sáng (Newsletter Subscription):** Form nhập email kèm thông báo toast xác nhận.

### 2. Trình Xem Bài Viết Nhanh & Bình Luận Thời Gian Thực (Reader Modal)
* Bấm vào bất kỳ bài báo nào trên trang để mở cửa sổ đọc chuyên sâu.
* Hỗ trợ tăng/giảm kích thước chữ (`A+` / `A-`) cho người lớn tuổi hoặc đọc ban đêm.
* Tính năng **Nghe AI đọc** bài viết sử dụng Web Speech API tiếng Việt.
* Đầy đủ hình ảnh phóng to, chú thích ảnh, nội dung phân đoạn và trích dẫn.
* **Khu vực bình luận:** Bạn đọc có thể nhập tên và gửi ý kiến đóng góp, bài bình luận xuất hiện ngay lập tức trên trang.

---

## 🚀 Hướng Dẫn Chạy & Trải Nghiệm Cục Bộ

1. Mở cửa sổ dòng lệnh tại thư mục dự án:
   ```bash
   cd d:\study\Web_bao_tin_tuc
   ```
2. Chạy máy chủ tĩnh cục bộ bằng Node.js:
   ```bash
   node server.js
   ```
3. Mở trình duyệt và truy cập:
   ```
   http://localhost:3000
   ```
*(Hoặc bạn có thể click đúp trực tiếp vào tệp `index.html` trong File Explorer để xem trực tiếp).*

---

## 📁 Cấu Trúc Mã Nguồn

```
Web_bao_tin_tuc/
├── index.html            # Khung sườn HTML5 chuẩn SEO & Semantic
├── server.js             # Máy chủ tĩnh Node.js phục vụ kiểm thử cục bộ
├── css/
│   └── style.css         # Hệ thống thiết kế (Tokens, Dark/Light, Layout, Animations)
├── js/
│   ├── data.js           # Cơ sở dữ liệu mẫu: bài viết, chuyên mục, bình luận, ticker
│   └── app.js            # Toàn bộ logic tương tác (Theme, Bookmark, Audio, Modal, Poll)
└── assets/
    └── images/           # Ảnh báo chí chuẩn phân giải cao
        ├── hero.jpg          (Hội nghị Thượng đỉnh AI Toàn cầu)
        ├── business.jpg      (Thị trường tài chính & Phố Wall)
        ├── green_tech.jpg    (Năng lượng gió & mặt trời ngoài khơi)
        ├── sports.jpg        (Trận chung kết bóng đá đỉnh cao)
        └── lifestyle.jpg     (Không gian văn hóa cà phê Hà Nội)
```
