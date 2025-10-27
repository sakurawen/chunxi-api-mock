FROM node:20-alpine

WORKDIR /app

# 启用 pnpm
RUN corepack enable

# 复制项目文件
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src

# 安装依赖并构建
RUN pnpm install
RUN pnpm run build

# 清理开发依赖，只保留生产依赖
RUN pnpm install --prod

EXPOSE 3000

CMD ["node", "dist/index.js"]
