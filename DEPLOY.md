# 甜蜜空间 - 情侣专属网页项目

## 📁 项目简介

一套现代化温馨治愈风格的情侣专属网页，采用纯前端 + LocalStorage 本地存储方案，无需后端数据库即可运行。

### 核心功能
- ✅ 用户注册/登录（含表单合规校验）
- ✅ 个人资料完善（含头像上传裁剪）
- ✅ 恋爱纪念日（实时倒计时）
- ✅ 情侣相册（多图上传、分类管理）
- ✅ 甜蜜语录墙（自动轮播）
- ✅ 恋爱日记（增删改查）
- ✅ 心愿清单（打卡完成）
- ✅ 宠物养成小游戏（喂食/玩耍/洗澡/睡觉）
- ✅ 背景音乐播放器
- ✅ 设置中心（修改密码/切换主题）
- ✅ 全局爱心飘落特效 + 点击特效

---

## 🛠 技术栈

| 技术 | 版本/说明 |
|------|-----------|
| HTML5 | 语义化标签 |
| CSS3 | 渐变/动画/响应式 |
| JavaScript | ES6+ |
| Vue3 | CDN 引入 |
| Tailwind CSS | CDN 引入 |
| LocalStorage | 本地数据存储 |

---

## 📂 项目结构

```
couple-web/
├── index.html          # 登录页面
├── register.html       # 注册页面
├── profile.html        # 资料完善页面
├── home.html           # 首页（含所有功能模块）
├── assets/
│   ├── css/
│   │   └── style.css   # 全局样式（动画/特效/响应式）
│   └── js/
│       ├── auth.js     # 登录注册逻辑
│       ├── profile.js  # 资料完善逻辑
│       ├── home.js     # 首页核心逻辑
│       └── effects.js  # 全局特效（爱心飘落/点击特效）
└── utils/
    └── storage.js      # LocalStorage 存储工具类
```

---

## 🚀 本地开发运行

### 方式一：Python HTTP 服务器
```bash
cd couple-web
python -m http.server 8080
```
访问：http://localhost:8080

### 方式二：Node.js serve
```bash
npx serve couple-web -p 8080
```
访问：http://localhost:8080

### 方式三：VS Code Live Server
右键 `index.html` → Open with Live Server

---

## 🌐 Debian12 云服务器部署（Nginx）

### 1. 安装 Nginx
```bash
sudo apt update
sudo apt install nginx -y
```

### 2. 上传项目文件
```bash
# 将 couple-web 文件夹上传到服务器
sudo mkdir -p /var/www/couple-web
sudo cp -r couple-web/* /var/www/couple-web/
```

### 3. 配置 Nginx
```bash
sudo nano /etc/nginx/sites-available/couple-web
```

写入以下配置：
```nginx
server {
    listen 80;
    server_name your_domain_or_ip;  # 替换为你的域名或IP

    root /var/www/couple-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1000;
}
```

### 4. 启用站点配置
```bash
sudo ln -s /etc/nginx/sites-available/couple-web /etc/nginx/sites-enabled/
sudo nginx -t                    # 测试配置
sudo systemctl reload nginx      # 重载 Nginx
```

### 5. 配置 HTTPS（可选，使用 Let's Encrypt）
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain
```

### 6. 设置文件权限
```bash
sudo chown -R www-data:www-data /var/www/couple-web
sudo chmod -R 755 /var/www/couple-web
```

---

## 📋 使用说明

### 注册账号
1. 访问网站，点击"立即注册"
2. 输入账号（6位以上，仅支持英文/数字）
3. 输入密码（6位以上，仅支持英文/数字）
4. 确认密码后点击注册

### 完善资料
1. 首次登录会自动跳转到资料完善页
2. 填写昵称、年龄、省份、城市
3. 可上传个人头像（支持JPG/PNG/GIF）
4. 选填个人简介
5. 点击保存进入首页

### 宠物养成
1. 首页点击"我的宠物"卡片进入游戏
2. 选择猫咪/小狗/小兔子
3. 通过喂食、玩耍、洗澡、睡觉维持宠物状态
4. 积累好感度可升级

---

## 🔒 数据存储说明

所有数据均存储在浏览器 LocalStorage 中：
- `couple_users` - 用户列表
- `couple_current_user` - 当前登录用户
- `couple_album_{username}` - 相册数据
- `couple_diary_{username}` - 日记数据
- `couple_wishlist_{username}` - 心愿清单
- `couple_quotes_{username}` - 语录数据
- `couple_anniversary_{username}` - 纪念日数据
- `couple_pet_{username}` - 宠物数据
- `couple_settings_{username}` - 设置数据

⚠️ 注意：清除浏览器缓存会导致数据丢失，建议定期备份。

---

## 🎨 主题配色

支持三种主题切换：
- 🩷 粉色主题（默认）
- 💜 紫色主题
- 💙 蓝色主题

在设置中心点击"切换主题配色"即可切换。

---

## 📱 响应式适配

| 设备 | 断点 | 布局 |
|------|------|------|
| 手机 | < 768px | 单列布局 |
| 平板 | 768px - 1024px | 双列布局 |
| 电脑 | > 1024px | 三列布局 |

---

## 📝 开发规范

- 代码使用中文注释
- 组件命名使用 kebab-case
- 变量命名使用 camelCase
- 常量使用 UPPER_SNAKE_CASE

---

## 🐛 常见问题

**Q: 刷新页面后数据丢失？**
A: 请检查浏览器是否禁用了 LocalStorage，或使用了无痕模式。

**Q: 图片上传失败？**
A: 请确保图片大小不超过 5MB，格式为 JPG/PNG/GIF/WEBP。

**Q: Nginx 部署后页面空白？**
A: 检查 Nginx 配置中 `root` 路径是否正确，查看 Nginx 错误日志 `sudo tail -f /var/log/nginx/error.log`。

---

## 📄 License

MIT License

---

💕 愿你们的爱情，如初见般美好 💕
