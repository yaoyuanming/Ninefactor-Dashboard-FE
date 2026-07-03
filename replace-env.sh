#!/bin/sh
set -euo pipefail  # 严格模式：未定义变量/管道失败都报错

# 定义要替换的静态文件目录（对应Nginx托管的前端文件目录）
TARGET_DIR="/usr/share/nginx/html"

# ========== 检查目录是否存在 ==========
if [ ! -d "${TARGET_DIR}" ]; then
  echo "ERROR: 静态文件目录 ${TARGET_DIR} 不存在！" >&2
  exit 1
fi

# 遍历所有以VITE_开头的环境变量
echo "========================================="
echo "开始替换前端环境变量..."
echo "========================================="

for env_var in $(env | grep ^VITE_ | cut -d= -f1); do
  # 获取环境变量的名称和值
  var_name="${env_var}"
  
  # 处理空值：如果环境变量未设置，默认空字符串
  var_value=$(eval echo \${$var_name:-})
  
  # 定义占位符（和 .env.k8s 中的格式一致：__变量名__）
  placeholder="__${var_name}__"
  
  # 打印替换日志（方便排查）
  echo "  替换占位符：${placeholder} → ${var_value:-"空值"}"
  
  # 替换所有 js/css/html 文件中的占位符
  # 用 find 命令（最稳定，兼容所有 shell，推荐）
  find "${TARGET_DIR}" -type f \( -name "*.js" -o -name "*.css" -o -name "index.html" \) \
    -exec sed -i "s|${placeholder}|${var_value}|g" {} + 2>/dev/null || true
done

echo "========================================="
echo "环境变量替换完成！"
echo "========================================="

# 启动 Nginx（前台运行，保证容器不退出）
exec nginx -g 'daemon off;'
