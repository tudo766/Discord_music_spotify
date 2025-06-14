# Base image: Node 18/20 LTS với apt support
FROM node:20-slim

# Cài ffmpeg + công cụ biên dịch + hỗ trợ âm thanh
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    ffmpeg \
    python-is-python3 \
    build-essential \
    pkg-config && \
    rm -rf /var/lib/apt/lists/*

# Thư mục làm việc trong container
WORKDIR /app

# Copy toàn bộ project
COPY . .

# Cài dependencies
RUN npm install

# Mặc định chạy bot
CMD ["node", "index.js"]
