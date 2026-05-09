const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

const versionCode = `

// 版本检测接口
app.get('/api/version', (req, res) => {
    fs.readFile(path.join(__dirname, 'version.json'), 'utf8', (err, data) => {
        if (err) {
            return res.json({ version: '1.0.0', changelog: '未知', updateTime: new Date().toISOString() });
        }
        try {
            const versionInfo = JSON.parse(data);
            res.json(versionInfo);
        } catch (e) {
            res.json({ version: '1.0.0', changelog: '未知', updateTime: new Date().toISOString() });
        }
    });
});

// 自动更新接口
app.post('/api/update', (req, res) => {
    const { secret } = req.body;
    
    if (secret !== 'love-space-update-secret-2024') {
        return res.status(403).json({ error: '未授权' });
    }
    
    const { exec } = require('child_process');
    exec('cd /opt/love-space && ./update.sh', (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json({ success: true, output: stdout, error: stderr });
    });
});
`;

const lastBracketIndex = content.lastIndexOf('});');
if (lastBracketIndex !== -1) {
    content = content.slice(0, lastBracketIndex) + versionCode + content.slice(lastBracketIndex);
    fs.writeFileSync(serverPath, content);
    console.log('版本接口添加成功！');
} else {
    console.log('未找到插入位置');
}