**Mô Tả & Mục Tiêu Ứng Dụng**
"Road To Úc" là một ứng dụng web toàn diện nhằm tổng hợp và cung cấp thông tin chi tiết về các lộ trình di trú Úc (du học, Work and Holiday, lao động tay nghề, du lịch), kèm theo các công cụ hỗ trợ tính toán tài chính, đánh giá trình độ tiếng Anh và quản lý danh mục hồ sơ.

**Tính Năng Cốt Lõi**

*   **Quản lý Lộ trình Di trú**:
    *   Hiển thị 4 lộ trình chính: Work & Holiday (462), Du học, Lao động Tay nghề/Định cư, Du lịch.
    *   Mỗi lộ trình có trang chi tiết riêng biệt, cung cấp thông tin tổng quan, điều kiện, và quyền lợi.
*   **Công cụ Tự đánh giá (Rule-based Self-Assessment)**:
    *   Các biểu mẫu nhập liệu động cho phép người dùng cung cấp thông tin về tuổi, trình độ học vấn, năng lực tiếng Anh (PTE/IELTS), và tài chính.
    *   Hệ thống quy tắc nghiệp vụ (rule-based logic) sẽ xử lý dữ liệu đầu vào để đưa ra đánh giá mức độ phù hợp (Cao/Trung bình/Thấp) và các gợi ý cá nhân hóa dựa trên từng lộ trình.
*   **Danh mục Hồ sơ (Checklist Management)**:
    *   Cung cấp danh sách các giấy tờ cần thiết cho từng lộ trình cụ thể.
    *   Cho phép người dùng đánh dấu trạng thái hoàn thành ("Đã xong") cho từng mục. Trạng thái này được lưu trữ cục bộ bằng `localStorage`.
*   **Công cụ Hỗ trợ Tài chính**:
    *   Máy tính tài chính ước tính chi phí tối thiểu cần thiết dựa trên loại hình di trú và thời gian dự kiến.
    *   Đề xuất số tiền nên có trong sổ tiết kiệm và hiển thị khoản thiếu hụt so với mục tiêu.
*   **Công cụ Hỗ trợ Tiếng Anh**:
    *   Chuyển đổi điểm tương đương giữa các chứng chỉ tiếng Anh phổ biến như PTE, IELTS, CEFR.
    *   Gợi ý mục tiêu điểm tiếng Anh cụ thể phù hợp với yêu cầu của từng loại visa.

**Luồng Người Dùng & Tương Tác**

*   **Khởi đầu**: Người dùng truy cập trang chủ, thấy 4 thẻ (card) lớn đại diện cho 4 lộ trình di trú chính.
*   **Chọn Lộ trình**: Người dùng nhấp vào một thẻ (ví dụ: "Work & Holiday 462") để điều hướng đến trang chi tiết của lộ trình đó.
*   **Tương tác Trang Lộ trình**:
    *   Đọc thông tin tổng quan, điều kiện, quyền lợi liên quan đến lộ trình đã chọn.
    *   Điền dữ liệu vào biểu mẫu "Tự đánh giá nhanh" (tuổi, trình độ học vấn, tiếng Anh, tài chính).
    *   Nhấn nút "Kiểm tra" hoặc tương tự để nhận kết quả đánh giá và các gợi ý tức thì.
    *   Tương tác với danh mục hồ sơ: đánh dấu các mục "Đã xong", trạng thái này được lưu trữ tự động trong trình duyệt.
*   **Sử dụng Công cụ**: Người dùng có thể điều hướng đến các công cụ "Tính toán Tài chính" và "Gợi ý Tiếng Anh" từ menu điều hướng hoặc các liên kết nội bộ.
    *   Nhập các tham số cần thiết vào biểu mẫu của công cụ.
    *   Nhận kết quả tính toán hoặc gợi ý ngay lập tức sau khi nhập liệu.
*   **Điều hướng Chung**: Thanh điều hướng chính (hoặc các liên kết) cho phép người dùng dễ dàng chuyển đổi giữa các lộ trình khác nhau và các công cụ hỗ trợ bất kỳ lúc nào.

**Hướng Dẫn Giao Diện & Trải Nghiệm Người Dùng (UX)**

*   Sử dụng thư viện giao diện người dùng hiện đại như Material UI hoặc Shadcn/UI để đảm bảo tính nhất quán, khả năng mở rộng và trải nghiệm người dùng tối ưu.
*   Giao diện thiết kế tối giản, trực quan, với các khối thông tin rõ ràng, dễ đọc và sử dụng nhiều biểu tượng minh họa (ví dụ: máy bay, vali, sách, công việc) để tăng tính sinh động.
*   Hỗ trợ chủ đề sáng (Light Theme) và tối (Dark Theme) để người dùng có thể tùy chọn.
*   Đảm bảo tính phản hồi (Responsive Design) trên mọi kích thước màn hình (desktop, tablet, mobile) và tuân thủ các nguyên tắc WCAG 2.1 AA về khả năng tiếp cận.

**Xử Lý Các Trường Hợp Ngoại Lệ & Bảo Mật**

*   **Xử lý Lỗi Nhập liệu**:
    *   Sử dụng thư viện schema validation (ví dụ: Zod hoặc Yup) để xác thực tất cả dữ liệu đầu vào từ người dùng (tuổi, số tiền, điểm tiếng Anh) theo các quy tắc nghiệp vụ và định dạng đã định nghĩa.
    *   Cung cấp thông báo lỗi rõ ràng, tức thì và mang tính hướng dẫn cho người dùng khi nhập liệu không hợp lệ.
*   **Trạng thái Rỗng (Empty States)**: Hiển thị thông báo thân thiện hoặc hướng dẫn khi không có dữ liệu để hiển thị (ví dụ: chưa nhập thông tin vào biểu mẫu tính toán) hoặc khi một phần của giao diện chưa có nội dung.
*   **Xử lý Lỗi Mạng**: Trong trường hợp có tích hợp API backend, triển khai cơ chế xử lý lỗi mạng toàn diện để thông báo cho người dùng về sự cố kết nối hoặc lỗi máy chủ một cách rõ ràng và cung cấp tùy chọn thử lại.
*   **Bảo mật**:
    *   Thực hiện mã hóa và làm sạch dữ liệu (data sanitization) trên tất cả các đầu vào người dùng để ngăn chặn các cuộc tấn công XSS (Cross-Site Scripting).
    *   Nếu có tính năng lưu trữ dữ liệu người dùng ngoài `localStorage`, áp dụng các biện pháp bảo mật như mã hóa dữ liệu khi truyền tải và lưu trữ, xác thực mạnh mẽ và ủy quyền (RBAC/ABAC).
    *   Tránh hiển thị thông tin nhạy cảm trực tiếp trong URL hoặc client-side logs.