const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const ADMIN_PORT = process.env.ADMIN_PORT || 3002;
const SECRET_KEY = 'love-space-admin-secret-key-2024';

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接
const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('数据库连接失败:', err);
    else console.log('已连接到数据库');
});

// 管理员认证中间件
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: '未授权' });
    
    jwt.verify(token, SECRET_KEY, (err, admin) => {
        if (err) return res.status(403).json({ error: '无效 token' });
        req.admin = admin;
        next();
    });
};

// 管理员登录
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: '请输入账号和密码' });
    }
    
    db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, admin) => {
        if (err || !admin) {
            return res.status(400).json({ error: '账号或密码错误' });
        }
        
        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) {
            return res.status(400).json({ error: '账号或密码错误' });
        }
        
        const token = jwt.sign({ id: admin.id, username: admin.username }, SECRET_KEY, { expiresIn: '7d' });
        res.json({ success: true, token });
    });
});

// 修改管理员密码
app.post('/api/admin/password', authenticateAdmin, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const adminId = req.admin.id;
    
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: '请输入旧密码和新密码' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: '新密码长度至少6个字符' });
    }
    
    db.get('SELECT * FROM admins WHERE id = ?', [adminId], async (err, admin) => {
        if (err || !admin) {
            return res.status(400).json({ error: '管理员不存在' });
        }
        
        const valid = await bcrypt.compare(oldPassword, admin.password);
        if (!valid) {
            return res.status(400).json({ error: '旧密码错误' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.run('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, adminId], (err) => {
            if (err) return res.status(500).json({ error: '修改密码失败' });
            res.json({ success: true });
        });
    });
});

// 获取所有用户
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let countSql = 'SELECT COUNT(*) as total FROM users';
    let sql = `SELECT u.id, u.username, u.nickname, u.avatar, u.partner_id, u.created_at,
               u2.username as partner_username, u2.nickname as partner_nickname
               FROM users u
               LEFT JOIN users u2 ON u.partner_id = u2.id`;
    let params = [];
    
    if (search) {
        const whereClause = ' WHERE u.username LIKE ? OR u.nickname LIKE ?';
        countSql += whereClause;
        sql += whereClause;
        params = [`%${search}%`, `%${search}%`];
    }
    
    sql += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    db.get(countSql, params.slice(0, search ? 2 : 0), (err, countResult) => {
        if (err) return res.status(500).json({ error: '获取用户失败' });
        
        db.all(sql, params, (err, users) => {
            if (err) return res.status(500).json({ error: '获取用户失败' });
            
            res.json({
                users,
                total: countResult.total,
                page: parseInt(page),
                totalPages: Math.ceil(countResult.total / limit)
            });
        });
    });
});

// 获取用户详细信息
app.get('/api/admin/users/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    
    db.get(`
        SELECT u.*, u2.username as partner_username, u2.nickname as partner_nickname
        FROM users u
        LEFT JOIN users u2 ON u.partner_id = u2.id
        WHERE u.id = ?
    `, [id], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: '用户不存在' });
        }
        
        // 获取用户的宠物
        db.get('SELECT * FROM pets WHERE user_id = ?', [id], (err, pet) => {
            if (err) pet = null;
            
            // 获取用户的照片数量
            db.get('SELECT COUNT(*) as count FROM photos WHERE user_id = ?', [id], (err, photoResult) => {
                if (err) photoResult = { count: 0 };
                
                // 获取用户的日记数量
                db.get('SELECT COUNT(*) as count FROM diaries WHERE user_id = ?', [id], (err, diaryResult) => {
                    if (err) diaryResult = { count: 0 };
                    
                    // 获取用户的语录数量
                    db.get('SELECT COUNT(*) as count FROM quotes WHERE user_id = ?', [id], (err, quoteResult) => {
                        if (err) quoteResult = { count: 0 };
                        
                        // 获取用户的心愿数量
                        db.get('SELECT COUNT(*) as count FROM wishes WHERE user_id = ?', [id], (err, wishResult) => {
                            if (err) wishResult = { count: 0 };
                            
                            res.json({
                                ...user,
                                pet,
                                stats: {
                                    photos: photoResult.count,
                                    diaries: diaryResult.count,
                                    quotes: quoteResult.count,
                                    wishes: wishResult.count
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});

// 删除用户
app.delete('/api/admin/users/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    
    // 先获取用户信息，检查是否有伴侣
    db.get('SELECT partner_id FROM users WHERE id = ?', [id], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: '用户不存在' });
        }
        
        // 解除伴侣关系
        if (user.partner_id) {
            db.run('UPDATE users SET partner_id = NULL WHERE id = ?', [user.partner_id], (err) => {
                if (err) console.error('解除伴侣关系失败:', err);
            });
        }
        
        // 删除用户的宠物
        db.run('DELETE FROM pets WHERE user_id = ?', [id], (err) => {
            if (err) console.error('删除宠物失败:', err);
        });
        
        // 删除用户的照片
        db.run('DELETE FROM photos WHERE user_id = ?', [id], (err) => {
            if (err) console.error('删除照片失败:', err);
        });
        
        // 删除用户的日记
        db.run('DELETE FROM diaries WHERE user_id = ?', [id], (err) => {
            if (err) console.error('删除日记失败:', err);
        });
        
        // 删除用户的语录
        db.run('DELETE FROM quotes WHERE user_id = ?', [id], (err) => {
            if (err) console.error('删除语录失败:', err);
        });
        
        // 删除用户的心愿
        db.run('DELETE FROM wishes WHERE user_id = ?', [id], (err) => {
            if (err) console.error('删除心愿失败:', err);
        });
        
        // 删除用户的纪念日
        db.run('DELETE FROM anniversaries WHERE user_id = ?', [id], (err) => {
            if (err) console.error('删除纪念日失败:', err);
        });
        
        // 删除用户的音乐
        db.run('DELETE FROM music WHERE user_id = ?', [id], (err) => {
            if (err) console.error('删除音乐失败:', err);
        });
        
        // 最后删除用户
        db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: '删除用户失败' });
            res.json({ success: true });
        });
    });
});

// 强制解除情侣绑定
app.post('/api/admin/unbind', authenticateAdmin, (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ error: '请提供用户ID' });
    }
    
    db.get('SELECT partner_id FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: '用户不存在' });
        }
        
        if (!user.partner_id) {
            return res.json({ success: true, message: '该用户没有绑定伴侣' });
        }
        
        const partnerId = user.partner_id;
        
        db.run('UPDATE users SET partner_id = NULL WHERE id = ?', [userId], (err) => {
            if (err) return res.status(500).json({ error: '解除绑定失败' });
            
            db.run('UPDATE users SET partner_id = NULL WHERE id = ?', [partnerId], (err) => {
                if (err) return res.status(500).json({ error: '解除绑定失败' });
                res.json({ success: true });
            });
        });
    });
});

// 获取所有内容（语录、日记等）
app.get('/api/admin/content', authenticateAdmin, (req, res) => {
    const { type, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let table, countTable;
    switch (type) {
        case 'quotes':
            table = 'quotes';
            countTable = 'quotes';
            break;
        case 'diaries':
            table = 'diaries';
            countTable = 'diaries';
            break;
        case 'wishes':
            table = 'wishes';
            countTable = 'wishes';
            break;
        case 'photos':
            table = 'photos';
            countTable = 'photos';
            break;
        default:
            return res.status(400).json({ error: '无效的内容类型' });
    }
    
    const sql = `SELECT q.*, u.username, u.nickname 
                 FROM ${table} q 
                 LEFT JOIN users u ON q.user_id = u.id 
                 ORDER BY q.created_at DESC 
                 LIMIT ? OFFSET ?`;
    
    db.get(`SELECT COUNT(*) as total FROM ${countTable}`, (err, countResult) => {
        if (err) return res.status(500).json({ error: '获取内容失败' });
        
        db.all(sql, [parseInt(limit), parseInt(offset)], (err, items) => {
            if (err) return res.status(500).json({ error: '获取内容失败' });
            res.json({
                items,
                total: countResult.total,
                page: parseInt(page),
                totalPages: Math.ceil(countResult.total / limit)
            });
        });
    });
});

// 删除内容
app.delete('/api/admin/content/:type/:id', authenticateAdmin, (req, res) => {
    const { type, id } = req.params;
    
    let table;
    switch (type) {
        case 'quotes':
            table = 'quotes';
            break;
        case 'diaries':
            table = 'diaries';
            break;
        case 'wishes':
            table = 'wishes';
            break;
        case 'photos':
            table = 'photos';
            break;
        default:
            return res.status(400).json({ error: '无效的内容类型' });
    }
    
    db.run(`DELETE FROM ${table} WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ error: '删除失败' });
        res.json({ success: true });
    });
});

// 获取统计数据
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
    db.get('SELECT COUNT(*) as count FROM users', (err, userResult) => {
        if (err) userResult = { count: 0 };
        
        db.get('SELECT COUNT(*) as count FROM users WHERE partner_id IS NOT NULL', (err, coupleResult) => {
            if (err) coupleResult = { count: 0 };
            
            db.get('SELECT COUNT(*) as count FROM quotes', (err, quoteResult) => {
                if (err) quoteResult = { count: 0 };
                
                db.get('SELECT COUNT(*) as count FROM diaries', (err, diaryResult) => {
                    if (err) diaryResult = { count: 0 };
                    
                    db.get('SELECT COUNT(*) as count FROM photos', (err, photoResult) => {
                        if (err) photoResult = { count: 0 };
                        
                        db.get('SELECT COUNT(*) as count FROM wishes', (err, wishResult) => {
                            if (err) wishResult = { count: 0 };
                            
                            res.json({
                                totalUsers: userResult.count,
                                totalCouples: coupleResult.count,
                                totalQuotes: quoteResult.count,
                                totalDiaries: diaryResult.count,
                                totalPhotos: photoResult.count,
                                totalWishes: wishResult.count
                            });
                        });
                    });
                });
            });
        });
    });
});

// 启动管理员服务器
app.listen(ADMIN_PORT, () => {
    console.log(`管理员后台服务器运行在 http://localhost:${ADMIN_PORT}`);
});
