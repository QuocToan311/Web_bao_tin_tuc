/* ==========================================================================
   VNEWS 24H - Database Mẫu Dữ Liệu Bài Báo
   ========================================================================== */

const NEWS_DATA = {
  // Tin chạy trên Breaking Ticker
  breakingNews: [
    "Hội nghị Thượng đỉnh Trí tuệ Nhân tạo Toàn cầu 2026 chính thức khai mạc với cam kết an toàn AI đa quốc gia",
    "Chỉ số VN-Index vượt mốc 1.288 điểm nhờ lực cầu mạnh mẽ từ nhóm cổ phiếu công nghệ và tài chính",
    "Việt Nam đẩy mạnh quy hoạch điện VIII, khánh thành thêm 2 dự án điện gió ngoài khơi lớn nhất Đông Nam Á",
    "Đội tuyển bóng đá quốc gia giành chiến thắng kịch tính 3-2 trong trận chung kết kịch tính",
    "Văn hóa cà phê đặc sản Việt Nam được vinh danh trong top trải nghiệm ẩm thực hàng đầu thế giới 2026"
  ],

  // Tin tiêu điểm đặc biệt (Super Hero)
  mainHero: {
    id: "hero-01",
    category: "Công nghệ & AI",
    categoryTag: "TIÊU ĐIỂM TOÀN CẦU",
    categoryClass: "red",
    title: "Khai mạc Hội nghị Thượng đỉnh AI Toàn cầu 2026: Định hình Kỷ nguyên Siêu Trí tuệ và Chuẩn mực Đạo đức Mới",
    sapo: "Hơn 5.000 chuyên gia công nghệ, các nhà khoa học hàng đầu và đại diện từ 60 quốc gia đã hội tụ để thống nhất bộ khung pháp lý quốc tế đầu tiên về kiểm soát rủi ro AI và mở rộng ứng dụng trí tuệ nhân tạo trong y tế, năng lượng sạch.",
    image: "assets/images/hero.jpg",
    imageCaption: "Toàn cảnh phiên khai mạc Hội nghị Thượng đỉnh Trí tuệ Nhân tạo Toàn cầu với sự tham gia của các chuyên gia đầu ngành.",
    author: {
      name: "TS. Nguyễn Minh Triết",
      title: "Chuyên gia Phân tích Công nghệ Số",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    publishedAt: "16:15 Hôm nay",
    readTime: "5 phút đọc",
    views: "28.4K",
    audioText: "Chào mừng quý thính giả đến với bản tin VNews 24 giờ. Hôm nay, Hội nghị Thượng đỉnh Trí tuệ Nhân tạo Toàn cầu 2026 đã chính thức khai mạc với sự tham gia của hơn năm nghìn chuyên gia quốc tế nhằm thiết lập chuẩn mực an toàn mới cho kỷ nguyên AI.",
    content: `
      <p>Tại phiên khai mạc sáng nay, các nhà lãnh đạo công nghệ toàn cầu đã nhấn mạnh tầm quan trọng sống còn của việc cân bằng giữa tốc độ đổi mới sáng tạo và cơ chế bảo vệ an toàn cho nhân loại. Khi các mô hình nền tảng AI thế hệ mới đạt năng lực suy luận vượt bậc, vấn đề an ninh thông tin và độ tin cậy của thuật toán trở thành ưu tiên số một của mọi chính phủ.</p>
      
      <p>Việt Nam đã mang tới hội nghị bản dự thảo chiến lược phát triển hạ tầng tính toán quốc gia và trung tâm dữ liệu xanh, nhận được sự đánh giá cao từ các đối tác Liên minh châu Âu và Nhật Bản. Trọng tâm của chiến lược là đào tạo 100.000 kỹ sư vi mạch và trí tuệ nhân tạo chất lượng cao đến năm 2030.</p>
      
      <blockquote style="border-left: 4px solid var(--accent-crimson); padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: var(--text-secondary); font-size: 1.1rem;">
        "Trí tuệ nhân tạo không sinh ra để thay thế con người, mà để nhân đôi tiềm năng sáng tạo và giải phóng sức lao động nếu chúng ta đặt đúng ranh giới đạo đức."
      </blockquote>
      
      <p>Hội nghị dự kiến kéo dài trong 3 ngày với hơn 40 phiên thảo luận chuyên sâu về ứng dụng AI trong chẩn đoán y khoa sớm, tối ưu hóa lưới điện thông minh và phòng chống tội phạm mạng xuyên biên giới.</p>
    `,
    comments: [
      { id: 1, user: "Độc giả Hoàng Long", time: "15 phút trước", text: "Bài viết phân tích rất chuẩn xác. Việt Nam đón đầu làn sóng AI và bán dẫn là hướng đi mang tính bước ngoặt chiến lược!" },
      { id: 2, user: "Kỹ sư Trần Anh", time: "30 phút trước", text: "Mong chờ các chính sách cụ thể hơn về hạ tầng siêu máy tính cho các startup trong nước." }
    ]
  },

  // 2 bài phụ ở cột trái Hero
  subHeroes: [
    {
      id: "sub-01",
      category: "Kinh doanh",
      categoryClass: "blue",
      title: "Phố Wall và Thị trường Châu Á Đồng Loạt Khởi Sắc Sau Tín Hiệu Lãi Suất Mới",
      sapo: "Dòng vốn ngoại tiếp tục quay lại các thị trường mới nổi khi kỳ vọng phục hồi kinh tế nửa cuối năm gia tăng mạnh mẽ.",
      image: "assets/images/business.jpg",
      publishedAt: "15:40",
      readTime: "3 phút đọc",
      views: "14.2K",
      author: { name: "Bảo Ngọc", title: "Phóng viên Tài chính" },
      content: "<p>Thị trường chứng khoán chứng kiến phiên giao dịch sôi động với thanh khoản toàn sàn tăng hơn 35% so với mức trung bình 20 phiên. Cổ phiếu ngành công nghệ, bán dẫn và năng lượng tái tạo là đầu kéo chính cho sự tăng điểm ấn tượng.</p>"
    },
    {
      id: "sub-02",
      category: "Năng lượng Xanh",
      categoryClass: "gold",
      title: "Đại Dự Án Điện Gió Ngoài Khơi Hòa Lưới Điện Quốc Gia: Bước Tiến Vượt Bậc Về Net-Zero",
      sapo: "Cánh đồng quạt gió quy mô 1.200 MW ngoài khơi miền Trung chính thức phát điện thương mại giai đoạn 1, cung cấp điện sạch cho 800.000 hộ dân.",
      image: "assets/images/green_tech.jpg",
      publishedAt: "14:20",
      readTime: "4 phút đọc",
      views: "18.7K",
      author: { name: "Lê Quốc Toàn", title: "Biên tập viên Môi trường" },
      content: "<p>Dự án điện gió ngoài khơi không chỉ giải bài toán an ninh năng lượng cho vùng kinh tế trọng điểm mà còn khẳng định cam kết đạt mức phát thải ròng bằng 0 của Việt Nam vào năm 2050.</p>"
    }
  ],

  // Dòng tin mới nhất theo phút (Cột phải Hero)
  latestFeed: [
    { id: "feed-1", time: "16:45", title: "Bộ Giao thông Vận tải thông tin tiến độ dự án đường sắt tốc độ cao Bắc - Nam" },
    { id: "feed-2", time: "16:30", title: "Giá vàng trong nước giữ vững mốc 89,5 triệu đồng/lượng sau nhịp biến động" },
    { id: "feed-3", time: "16:15", title: "Chung kết Champions League: Chiến thuật nào sẽ giúp đội bóng xưng vương?" },
    { id: "feed-4", time: "15:55", title: "Khám phá phong vị cà phê rang mộc Thủ đô qua con mắt của du khách quốc tế" },
    { id: "feed-5", time: "15:35", title: "Chuyên gia an ninh mạng cảnh báo thủ đoạn lừa đảo giả mạo mã QR mới" },
    { id: "feed-6", time: "15:10", title: "Xuất khẩu thủy sản quý 3 tăng trưởng hai con số tại thị trường Mỹ và EU" }
  ],

  // Các bài viết danh mục Kinh doanh & Đổi mới sáng tạo
  businessNews: [
    {
      id: "biz-01",
      category: "Kinh doanh",
      categoryClass: "blue",
      title: "Chuyển Đổi Số Trong Ngành Ngân Hàng: Khi Thanh Toán Không Chạm Trở Thành Lựa Chọn Thống Trị",
      sapo: "Tỷ lệ giao dịch trực tuyến qua mã QR và ví điện tử đạt mức kỷ lục 82%, định hình lại hành vi chi tiêu của người tiêu dùng.",
      image: "assets/images/business.jpg",
      author: { name: "Nguyễn Văn Hưng" },
      publishedAt: "13:45",
      readTime: "4 phút đọc",
      views: "11.1K"
    },
    {
      id: "biz-02",
      category: "Khoa học & Môi trường",
      categoryClass: "gold",
      title: "Pin Thế Hệ Mới Đột Phá: Sạc Đầy Xe Điện Chỉ Trong 10 Phút Với Độ Bền 1 Triệu Km",
      sapo: "Công nghệ pin thể rắn vừa được thương mại hóa thành công, giải quyết triệt để nỗi lo ngại về quãng đường của người dùng xe điện toàn cầu.",
      image: "assets/images/green_tech.jpg",
      author: { name: "Trịnh Thùy Linh" },
      publishedAt: "12:10",
      readTime: "5 phút đọc",
      views: "16.8K"
    },
    {
      id: "biz-03",
      category: "Thể thao Đỉnh cao",
      categoryClass: "red",
      title: "Bàn Thắng Vàng Phút Bù Giờ Thứ 94 Đưa Đội Tuyển Vào Lịch Sử Vòng Loại Thế Giới",
      sapo: "Màn lội ngược dòng ngoạn mục đầy cảm xúc làm nức lòng hàng triệu người hâm mộ sau 120 phút nghẹt thở trên sân vận động Mỹ Đình.",
      image: "assets/images/sports.jpg",
      author: { name: "Vũ Hải Đăng" },
      publishedAt: "11:30",
      readTime: "3 phút đọc",
      views: "34.5K"
    }
  ],

  // Bài E-Magazine Đặc Biệt (Longform)
  eMagazine: {
    id: "emag-01",
    tag: "E-MAGAZINE ĐẶC BIỆT #42",
    title: "Cà Phê Hà Nội: Nhịp Sống Chậm Rãi Giữa Kỷ Nguyên Số Hóa Tốc Độ Cao",
    sapo: "Giữa những tòa cao ốc bằng kính và tiếng thông báo không ngừng của điện thoại thông minh, những quán cà phê góc phố cổ vẫn giữ trọn linh hồn của sự kết nối chân thật giữa người với người.",
    image: "assets/images/lifestyle.jpg",
    author: { name: "Ký sự của Chu Đình Ngạn", title: "Nhà nghiên cứu Văn hóa Đô thị" },
    readTime: "8 phút đọc trải nghiệm",
    views: "45.2K"
  },

  // Góc nhìn chuyên gia (Opinions / Columnists)
  opinions: [
    {
      id: "op-01",
      quote: "Đừng sợ AI cướp đi công việc của bạn, hãy lo ngại nếu bản thân từ chối học cách làm việc cùng với AI mỗi ngày.",
      author: "GS. Đặng Minh Tuấn",
      role: "Viện trưởng Viện Nghiên cứu Đổi mới Sáng tạo",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      time: "Hôm nay, 10:15"
    },
    {
      id: "op-02",
      quote: "Năng lượng xanh không còn là trách nhiệm xã hội đơn thuần, đó là tấm vé thông hành bắt buộc để hàng hóa Việt bước ra biển lớn.",
      author: "Bà Phạm Thanh Hà",
      role: "Chuyên gia Kinh tế & Phát triển Bền vững",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
      time: "Hôm qua, 17:30"
    }
  ],

  // Danh sách đọc nhiều nhất (Trending Top 5)
  trendingTop: [
    { id: "top-1", rank: 1, title: "Lễ hội trình diễn ánh sáng bằng 2.026 drone thắp sáng bầu trời hồ Tây cuối tuần này", views: "82K lượt xem" },
    { id: "top-2", rank: 2, title: "Hội nghị Thượng đỉnh AI 2026: Đột phá lớn nhất về chuẩn an toàn quốc tế", views: "65K lượt xem" },
    { id: "top-3", rank: 3, title: "Giá vàng SJC biến động mạnh: Khuyến nghị quan trọng cho nhà đầu tư cá nhân", views: "53K lượt xem" },
    { id: "top-4", rank: 4, title: "Đường sắt cao tốc 350 km/h: Hành trình đưa kinh tế cất cánh", views: "41K lượt xem" },
    { id: "top-5", rank: 5, title: "Top 10 quán cà phê đẹp tĩnh lặng thích hợp làm việc tại Hà Nội và TP.HCM", views: "38K lượt xem" }
  ]
};
