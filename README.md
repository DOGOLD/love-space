# 💕 甜蜜空间 - 情侣专属网页

一个温馨治愈风格的情侣专属网页应用，内置五行宠物养成游戏、情侣绑定、恋爱纪念日、相册、日记、心愿清单等功能。

## ✨ 功能特性

### 👫 情侣系统
- **账号注册/登录**：支持多账号独立登录，LocalStorage 本地存储
- **情侣绑定**：输入对方账号即可绑定情侣关系，支持解除绑定
- **个人资料**：头像上传、昵称、年龄、省份城市、个人简介

### 🐾 五行宠物养成游戏
- **五行属性**：金、木、水、火、土，每种属性两只宠物可选
- **相生相克**：金克木、木克土、土克水、水克火、火克金，属性加成 1.5 倍伤害
- **时间限制喂养**：早餐(5:00-11:00)、午餐(11:00-17:00)、晚餐(17:00-22:00)，每日三次
- **每日清洁**：每天可清洁一次
- **文字冒险打怪**：五大探险区域，随机遭遇野生宠物，多种事件（宝箱/小偷/战斗）
- **情侣对战**：双方宠物可互相切磋，消耗金币挑战
- **金币系统**：初始 100 金币，探险/战斗获取，失败会损失

### 🎨 四套主题
| 主题 | 风格 | 特效 |
|------|------|------|
| 甜蜜粉紫 | 温馨治愈·浪漫柔和 | 爱心飘落 |
| 极简霓虹 | 流体渐变·未来酷炫 | 星光闪烁 |
| 云端治愈 | 柔和渐变·温馨干净 | 云朵花朵 |
| 宇宙银河 | 银河星云·浪漫酷炫 | 流星划过 |

### 📸 其他功能
- **恋爱纪念日**：在一起天数计时，自定义纪念日
- **情侣相册**：分类上传照片，网格展示
- **甜蜜语录墙**：轮播展示甜蜜语录
- **恋爱日记**：记录甜蜜时刻
- **心愿清单**：一起完成的小心愿
- **背景音乐**：可调节音量的背景音乐播放器

## 🛠 技术栈

| 技术 | 说明 |
|------|------|
| HTML5 + CSS3 | 页面结构与样式 |
| Tailwind CSS | 原子化 CSS 框架 |
| Vue 3 | 前端响应式框架 |
| LocalStorage | 本地数据持久化 |
| Nginx | Web 服务器 |

## 📁 项目结构

```
couple-web/
├── index.html              # 登录页面
├── register.html           # 注册页面
├── home.html               # 首页（主功能页面）
├── profile.html            # 个人资料页
├── assets/
│   ├── css/
│   │   └── style.css       # 全局样式 + 主题系统 + 响应式
│   └── js/
│       ├── auth.js         # 登录注册逻辑
│       ├── home.js         # 首页 + 宠物游戏核心逻辑
│       ├── effects.js      # 动态特效（飘落物等）
│       └── profile.js      # 个人资料逻辑
├── utils/
│   └── storage.js          # LocalStorage 工具类
├── nginx.conf              # Nginx 配置
├── Dockerfile              # Docker 镜像构建
├── docker-compose.yml      # Docker Compose 编排
├── .dockerignore
├── .gitignore
└── README.md
```

## 🚀 快速开始

### 方式一：直接部署

将项目文件放到任意 Web 服务器目录下即可，无需构建步骤。

```bash
# 使用 Nginx
cp -r couple-web /var/www/
# 配置 nginx.conf 到 /etc/nginx/sites-available/
nginx -s reload
```

### 方式二：Docker 部署（推荐）

支持 **amd64** 和 **arm64** 架构（包括 Apple Silicon、树莓派等 ARM 设备）。

```bash
# 构建并启动
docker-compose up -d

# 或者手动构建
docker build -t love-space .
docker run -d -p 8080:80 --name love-space love-space
```

访问 `http://localhost:8080` 即可。

### 方式三：多架构构建并推送

```bash
# 创建 buildx 构建器
docker buildx create --name multiarch --use

# 构建多架构镜像
docker buildx build --platform linux/amd64,linux/arm64 -t your-username/love-space:latest --push .
```

## 🌐 Debian 服务器部署

```bash
# 1. 安装 Nginx
sudo apt update && sudo apt install -y nginx

# 2. 上传项目文件
scp -r couple-web user@your-server:/var/www/

# 3. 配置 Nginx（参考 nginx.conf）
sudo cp /var/www/couple-web/nginx.conf /etc/nginx/conf.d/love-space.conf
sudo nginx -t && sudo nginx -s reload

# 4. 配置 HTTPS（可选）
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📱 响应式适配

- **PC 端**（>1024px）：完整三列布局
- **平板端**（768px-1024px）：两列布局
- **手机端**（<768px）：单列布局，弹窗底部弹出
- **小屏手机**（<480px）：紧凑布局，优化触摸体验

## 🔒 数据存储说明

所有用户数据存储在浏览器 LocalStorage 中：
- 用户账号和资料
- 情侣绑定关系
- 宠物数据（等级、经验、属性、喂养状态）
- 主题设置
- 相册、日记、心愿清单等

> ⚠️ 注意：LocalStorage 是浏览器级别的存储，不同浏览器/设备之间的数据不互通。建议情侣双方在同一设备上使用不同浏览器（或使用浏览器的无痕模式）来分别登录。

## 📄 License

MIT License