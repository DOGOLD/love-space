const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'love-space-secret-key-2024';

// 配置上传存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 数据库和上传目录配置
const fs = require('fs');
const dbDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new sqlite3.Database(path.join(dbDir, 'database.sqlite'), (err) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Connected to SQLite database');
});

// 初始化数据库表
db.serialize(() => {
    // 用户表
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            nickname TEXT,
            age INTEGER,
            province TEXT,
            city TEXT,
            bio TEXT,
            avatar TEXT,
            partner_id INTEGER,
            love_start_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (partner_id) REFERENCES users(id)
        )
    `);
    
    // 为现有表添加恋爱开始时间字段（如果不存在）
    db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS love_start_date TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.log('添加字段跳过:', err.message);
        }
    });

    // 照片表
    db.run(`
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            url TEXT,
            category TEXT DEFAULT '默认相册',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // 日记表
    db.run(`
        CREATE TABLE IF NOT EXISTS diaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            content TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // 语录表
    db.run(`
        CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            content TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // 心愿清单表
    db.run(`
        CREATE TABLE IF NOT EXISTS wishes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            text TEXT,
            completed INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // 纪念日表
    db.run(`
        CREATE TABLE IF NOT EXISTS anniversaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // 宠物表
    db.run(`
        CREATE TABLE IF NOT EXISTS pets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            icon TEXT,
            element TEXT,
            element_name TEXT,
            level INTEGER DEFAULT 1,
            exp INTEGER DEFAULT 0,
            hunger INTEGER DEFAULT 100,
            cleanliness INTEGER DEFAULT 100,
            mood INTEGER DEFAULT 100,
            energy INTEGER DEFAULT 100,
            feed_status TEXT DEFAULT '{}',
            clean_status TEXT DEFAULT '{}',
            gold INTEGER DEFAULT 100,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
    
    // 音乐表
    db.run(`
        CREATE TABLE IF NOT EXISTS music (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            url TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
});

// 验证 token 中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: '未授权' });
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: '无效 token' });
        req.user = user;
        next();
    });
};

// 获取用户ID
const getUserId = (req) => {
    return req.user.id;
};

// 注册
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: '请输入账号和密码' });
    }
    
    if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ error: '账号长度必须在3-20个字符之间' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: '密码长度至少6个字符' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: '账号已存在' });
                }
                return res.status(500).json({ error: '注册失败' });
            }
            
            const token = jwt.sign({ id: this.lastID, username }, SECRET_KEY, { expiresIn: '7d' });
            res.json({ 
                success: true, 
                token, 
                user: { id: this.lastID, username } 
            });
        });
    } catch (error) {
        res.status(500).json({ error: '注册失败' });
    }
});

// 登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: '账号或密码错误' });
        }
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({ error: '账号或密码错误' });
        }
        
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '7d' });
        res.json({ 
            success: true, 
            token, 
            user: { 
                id: user.id, 
                username: user.username,
                nickname: user.nickname,
                avatar: user.avatar 
            } 
        });
    });
});

// 获取用户信息
app.get('/api/user', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    
    db.get('SELECT id, username, nickname, age, province, city, bio, avatar, love_start_date FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            return res.status(500).json({ error: '获取用户信息失败' });
        }
        res.json(user);
    });
});

// 设置恋爱开始时间
app.post('/api/love-date', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    const { date } = req.body;
    
    console.log('设置恋爱时间:', { userId, date });
    
    // 先获取当前用户信息
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            return res.status(500).json({ error: '用户不存在' });
        }
        
        // 更新当前用户和伴侣的恋爱时间
        db.run('UPDATE users SET love_start_date = ? WHERE id = ?', [date, userId], (err) => {
            if (err) return res.status(500).json({ error: '更新失败' });
            
            // 如果有伴侣，也更新伴侣的时间
            if (user.partner_id) {
                db.run('UPDATE users SET love_start_date = ? WHERE id = ?', [date, user.partner_id], (err) => {
                    if (err) console.error('更新伴侣恋爱时间失败:', err);
                    res.json({ success: true });
                });
            } else {
                res.json({ success: true });
            }
        });
    });
});

// 更新用户信息
app.post('/api/user', authenticateToken, upload.single('avatar'), (req, res) => {
    const userId = getUserId(req);
    const { nickname, age, province, city, bio } = req.body;
    
    console.log('收到更新用户请求:', { userId, hasFile: !!req.file, body: req.body });
    
    // 先获取当前用户信息，保留未更新的字段
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            return res.status(500).json({ error: '用户不存在' });
        }
        
        let avatar = user.avatar;
        if (req.file) {
            avatar = `/uploads/${req.file.filename}`;
        }
        
        const newNickname = nickname || user.nickname;
        const newAge = age !== undefined ? age : user.age;
        const newProvince = province !== undefined ? province : user.province;
        const newCity = city !== undefined ? city : user.city;
        const newBio = bio !== undefined ? bio : user.bio;
        
        db.run(
            'UPDATE users SET nickname = ?, age = ?, province = ?, city = ?, bio = ?, avatar = ? WHERE id = ?',
            [newNickname, newAge || null, newProvince, newCity, newBio, avatar, userId],
            (err) => {
                if (err) {
                    console.error('更新用户失败:', err);
                    return res.status(500).json({ error: '更新失败' });
                }
                res.json({ success: true });
            }
        );
    });
});

// 获取伴侣信息
app.get('/api/partner', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    
    db.get('SELECT partner_id FROM users WHERE id = ?', [userId], (err, result) => {
        if (err || !result || !result.partner_id) {
            return res.json(null);
        }
        
        db.get('SELECT id, username, nickname, avatar FROM users WHERE id = ?', [result.partner_id], (err, partner) => {
            if (err || !partner) {
                return res.json(null);
            }
            res.json(partner);
        });
    });
});

// 绑定伴侣
app.post('/api/partner/bind', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    const { partnerUsername } = req.body;
    
    if (!partnerUsername) {
        return res.status(400).json({ error: '请输入伴侣账号' });
    }
    
    db.get('SELECT id FROM users WHERE username = ?', [partnerUsername], (err, partner) => {
        if (err || !partner) {
            return res.status(400).json({ error: '未找到该用户' });
        }
        
        if (partner.id === userId) {
            return res.status(400).json({ error: '不能绑定自己' });
        }
        
        // 绑定双方
        db.run('UPDATE users SET partner_id = ? WHERE id = ?', [partner.id, userId], (err) => {
            if (err) return res.status(500).json({ error: '绑定失败' });
            
            db.run('UPDATE users SET partner_id = ? WHERE id = ?', [userId, partner.id], (err) => {
                if (err) return res.status(500).json({ error: '绑定失败' });
                res.json({ success: true });
            });
        });
    });
});

// 解除伴侣关系
app.post('/api/partner/unbind', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    
    db.get('SELECT partner_id FROM users WHERE id = ?', [userId], (err, result) => {
        if (err || !result || !result.partner_id) {
            return res.json({ success: true });
        }
        
        const partnerId = result.partner_id;
        
        db.run('UPDATE users SET partner_id = NULL WHERE id = ?', [userId], (err) => {
            if (err) return res.status(500).json({ error: '解除失败' });
            
            db.run('UPDATE users SET partner_id = NULL WHERE id = ?', [partnerId], (err) => {
                if (err) return res.status(500).json({ error: '解除失败' });
                res.json({ success: true });
            });
        });
    });
});

// 获取照片
app.get('/api/photos', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    const category = req.query.category;
    
    let query = 'SELECT * FROM photos WHERE user_id = ?';
    let params = [userId];
    
    if (category && category !== '全部') {
        query += ' AND category = ?';
        params.push(category);
    }
    
    // 获取自己和伴侣的照片
    db.get('SELECT partner_id FROM users WHERE id = ?', [userId], (err, result) => {
        if (result && result.partner_id) {
            query += ' OR user_id = ?';
            params.push(result.partner_id);
        }
        
        db.all(query, params, (err, photos) => {
            if (err) return res.status(500).json({ error: '获取照片失败' });
            res.json(photos.map(p => ({ ...p, url: p.url })));
        });
    });
});

// 上传照片
app.post('/api/photos', authenticateToken, upload.single('photo'), (req, res) => {
    const userId = getUserId(req);
    const category = req.body.category || '默认相册';
    
    console.log('收到照片上传请求:', { userId, hasFile: !!req.file, category });
    
    if (!req.file) {
        return res.status(400).json({ error: '请选择照片' });
    }
    
    db.run(
        'INSERT INTO photos (user_id, url, category) VALUES (?, ?, ?)',
        [userId, `/uploads/${req.file.filename}`, category],
        (err) => {
            if (err) {
                console.error('照片上传失败:', err);
                return res.status(500).json({ error: '上传失败' });
            }
            res.json({ success: true });
        }
    );
});

// 获取照片分类
app.get('/api/photos/categories', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    
    db.all('SELECT DISTINCT category FROM photos WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: '获取分类失败' });
        res.json(rows.map(r => r.category));
    });
});

// 获取日记（包含情侣双方）
app.get('/api/diaries', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    
    // 获取用户和伴侣的日记
    db.get('SELECT partner_id FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) return res.status(500).json({ error: '获取日记失败' });
        
        let query = 'SELECT * FROM diaries WHERE user_id = ?';
        let params = [userId];
        
        if (user && user.partner_id) {
            query += ' OR user_id = ?';
            params.push(user.partner_id);
        }
        
        query += ' ORDER BY created_at DESC';
        
        db.all(query, params, (err, diaries) => {
            if (err) return res.status(500).json({ error: '获取日记失败' });
            res.json(diaries);
        });
    });
});

// 添加日记
app.post('/api/diaries', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    const { content } = req.body;
    
    if (!content) {
        return res.status(400).json({ error: '请输入日记内容' });
    }
    
    db.run('INSERT INTO diaries (user_id, content) VALUES (?, ?)', [userId, content], (err) => {
        if (err) return res.status(500).json({ error: '添加失败' });
        res.json({ success: true });
    });
});

// 获取语录（包含情侣双方）
app.get('/api/quotes', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    
    // 获取用户和伴侣的语录
    db.get('SELECT partner_id FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) return res.status(500).json({ error: '获取语录失败' });
        
        let query = 'SELECT * FROM quotes WHERE user_id = ?';
        let params = [userId];
        
        if (user && user.partner_id) {
            query += ' OR user_id = ?';
            params.push(user.partner_id);
        }
        
        query += ' ORDER BY created_at DESC';
        
        db.all(query, params, (err, quotes) => {
            if (err) return res.status(500).json({ error: '获取语录失败' });
            res.json(quotes);
        });
    });
});

// 添加语录
app.post('/api/quotes', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    const { content } = req.body;
    
    if (!content) {
        return res.status(400).json({ error: '请输入语录内容' });
    }
    
    db.run('INSERT INTO quotes (user_id, content) VALUES (?, ?)', [userId, content], (err) => {
        if (err) return res.status(500).json({ error: '添加失败' });
        res.json({ success: true });
    });
});

// 获取心愿（包含情侣双方）
app.get('/api/wishes', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    
    // 获取用户和伴侣的心愿
    db.get('SELECT partner_id FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) return res.status(500).json({ error: '获取心愿失败' });
        
        let query = 'SELECT * FROM wishes WHERE user_id = ?';
        let params = [userId];
        
        if (user && user.partner_id) {
            query += ' OR user_id = ?';
            params.push(user.partner_id);
        }
        
        query += ' ORDER BY created_at DESC';
        
        db.all(query, params, (err, wishes) => {
            if (err) return res.status(500).json({ error: '获取心愿失败' });
            res.json(wishes);
        });
    });
});

// 添加心愿
app.post('/api/wishes', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: '请输入心愿内容' });
    }
    
    db.run('INSERT INTO wishes (user_id, text) VALUES (?, ?)', [userId, text], (err) => {
        if (err) return res.status(500).json({ error: '添加失败' });
        res.json({ success: true });
    });
});

// 更新心愿
app.put('/api/wishes/:id', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    const { id } = req.params;
    const { completed } = req.body;
    
    db.run(
        'UPDATE wishes SET completed = ? WHERE id = ? AND user_id = ?',
        [completed, id, userId],
        (err) => {
            if (err) return res.status(500).json({ error: '更新失败' });
            res.json({ success: true });
        }
    );
});

// 删除心愿
app.delete('/api/wishes/:id', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    const { id } = req.params;
    
    db.run('DELETE FROM wishes WHERE id = ? AND user_id = ?', [id, userId], (err) => {
        if (err) return res.status(500).json({ error: '删除失败' });
        res.json({ success: true });
    });
});

// 获取纪念日
app.get('/api/anniversaries', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    
    db.all('SELECT * FROM anniversaries WHERE user_id = ? ORDER BY date ASC', [userId], (err, anniversaries) => {
        if (err) return res.status(500).json({ error: '获取纪念日失败' });
        res.json(anniversaries);
    });
});

// 添加纪念日
app.post('/api/anniversaries', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    const { name, date } = req.body;
    
    if (!name || !date) {
        return res.status(400).json({ error: '请填写完整信息' });
    }
    
    db.run('INSERT INTO anniversaries (user_id, name, date) VALUES (?, ?, ?)', [userId, name, date], (err) => {
        if (err) return res.status(500).json({ error: '添加失败' });
        res.json({ success: true });
    });
});

// 获取音乐列表（包含情侣双方）
app.get('/api/music', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    
    db.get('SELECT partner_id FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) return res.status(500).json({ error: '获取音乐失败' });
        
        let query = 'SELECT * FROM music WHERE user_id = ?';
        let params = [userId];
        
        if (user && user.partner_id) {
            query += ' OR user_id = ?';
            params.push(user.partner_id);
        }
        
        query += ' ORDER BY created_at DESC';
        
        db.all(query, params, (err, music) => {
            if (err) return res.status(500).json({ error: '获取音乐失败' });
            res.json(music);
        });
    });
});

// 上传音乐
app.post('/api/music', authenticateToken, upload.single('music'), (req, res) => {
    const userId = getUserId(req);
    const { name } = req.body;
    
    console.log('收到音乐上传:', { userId, hasFile: !!req.file, name });
    
    if (!req.file) {
        return res.status(400).json({ error: '请选择音乐文件' });
    }
    
    const musicName = name || req.file.originalname;
    
    db.run('INSERT INTO music (user_id, name, url) VALUES (?, ?, ?)', 
        [userId, musicName, `/uploads/${req.file.filename}`], 
        (err) => {
            if (err) return res.status(500).json({ error: '上传失败' });
            res.json({ success: true });
        });
});

// 删除音乐
app.delete('/api/music/:id', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    const { id } = req.params;
    
    db.run('DELETE FROM music WHERE id = ? AND user_id = ?', [id, userId], (err) => {
        if (err) return res.status(500).json({ error: '删除失败' });
        res.json({ success: true });
    });
});

// 获取宠物
app.get('/api/pet', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    
    db.get('SELECT * FROM pets WHERE user_id = ?', [userId], (err, pet) => {
        if (err) return res.status(500).json({ error: '获取宠物失败' });
        if (!pet) return res.json(null);
        
        // 解析 JSON 字段
        try {
            pet.feedStatus = pet.feed_status ? JSON.parse(pet.feed_status) : { breakfast: false, lunch: false, dinner: false };
            pet.cleanStatus = pet.clean_status ? JSON.parse(pet.clean_status) : { cleaned: false };
        } catch (e) {
            pet.feedStatus = { breakfast: false, lunch: false, dinner: false };
            pet.cleanStatus = { cleaned: false };
        }
        
        delete pet.feed_status;
        delete pet.clean_status;
        
        res.json(pet);
    });
});

// 创建宠物
app.post('/api/pet', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    const { name, icon, element, elementName } = req.body;
    
    if (!name || !icon || !element || !elementName) {
        return res.status(400).json({ error: '请填写完整信息' });
    }
    
    db.run(
        'INSERT INTO pets (user_id, name, icon, element, element_name) VALUES (?, ?, ?, ?, ?)',
        [userId, name, icon, element, elementName],
        (err) => {
            if (err) return res.status(500).json({ error: '创建失败' });
            res.json({ success: true });
        }
    );
});

// 更新宠物
app.put('/api/pet', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    const petData = req.body;
    
    const feedStatus = JSON.stringify(petData.feedStatus || {});
    const cleanStatus = JSON.stringify(petData.cleanStatus || {});
    
    db.run(
        'UPDATE pets SET name = ?, icon = ?, element = ?, element_name = ?, level = ?, exp = ?, hunger = ?, cleanliness = ?, mood = ?, energy = ?, feed_status = ?, clean_status = ?, gold = ? WHERE user_id = ?',
        [
            petData.name, petData.icon, petData.element, petData.elementName,
            petData.level, petData.exp, petData.hunger, petData.cleanliness,
            petData.mood, petData.energy, feedStatus, cleanStatus, petData.gold, userId
        ],
        (err) => {
            if (err) return res.status(500).json({ error: '更新失败' });
            res.json({ success: true });
        }
    );
});

// 获取伴侣宠物
app.get('/api/pet/partner', authenticateToken, (req, res) => {
    const userId = getUserId(req);
    
    db.get('SELECT partner_id FROM users WHERE id = ?', [userId], (err, result) => {
        if (err || !result || !result.partner_id) {
            return res.json(null);
        }
        
        db.get('SELECT * FROM pets WHERE user_id = ?', [result.partner_id], (err, pet) => {
            if (err || !pet) return res.json(null);
            
            try {
                pet.feedStatus = pet.feed_status ? JSON.parse(pet.feed_status) : {};
                pet.cleanStatus = pet.clean_status ? JSON.parse(pet.clean_status) : {};
            } catch (e) {
                pet.feedStatus = {};
                pet.cleanStatus = {};
            }
            
            delete pet.feed_status;
            delete pet.clean_status;
            
            res.json(pet);
        });
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});