# 基础镜像：轻量版Nginx
# FROM nginx:alpine
FROM docker.m.daocloud.io/library/nginx:alpine

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 复制打包后的dist目录到Nginx静态资源目录
COPY dist/ .

# 复制替换脚本到容器
COPY replace-env.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/replace-env.sh

# 覆盖Nginx默认配置（可选，如需自定义Nginx配置）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 注意：这里不直接启动Nginx，而是在K8s中指定启动命令（先执行替换再启动）
