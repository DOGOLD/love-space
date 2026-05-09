#!/bin/bash
echo "正在更新甜蜜空间..."

# 备份数据库和上传文件
echo "备份数据..."
mkdir -p /opt/love-space/backup
cp /opt/love-space/data/database.sqlite /opt/love-space/backup/database_$(date +%Y%m%d_%H%M%S).sqlite
cp -r /opt/love-space/uploads /opt/love-space/backup/uploads_$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# 拉取代码
echo "拉取最新代码..."
cd /opt/love-space
git fetch origin
git reset --hard origin/main

# 恢复数据库
echo "恢复数据库..."
latest_db=$(ls -t /opt/love-space/backup/database_*.sqlite 2>/dev/null | head -1)
if [ -f "$latest_db" ]; then
    cp "$latest_db" /opt/love-space/data/database.sqlite
    echo "数据库已恢复"
fi

# 恢复上传文件
latest_uploads=$(ls -td /opt/love-space/backup/uploads_* 2>/dev/null | head -1)
if [ -d "$latest_uploads" ]; then
    cp -r "$latest_uploads"/* /opt/love-space/uploads/ 2>/dev/null || true
    echo "上传文件已恢复"
fi

echo "更新完成！请刷新页面"