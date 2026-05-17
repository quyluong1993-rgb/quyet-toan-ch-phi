# 📂 Cấu Trúc Thư Mục Dự Án ZRG_Quyet toan
## 🌟 Hệ Thống Quyết Toán Chi Phí Thông Minh (AI-Bilingual Settlement)

Dự án **ZRG Quyết toán** đã được quy hoạch cấu trúc thư mục một cách khoa học, chuyên nghiệp, tuân thủ tiêu chuẩn quản lý dự án phần mềm và lưu trữ dữ liệu thực tế. Cấu trúc này giúp lập trình viên và người dùng dễ dàng phân loại tài liệu, quản lý chứng từ đầu vào, phát triển mã nguồn, và kết xuất báo cáo nhanh chóng.

---

## 🗺️ Sơ Đồ Cấu Trúc Tổng Quan (Folder Tree)

```text
ZRG_Quyet_toan/
├── 📂 01_Tai_lieu_Du_an/                  # Tài liệu hướng dẫn & quy trình dự án
│   ├── 📂 01_PRD_Yeu_cau/                # Tài liệu Yêu cầu Sản phẩm (Product Requirements Document)
│   └── 📂 02_Huong_dan_Su_dung/          # Hướng dẫn thao tác, vận hành hệ thống
├── 📂 02_Du_lieu_Dau_vao/                 # Nơi lưu trữ chứng từ, hóa đơn & file excel gốc
│   ├── 📂 01_Hoa_don_Anh_chup/           # Ảnh chụp hóa đơn/chứng từ đầu vào (để chạy AI OCR)
│   │   ├── 📂 Cho_xu_ly/                 # Hóa đơn mới upload, chưa quét hoặc đang chờ xử lý
│   │   └── 📂 Da_xu_ly/                  # Hóa đơn đã quét thành công & ghi nhận vào hệ thống
│   └── 📂 02_Bang_tinh_Goc/              # File Excel mẫu, dữ liệu danh mục nhân viên/định mức
├── 📂 03_Bao_cao_Quy_toan/                # Kết xuất báo cáo tài chính & quyết toán chi phí
│   ├── 📂 Bao_cao_Thang/                  # Báo cáo quyết toán định kỳ hàng tháng
│   └── 📂 Bao_cao_Nam/                    # Tổng hợp quyết toán năm & quyết toán dự án
├── 📂 04_Ma_nguon_Phat_trien/             # Toàn bộ mã nguồn hệ thống
│   ├── 📂 backend/                       # Google Apps Script (GAS) Module & API kết nối Google Sheets
│   │   ├── 📂 Modules/                   # Các Module nghiệp vụ xử lý dữ liệu quyết toán
│   │   └── 📂 Utils/                     # Các hàm tiện ích xử lý định dạng, logic tính toán
│   ├── 📂 frontend/                      # Giao diện người dùng Web App (Vite + React + Tailwind + TypeScript)
│   │   ├── 📂 public/                    # Tài nguyên tĩnh (favicon, icons)
│   │   └── 📂 src/                       # Thư mục chứa code Frontend (components, hooks, pages, models)
│   └── 📄 zrg_dashboard.html              # Trang dashboard độc lập tích hợp nhanh
└── 📂 05_Luu_tru_Lich_su/                 # Nơi lưu trữ phiên bản cũ (Archive) và sao lưu định kỳ (Backup)
```

---

## 🔍 Mô Tả Chi Tiết & Hướng Dẫn Sử Dụng Từng Thư Mục

### 📁 1. `01_Tai_lieu_Du_an` (Project Documentation)
*   **Mục đích:** Lưu trữ tất cả tài liệu mềm, tài liệu đặc tả thiết kế, và hướng dẫn vận hành.
*   **Trạng thái hiện tại:** Đã di chuyển file PRD gốc vào đây: `01_Tai_lieu_Du_an/01_PRD_Yeu_cau/PRD - Hệ thống Quyết toán Chi phí Thông minh (AI-Bilingual Settlement).docx`.
*   **Hướng dẫn:** Hãy lưu trữ các phiên bản cập nhật của PRD, thiết kế giao diện Figma, sơ đồ luồng dữ liệu (Dataflow) tại đây.

### 📁 2. `02_Du_lieu_Dau_vao` (Raw Input Data)
*   **Mục đích:** Quản lý toàn bộ chứng từ thanh toán, hóa đơn đỏ, và các bảng kê đầu vào.
*   **Quy trình xử lý hóa đơn:**
    1.  **Bước 1:** Khi nhận được hóa đơn mới dạng ảnh chụp hoặc file PDF từ nhân viên hiện trường, hãy copy vào thư mục `02_Du_lieu_Dau_vao/01_Hoa_don_Anh_chup/Cho_xu_ly/` (Các hóa đơn ban đầu đã được chuyển an toàn vào đây).
    2.  **Bước 2:** Sau khi hệ thống Frontend (AI OCR) quét thành công và đồng bộ dữ liệu lên Google Sheets, ảnh hóa đơn sẽ được chuyển sang `02_Du_lieu_Dau_vao/01_Hoa_don_Anh_chup/Da_xu_ly/` để dễ quản lý.
*   **Bảng tính gốc:** Lưu các file `.xlsx` danh mục nhân sự, danh mục nhà cung cấp, hoặc hạn mức chiết khấu định kỳ của ZRG Sales DMS.

### 📁 3. `03_Bao_cao_Quy_toan` (Settlement Reports)
*   **Mục đích:** Lưu trữ các tệp báo cáo PDF/Excel đã chốt số liệu quyết toán cuối kỳ để gửi cho bộ phận kế toán hoặc ban giám đốc.
*   **Hướng dẫn:** Tổ chức báo cáo theo năm và tháng rõ ràng (ví dụ: `Bao_cao_Thang/Quyet_toan_T05_2026.xlsx`).

### 📁 4. `04_Ma_nguon_Phat_trien` (Source Code)
*   **Mục đích:** Trọng tâm phát triển công nghệ cho dự án Quyết toán.
*   **`backend` (Google Apps Script - GAS):**
    *   Chứa file `Code.gs` và `CombinedCode.gs` đảm nhận việc nhận dữ liệu từ Client qua HTTP POST, xử lý dữ liệu và đẩy vào Google Sheets, lưu trữ file Base64 lên Drive.
*   **`frontend` (Vite + React + TS):**
    *   Hệ thống Frontend hiện đại, tối ưu hóa giao diện di động (Mobile-first) hỗ trợ chụp ảnh hóa đơn, gọi API AI OCR, hiển thị tiến trình duyệt chi phí của đại lý/nhân viên.
    *   *Lưu ý:* Thư mục này đã được tối ưu sao chép bằng cách loại bỏ `node_modules` và `dist` để đảm bảo dung lượng nhẹ. Hãy chạy lệnh `npm install` trước khi phát triển.

### 📁 5. `05_Luu_tru_Lich_su` (Archive & Backup)
*   **Mục đích:** Sao lưu dữ liệu đề phòng sự cố và lưu trữ lịch sử các phiên bản cũ để tránh làm nhiễu không gian làm việc chính.

---

## ⚡ Hướng Dẫn Khởi Chạy Nhanh Cho Lập Trình Viên (Quick Start)

### 1. Cài đặt và Chạy Frontend:
Để mở giao diện điều khiển và xử lý hóa đơn quyết toán:
```bash
# Di chuyển vào thư mục frontend
cd 04_Ma_nguon_Phat_trien/frontend

# Cài đặt các gói phụ thuộc (dependencies)
npm install

# Khởi chạy máy chủ phát triển (Local Dev Server)
npm run dev
```
Sau đó truy cập địa chỉ hiển thị trên terminal (thường là `http://localhost:5173`) để trải nghiệm giao diện **Rugged Field Precision** cao cấp, hỗ trợ đa ngôn ngữ (Anh/Việt) và đồng bộ dữ liệu kế toán theo thời gian thực!

### 2. Triển khai Backend (Google Apps Script):
*   Toàn bộ mã nguồn lưu tại `04_Ma_nguon_Phat_trien/backend/`.
*   Bạn có thể sử dụng công cụ `clasp` của Google để đẩy code trực tiếp lên dự án Apps Script liên kết với Google Sheets của bạn.

---
☘️ *Chúc bạn xây dựng dự án Quyết toán Chi phí ZRG thành công xuất sắc tại Lớp anh Đức!*
