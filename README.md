# 💕 甜蜜空间 - 情侣专属网页

一个温馨治愈风格的情侣专属网页应用，内置五行宠物养成游戏、情侣绑定、恋爱纪念日、相册、日记、心愿清单、音乐播放器等功能。

## ✨ 功能特性

### 👫 情侣系统
- **账号注册/登录**：支持多账号独立登录，后端服务器数据存储
- **情侣绑定**：输入对方账号即可绑定情侣关系，支持解除绑定
- **个人资料**：头像上传、昵称、年龄、省份城市、个人简介
- **恋爱时间**：可设置恋爱开始日期，自动计算相爱天数

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
- **恋爱纪念日**：在一起天数计时，自定义纪念日（双方同步）
- **情侣相册**：分类上传照片，网格展示（双方照片互通）
- **甜蜜语录墙**：轮播展示甜蜜语录（双方语录互通）
- **恋爱日记**：记录甜蜜时刻（双方日记互通）
- **心愿清单**：一起完成的小心愿（双方心愿互通）
- **音乐播放器**：上传自己喜欢的音乐，支持播放列表、进度调节、音量控制（双方音乐互通）

## 🛠 技术栈

| 技术 | 说明 |
|------|------|
| HTML5 + CSS3 | 页面结构与样式 |
| Tailwind CSS | 原子化 CSS 框架 |
| Vue 3 | 前端响应式框架 |
| Node.js + Express | 后端服务器 |
| SQLite3 | 轻量级数据库 |
| Multer | 文件上传处理 |
| JWT | 用户身份认证 |

## 📁 项目结构

```
couple-web/
├── index.html              # 登录页面
├── register.html           # 注册页面
├── home.html               # 首页（主功能页面）
├── profile.html            # 个人资料页
├── server.js               # 后端服务器主文件
├── assets/
│   ├── css/
│   │   └── style.css       # 全局样式 + 主题系统 + 响应式
│   └── js/
│       ├── auth.js         # 登录注册逻辑
│       ├── home.js         # 首页 + 宠物游戏核心逻辑
│       ├── profile.js      # 个人资料逻辑
│       └── api.js          # API 请求封装
├── uploads/                # 上传文件存储目录（重要！需要手动创建）
├── data/                   # SQLite 数据库目录
├── .gitignore
└── README.md
```

## 🚀 快速开始

### ⚠️ 重要前置条件

**必须先创建以下目录！** 否则文件上传会失败：

```bash
cd couple-web
mkdir -p uploads
mkdir -p data
```

### 本地开发运行

```bash
cd couple-web
npm install
# 或者直接运行
node server.js
```

默认访问 `http://localhost:3000`

### 服务器部署

```bash
# 1. 上传项目文件到服务器
scp -r couple-web user@your-server:/opt/love-space/

# 2. 进入目录并创建必要文件夹（重要！）
cd /opt/love-space
mkdir -p uploads
mkdir -p data
chmod 755 uploads  # 确保有写入权限

# 3. 安装依赖（可选，项目已内置）
npm install

# 4. 后台运行服务
PORT=3001 nohup node server.js > app.log 2>&1 &

# 5. 查看运行日志
tail -f app.log
```

### 使用 PM2 管理进程（推荐）

```bash
npm install -g pm2
pm2 start server.js --name love-space
pm2 save
pm2 startup
```

## 🌐 Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件大小限制
    client_max_body_size 20M;
}
```

配置 HTTPS（可选，推荐）：
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📱 响应式适配

- **PC 端**（>1024px）：完整三列布局
- **平板端**（768px-1024px）：两列布局
- **手机端**（<768px）：单列布局，弹窗底部弹出
- **小屏手机**（<480px）：紧凑布局，优化触摸体验

## 🔒 数据存储说明

所有用户数据存储在后端 SQLite 数据库中：
- 用户账号和资料
- 情侣绑定关系
- 宠物数据（等级、经验、属性、喂养状态）
- 主题设置
- 相册、日记、心愿清单、音乐等

## 📄 License

MIT License
