# 📐 Quy chuẩn Phát triển & Cộng tác Frontend (VueJS 3)

Tài liệu này định nghĩa quy chuẩn làm việc để cả 3 nhóm (Nhóm 4, Nhóm 5, Nhóm 6) có thể cùng cộng tác phát triển trên một dự án Frontend duy nhất mà không xảy ra xung đột code (conflict).

---

## 1. Công nghệ sử dụng
* **Core:** VueJS 3 (Composition API / `<script setup>`).
* **UI Library:** Vuetify 3 (hỗ trợ component chuẩn, Material Design).
* **State Management:** Pinia (quản lý state tập trung cho Auth, Giỏ hàng, v.v.).
* **Routing:** Vue Router (định tuyến SPA).
* **HTTP Client:** Axios (gọi API qua Gateway).

---

## 2. Phân chia thư mục trong `src/`

Để tránh việc sửa đổi chung file gây xung đột, mã nguồn được phân chia phân khu rõ ràng:

```
src/
├── assets/             # Ảnh, logo dùng chung
├── components/         # Các component UI dùng chung (Ví dụ: Alert, ConfirmationDialog, v.v.)
├── config/             # Cấu hình hệ thống (axios, API endpoints)
├── layouts/            # Layout chính (DashboardLayout.vue, LoginLayout.vue)
├── plugins/            # Cấu hình Vuetify, Pinia
├── router/             # Định tuyến Vue Router
├── stores/             # Pinia stores (auth.js, cart.js)
│
└── views/              # PHÂN CHIA VIEW THEO NHÓM
    ├── Dashboard/      # Nhóm 6 (Báo cáo doanh thu, thống kê)
    ├── Products/       # Nhóm 5 (Danh mục, Sản phẩm, Tồn kho, Nhập kho)
    ├── Orders/         # Nhóm 4 (Tạo đơn bán, quản lý đơn, công nợ)
    └── Users/          # Nhóm 6 (Quản lý User, phân quyền, Đăng nhập)
```

> ⚠️ **Nguyên tắc vàng:** 
> * Nhóm nào chỉ viết code trong thư mục `views/` của nhóm đó.
> * Nếu cần tạo component dùng riêng, hãy tạo thư mục `components/` ngay bên trong thư mục `views/[Feature]/` của nhóm mình (ví dụ: `src/views/Products/components/ProductCard.vue`).

---

## 3. Quy tắc viết CSS để không bị đè style
Tất cả các file component Vue (`.vue`) **bắt buộc** phải sử dụng từ khóa `scoped` khi định nghĩa CSS:
```vue
<style scoped>
/* Style này chỉ áp dụng riêng cho component này, không đè lên component của nhóm khác */
.card-title {
  color: var(--v-theme-primary);
}
</style>
```

---

## 4. Định tuyến (Vue Router) & Quyền truy cập
File routing cấu hình tại `src/router/index.js`.
* Nhóm 6 chịu trách nhiệm chính quản lý file này để tích hợp Route của các nhóm.
* Khi thêm Route mới, mỗi nhóm đăng ký các đường dẫn con dưới layout chính `DashboardLayout.vue`.
* Sử dụng trường `meta: { requiresAuth: true, roles: ['Admin', 'Sales'] }` để kiểm tra phân quyền.

---

## 5. Tích hợp API qua API Gateway

Không được gọi trực tiếp URL Backend của riêng nhóm mình. Tất cả API call phải thông qua **Ocelot API Gateway** chạy tại cổng `http://localhost:5000` (ở local).

Sử dụng file cấu hình axios dùng chung: `src/config/api.js`.
* Tự động lấy JWT Token từ `localStorage` (hoặc Pinia Store) và đính kèm vào Header `Authorization: Bearer <token>`.
* Ví dụ gọi API trong component:
```javascript
import api from '@/config/api';

// Gọi API lấy danh sách sản phẩm (đã định tuyến qua Gateway)
const fetchProducts = async () => {
  try {
    const response = await api.get('/api/products');
    products.value = response.data;
  } catch (error) {
    console.error("Lỗi lấy sản phẩm:", error);
  }
};
```

---

## 6. Quy trình làm việc trên Git (Git Workflow)

* **Nhánh chính (`main`):** Nhánh chạy ổn định, không ai được push trực tiếp lên đây.
* **Tạo nhánh tính năng:** Mỗi khi làm tính năng mới, tạo nhánh từ `main`:
  * Định dạng: `feat/group-[số_nhóm]-[tên_tính_năng]`
  * Ví dụ: `feat/group5-product-crud`
* **Quy trình Merge (Hợp nhất code):**
  1. Chạy chạy thử code ở local đảm bảo build thành công (`npm run build`).
  2. Push nhánh lên Github và tạo **Pull Request (PR)** vào nhánh `main`.
  3. Chỉ định đại diện các nhóm khác vào Review và duyệt PR trước khi merge.
