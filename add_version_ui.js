const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, 'home.html');
let content = fs.readFileSync(homePath, 'utf8');

const versionCode = `

    <!-- 版本检测区域 -->
    <div id="version-check" style="position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; z-index: 1000;">
        <div id="version-info" style="display: inline-block; padding: 8px 16px; background: rgba(255,255,255,0.95); border-radius: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); font-size: 12px; color: #666;">
            <span id="current-version">v1.0.0</span>
            <span id="update-notification" style="display: none; margin-left: 10px; color: #ff6b6b;">
                → 有新版本！<button onclick="checkUpdate()" style="background: #ff6b6b; color: white; border: none; border-radius: 10px; padding: 4px 10px; font-size: 12px; cursor: pointer;">立即更新</button>
            </span>
        </div>
    </div>

    <script>
    // 当前客户端版本
    const CLIENT_VERSION = '1.0.0';

    // 检测版本
    async function checkVersion() {
        try {
            const response = await fetch('/api/version');
            const data = await response.json();
            
            document.getElementById('current-version').textContent = 'v' + CLIENT_VERSION;
            
            // 比较版本号
            if (compareVersions(data.version, CLIENT_VERSION) > 0) {
                document.getElementById('update-notification').style.display = 'inline';
            }
        } catch (error) {
            console.log('版本检测失败:', error);
        }
    }

    // 版本号比较
    function compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        const length = Math.max(parts1.length, parts2.length);
        
        for (let i = 0; i < length; i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;
            if (p1 > p2) return 1;
            if (p1 < p2) return -1;
        }
        return 0;
    }

    // 执行更新
    async function checkUpdate() {
        if (confirm('确定要更新吗？更新过程中可能需要刷新页面。')) {
            try {
                const response = await fetch('/api/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ secret: 'love-space-update-secret-2024' })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('更新完成！请刷新页面');
                    location.reload();
                } else {
                    alert('更新失败: ' + result.error);
                }
            } catch (error) {
                alert('更新失败: ' + error.message);
            }
        }
    }

    // 页面加载时检测版本
    document.addEventListener('DOMContentLoaded', checkVersion);
    </script>
</body>
</html>`;

const bodyEndIndex = content.lastIndexOf('</body>');
if (bodyEndIndex !== -1) {
    content = content.slice(0, bodyEndIndex) + versionCode;
    fs.writeFileSync(homePath, content);
    console.log('版本检测功能添加成功！');
} else {
    console.log('未找到 </body> 标签');
}