/**
 * 首页核心逻辑
 * 包含所有功能模块的数据管理和交互
 */

const { createApp } = Vue;

// 省份城市数据（与profile.js保持一致）
const provinceCityData = {
    '北京市': ['北京市'], '上海市': ['上海市'], '天津市': ['天津市'], '重庆市': ['重庆市'],
    '河北省': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市'],
    '江苏省': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市'],
    '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市'],
    '广东省': ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '东莞市'],
    '四川省': ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市']
};

createApp({
    data() {
        return {
            // 用户信息
            currentUser: null,
            userProfile: {},
            partner: null,  // 绑定的伴侣用户
            provinces: Object.keys(provinceCityData),
            
            // 纪念日
            anniversaryData: null,
            anniversaryDays: 0,
            currentTime: { hours: '00', minutes: '00', seconds: '00' },
            customAnniversaries: [],
            timer: null,
            
            // 相册
            albumData: [],
            albumCategories: ['全部', '默认相册'],
            currentAlbumCategory: '全部',
            viewingPhoto: '',
            
            // 语录
            quotes: [],
            currentQuoteIndex: 0,
            quoteTimer: null,
            
            // 日记
            diaries: [],
            
            // 心愿清单
            wishlist: [],
            
            // 五行宠物配置
            petElements: [
                { id: 'wood', name: '木', icon: '🪵', color: 'green' },
                { id: 'fire', name: '火', icon: '🔥', color: 'red' },
                { id: 'earth', name: '土', icon: '🪨', color: 'yellow' },
                { id: 'metal', name: '金', icon: '⚔️', color: 'gray' },
                { id: 'water', name: '水', icon: '💧', color: 'blue' }
            ],
            selectedElement: 'wood',
            petOptions: [
                { id: 'grass', name: '小草灵', icon: '🌿', element: 'wood', elementName: '木', bgColor: '#dcfce7', borderColor: '#86efac', desc: '一片充满生机的小草精灵' },
                { id: 'forest', name: '森木兽', icon: '🌲', element: 'wood', elementName: '木', bgColor: '#dcfce7', borderColor: '#86efac', desc: '森林深处的守护者' },
                { id: 'flame', name: '小火狐', icon: '🦊', element: 'fire', elementName: '火', bgColor: '#fee2e2', borderColor: '#fca5a5', desc: '拥有火焰尾巴的灵狐' },
                { id: 'lion', name: '烈焰狮', icon: '🦁', element: 'fire', elementName: '火', bgColor: '#fee2e2', borderColor: '#fca5a5', desc: '火焰鬃毛的百兽之王' },
                { id: 'rock', name: '小岩人', icon: '🗿', element: 'earth', elementName: '土', bgColor: '#fef9c3', borderColor: '#fde047', desc: '岩石之心孕育的生命' },
                { id: 'bear', name: '大地熊', icon: '🐻', element: 'earth', elementName: '土', bgColor: '#fef9c3', borderColor: '#fde047', desc: '承载大地力量的巨熊' },
                { id: 'dragon', name: '小金龙', icon: '🐉', element: 'metal', elementName: '金', bgColor: '#f3f4f6', borderColor: '#d1d5db', desc: '金属鳞片的龙族幼崽' },
                { id: 'shield', name: '铁甲兽', icon: '🦍', element: 'metal', elementName: '金', bgColor: '#f3f4f6', borderColor: '#d1d5db', desc: '刀枪不入的铁甲战士' },
                { id: 'turtle', name: '水灵龟', icon: '🐢', element: 'water', elementName: '水', bgColor: '#dbeafe', borderColor: '#93c5fd', desc: '承载水之灵性的古龟' },
                { id: 'bubble', name: '泡泡龙', icon: '🐲', element: 'water', elementName: '水', bgColor: '#dbeafe', borderColor: '#93c5fd', desc: '能操控水波的龙族' }
            ],
            
            // 宠物数据
            pet: {
                id: '', name: '', icon: '', element: '', elementName: '',
                level: 1, exp: 0, maxExp: 100,
                hunger: 100, cleanliness: 100, mood: 100, energy: 100,
                feedStatus: { breakfast: false, lunch: false, dinner: false },
                lastFeedReset: '',
                cleanStatus: { cleaned: false, lastCleanReset: '' },
                gold: 100
            },
            petGameView: 'select',
            
            // 探险相关
            adventure: {
                currentZone: '精灵森林',
                description: '你踏入了一片神秘的森林...',
                enemy: null,
                options: [],
                result: null
            },
            
            // 对战相关
            partnerPet: null,
            battleResult: null,
            
            // 探险区域配置
            adventureZones: [
                { name: '精灵森林', description: '你踏入了一片神秘的森林，空气中弥漫着草木的清香...', enemies: ['🌱 野生草灵', '🌿 藤蔓蛇'], options: ['往左走', '往右走', '继续前进'] },
                { name: '火焰山谷', description: '炙热的气息扑面而来，岩浆在远处缓缓流淌...', enemies: ['🔥 烈焰蝶', '🦎 火焰蜥'], options: ['穿过岩浆', '绕道而行', '直接前进'] },
                { name: '岩石山脉', description: '高耸入云的山峰令人敬畏，碎石不时从山顶滚落...', enemies: ['🪨 落石怪', '⛰️ 山岭巨人'], options: ['攀登山崖', '走山洞', '绕过山峰'] },
                { name: '金属工坊', description: '齿轮转动的声音在耳边回响，废弃的机器正在重新运转...', enemies: ['⚔️ 废铁机器人', '🛡️ 锈蚀卫兵'], options: ['潜入工厂', '正面突破', '寻找入口'] },
                { name: '水晶湖泊', description: '平静的湖面倒映着天空，水晶般的光芒在水面闪烁...', enemies: ['💧 水晶蟹', '🐚 珍珠蚌'], options: ['环湖漫步', '下水探索', '湖边休息'] }
            ],
            
            // 五行相克配置：金克木、木克土、土克水、水克火、火克金
            elementalAdvantage: {
                wood: { weakTo: 'metal', strongTo: 'earth' },
                fire: { weakTo: 'water', strongTo: 'metal' },
                earth: { weakTo: 'wood', strongTo: 'water' },
                metal: { weakTo: 'fire', strongTo: 'wood' },
                water: { weakTo: 'earth', strongTo: 'fire' }
            },
            
            // 音乐播放器
            isPlaying: false,
            volume: 50,
            audio: null,
            
            // 弹窗控制
            showSettings: false,
            showEditProfile: false,
            showCoupleBind: false,
            showThemeSelect: false,
            showAddAnniversary: false,
            showAddAlbum: false,
            showAddAlbumCategory: false,
            showAddQuote: false,
            showAddDiary: false,
            showAddWish: false,
            showChangePassword: false,
            showPetGame: false,
            showPhotoViewer: false,
            currentThemeClass: 'theme-pink',
            
            // 表单数据
            editProfileForm: { avatar: '', nickname: '', age: null, province: '', city: '', bio: '' },
            anniversaryForm: { name: '', date: '' },
            newCategoryName: '',
            newQuote: '',
            diaryForm: { content: '' },
            editingDiaryIndex: -1,
            newWish: '',
            passwordForm: { oldPassword: '', newPassword: '', confirmPassword: '' },
            passwordError: '',
            uploadAlbumCategory: '全部',
            selectedPhotos: [],
            // 情侣绑定数据
            coupleUsername: '',
            coupleBindError: '',
            coupleBindSuccess: ''
        };
    },
    watch: {
        showEditProfile(newVal) {
            if (newVal) {
                this.editProfileForm = {
                    avatar: this.userProfile.avatar || '',
                    nickname: this.userProfile.nickname || '',
                    age: this.userProfile.age || null,
                    province: this.userProfile.province || '',
                    city: this.userProfile.city || '',
                    bio: this.userProfile.bio || ''
                };
            }
        }
    },
    computed: {
        currentCities() {
            return provinceCityData[this.editProfileForm.province] || [];
        },
        currentPhotos() {
            if (this.currentAlbumCategory === '全部') {
                return this.albumData;
            }
            return this.albumData.filter(p => p.category === this.currentAlbumCategory);
        },
        currentQuote() {
            return this.quotes[this.currentQuoteIndex] || '暂无语录';
        },
        filteredPetOptions() {
            return this.petOptions.filter(p => p.element === this.selectedElement);
        },
        expToNextLevel() {
            return this.pet.level * 100;
        },
        canFeed() {
            const hour = new Date().getHours();
            const feedStatus = this.pet.feedStatus;
            if (hour >= 5 && hour < 11 && !feedStatus.breakfast) return true;
            if (hour >= 11 && hour < 17 && !feedStatus.lunch) return true;
            if (hour >= 17 && hour < 22 && !feedStatus.dinner) return true;
            return false;
        },
        petIcon() {
            return this.pet.icon || '🐾';
        },
        petLevel() {
            return this.pet.level || 1;
        },
        petAffection() {
            return Math.floor(((this.pet.mood || 50) + (this.pet.exp || 0)) / 10);
        }
    },
    methods: {
        // 初始化数据
        initData() {
            const username = this.currentUser.username;
            this.userProfile = this.currentUser.profile || {};
            this.anniversaryData = Storage.anniversary.get(username) || { startDate: new Date().toISOString().split('T')[0], customDates: [] };
            this.albumData = Storage.album.getAll(username);
            this.quotes = Storage.quotes.getAll(username);
            this.diaries = Storage.diary.getAll(username);
            this.wishlist = Storage.wishlist.getAll(username);
            this.loadPet();
            this.loadPartner();
            this.loadPartnerPet();
            
            // 提取相册分类
            const categories = new Set(this.albumData.map(p => p.category));
            this.albumCategories = ['全部', ...categories, '默认相册'];
            
            this.calculateAnniversary();
        },
        
        // 加载宠物数据
        loadPet() {
            const username = this.currentUser.username;
            const savedPet = Storage.pet.get(username);
            if (savedPet && savedPet.id) {
                this.pet = savedPet;
                if (!this.pet.cleanStatus) {
                    this.pet.cleanStatus = { cleaned: false, lastCleanReset: new Date().toDateString() };
                }
                if (typeof this.pet.gold !== 'number') {
                    this.pet.gold = 100;
                }
                this.petGameView = 'main';
            } else {
                this.pet = {
                    id: '', name: '', icon: '', element: '', elementName: '',
                    level: 1, exp: 0, maxExp: 100,
                    hunger: 100, cleanliness: 100, mood: 100, energy: 100,
                    feedStatus: { breakfast: false, lunch: false, dinner: false },
                    lastFeedReset: '',
                    cleanStatus: { cleaned: false, lastCleanReset: '' },
                    gold: 100
                };
                this.petGameView = 'select';
            }
            this.checkFeedReset();
            this.checkCleanReset();
        },
        
        // 检查并重置喂养状态
        checkFeedReset() {
            const today = new Date().toDateString();
            if (this.pet.lastFeedReset !== today) {
                this.pet.feedStatus = { breakfast: false, lunch: false, dinner: false };
                this.pet.lastFeedReset = today;
                this.savePet();
            }
        },
        
        // 检查并重置清洁状态
        checkCleanReset() {
            const today = new Date().toDateString();
            if (this.pet.cleanStatus && this.pet.cleanStatus.lastCleanReset !== today) {
                this.pet.cleanStatus = { cleaned: false, lastCleanReset: today };
                this.savePet();
            }
        },
        
        // 加载伴侣宠物
        loadPartnerPet() {
            this.partnerPet = null;
            if (this.partner && this.partner.username) {
                const partnerPetData = Storage.pet.get(this.partner.username);
                if (partnerPetData && partnerPetData.id) {
                    this.partnerPet = partnerPetData;
                }
            }
        },
        
        // 加载主题
        loadTheme() {
            const settings = Storage.settings.get(this.currentUser.username);
            const theme = settings?.theme || 'theme-pink';
            this.applyTheme(theme, false);
        },
        
        // 调用加载主题
        callLoadTheme() {
            this.loadTheme();
        },
        
        // 应用主题
        applyTheme(themeClass, save = true) {
            const themes = ['theme-pink', 'theme-neon', 'theme-cloud', 'theme-galaxy'];
            themes.forEach(t => document.body.classList.remove(t));
            document.body.classList.add(themeClass);
            this.currentThemeClass = themeClass;
            if (save) {
                Storage.settings.set(this.currentUser.username, { theme: themeClass });
            }
        },
        
        // 加载伴侣数据
        loadPartner() {
            const username = this.currentUser.username;
            const partnerUsername = Storage.couple.getPartner(username);
            if (partnerUsername) {
                const partnerUser = Storage.users.findByUsername(partnerUsername);
                if (partnerUser) {
                    this.partner = {
                        username: partnerUsername,
                        profile: partnerUser.profile || {}
                    };
                }
            }
        },
        
        // 计算纪念日天数
        calculateAnniversary() {
            if (!this.anniversaryData) return;
            const start = new Date(this.anniversaryData.startDate);
            const now = new Date();
            const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
            this.anniversaryDays = diff >= 0 ? diff : 0;
            
            // 计算自定义纪念日
            this.customAnniversaries = (this.anniversaryData.customDates || []).map(d => {
                const target = new Date(d.date);
                const days = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
                return { ...d, days };
            }).filter(d => d.days > 0);
        },
        
        // 更新时间
        updateTime() {
            const now = new Date();
            this.currentTime = {
                hours: String(now.getHours()).padStart(2, '0'),
                minutes: String(now.getMinutes()).padStart(2, '0'),
                seconds: String(now.getSeconds()).padStart(2, '0')
            };
        },
        
        // 退出登录
        handleLogout() {
            Storage.currentUser.clear();
            clearInterval(this.timer);
            clearInterval(this.quoteTimer);
            clearInterval(this.petTimer);
            window.location.href = 'index.html';
        },
        
        // 保存资料
        saveProfile() {
            const profileData = {
                ...this.userProfile,
                ...this.editProfileForm,
                updatedAt: new Date().toISOString()
            };
            Storage.users.update(this.currentUser.username, { profile: profileData });
            this.currentUser.profile = profileData;
            Storage.currentUser.set(this.currentUser);
            this.userProfile = profileData;
            this.showEditProfile = false;
        },
        
        // 头像上传
        handleAvatarUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                this.editProfileForm.avatar = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        
        // 添加纪念日
        addAnniversary() {
            if (!this.anniversaryData.customDates) this.anniversaryData.customDates = [];
            this.anniversaryData.customDates.push(this.anniversaryForm);
            Storage.anniversary.set(this.currentUser.username, this.anniversaryData);
            this.calculateAnniversary();
            this.showAddAnniversary = false;
            this.anniversaryForm = { name: '', date: '' };
        },
        
        // 相册相关
        handlePhotoSelect(event) {
            this.selectedPhotos = Array.from(event.target.files);
        },
        uploadPhotos() {
            if (!this.selectedPhotos.length) return;
            const username = this.currentUser.username;
            const promises = this.selectedPhotos.map(file => {
                return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({ url: e.target.result, category: this.uploadAlbumCategory, date: new Date().toISOString() });
                    };
                    reader.readAsDataURL(file);
                });
            });
            Promise.all(promises).then(photos => {
                this.albumData.push(...photos);
                Storage.album.saveAll(username, this.albumData);
                const categories = new Set(this.albumData.map(p => p.category));
                this.albumCategories = ['全部', ...categories];
                this.showAddAlbum = false;
                this.selectedPhotos = [];
            });
        },
        addAlbumCategory() {
            if (this.albumCategories.includes(this.newCategoryName)) return;
            this.albumCategories.push(this.newCategoryName);
            this.showAddAlbumCategory = false;
            this.newCategoryName = '';
        },
        viewPhoto(photo) {
            this.viewingPhoto = photo.url;
            this.showPhotoViewer = true;
        },
        
        // 语录相关
        addQuote() {
            this.quotes.push(this.newQuote);
            Storage.quotes.saveAll(this.currentUser.username, this.quotes);
            this.showAddQuote = false;
            this.newQuote = '';
        },
        
        // 日记相关
        saveDiary() {
            const username = this.currentUser.username;
            if (this.editingDiaryIndex >= 0) {
                this.diaries[this.editingDiaryIndex].content = this.diaryForm.content;
            } else {
                this.diaries.unshift({ content: this.diaryForm.content, date: new Date().toISOString() });
            }
            Storage.diary.saveAll(username, this.diaries);
            this.showAddDiary = false;
            this.diaryForm = { content: '' };
            this.editingDiaryIndex = -1;
        },
        editDiary(diary) {
            this.diaryForm.content = diary.content;
            this.editingDiaryIndex = this.diaries.indexOf(diary);
            this.showAddDiary = true;
        },
        deleteDiary(index) {
            this.diaries.splice(index, 1);
            Storage.diary.saveAll(this.currentUser.username, this.diaries);
        },
        
        // 心愿清单
        addWish() {
            this.wishlist.push({ text: this.newWish, completed: false });
            Storage.wishlist.saveAll(this.currentUser.username, this.wishlist);
            this.showAddWish = false;
            this.newWish = '';
        },
        toggleWish(index) {
            this.wishlist[index].completed = !this.wishlist[index].completed;
            Storage.wishlist.saveAll(this.currentUser.username, this.wishlist);
        },
        deleteWish(index) {
            this.wishlist.splice(index, 1);
            Storage.wishlist.saveAll(this.currentUser.username, this.wishlist);
        },
        
        // 修改密码
        changePassword() {
            const user = Storage.users.findByUsername(this.currentUser.username);
            if (user.password !== this.passwordForm.oldPassword) {
                this.passwordError = '原密码错误';
                return;
            }
            if (this.passwordForm.newPassword.length < 6) {
                this.passwordError = '新密码长度至少6个字符';
                return;
            }
            if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
                this.passwordError = '两次输入的密码不一致';
                return;
            }
            Storage.users.update(this.currentUser.username, { password: this.passwordForm.newPassword });
            this.showChangePassword = false;
            this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
            this.passwordError = '';
        },
        
        // 宠物相关
        selectPet(petId) {
            const petOption = this.petOptions.find(p => p.id === petId);
            if (!petOption) return;
            
            this.pet = {
                id: petOption.id,
                name: petOption.name,
                icon: petOption.icon,
                element: petOption.element,
                elementName: petOption.elementName,
                level: 1,
                exp: 0,
                maxExp: 100,
                hunger: 100,
                cleanliness: 100,
                mood: 100,
                energy: 100,
                feedStatus: { breakfast: false, lunch: false, dinner: false },
                lastFeedReset: new Date().toDateString(),
                cleanStatus: { cleaned: false, lastCleanReset: new Date().toDateString() },
                gold: 100
            };
            
            this.petGameView = 'main';
            this.savePet();
        },
        
        closePetGame() {
            this.showPetGame = false;
        },
        
        feedPet() {
            const hour = new Date().getHours();
            const feedStatus = this.pet.feedStatus;
            
            if (hour >= 5 && hour < 11) {
                if (feedStatus.breakfast) return;
                feedStatus.breakfast = true;
            } else if (hour >= 11 && hour < 17) {
                if (feedStatus.lunch) return;
                feedStatus.lunch = true;
            } else if (hour >= 17 && hour < 22) {
                if (feedStatus.dinner) return;
                feedStatus.dinner = true;
            } else {
                return;
            }
            
            this.pet.hunger = Math.min(100, this.pet.hunger + 25);
            this.pet.mood = Math.min(100, this.pet.mood + 5);
            this.pet.exp += 10;
            this.checkLevelUp();
            this.savePet();
        },
        
        cleanPet() {
            if (this.pet.cleanStatus && this.pet.cleanStatus.cleaned) {
                return;
            }
            this.pet.cleanliness = Math.min(100, this.pet.cleanliness + 30);
            this.pet.mood = Math.min(100, this.pet.mood + 5);
            this.pet.exp += 5;
            this.pet.cleanStatus = { cleaned: true, lastCleanReset: new Date().toDateString() };
            this.checkLevelUp();
            this.savePet();
        },
        
        playWithPet() {
            if (this.pet.energy < 20) return;
            this.pet.energy -= 15;
            this.pet.mood = Math.min(100, this.pet.mood + 20);
            this.pet.exp += 8;
            this.checkLevelUp();
            this.savePet();
        },
        
        sleepPet() {
            this.pet.energy = Math.min(100, this.pet.energy + 40);
            this.pet.mood = Math.min(100, this.pet.mood + 5);
            this.savePet();
        },
        
        checkLevelUp() {
            const expNeeded = this.pet.level * 100;
            while (this.pet.exp >= expNeeded) {
                this.pet.exp -= expNeeded;
                this.pet.level++;
            }
        },
        
        savePet() {
            Storage.pet.set(this.currentUser.username, this.pet);
        },
        
        decreasePetStats() {
            if (!this.pet.id) return;
            
            this.pet.hunger = Math.max(0, this.pet.hunger - 2);
            this.pet.cleanliness = Math.max(0, this.pet.cleanliness - 1);
            this.pet.mood = Math.max(0, this.pet.mood - 1);
            this.pet.energy = Math.max(0, this.pet.energy - 1);
            this.savePet();
        },
        
        // 探险系统
        startAdventure() {
            if (this.pet.energy < 20) {
                alert('体力不足，无法探险！');
                return;
            }
            
            this.pet.energy -= 15;
            this.petGameView = 'adventure';
            
            const zones = this.adventureZones;
            const zone = zones[Math.floor(Math.random() * zones.length)];
            this.adventure = {
                currentZone: zone.name,
                description: zone.description || '你踏入了一片神秘的区域...',
                enemy: null,
                options: zone.options.map(opt => ({ text: opt })),
                result: null,
                currentZoneData: zone
            };
            this.savePet();
        },
        
        exploreOption(option) {
            const rand = Math.random();
            
            if (rand < 0.45) {
                const zone = this.adventure.currentZoneData;
                const enemyName = zone.enemies[Math.floor(Math.random() * zone.enemies.length)];
                const elements = ['🌿', '🔥', '🗿', '🐉', '💧'];
                const enemyIcon = elements[Math.floor(Math.random() * elements.length)];
                
                this.adventure.enemy = {
                    name: enemyName,
                    icon: enemyIcon,
                    level: this.pet.level + Math.floor(Math.random() * 3) - 1
                };
                this.adventure.result = null;
            } else if (rand < 0.75) {
                const goldGain = 15 + Math.floor(Math.random() * 20);
                const expGain = 15 + Math.floor(Math.random() * 10);
                this.pet.exp += expGain;
                this.pet.gold += goldGain;
                this.checkLevelUp();
                this.adventure.result = {
                    icon: '🎁',
                    text: '发现了一个神秘的宝箱！',
                    exp: expGain,
                    gold: goldGain
                };
                this.adventure.enemy = null;
                this.savePet();
            } else if (rand < 0.9) {
                const goldGain = 5 + Math.floor(Math.random() * 10);
                const expGain = 5 + Math.floor(Math.random() * 5);
                this.pet.exp += expGain;
                this.pet.gold += goldGain;
                this.checkLevelUp();
                this.adventure.result = {
                    icon: '🍃',
                    text: '平静的旅程，发现了一些有趣的东西',
                    exp: expGain,
                    gold: goldGain
                };
                this.adventure.enemy = null;
                this.savePet();
            } else {
                const goldLoss = 3 + Math.floor(Math.random() * 5);
                this.pet.gold = Math.max(0, this.pet.gold - goldLoss);
                this.adventure.result = {
                    icon: '💨',
                    text: `遭遇了小偷...损失${goldLoss}金币`,
                    exp: 0,
                    gold: -goldLoss
                };
                this.adventure.enemy = null;
                this.savePet();
            }
        },
        
        attackEnemy() {
            if (!this.adventure.enemy) return;
            
            const playerPower = this.pet.level * 10 + Math.floor(this.pet.mood / 10);
            const enemyPower = this.adventure.enemy.level * 8;
            
            const winChance = 0.35 + (playerPower - enemyPower) / 150;
            const isWin = Math.random() < winChance;
            
            if (isWin) {
                const goldGain = 10 + Math.floor(Math.random() * 15);
                const expGain = 20 + this.adventure.enemy.level * 5;
                this.pet.exp += expGain;
                this.pet.gold += goldGain;
                this.pet.mood = Math.min(100, this.pet.mood + 10);
                this.checkLevelUp();
                
                this.adventure.result = {
                    icon: '🏆',
                    text: `战胜了${this.adventure.enemy.name}！获得${goldGain}金币`,
                    exp: expGain,
                    gold: goldGain
                };
            } else {
                const goldLoss = 5 + Math.floor(Math.random() * 10);
                this.pet.gold = Math.max(0, this.pet.gold - goldLoss);
                this.pet.mood = Math.max(0, this.pet.mood - 15);
                this.adventure.result = {
                    icon: '💫',
                    text: `被${this.adventure.enemy.name}击败了...损失${goldLoss}金币`,
                    exp: 0,
                    gold: -goldLoss
                };
            }
            
            this.adventure.enemy = null;
            this.savePet();
        },
        
        flee() {
            const goldLoss = 3 + Math.floor(Math.random() * 5);
            this.pet.gold = Math.max(0, this.pet.gold - goldLoss);
            this.adventure.result = {
                icon: '🏃',
                text: `成功逃脱了！但被追赶时掉了${goldLoss}金币`,
                exp: 0,
                gold: -goldLoss
            };
            this.adventure.enemy = null;
            this.adventure.options = [];
            this.savePet();
        },
        
        // 情侣对战系统
        startCoupleBattle() {
            if (!this.partnerPet) {
                this.battleResult = {
                    win: false,
                    text: '伴侣还没有宠物，无法对战！'
                };
                return;
            }
            
            if (this.pet.energy < 30) {
                this.battleResult = {
                    win: false,
                    text: '体力不足，无法对战！'
                };
                return;
            }
            
            if (this.pet.gold < 20) {
                this.battleResult = {
                    win: false,
                    text: '金币不足，需要至少20金币才能挑战！'
                };
                return;
            }
            
            this.pet.energy -= 25;
            this.pet.gold -= 20;
            
            const playerPower = this.calculatePetPower(this.pet);
            const partnerPower = this.calculatePetPower(this.partnerPet);
            
            const elementalBonus = this.getElementalAdvantage(this.pet.element, this.partnerPet.element);
            
            const playerFinalPower = playerPower * elementalBonus;
            const partnerFinalPower = partnerPower;
            
            const winChance = 0.4 * elementalBonus;
            const isWin = Math.random() < winChance;
            
            if (isWin) {
                const goldGain = 50 + Math.floor(this.partnerPet.level * 5);
                const expGain = 50 + Math.floor(this.partnerPet.level * 3);
                this.pet.exp += expGain;
                this.pet.gold += goldGain;
                this.pet.mood = Math.min(100, this.pet.mood + 15);
                this.checkLevelUp();
                
                this.battleResult = {
                    win: true,
                    text: '恭喜你战胜了伴侣的宠物！💕',
                    exp: expGain,
                    gold: goldGain
                };
            } else {
                const expGain = 15 + Math.floor(this.pet.level * 2);
                this.pet.exp += expGain;
                this.pet.mood = Math.max(0, this.pet.mood - 10);
                this.checkLevelUp();
                
                this.battleResult = {
                    win: false,
                    text: '虽然输了，但获得了宝贵经验！',
                    exp: expGain,
                    gold: 0
                };
            }
            
            this.savePet();
        },
        
        calculatePetPower(pet) {
            return pet.level * 15 + Math.floor(pet.mood / 5) + Math.floor(pet.hunger / 10);
        },
        
        getElementalAdvantage(playerElement, enemyElement) {
            const advantage = this.elementalAdvantage[playerElement];
            if (advantage && advantage.strongTo === enemyElement) {
                return 1.5;
            }
            if (advantage && advantage.weakTo === enemyElement) {
                return 0.7;
            }
            return 1.0;
        },
        
        // 音乐播放
        toggleMusic() {
            if (!this.audio) {
                this.audio = new Audio();
                this.audio.loop = true;
            }
            if (this.isPlaying) {
                this.audio.pause();
            } else {
                this.audio.play().catch(() => {});
            }
            this.isPlaying = !this.isPlaying;
        },
        changeVolume() {
            if (this.audio) {
                this.audio.volume = this.volume / 100;
            }
        },
        
        // 格式化日期
        formatDate(dateStr) {
            const date = new Date(dateStr);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        },
        
        // 绑定情侣关系
        bindCouple() {
            const targetUsername = this.coupleUsername.trim();
            
            // 检查是否是自己
            if (targetUsername === this.currentUser.username) {
                this.coupleBindError = '不能绑定自己哦~';
                this.coupleBindSuccess = '';
                return;
            }
            
            // 检查对方用户是否存在
            const targetUser = Storage.users.findByUsername(targetUsername);
            if (!targetUser) {
                this.coupleBindError = '未找到该用户信息';
                this.coupleBindSuccess = '';
                return;
            }
            
            // 绑定成功
            Storage.couple.bind(this.currentUser.username, targetUsername);
            
            // 更新伴侣信息
            this.partner = {
                username: targetUsername,
                profile: targetUser.profile || {}
            };
            
            this.coupleBindSuccess = '绑定成功！💕';
            this.coupleBindError = '';
            
            // 清空输入框
            this.coupleUsername = '';
            
            // 3秒后清空成功提示
            setTimeout(() => {
                this.coupleBindSuccess = '';
            }, 3000);
        },
        
        // 解除情侣关系
        unbindCouple() {
            if (confirm('确定要解除情侣关系吗？')) {
                Storage.couple.unbind(this.currentUser.username);
                this.partner = null;
                this.showCoupleBind = false;
            }
        }
    },
    mounted() {
        // 检查登录状态
        this.currentUser = Storage.currentUser.get();
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }
        
        // 初始化数据
        this.initData();
        
        // 启动定时器
        this.timer = setInterval(() => {
            this.updateTime();
            this.calculateAnniversary();
        }, 1000);
        
        // 语录轮播
        this.quoteTimer = setInterval(() => {
            if (this.quotes.length) {
                this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
            }
        }, 5000);
        
        // 宠物属性衰减
        this.petTimer = setInterval(() => {
            if (this.pet.type) {
                this.decreasePetStats();
            }
        }, 60000); // 每分钟衰减一次
        
        // 加载主题设置
        const settings = Storage.settings.get(this.currentUser.username);
        if (settings && settings.theme) {
            document.body.classList.add(settings.theme);
        }
        
        this.updateTime();
    },
    beforeUnmount() {
        clearInterval(this.timer);
        clearInterval(this.quoteTimer);
        clearInterval(this.petTimer);
    }
}).mount('#app');
