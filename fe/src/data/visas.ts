export const audToVndDefault = 16000

export const visaEarningsMonthly: Record<string, number> = {
  '600 (Tourist/Sponsored Family Stream)': 0,
  '600 (Business Visitor Stream)': 1000,
  '500': 800,
  '590': 0,
  '482': 2500,
  '485 (Graduate Temporary)': 2000,
  '491': 2400,
  '189': 3000,
  '190': 3000,
  '462 (Work & Holiday)': 1800,
  '300/309/820': 0,
  '143': 0,
  'Transit': 0
}

export const visaTripCost: Record<string, number> = {
  '600 (Tourist/Sponsored Family Stream)': 800,
  '600 (Business Visitor Stream)': 1200,
  '500': 1500,
  '590': 1500,
  '482': 2000,
  '485 (Graduate Temporary)': 1500,
  '491': 2500,
  '189': 3000,
  '190': 3000,
  '462 (Work & Holiday)': 1200,
  '300/309/820': 2000,
  '143': 5000,
  'Transit': 200
}

export const visaDefinitions: Record<string, any> = {
  '600 (Tourist/Sponsored Family Stream)': {
    key: 'visitor', title: 'Visitor 600', desc: 'Visa ngắn hạn cho du lịch / thăm thân',
    requirements: [
      { id: 'funds', label: 'Chứng minh tài chính (AUD)', type: 'funds', op: '>=', value: 1500 }
    ]
  },
  '500': {
    key: 'student', title: 'Student 500', desc: 'Visa học toàn thời gian',
    requirements: [
      { id: 'funds', label: 'Số dư tối thiểu (AUD)', type: 'funds', op: '>=', value: 21041 },
      { id: 'ielts', label: 'IELTS (band) tối thiểu (tham khảo)', type: 'ielts', op: '>=', value: 5.0 }
    ]
  },
  '482': {
    key: 'tss', title: 'Temporary Skill Shortage 482', desc: 'Lao động tay nghề do employer sponsor',
    requirements: [
      { id: 'experience', label: 'Kinh nghiệm (năm)', type: 'experience', op: '>=', value: 1 }
    ]
  },
  '462 (Work & Holiday)': {
    key: '462', title: 'Work & Holiday 462', desc: 'Visa du lịch kết hợp làm việc cho người trẻ (tuổi hạn chế, danh sách quốc gia)',
    requirements: [
      { id: 'age_le', label: 'Tuổi tối đa (thường)', type: 'age_le', op: '<=', value: 30 },
      { id: 'funds', label: 'Số dư khởi đầu ước tính (AUD)', type: 'funds', op: '>=', value: 5000 }
    ],
    guidance: {
      before: [
        'Kiểm tra quốc tịch của bạn có nằm trong danh sách đủ điều kiện Work & Holiday hay không.',
        'Chuẩn bị passport còn hạn ít nhất 6 tháng, ảnh, giấy tờ cá nhân và bằng chứng học vấn nếu cần.',
        'Mua bảo hiểm y tế du học/du lịch (OSHC hoặc bảo hiểm du lịch quốc tế) cho thời gian ở Úc.',
        'Chứng minh tài chính ban đầu (ít nhất AUD 5,000) và kế hoạch chi tiêu ban đầu.',
        'Tìm hiểu điều kiện làm việc (giới hạn giờ, nghề bị hạn chế) và yêu cầu tuổi.'
      ],
      during: [
        'Mở tài khoản ngân hàng Úc và xin TFN (Tax File Number) nếu bạn làm việc.',
        'Tôn trọng giới hạn làm việc của visa; giữ các giấy tờ quan trọng (passport, visa grant letter) an toàn.',
        'Ký hợp đồng lao động bằng văn bản khi có thể; lưu hợp đồng, payslips để làm bằng chứng.',
        'Đăng ký Medicare/OSHC theo hướng dẫn, và gia hạn bảo hiểm khi cần.',
        'Tìm kiếm công việc phù hợp, kiểm tra quyền lợi lao động và mức lương tối thiểu.'
      ],
      after: [
        'Lưu giữ bằng chứng làm việc, payslips, hợp đồng nếu bạn cần xin visa tiếp theo hoặc chứng minh kinh nghiệm.',
        'Nếu muốn ở lại lâu hơn, nghiên cứu các pathway (ví dụ visa tay nghề vùng/đề cử bang) và thời hạn nộp hồ sơ.',
        'Khai báo thuế cuối năm, giữ giấy tờ thuế để hoàn thuế nếu có.',
        'Nếu về nước, kiểm tra điều kiện quay lại Úc (nếu muốn làm việc tiếp) và gia hạn giấy tờ cần thiết.'
      ]
    }
  },
  '189': {
    key: '189', title: 'Skilled Independent 189', desc: 'Định cư qua điểm — yêu cầu điểm cao',
    requirements: [
      { id: 'ielts', label: 'IELTS (band) tham khảo', type: 'ielts', op: '>=', value: 7.0 },
      { id: 'education', label: 'Bằng cấp tối thiểu (Cử nhân)', type: 'education', op: '>=', value: 2 }
    ]
  }
}

export const visaRows = [
  { type: 'Du lịch/Thăm thân', code: '600 (Tourist/Sponsored Family Stream)', purpose: 'Du lịch, thăm bạn bè/gia đình', duration: '3-12 tháng/lần', audience: 'Du khách Việt Nam' },
  { type: 'Công tác ngắn hạn', code: '600 (Business Visitor Stream)', purpose: 'Họp hành, khảo sát thị trường', duration: 'Tối đa 3 tháng/lần, hiệu lực đến 3 năm', audience: 'Doanh nhân' },
  { type: 'Du học', code: '500', purpose: 'Học toàn thời gian tại trường Úc', duration: 'Theo thời gian khóa học + làm thêm', audience: 'Sinh viên quốc tế' },
  { type: 'Giám hộ học sinh', code: '590', purpose: 'Giám hộ con dưới 18 tuổi du học', duration: 'Theo visa con', audience: 'Cha mẹ' },
  { type: 'Làm việc tạm thời (TSS)', code: '482', purpose: 'Lao động tay nghề ngắn/dài hạn', duration: '2-4 năm', audience: 'Người được bảo lãnh doanh nghiệp' },
  { type: 'Sau tốt nghiệp', code: '485 (Graduate Temporary)', purpose: 'Làm việc sau du học', duration: '18 tháng - 4 năm', audience: 'Du học sinh tốt nghiệp' },
  { type: 'Tay nghề vùng miền', code: '491', purpose: 'Làm việc ở khu vực vùng sâu', duration: '5 năm (dẫn đến PR)', audience: 'Lao động có kỹ năng, được đề cử' },
  { type: 'Tay nghề độc lập', code: '189', purpose: 'Định cư vĩnh viễn không bảo lãnh', duration: 'Vĩnh viễn (gia hạn 5 năm)', audience: 'Người điểm cao, nghề hot' },
  { type: 'Tay nghề được đề cử', code: '190', purpose: 'Định cư với đề cử tiểu bang', duration: 'Vĩnh viễn', audience: 'Lao động kỹ năng cao' },
  { type: 'Lao động nghỉ dưỡng', code: '462 (Work & Holiday)', purpose: 'Du lịch + làm việc', duration: '1 năm (gia hạn 2 lần)', audience: 'Người trẻ 18-30 tuổi' },
  { type: 'Bảo lãnh vợ/chồng', code: '300/309/820', purpose: 'Kết hôn/đồng sống', duration: 'Tạm trú dẫn đến PR', audience: 'Người có quan hệ hôn nhân' },
  { type: 'Bảo lãnh cha mẹ', code: '143', purpose: 'Định cư đóng góp tài chính', duration: 'Vĩnh viễn', audience: 'Cha mẹ con cái bảo lãnh' },
  { type: 'Quá cảnh', code: 'Transit', purpose: 'Chuyển tiếp sân bay', duration: '72 giờ (hàng không)', audience: 'Hành khách trung chuyển' }
]
