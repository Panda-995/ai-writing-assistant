# 构建阶段
FROM node:18-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 清理npm缓存并安装依赖（解决版本匹配问题）
RUN npm cache clean --force && npm install

# 复制项目文件
COPY . .

# 构建生产版本
RUN npm run build

# 运行阶段
FROM nginx:alpine

# 从构建阶段复制构建产物到nginx
COPY --from=build /app/dist /usr/share/nginx/html

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露3000端口
EXPOSE 3000

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]