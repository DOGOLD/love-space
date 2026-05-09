# 💕 甜蜜空间 - 情侣专属网页

一个温馨治愈风格的情侣专属网页应用，内置情侣农场经营游戏、五行宠物养成、情侣绑定、恋爱纪念日、相册、日记、心愿清单、音乐播放器等功能。

## ✨ 功能特性

### 👫 情侣系统
- **账号注册/登录**：支持多账号独立登录，后端服务器数据存储
- **情侣绑定**：输入对方账号即可绑定情侣关系，支持解除绑定
- **个人资料**：头像上传、昵称、年龄、省份城市、个人简介
- **恋爱时间**：可设置恋爱开始日期，自动计算相爱天数

### 🌾 情侣农场经营游戏
- **6x6 网格农场**：36块土地，初始6块已开垦，可消耗金币开垦更多
- **双人协作种植**：必须双方共同确认才能种下作物（弹出"爱的契约"）
- **4阶段作物成长**：种子 → 发芽 → 开花 → 成熟，实时可视化成长进度
- **协作浇水/除虫**：植物需要双方共同浇水和除虫才能健康成长
- **双人收获机制**：必须双方同时点击才能收获全部收益
- **偷菜惩罚**：独自收获只能获得20%收益，剩余80%被系统没收
- **种植请求**：一方不在线时可发起请求，对方下次登录会收到弹窗提示
- **种子商店**：购买不同种类的种子，每种作物有不同的生长时间和收益
- **留言板**：农场内可随时给对方留言或发送表情包
- **守护犬系统**：养一只狗保护农场，偷菜时会发出警告
- **成就系统**：记录连续共同耕种天数，颁发"最佳伴侣"勋章

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
- **恋爱纪念日**：在一起天数计时，自定义纪念日（双方同步，支持删除）
- **情侣相册**：分类上传照片，网格展示（双方照片互通）
- **甜蜜语录墙**：轮播展示甜蜜语录（双方语录互通）
- **恋爱日记**：记录甜蜜时刻（双方日记互通）
- **心愿清单**：一起完成的小心愿（双方心愿互通）
- **音乐播放器**：上传自己喜欢的音乐，支持播放列表、进度调节、音量控制（双方音乐互通）

### 🔐 管理员后台
- **独立管理员账号**：与普通用户分离，安全可靠
- **用户管理**：查看所有用户、删除用户、查看用户详细信息
- **情侣绑定管理**：查看情侣绑定关系，强制解除绑定
- **内容管理**：管理语录、日记、照片、心愿等用户生成内容

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
├── register.html          # 注册页面
├── home.html              # 首页（主功能页面）
├── profile.html           # 个人资料页
├── couple_farm.html       # 情侣农场游戏
├── admin.html             # 管理员后台页面
├── server.js              # 后端服务器主文件
├── admin_server.js        # 管理员后台 API 服务器
├── assets/
│   ├── css/
│   │   └── style.css      # 全局样式 + 主题系统 + 响应式
│   └── js/
│       ├── auth.js        # 登录注册逻辑
│       ├── home.js        # 首页 + 宠物游戏核心逻辑
│       ├── profile.js     # 个人资料逻辑
│       └── api.js         # API 请求封装
├── uploads/               # 上传文件存储目录（重要！需要手动创建）
├── data/                  # SQLite 数据库目录
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
# 运行主服务器
node server.js
# 运行管理员服务器（可选）
node admin_server.js
```

默认访问：
- 主应用：`http://localhost:3000`
- 管理员后台：`http://localhost:3002`

### 服务器部署

```bash
# 1. 上传项目文件到服务器
scp -r couple-web user@your-server:/opt/love-space/

# 2. 进入目录并创建必要文件夹（重要！）
cd /opt/love-space
mkdir -p uploads
mkdir -p data
chmod 755 uploads  # 确保有写入权限
chmod 666 data/database.sqlite  # 确保数据库可写

# 3. 安装依赖（可选，项目已内置）
npm install

# 4. 后台运行服务
PORT=3001 nohup node server.js > app.log 2>&1 &

# 5. 运行管理员后台（可选）
PORT=3002 nohup node admin_server.js > admin.log 2>&1 &

# 6. 查看运行日志
tail -f app.log
```

## 🔄 设置开机自启

使用 systemd 设置开机自启：

```bash
# 创建服务文件
sudo tee /etc/systemd/system/love-space.service > /dev/null <<EOF
[Unit]
Description=Love Space Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/love-space
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd
sudo systemctl daemon-reload

# 启用开机自启
sudo systemctl enable love-space

# 立即启动服务
sudo systemctl start love-space

# 检查服务状态
sudo systemctl status love-space
```

## 🔐 管理员后台

### 访问地址
`http://your-domain.com/admin.html` 或 `http://your-server-ip:3002/admin.html`

### 默认账号
- **用户名**：admin
- **密码**：admin123

⚠️ **重要**：首次登录后请立即修改默认密码！

### 功能说明
1. **数据概览**：查看用户总数、情侣对数、内容统计等
2. **用户管理**：搜索、查看详情、删除用户
3. **情侣绑定**：强制解除指定用户的情侣绑定关系
4. **内容管理**：查看和删除语录、日记、照片、心愿
5. **设置**：修改管理员密码

## 🌐 Nginx 反向代理配置

### 主应用
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

### 管理员后台（可选）
```nginx
server {
    listen 80;
    server_name admin.your-domain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 配置 HTTPS（可选，推荐）
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
- 农场数据（土地、作物、金币、仓库）
- 宠物数据（等级、经验、属性、喂养状态）
- 主题设置
- 相册、日记、心愿清单、音乐等

## 📄 License

MIT License
