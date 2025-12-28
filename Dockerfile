# Sử dụng Node phiên bản ổn định (Alpine giúp dung lượng siêu nhẹ)
FROM node:20-alpine

# Thiết lập thư mục làm việc
WORKDIR /Travia.frontend

# Kích hoạt corepack để dùng Yarn hoặc Pnpm nếu cần
RUN corepack enable

# Chỉ copy file quản lý thư viện để tối ưu cache của Docker
COPY package.json yarn.lock* ./

# Cài đặt dependencies
RUN yarn install

# Copy toàn bộ mã nguồn
COPY . .

# Mở cổng mặc định của Vite
EXPOSE 5173

# Chạy lệnh dev với flag --host để truy cập được từ bên ngoài container
CMD ["yarn", "dev", "--host"]