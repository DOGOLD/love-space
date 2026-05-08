/**
 * 全局特效脚本
 * 主题适配的飘落特效、点击特效等
 */

// 根据主题获取掉落物配置
function getParticlesConfig() {
    const body = document.body;
    if (body.classList.contains('theme-neon')) {
        // 极简液态霓虹主题 - 星星/闪光
        return {
            particles: ['✨', '💫', '⭐', '🌟', '✦', '✧'],
            className: 'particle-falling'
        };
    } else if (body.classList.contains('theme-cloud')) {
        // 云端治愈渐变主题 - 云朵/花朵
        return {
            particles: ['☁️', '🌸', '🌺', '💭', '🌤️', '☀️'],
            className: 'particle-falling'
        };
    } else if (body.classList.contains('theme-galaxy')) {
        // 宇宙银河浪漫主题 - 星星/流星
        return {
            particles: ['🌟', '✨', '💫', '🌠', '⭐', '✦'],
            className: 'particle-falling'
        };
    } else {
        // 默认甜蜜粉紫主题 - 爱心
        return {
            particles: ['💕', '💖', '💗', '💓', '💝', '❤️', '💘'],
            className: 'heart-falling'
        };
    }
}

// 飘落特效
function createFallingParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    setInterval(() => {
        const config = getParticlesConfig();
        const particle = document.createElement('div');
        particle.className = config.className;
        particle.textContent = config.particles[Math.floor(Math.random() * config.particles.length)];
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.fontSize = (Math.random() * 15 + 12) + 'px';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';

        // 根据主题调整透明度
        if (document.body.classList.contains('theme-galaxy') || document.body.classList.contains('theme-neon')) {
            particle.style.opacity = '0.8';
        }

        container.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 8000);
    }, 2500);
}

// 点击特效
function createClickEffect() {
    document.addEventListener('click', (e) => {
        const config = getParticlesConfig();
        const particle = document.createElement('div');
        particle.className = 'particle-burst';
        particle.textContent = config.particles[Math.floor(Math.random() * config.particles.length)];
        particle.style.left = e.clientX - 12 + 'px';
        particle.style.top = e.clientY - 12 + 'px';
        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 1000);
    });
}

// 监听主题变化，更新掉落物
function observeThemeChange() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                // 主题切换后，清空现有容器，重新开始
                const container = document.getElementById('particles-container');
                if (container) {
                    container.innerHTML = '';
                }
            }
        });
    });

    observer.observe(document.body, { attributes: true });
}

// 页面加载时初始化特效
document.addEventListener('DOMContentLoaded', () => {
    createFallingParticles();
    createClickEffect();
    observeThemeChange();
});

// 初始化已有元素的事件
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createFallingParticles();
    createClickEffect();
    observeThemeChange();
}
