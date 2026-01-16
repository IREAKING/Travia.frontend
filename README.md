# Travia Frontend

Frontend cho hệ thống quản lý đặt tour Travia, xây dựng bằng React + TypeScript + Vite.

## Tech stack
- React 19
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS

## Yêu cầu
- Node.js 18+
- Yarn hoặc npm

## Cài đặt
```
cd Travia.frontend
yarn install
```

## Cấu hình môi trường
Tạo file `.env`:
```
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

## Chạy dev
```
yarn dev
```
Mặc định: http://localhost:5173

## Build & preview
```
yarn build
yarn preview
```

## Lint
```
yarn lint
```

## Cấu trúc chính
```
src/
├── components/        # UI components
├── pages/             # Pages (public/user/admin/supplier)
├── services/          # API service layer (Axios)
├── contexts/          # AuthContext
├── hooks/             # Custom hooks
├── types/             # TypeScript types
└── utils/             # Helpers
```

## Đăng nhập theo vai trò
- Khách hàng: `/login`
- Admin: `/admin/login`
- Nhà cung cấp: `/supplier/login`

## Ghi chú
- Đổi URL backend trong `VITE_API_URL`.
- Nếu API bật cache, dữ liệu có thể trễ; nên kiểm tra invalidate cache ở backend.
