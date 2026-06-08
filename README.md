# 🖥️ Sales Management Frontend — VueJS 3

Dự án Frontend dùng chung cho Hệ thống Quản lý Bán hàng & Kho hàng (Bài tập lớn). Được xây dựng dựa trên **VueJS 3 + Vuetify 3 + Pinia + Vue Router** chạy bằng **Webpack (Vue CLI)**.

---

## 🛠️ Yêu cầu môi trường
* **Node.js**: Phiên bản `18.x` hoặc `20.x` trở lên.
* **NPM**: Đi kèm khi cài đặt Node.js.

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Cài đặt các gói thư viện (Dependencies)
Tại thư mục `SalesManagement.Web`, chạy lệnh sau để tải các gói thư viện cần thiết:
```bash
npm install
```

### 2. Khởi chạy môi trường phát triển (Local Development)
Chạy lệnh sau để khởi động dev server trên máy cá nhân:
```bash
npm run serve
```
* Sau khi khởi chạy thành công, giao diện sẽ hoạt động tại địa chỉ: `http://localhost:3000`.
* Bạn có thể đăng nhập bằng các tài khoản thử nghiệm đi kèm (`admin`, `sales`, `warehouse` với mật khẩu bất kỳ) để kiểm tra các phân hệ chức năng tương ứng.

### 3. Đóng gói ứng dụng (Production Build)
Chạy lệnh sau để tối ưu hóa và biên dịch mã nguồn thành các file tĩnh đặt trong thư mục `dist`:
```bash
npm run build
```
* Thư mục `dist` này sẽ được dùng để triển khai lên các dịch vụ hosting (như Vercel, Netlify, IIS, hoặc Nginx).

---

## 📐 Quy chuẩn làm việc nhóm
Các nhóm tham gia phát triển chung vui lòng đọc kỹ hướng dẫn quy chuẩn đặt tên thư mục, đặt tên nhánh Git và cách gọi API qua Gateway tại tài liệu: **[FRONTEND_GUIDELINES.md](./FRONTEND_GUIDELINES.md)**.
