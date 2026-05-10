# Smart Goods Management System (BT Branch)

Đây là hệ thống quản lý hàng hóa thông minh được thiết kế để chạy trên nền tảng Cloud hoặc tích hợp với Google Apps Script.

## 1. Thiết lập Google Sheets (Database)

Bạn cần tạo một Google Spreadsheet với các Sheet sau:

### Sheet '64', 'BT', '7bc', 'Tba', 'Q9', 'Q7', 'CTP', 'BD'
Cấu trúc cột (A-Y):
- A: Mã kho
- B: Mã hàng (SKU)
- C: Tên hàng
- D: Giá bán lẻ
- E: Số lượng tồn
- ...
- Y: Tồn Max
- Z: Ngày bắt đầu trưng bày (Chỉ dành cho sheet 'Tba')

### Sheet 'tk' (Thống kê)
Cấu trúc cột:
- A: Mã hàng
- B: Tên hàng
- K: Số lượng bán lẻ (30 ngày)
- S: SO Pending
- U: Khuyến mãi V2 (CTKM)
- H: Nhập nội bộ (Hot)
- I: Xuất nội bộ (Hot)

## 2. Triển khai Google Apps Script (GAS)

Nếu bạn muốn chạy trực tiếp trong Google Sheets:
1. Mở Spreadsheet.
2. Chọn `Extensions` -> `Apps Script`.
3. Copy nội dung file `Code.gs` (sẽ được cung cấp trong mã nguồn của ứng dụng này) vào editor.
4. Chọn `Deploy` -> `New Deployment` -> `Web App`.
5. Cấp quyền truy cập.

## 3. Đồng bộ với Web App này

Ứng dụng React này được thiết kế để giao tiếp với API hoặc giả lập dữ liệu từ Google Sheets. Để kết nối thật, bạn cần cập nhật URL của Web App GAS vào biến môi trường `VITE_GAS_API_URL`.
