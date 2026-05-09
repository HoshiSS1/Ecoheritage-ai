export interface HeritageLocation {
  id: string;
  name: string;
  address: string;
  position: [number, number];
  status: string;
  level: string;
  herbs: string[];
  regulations: string;
  type: string;
  color: string;
  image: string;
  aqi: number;
  humidity: number;
  medicinalPower: string;
  rating: number;
  folkTip: string;
  reviews: number;
  description: string;
  history: string;
  bestTime: string;
  contact: string;
  comments: { user: string, text: string, rating: number }[];
}

export const HERITAGE_LOCATIONS: HeritageLocation[] = [
  {
    id: 'loc-1',
    name: 'Khu Bảo Tồn Thiên Nhiên Sơn Trà',
    address: 'Đường Yết Kiêu, Phường Thọ Quang, Quận Sơn Trà, TP. Đà Nẵng',
    position: [16.121, 108.278],
    status: '🔴 Cấm hái',
    level: 'Cấp Quốc Gia',
    herbs: ['Chè Dây', 'Kim Ngân Hoa', 'Thiên Môn Đông', 'Ba Kích', 'Hoàng Liên'],
    regulations: 'Nghiêm cấm ngắt lá, bẻ cành; chỉ dành cho tham quan và nghiên cứu.',
    type: 'Khu bảo tồn',
    color: '#10b981',
    image: '/images/map/khu_bao_ton_thien_nhien_son_tra.jpg',
    aqi: 22,
    humidity: 85,
    medicinalPower: 'Cực đại',
    rating: 4.9,
    folkTip: 'Chè dây hái trên đỉnh đỉnh Sơn Trà lúc bình minh có hoạt tính chữa dạ dày tốt nhất.',
    reviews: 1240,
    description: 'Sơn Trà là "lá phổi xanh" của Đà Nẵng, nơi hội tụ hệ sinh thái rừng tự nhiên gắn liền với biển duy nhất tại Việt Nam. Đây là kho tàng dược liệu khổng lồ với hơn 100 loài cây thuốc quý.',
    history: 'Được bảo vệ nghiêm ngặt từ những năm 1970, Sơn Trà đóng vai trò chiến lược trong bảo tồn đa dạng sinh học và an ninh quốc phòng.',
    bestTime: '05:00 - 09:00 sáng',
    contact: 'Ban Quản lý Bán đảo Sơn Trà - 0236 3920 497',
    comments: [
      { user: 'Thanh Hằng', text: 'Không khí cực kỳ trong lành, nhiều loại cây thuốc quý hiếm.', rating: 5 },
      { user: 'Minh Tuấn', text: 'Đường lên hơi dốc nhưng cảnh quan và đa dạng sinh học rất đáng giá.', rating: 4 }
    ]
  },
  {
    id: 'loc-2',
    name: 'Làng Nghề Thuốc Nam Túy Loan',
    address: 'Quốc lộ 14B, Xã Hòa Phong, Huyện Hòa Vang, TP. Đà Nẵng',
    position: [15.992, 108.154],
    status: '🟢 Cho phép',
    level: 'Di sản Văn hóa',
    herbs: ['Cây Cỏ Máu', 'Xuyên Tâm Liên', 'Lá Lốt', 'Kinh Giới', 'Tía Tô', 'Đinh Lăng'],
    regulations: 'Được phép khai thác dưới sự hướng dẫn của hộ dân địa phương.',
    type: 'Làng nghề',
    color: '#ec4899',
    image: '/images/map/Lang-co-Tuy-Loan-duoc-lieu.jpg',
    aqi: 35,
    humidity: 78,
    medicinalPower: 'Ổn định',
    rating: 4.7,
    folkTip: 'Cây Cỏ Máu tại đây thường được dùng để nấu nước tắm cho phụ nữ sau sinh.',
    reviews: 850,
    description: 'Túy Loan là ngôi làng cổ hơn 500 năm tuổi, nổi tiếng với nghề trồng và chế biến thuốc nam gia truyền. Các bài thuốc tại đây chủ yếu phục vụ chăm sóc sức khỏe cộng đồng.',
    history: 'Làng nghề hình thành từ thời vua Lê Thánh Tông mở cõi về phía Nam, lưu giữ những bí quyết bốc thuốc nam độc đáo của người Việt cổ.',
    bestTime: 'Tháng 3 - Tháng 8 (Mùa thu hoạch)',
    contact: 'UBND Xã Hòa Phong - 0236 3846 112',
    comments: [
      { user: 'Bà Sáu', text: 'Người dân ở đây rất nhiệt tình hướng dẫn cách hái thuốc.', rating: 5 },
      { user: 'Hoàng Nam', text: 'Làng cổ yên bình, thuốc nam chất lượng tốt.', rating: 4 }
    ]
  },
  {
    id: 'loc-3',
    name: 'Trạm Dược Liệu Ngũ Hành Sơn',
    address: '81 Huyền Trân Công Chúa, Phường Hòa Hải, Quận Ngũ Hành Sơn, TP. Đà Nẵng',
    position: [16.002, 108.263],
    status: '🔴 Cấm hái',
    level: 'Cấp Quốc Gia',
    herbs: ['Sâm Cau', 'Chùm Ngây', 'Cây Độc Lực', 'Ngải Cứu', 'Xạ Đen'],
    regulations: 'Khu vực di tích quốc gia; vui lòng không xâm phạm thảm thực vật tự nhiên.',
    type: 'Khu bảo tồn',
    color: '#10b981',
    image: '/images/map/tram-duoc-lieu-ngu-hanh-son.jpg',
    aqi: 42,
    humidity: 72,
    medicinalPower: 'Trung bình',
    rating: 4.6,
    folkTip: 'Sâm cau mọc kẽ đá Ngũ Hành có tính dương rất mạnh, chỉ dùng lượng nhỏ.',
    reviews: 2100,
    description: 'Ngũ Hành Sơn không chỉ là danh thắng tâm linh mà còn là nơi trú ngụ của nhiều loài thảo dược mọc trên núi đá vôi đặc hữu, có dược tính khác biệt so với vùng đồng bằng.',
    history: 'Trong các cuộc kháng chiến, đây là "kho thuốc lộ thiên" cứu chữa cho cán bộ, chiến sĩ cách mạng ẩn náu trong các hang động.',
    bestTime: 'Sáng sớm hoặc Chiều mát',
    contact: 'BQL Di tích Ngũ Hành Sơn - 0236 3847 455',
    comments: [
      { user: 'Anh Đức', text: 'Vị trí thuận tiện, nhiều loài thảo mộc mọc tự nhiên trên núi đá.', rating: 4 },
      { user: 'Ngọc Lan', text: 'Khu vực bảo tồn nghiêm ngặt nên thảm thực vật rất xanh tốt.', rating: 5 }
    ]
  },
  {
    id: 'loc-4',
    name: 'Chợ Dược Liệu Thanh Khê',
    address: 'Khu vực Chợ Thanh Khê, Phường Thanh Khê Đông, Quận Thanh Khê, TP. Đà Nẵng',
    position: [16.062, 108.184],
    status: '🟢 Cho phép',
    level: 'Cấp Địa Phương',
    herbs: ['Cam Thảo', 'Kỷ Tử', 'Táo Tàu', 'Nhân Sâm', 'Đương Quy', 'Thục Địa'],
    regulations: 'Giao thương tự do; khuyến khích mua các bài thuốc đã chế biến sẵn.',
    type: 'Chợ dược liệu',
    color: '#ef4444',
    image: '/images/map/cho-duoc-lieu-thanh-khe.jpg',
    aqi: 65,
    humidity: 65,
    medicinalPower: 'Ổn định',
    rating: 4.5,
    folkTip: 'Nên kiểm tra độ khô của dược liệu bằng cách bẻ nhẹ, nếu có tiếng kêu giòn là đạt chuẩn.',
    reviews: 5400,
    description: 'Chợ dược liệu Thanh Khê là đầu mối giao thương thảo dược lớn nhất khu vực miền Trung, nơi quy tụ hàng ngàn loại dược liệu từ khắp mọi miền đất nước và thế giới.',
    history: 'Hình thành tự phát từ nhu cầu trao đổi thảo mộc của ngư dân ven biển, chợ đã phát triển thành trung tâm dược liệu sầm uất qua nhiều thập kỷ.',
    bestTime: '06:00 - 11:00 hàng ngày',
    contact: 'BQL Chợ Thanh Khê - 0236 3711 445',
    comments: [
      { user: 'Chị Mai', text: 'Hàng hóa đa dạng, giá cả hợp lý, nhiều vị thuốc hiếm.', rating: 4 },
      { user: 'Bác Hùng', text: 'Điểm đến tin cậy để mua thuốc nam tại Đà Nẵng.', rating: 5 }
    ]
  },
  {
    id: 'loc-5',
    name: 'Vườn Thảo Mộc Trung Tâm Hải Châu',
    address: 'Phố Đông y Hùng Vương, Phường Hải Châu 1, Quận Hải Châu, TP. Đà Nẵng',
    position: [16.067, 108.221],
    status: '🔴 Cấm hái',
    level: 'Cấp Tỉnh',
    herbs: ['Cát Cánh', 'Đẳng Sâm', 'Bạch Chỉ', 'Phục Linh', 'Cam Thảo'],
    regulations: 'Vườn trưng bày di sản; không tự ý hái mẫu vật khi chưa có sự đồng ý.',
    type: 'Tiệm di sản',
    color: '#f59e0b',
    image: '/images/map/Vườn Thảo Mộc Trung Tâm Hải Châu.png',
    aqi: 48,
    humidity: 70,
    medicinalPower: 'Cao',
    rating: 4.8,
    folkTip: 'Cát cánh phối hợp với cam thảo giúp giảm ho và tiêu đờm cực nhanh.',
    reviews: 320,
    description: 'Một không gian xanh hiếm hoi giữa lòng đô thị, nơi lưu trữ và nhân giống các loài cây thuốc tiêu biểu của vùng duyên hải miền Trung.',
    history: 'Được thiết lập nhằm giáo dục cộng đồng về giá trị của cây thuốc nam và bảo tồn các nguồn gen quý trong môi trường đô thị.',
    bestTime: 'Cả ngày (Tránh giờ trưa nắng)',
    contact: 'Trung tâm Bảo tồn Hải Châu - 0236 3821 334',
    comments: [
      { user: 'Văn Phú', text: 'Vườn thuốc giữa lòng thành phố rất đẹp và bổ ích.', rating: 5 },
      { user: 'Thùy Linh', text: 'Cách trình bày các loại cây thuốc rất khoa học.', rating: 5 }
    ]
  },
  {
    id: 'loc-6',
    name: 'Khu Bảo Tồn Dược Liệu Bà Nà',
    address: 'Vườn Quốc gia Bà Nà - Núi Chúa, Xã Hòa Ninh, Huyện Hòa Vang, TP. Đà Nẵng',
    position: [15.997, 107.998],
    status: '🔴 Cấm hái',
    level: 'Cấp Đặc Biệt',
    herbs: ['Ngũ Gia Bì', 'Đương Quy', 'Lan Kim Tuyến', 'Linh Chi', 'Sâm Ngọc Linh'],
    regulations: 'Rừng đặc dụng bảo vệ nghiêm ngặt; không mang các giống cây ra khỏi khu vực.',
    type: 'Nguồn dược liệu quý',
    color: '#3b82f6',
    image: '/images/map/Khu Bảo Tồn Dược Liệu Bà Nà.jpg',
    aqi: 15,
    humidity: 90,
    medicinalPower: 'Cực đại',
    rating: 5.0,
    folkTip: 'Lan kim tuyến Bà Nà chỉ mọc ở những hốc đá ẩm ướt, có giá trị dược tính cực cao.',
    reviews: 950,
    description: 'Với độ cao hơn 1400m, Bà Nà sở hữu khí hậu ôn đới lý tưởng cho các loài dược liệu cao cấp như Sâm Ngọc Linh, Linh Chi rừng và các loài lan thuốc quý hiếm.',
    history: 'Từ thời Pháp thuộc, Bà Nà đã được khảo sát như một trạm nghỉ dưỡng và vùng cung cấp thảo dược cho giới thượng lưu.',
    bestTime: 'Tháng 4 - Tháng 9',
    contact: 'Vườn Quốc gia Bà Nà - Núi Chúa - 0236 3791 223',
    comments: [
      { user: 'Gia Bảo', text: 'Thật bất ngờ khi thấy được Sâm Ngọc Linh ngoài tự nhiên.', rating: 5 },
      { user: 'Diệu Hương', text: 'Khí hậu ôn đới giúp cây thuốc phát triển rất tốt.', rating: 5 }
    ]
  },
  {
    id: 'loc-7',
    name: 'Vùng Nguyên Liệu Cẩm Lệ',
    address: 'Khu Nông nghiệp sinh thái Hòa Thọ Tây, Quận Cẩm Lệ, TP. Đà Nẵng',
    position: [16.019, 108.206],
    status: '🟢 Cho phép',
    level: 'Cấp Địa Phương',
    herbs: ['Bạc Hà', 'Diếp Cá', 'Ngải Cứu', 'Sả', 'Chanh', 'Húng Quế'],
    regulations: 'Khu vực sản xuất nông nghiệp; liên hệ chủ vườn để thu hái trực tiếp.',
    type: 'Vùng nguyên liệu',
    color: '#8b5cf6',
    image: '/images/map/Vườn Ươm Thảo Mộc Nam Hải Vân.jpg',
    aqi: 52,
    humidity: 75,
    medicinalPower: 'Ổn định',
    rating: 4.3,
    folkTip: 'Ngải cứu hái vào dịp Tết Đoan Ngọ có hoạt chất chữa đau xương khớp tốt nhất.',
    reviews: 670,
    description: 'Vùng đất bồi ven sông Cẩm Lệ cực kỳ màu mỡ, thích hợp cho việc canh tác các loài thảo dược ngắn ngày phục vụ nhu cầu hàng ngày của người dân.',
    history: 'Tiếp nối truyền thống canh tác lúa nước, các hộ dân tại đây đã chuyển đổi sang mô hình trồng dược liệu sạch từ đầu những năm 2000.',
    bestTime: 'Sáng sớm (Để lấy thảo mộc tươi nhất)',
    contact: 'Hợp tác xã Thảo mộc Cẩm Lệ - 0236 3674 112',
    comments: [
      { user: 'Hà My', text: 'Vườn rau thuốc xanh mướt bên bờ sông.', rating: 4 },
      { user: 'Tuấn Anh', text: 'Mua được nhiều loại rau gia vị làm thuốc rất tươi.', rating: 4 }
    ]
  },
  {
    id: 'loc-8',
    name: 'Học Viện Dược Liệu Liên Chiểu',
    address: 'Phân viện Dược liệu, Phường Hòa Khánh Bắc, Quận Liên Chiểu, TP. Đà Nẵng',
    position: [16.085, 108.160],
    status: '🔴 Cấm hái',
    level: 'Cấp Tỉnh',
    herbs: ['Xạ Đen', 'Trinh Nữ Hoàng Cung', 'Hoàn Ngọc', 'Cà Gai Leo'],
    regulations: 'Cơ sở nghiên cứu; yêu cầu bảo vệ nguyên trạng các lô thí nghiệm.',
    type: 'Khu bảo tồn',
    color: '#10b981',
    image: '/images/map/Học Viện Dược Liệu Liên Chiểu.jpg',
    aqi: 58,
    humidity: 68,
    medicinalPower: 'Cao',
    rating: 4.4,
    folkTip: 'Cà gai leo tại đây được nghiên cứu có hàm lượng Glycoalkaloid cao vượt trội.',
    reviews: 120,
    description: 'Trung tâm đào tạo và nghiên cứu chuyên sâu về các loại thảo dược kháng ung thư và hỗ trợ điều trị gan mật nổi tiếng của thành phố.',
    history: 'Tiền thân là trạm thí nghiệm cây thuốc của quân khu, nay trở thành học viện hàng đầu về dược liệu nam tại miền Trung.',
    bestTime: 'Giờ hành chính (Thứ 2 - Thứ 6)',
    contact: 'Văn phòng Học viện - 0236 3842 556',
    comments: [
      { user: 'Sơn Tùng', text: 'Rất nhiều kiến thức bổ ích về dược liệu được chia sẻ ở đây.', rating: 5 },
      { user: 'Minh Phương', text: 'Cơ sở vật chất hiện đại, bảo tồn cây thuốc tốt.', rating: 4 }
    ]
  },
  {
    id: 'loc-9',
    name: 'Vườn Ươm Thảo Mộc Nam Hải Vân',
    address: 'Đường Suối Lương, Phường Hòa Hiệp Bắc, Quận Liên Chiểu, TP. Đà Nẵng',
    position: [16.124, 108.132],
    status: '🟢 Cho phép',
    level: 'Cấp Địa Phương',
    herbs: ['Cây Ba Kích', 'Đinh Lăng', 'Cỏ Ngọt', 'Sâm Bố Chính'],
    regulations: 'Vùng nhân giống; có thể mua cây giống về trồng tại gia.',
    type: 'Vùng nguyên liệu',
    color: '#8b5cf6',
    image: '/images/map/Vườn Ươm Thảo Mộc Nam Hải Vân.jpg',
    aqi: 30,
    humidity: 80,
    medicinalPower: 'Mạnh',
    rating: 4.6,
    folkTip: 'Rễ ba kích sau khi thu hoạch cần rút lõi để loại bỏ độc tính trước khi ngâm rượu.',
    reviews: 430,
    description: 'Vườn ươm quy mô lớn tại cửa ngõ phía Bắc thành phố, cung cấp cây giống dược liệu cho các tỉnh thành lân cận và phục vụ nhu cầu trồng thuốc tại nhà.',
    history: 'Tận dụng địa thế chân núi Hải Vân quanh năm mây phủ, độ ẩm cao, vườn ươm đã duy trì sản lượng cây giống ổn định suốt 20 năm.',
    bestTime: '07:00 - 17:00 hàng ngày',
    contact: 'Chủ vườn Mr. Nam - 0905 123 456',
    comments: [
      { user: 'Bác Ba', text: 'Cây giống ở đây rất khỏe, tôi đã mua về trồng thành công.', rating: 5 },
      { user: 'Nguyễn Kiên', text: 'Vị trí dưới chân đèo rất thơ mộng, vườn thuốc quy mô.', rating: 4 }
    ]
  },
  {
    id: 'loc-10',
    name: 'Phố Đông Y Ông Ích Khiêm',
    address: 'Ngã tư Ông Ích Khiêm - Hùng Vương, Phường Vĩnh Trung, Quận Thanh Khê, TP. Đà Nẵng',
    position: [16.075, 108.200],
    status: '🟢 Cho phép',
    level: 'Cấp Tỉnh',
    herbs: ['Cao thuốc Nam', 'Trà thảo mộc', 'Xuyên Khung', 'Đỗ Trọng'],
    regulations: 'Trung tâm thương mại dịch vụ dược liệu lâu đời của thành phố.',
    type: 'Chợ dược liệu',
    color: '#ef4444',
    image: '/images/map/Phố Đông Y Ông Ích Khiêm.jpg',
    aqi: 60,
    humidity: 62,
    medicinalPower: 'Ổn định',
    rating: 4.7,
    folkTip: 'Tại đây có những bài thuốc xông giải cảm gia truyền rất nổi tiếng của người Đà Nẵng.',
    reviews: 3200,
    description: 'Con phố đông y lâu đời bậc nhất Đà Nẵng, nơi lưu giữ văn hóa bốc thuốc của nhiều thế hệ lương y tài ba, gắn liền với nhịp sống của người dân quận Hải Châu.',
    history: 'Hầu hết các hiệu thuốc tại đây đã có tuổi đời trên 50 năm, trải qua bao thăng trầm của lịch sử vẫn giữ vững cái tâm của nghề y.',
    bestTime: 'Chiều tối (Không khí con phố rất đặc trưng)',
    contact: 'Hội Đông y Đà Nẵng - 0236 3822 457',
    comments: [
      { user: 'Thế Vinh', text: 'Con phố thuốc đông y lâu đời, uy tín bậc nhất Đà Nẵng.', rating: 5 },
      { user: 'Lan Anh', text: 'Mùi thảo dược thơm ngát cả con đường, rất đặc trưng.', rating: 5 }
    ]
  },
  {
    id: 'loc-11',
    name: 'Bảo Tàng Di Sản Đồng Đình',
    address: 'Đường Hoàng Sa, Phường Thọ Quang, Quận Sơn Trà, TP. Đà Nẵng',
    position: [16.115, 108.285],
    status: '🔴 Cấm hái',
    level: 'Cấp Quốc Gia',
    herbs: ['Sâm tự nhiên', 'Thảo dược cổ', 'Bạch Mao Căn', 'Hoài Sơn'],
    regulations: 'Không ngắt lá, bẻ cành tại khuôn viên bảo tồn văn hóa - thiên nhiên.',
    type: 'Khu bảo tồn',
    color: '#10b981',
    image: '/images/map/Bảo Tàng Di Sản Đồng Đình.jpg',
    aqi: 25,
    humidity: 82,
    medicinalPower: 'Cao',
    rating: 4.9,
    folkTip: 'Vườn thuốc tại Đồng Đình được trồng theo mô hình cộng sinh rừng tự nhiên.',
    reviews: 1500,
    description: 'Bảo tàng nằm giữa rừng Sơn Trà, không chỉ trưng bày hiện vật văn hóa mà còn sở hữu khu vườn dược liệu rừng nguyên sinh vô cùng quý báu.',
    history: 'Do Nghệ sĩ ưu tú Đoàn Huy Giao sáng lập, đây là tâm huyết cả đời của ông trong việc bảo tồn hồn cốt văn hóa và thiên nhiên Đà Nẵng.',
    bestTime: '08:00 - 17:00 (Đóng cửa Thứ 2)',
    contact: 'Văn phòng Bảo tàng - 0236 3921 556',
    comments: [
      { user: 'Quốc Anh', text: 'Sự kết hợp hoàn hảo giữa văn hóa và dược liệu rừng.', rating: 5 },
      { user: 'Phương Thảo', text: 'Bảo tàng rất đẹp, khu vườn dược liệu tự nhiên rất ấn tượng.', rating: 5 }
    ]
  },
  {
    id: 'loc-12',
    name: 'Khu Sinh Thái Thảo Mộc Nam Ô',
    address: 'Làng nghề Nam Ô, Phường Hòa Hiệp Nam, Quận Liên Chiểu, TP. Đà Nẵng',
    position: [16.107, 108.131],
    status: '🟢 Cho phép',
    level: 'Di sản Văn hóa',
    herbs: ['Cỏ Nhọ Nồi', 'Tía Tô', 'Kinh Giới', 'Mướp Đắng Rừng', 'Khổ Sâm'],
    regulations: 'Làng nghề truyền thống; hỗ trợ thu mua để ủng hộ sinh kế người dân.',
    type: 'Làng nghề',
    color: '#ec4899',
    image: '/images/map/Khu Sinh Thái Thảo Mộc Nam Ô.jpg',
    aqi: 38,
    humidity: 76,
    medicinalPower: 'Tốt',
    rating: 4.5,
    folkTip: 'Nước ép mướp đắng rừng Nam Ô có tính hàn, giúp thanh nhiệt cơ thể rất tốt.',
    reviews: 920,
    description: 'Làng chài Nam Ô cổ kính không chỉ có nước mắm mà còn có vùng nguyên liệu dược liệu ven biển đặc thù, nổi tiếng với các bài thuốc trị bệnh ngoài da và tiêu hóa.',
    history: 'Đã từ lâu, người dân Nam Ô đã biết tận dụng các loài cây mọc hoang dại ven gành đá để chữa bệnh cho ngư dân đi biển dài ngày.',
    bestTime: 'Mùa hè (Tháng 5 - Tháng 8)',
    contact: 'Ban Quản lý Di sản Nam Ô - 0236 3842 119',
    comments: [
      { user: 'Hải Yến', text: 'Trải nghiệm làm trà thảo mộc cùng dân làng rất vui.', rating: 5 },
      { user: 'Thành Long', text: 'Dược liệu ở làng Nam Ô rất tươi và có dược tính tốt.', rating: 4 }
    ]
  }
];
