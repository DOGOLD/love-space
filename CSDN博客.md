# 基于 Vue3 + Node.js 的全栈情侣空间应用开发实战

> 一个温馨治愈的情侣专属网页应用，内置农场经营游戏、五行宠物养成、情侣绑定、恋爱纪念日、相册、日记等功能。

## 项目背景

在数字化时代，情侣之间需要一个专属的线上空间来记录甜蜜时刻、共同经营属于两人的小世界。本项目基于 Vue 3 和 Node.js 开发，实现了一个功能完整的情侣空间 Web 应用。

**在线演示**：[项目地址](https://github.com/DOGOLD/love-space)

## 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 | 前端响应式框架 |
| Tailwind CSS | 原子化 CSS 框架 |
| Node.js + Express | 后端 RESTful API |
| SQLite3 | 轻量级关系型数据库 |
| JWT | 用户身份认证 |
| Multer | 文件上传处理 |

## 核心功能架构

### 1. 情侣系统设计

情侣系统的核心是用户关系绑定，通过数据库中的 `partner_id` 字段实现双向关联：

```sql
-- 用户表设计
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    nickname TEXT,
    partner_id INTEGER,
    love_start_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES users(id)
);
```

**绑定逻辑**：
```javascript
// 情侣绑定 API
app.post('/api/bind', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    const { partnerUsername } = req.body;
    
    // 查找对方用户
    db.get('SELECT id FROM users WHERE username = ?', [partnerUsername], (err, partner) => {
        if (!partner) return res.status(404).json({ error: '用户不存在' });
        
        // 双向绑定
        db.run('UPDATE users SET partner_id = ? WHERE id = ?', [partner.id, userId]);
        db.run('UPDATE users SET partner_id = ? WHERE id = ?', [userId, partner.id]);
        
        res.json({ success: true });
    });
});
```

### 2. 情侣农场经营游戏

农场是本项目的亮点功能，采用**双人协作机制**，必须双方共同操作才能高效产出。

#### 2.1 农场状态管理

使用 Vue 3 的响应式数据管理农场状态：

```javascript
const farmState = reactive({
    coins: 100,
    lands: [],          // 6x6 土地网格
    warehouse: {},      // 作物仓库
    messages: [],       // 留言板
    achievements: [],   // 成就系统
    consecutiveDays: 1  // 连续共同耕种天数
});
```

#### 2.2 双人协作种植机制

```javascript
// 种植作物 - 需要双方确认
async confirmPlant() {
    const land = this.farmState.lands[this.selectedLandIndex];
    const crop = CROPS[this.selectedSeed.id];
    
    // 检查是否双方都确认
    const isBothConfirmed = this.partnerOnline && 
                           land.confirmedBy.includes(this.partnerName);
    
    if (!isBothConfirmed) {
        // 对方不在线，发送种植请求
        this.sendPlantRequest(land, crop);
        return;
    }
    
    // 双方都在线且确认，执行种植
    land.state = 'planted';
    land.cropType = crop.id;
    land.confirmedBy = [this.currentUser, this.partnerName];
    
    this.addNotification('❤️ 爱的契约已签订，种子种下啦！');
}
```

#### 2.3 偷菜惩罚机制

```javascript
// 收获作物
harvestCrop(index) {
    const land = this.farmState.lands[index];
    const isBothConfirmed = this.partnerOnline && 
                           land.confirmedBy.includes(this.partnerName);
    
    if (!isBothConfirmed) {
        // 偷菜惩罚：只能获得 20% 收益
        const crop = CROPS[land.cropType];
        const stealCoins = Math.floor(crop.sellPrice * 0.2);
        this.farmState.coins += stealCoins;
        this.addNotification(`🚨 偷菜！只获得 ${stealCoins} 金币（20%）`);
    } else {
        // 正常收获：获得全部收益
        const crop = CROPS[land.cropType];
        this.farmState.coins += crop.sellPrice;
        this.addNotification(`🎉 收获 ${crop.name}！获得 ${crop.sellPrice} 金币`);
    }
}
```

### 3. 五行宠物养成系统

宠物系统基于中国传统五行理论，实现相生相克的战斗机制。

#### 3.1 五行属性配置

```javascript
const WUXING = {
    '金': { color: '#FFD700', icon: '⚔️', strong: '木', weak: '火' },
    '木': { color: '#228B22', icon: '🌲', strong: '土', weak: '金' },
    '水': { color: '#1E90FF', icon: '💧', strong: '火', weak: '土' },
    '火': { color: '#FF4500', icon: '🔥', strong: '金', weak: '水' },
    '土': { color: '#8B4513', icon: '🏔️', strong: '水', weak: '木' }
};
```

#### 3.2 相生相克算法

```javascript
// 计算伤害倍率
function calculateDamageMultiplier(attackerElement, defenderElement) {
    const elementData = WUXING[attackerElement];
    
    if (elementData.strong === defenderElement) {
        return 1.5; // 克制对方，伤害 1.5 倍
    }
    if (elementData.weak === defenderElement) {
        return 0.7; // 被对方克制，伤害 0.7 倍
    }
    return 1.0; // 无克制关系，正常伤害
}
```

#### 3.3 时间限制喂养系统

```javascript
// 检查当前时间段
function getMealPeriod() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 11) return 'breakfast';   // 早餐 5:00-11:00
    if (hour >= 11 && hour < 17) return 'lunch';      // 午餐 11:00-17:00
    if (hour >= 17 && hour < 22) return 'dinner';     // 晚餐 17:00-22:00
    return null; // 非喂养时间
}

// 喂养宠物
async feedPet(petId, foodType) {
    const period = getMealPeriod();
    if (!period) {
        return { error: '当前不是喂养时间' };
    }
    
    // 检查今日是否已喂养
    const today = new Date().toDateString();
    if (pet.lastFedDate === today && pet.fedMeals.includes(period)) {
        return { error: '这顿饭已经喂过了' };
    }
    
    // 执行喂养
    pet.experience += 10;
    pet.fedMeals.push(period);
    pet.lastFedDate = today;
}
```

### 4. 多主题切换系统

通过 CSS 变量和 Tailwind CSS 配置实现四套主题：

```css
/* 甜蜜粉紫主题 */
.theme-pink-purple {
    --primary: #FFB6C1;
    --secondary: #E6E6FA;
    --accent: #87CEEB;
    --bg-gradient: linear-gradient(135deg, #FFE4E1 0%, #FFF0F5 100%);
}

/* 极简霓虹主题 */
.theme-neon {
    --primary: #00FFFF;
    --secondary: #FF00FF;
    --accent: #FFFF00;
    --bg-gradient: linear-gradient(135deg, #0F0F23 0%, #1A1A3E 100%);
}
```

**主题切换逻辑**：
```javascript
// 切换主题
function switchTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    localStorage.setItem('theme', themeName);
}
```

### 5. 文件上传与存储

使用 Multer 处理文件上传，SQLite 存储文件路径：

```javascript
const multer = require('multer');
const path = require('path');

// 配置存储
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 限制
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('只支持图片文件'));
        }
    }
});

// 上传头像 API
app.post('/api/user/avatar', authenticateToken, upload.single('avatar'), (req, res) => {
    const userId = getUserId(req);
    const avatarPath = `/uploads/${req.file.filename}`;
    
    db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, userId], (err) => {
        if (err) return res.status(500).json({ error: '上传失败' });
        res.json({ success: true, avatar: avatarPath });
    });
});
```

## 项目结构

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
│   │   └── style.css      # 全局样式 + 主题系统
│   └── js/
│       ├── auth.js        # 登录注册逻辑
│       ├── home.js        # 首页 + 宠物游戏核心逻辑
│       ├── profile.js     # 个人资料逻辑
│       └── api.js         # API 请求封装
├── uploads/               # 上传文件存储目录
├── data/                  # SQLite 数据库目录
└── README.md
```

## 部署方案

### 服务器部署

```bash
# 1. 上传项目到服务器
scp -r couple-web user@your-server:/opt/love-space/

# 2. 创建必要目录
cd /opt/love-space
mkdir -p uploads data
chmod 755 uploads
chmod 666 data/database.sqlite

# 3. 安装依赖并运行
npm install
PORT=3001 nohup node server.js > app.log 2>&1 &
```

### Systemd 开机自启

```ini
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
```

## 技术难点与解决方案

### 1. 实时状态同步

**问题**：情侣双方操作需要实时同步

**解决方案**：
- 使用 localStorage 缓存状态
- 每次操作后保存到数据库
- 页面加载时从数据库恢复状态

### 2. 文件权限问题

**问题**：SQLite 数据库只读导致写入失败

**解决方案**：
```bash
chmod 666 data/database.sqlite
chmod 777 data/
```

### 3. 端口冲突

**问题**：3000 端口被其他应用占用

**解决方案**：使用环境变量配置端口
```javascript
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## 项目总结

本项目是一个完整的全栈 Web 应用，涵盖了：

- ✅ 用户认证与授权（JWT）
- ✅ RESTful API 设计
- ✅ 数据库设计与操作
- ✅ 文件上传处理
- ✅ 响应式前端开发
- ✅ 游戏逻辑实现
- ✅ 服务器部署

通过这个项目，可以学习到 Vue 3、Express、SQLite3 等技术的实际应用，以及如何处理复杂业务逻辑（如双人协作、五行相克等）。

## 源码地址

**GitHub**: [https://github.com/DOGOLD/love-space](https://github.com/DOGOLD/love-space)

欢迎 Star 和 Fork，有任何问题欢迎提 Issue！

---

*如果你觉得这个项目对你有帮助，欢迎点赞支持！*
