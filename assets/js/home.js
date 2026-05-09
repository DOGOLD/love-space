/**
 * 首页核心逻辑 - 使用后端API版本
 * 包含所有功能模块的数据管理和交互
 */

const { createApp } = Vue;

// API服务
const ApiService = {
    baseUrl: '/api',
    
    getToken() {
        return localStorage.getItem('token');
    },
    
    async request(method, url, data = null, isFormData = false) {
        const headers = {
            'Authorization': `Bearer ${this.getToken()}`
        };
        
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        
        const options = {
            method,
            headers,
            body: isFormData ? data : (data ? JSON.stringify(data) : null)
        };
        
        try {
            const response = await fetch(`${this.baseUrl}${url}`, options);
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            return { error: '网络错误' };
        }
    },
    
    // 用户相关
    async getUser() {
        return this.request('GET', '/user');
    },
    
    async updateUser(formData) {
        return this.request('POST', '/user', formData, true);
    },
    
    // 伴侣相关
    async getPartner() {
        return this.request('GET', '/partner');
    },
    
    async bindPartner(username) {
        return this.request('POST', '/partner/bind', { partnerUsername: username });
    },
    
    async unbindPartner() {
        return this.request('POST', '/partner/unbind');
    },
    
    // 照片相关
    async getPhotos(category = null) {
        const url = category ? `/photos?category=${category}` : '/photos';
        return this.request('GET', url);
    },
    
    async uploadPhoto(formData) {
        return this.request('POST', '/photos', formData, true);
    },
    
    async getPhotoCategories() {
        return this.request('GET', '/photos/categories');
    },
    
    // 日记相关
    async getDiaries() {
        return this.request('GET', '/diaries');
    },
    
    async addDiary(content) {
        return this.request('POST', '/diaries', { content });
    },
    
    // 语录相关
    async getQuotes() {
        return this.request('GET', '/quotes');
    },
    
    async addQuote(content) {
        return this.request('POST', '/quotes', { content });
    },
    
    // 心愿相关
    async getWishes() {
        return this.request('GET', '/wishes');
    },
    
    async addWish(text) {
        return this.request('POST', '/wishes', { text });
    },
    
    async updateWish(id, completed) {
        return this.request('PUT', `/wishes/${id}`, { completed });
    },
    
    async deleteWish(id) {
        return this.request('DELETE', `/wishes/${id}`);
    },
    
    // 纪念日相关
    async getAnniversaries() {
        return this.request('GET', '/anniversaries');
    },
    
    async addAnniversary(name, date) {
        return this.request('POST', '/anniversaries', { name, date });
    },
    
    async deleteAnniversary(id) {
        return this.request('DELETE', `/anniversaries/${id}`);
    },
    
    // 宠物相关
    async getPet() {
        return this.request('GET', '/pet');
    },
    
    async createPet(name, icon, element, elementName) {
        return this.request('POST', '/pet', { name, icon, element, elementName });
    },
    
    async updatePet(petData) {
        return this.request('PUT', '/pet', petData);
    },
    
    async getPartnerPet() {
        return this.request('GET', '/pet/partner');
    },
    
    // 设置恋爱开始时间
    async setLoveDate(date) {
        return this.request('POST', '/love-date', { date });
    },
    
    // 获取音乐
    async getMusic() {
        return this.request('GET', '/music');
    },
    
    // 上传音乐
    async uploadMusic(formData) {
        return this.request('POST', '/music', formData, true);
    },
    
    // 删除音乐
    async deleteMusic(id) {
        return this.request('DELETE', `/music/${id}`);
    }
};

// 省份城市数据
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
            currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
            userProfile: {},
            partner: null,
            provinces: Object.keys(provinceCityData),
            
            // 纪念日
            anniversaryData: { startDate: new Date().toISOString().split('T')[0], customDates: [] },
            anniversaryDays: 0,
            clockTime: { hours: '00', minutes: '00', seconds: '00' },
            customAnniversaries: [],
            timer: null,
            
            // 相册
            albumData: [],
            albumCategories: ['全部'],
            currentAlbumCategory: '全部',
            viewingPhoto: '',
            selectedPhotos: [],
            uploadAlbumCategory: '全部',
            newCategoryName: '',
            
            // 语录
            quotes: [],
            currentQuoteIndex: 0,
            quoteTimer: null,
            newQuote: '',
            
            // 日记
            diaries: [],
            diaryForm: { content: '' },
            editingDiary: null,
            
            // 心愿清单
            wishlist: [],
            newWish: '',
            
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
                cleanStatus: { cleaned: false },
                gold: 100
            },
            petGameView: 'select',
            
            // 探险相关
            adventure: {
                currentZone: '精灵森林',
                description: '你踏入了一片神秘的森林...',
                enemy: null,
                options: [],
                result: null,
                currentZoneData: null
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
            
            // 五行相克配置
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
            musicList: [],
            currentMusicIndex: 0,
            currentTime: 0,
            duration: 0,
            showAddMusic: false,
            selectedMusicFile: null,
            musicName: '',
            
            // 恋爱开始时间
            loveStartDate: '',
            
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
            passwordForm: { oldPassword: '', newPassword: '', confirmPassword: '' },
            passwordError: '',
            
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
            return this.quotes[this.currentQuoteIndex]?.content || '暂无语录';
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
        petGold() {
            return this.pet.gold || 0;
        }
    },
    methods: {
        // 跳转到农场
        goToFarm() {
            window.location.href = 'couple_farm.html';
        },
        
        // 初始化数据
        async initData() {
            await Promise.all([
                this.loadUserProfile(),
                this.loadPartner(),
                this.loadPhotos(),
                this.loadQuotes(),
                this.loadDiaries(),
                this.loadWishes(),
                this.loadPet(),
                this.loadPartnerPet(),
                this.loadMusic(),
                this.loadAnniversaries()
            ]);
            this.calculateAnniversary();
        },
        
        // 加载音乐
        async loadMusic() {
            const music = await ApiService.getMusic();
            if (music) {
                this.musicList = music;
            }
        },
        
        // 加载自定义纪念日
        async loadAnniversaries() {
            const result = await ApiService.getAnniversaries();
            if (result.error) {
                console.error('Failed to load anniversaries:', result.error);
                return;
            }
            this.customAnniversaries = result.map(item => {
                const today = new Date();
                const anniversaryDate = new Date(item.date);
                let nextDate = new Date(anniversaryDate);
                nextDate.setFullYear(today.getFullYear());
                
                if (nextDate < today) {
                    nextDate.setFullYear(today.getFullYear() + 1);
                }
                
                const diff = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
                return {
                    ...item,
                    days: diff === 0 ? '今天' : diff
                };
            });
        },
        
        // 加载用户资料
        async loadUserProfile() {
            const result = await ApiService.getUser();
            if (result.error) {
                console.error('Failed to load user:', result.error);
                return;
            }
            this.userProfile = result;
            if (result.love_start_date) {
                this.loveStartDate = result.love_start_date;
            }
        },
        
        // 加载伴侣
        async loadPartner() {
            const result = await ApiService.getPartner();
            if (result.error) {
                console.error('Failed to load partner:', result.error);
                return;
            }
            this.partner = result;
        },
        
        // 加载照片
        async loadPhotos() {
            const result = await ApiService.getPhotos();
            if (result.error) {
                console.error('Failed to load photos:', result.error);
                return;
            }
            this.albumData = result;
            const categories = new Set(result.map(p => p.category));
            this.albumCategories = ['全部', ...categories];
        },
        
        // 加载语录
        async loadQuotes() {
            const result = await ApiService.getQuotes();
            if (result.error) {
                console.error('Failed to load quotes:', result.error);
                return;
            }
            this.quotes = result;
        },
        
        // 加载日记
        async loadDiaries() {
            const result = await ApiService.getDiaries();
            if (result.error) {
                console.error('Failed to load diaries:', result.error);
                return;
            }
            this.diaries = result;
        },
        
        // 加载心愿
        async loadWishes() {
            const result = await ApiService.getWishes();
            if (result.error) {
                console.error('Failed to load wishes:', result.error);
                return;
            }
            this.wishlist = result;
        },
        
        // 加载宠物数据
        async loadPet() {
            const result = await ApiService.getPet();
            if (result.error || !result) {
                this.pet = {
                    id: '', name: '', icon: '', element: '', elementName: '',
                    level: 1, exp: 0, maxExp: 100,
                    hunger: 100, cleanliness: 100, mood: 100, energy: 100,
                    feedStatus: { breakfast: false, lunch: false, dinner: false },
                    cleanStatus: { cleaned: false },
                    gold: 100
                };
                this.petGameView = 'select';
                return;
            }
            
            this.pet = {
                ...result,
                feedStatus: result.feedStatus || { breakfast: false, lunch: false, dinner: false },
                cleanStatus: result.cleanStatus || { cleaned: false },
                gold: result.gold || 100
            };
            this.petGameView = 'main';
        },
        
        // 加载伴侣宠物
        async loadPartnerPet() {
            const result = await ApiService.getPartnerPet();
            if (result.error || !result) {
                this.partnerPet = null;
                return;
            }
            this.partnerPet = result;
        },
        
        // 保存宠物数据
        async savePet() {
            await ApiService.updatePet(this.pet);
        },
        
        // 检查并重置喂养状态（每天凌晨）
        checkFeedReset() {
            const today = new Date().toDateString();
            if (!this.pet.lastFeedReset || this.pet.lastFeedReset !== today) {
                this.pet.feedStatus = { breakfast: false, lunch: false, dinner: false };
                this.pet.lastFeedReset = today;
                this.savePet();
            }
        },
        
        // 检查并重置清洁状态（每天凌晨）
        checkCleanReset() {
            const today = new Date().toDateString();
            if (!this.pet.cleanStatus.lastCleanReset || this.pet.cleanStatus.lastCleanReset !== today) {
                this.pet.cleanStatus = { cleaned: false, lastCleanReset: today };
                this.savePet();
            }
        },
        
        // 应用主题
        applyTheme(themeClass, save = true) {
            const themes = ['theme-pink', 'theme-neon', 'theme-cloud', 'theme-galaxy'];
            themes.forEach(t => document.body.classList.remove(t));
            document.body.classList.add(themeClass);
            this.currentThemeClass = themeClass;
            localStorage.setItem('theme', themeClass);
        },
        
        // 加载主题
        loadTheme() {
            const theme = localStorage.getItem('theme') || 'theme-pink';
            this.applyTheme(theme, false);
        },
        
        // 计算纪念日天数
        calculateAnniversary() {
            if (!this.loveStartDate) return;
            const start = new Date(this.loveStartDate);
            const now = new Date();
            const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
            this.anniversaryDays = diff >= 0 ? diff : 0;
        },
        
        // 设置恋爱开始时间
        async setLoveDate() {
            if (!this.loveStartDate) {
                alert('请选择日期');
                return;
            }
            await ApiService.setLoveDate(this.loveStartDate);
            this.calculateAnniversary();
            alert('设置成功');
        },
        
        // 更新时间
        updateTime() {
            const now = new Date();
            this.clockTime = {
                hours: String(now.getHours()).padStart(2, '0'),
                minutes: String(now.getMinutes()).padStart(2, '0'),
                seconds: String(now.getSeconds()).padStart(2, '0')
            };
        },
        
        // 退出登录
        handleLogout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            clearInterval(this.timer);
            clearInterval(this.quoteTimer);
            window.location.href = 'index.html';
        },
        
        // 保存资料
        async saveProfile() {
            const formData = new FormData();
            formData.append('nickname', this.editProfileForm.nickname);
            formData.append('age', this.editProfileForm.age || '');
            formData.append('province', this.editProfileForm.province);
            formData.append('city', this.editProfileForm.city);
            formData.append('bio', this.editProfileForm.bio || '');
            
            // 如果有新头像
            if (this.editProfileForm.avatar && this.editProfileForm.avatar.startsWith('data:')) {
                // 创建一个临时文件对象
                const response = await fetch(this.editProfileForm.avatar);
                const blob = await response.blob();
                formData.append('avatar', blob, 'avatar.png');
            }
            
            const result = await ApiService.updateUser(formData);
            if (result.success) {
                await this.loadUserProfile();
                this.showEditProfile = false;
            }
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
        async addAnniversary() {
            await ApiService.addAnniversary(this.anniversaryForm.name, this.anniversaryForm.date);
            this.showAddAnniversary = false;
            this.anniversaryForm = { name: '', date: '' };
            await this.loadAnniversaries();
        },
        
        async deleteAnniversary(id) {
            if (confirm('确定要删除这个纪念日吗？')) {
                await ApiService.deleteAnniversary(id);
                await this.loadAnniversaries();
            }
        },
        
        // 照片相关
        handlePhotoSelect(event) {
            this.selectedPhotos = Array.from(event.target.files);
        },
        
        async uploadPhotos() {
            if (!this.selectedPhotos.length) return;
            
            for (const file of this.selectedPhotos) {
                const formData = new FormData();
                formData.append('photo', file);
                formData.append('category', this.uploadAlbumCategory);
                await ApiService.uploadPhoto(formData);
            }
            
            await this.loadPhotos();
            this.showAddAlbum = false;
            this.selectedPhotos = [];
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
        async addQuote() {
            await ApiService.addQuote(this.newQuote);
            await this.loadQuotes();
            this.showAddQuote = false;
            this.newQuote = '';
        },
        
        // 日记相关
        async saveDiary() {
            await ApiService.addDiary(this.diaryForm.content);
            await this.loadDiaries();
            this.showAddDiary = false;
            this.diaryForm = { content: '' };
            this.editingDiary = null;
        },
        
        editDiary(diary) {
            this.diaryForm.content = diary.content;
            this.editingDiary = diary;
            this.showAddDiary = true;
        },
        
        // 心愿清单
        async addWish() {
            await ApiService.addWish(this.newWish);
            await this.loadWishes();
            this.showAddWish = false;
            this.newWish = '';
        },
        
        async toggleWish(id) {
            const wish = this.wishlist.find(w => w.id === id);
            if (wish) {
                await ApiService.updateWish(id, wish.completed ? 0 : 1);
                await this.loadWishes();
            }
        },
        
        async deleteWish(id) {
            await ApiService.deleteWish(id);
            await this.loadWishes();
        },
        
        // 修改密码
        changePassword() {
            // 后端暂未实现修改密码API，显示提示
            alert('修改密码功能即将上线');
            this.showChangePassword = false;
            this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
            this.passwordError = '';
        },
        
        // 宠物相关
        async selectPet(petId) {
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
                cleanStatus: { cleaned: false },
                gold: 100
            };
            
            await ApiService.createPet(petOption.name, petOption.icon, petOption.element, petOption.elementName);
            this.petGameView = 'main';
        },
        
        closePetGame() {
            this.showPetGame = false;
        },
        
        async feedPet() {
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
            await this.savePet();
        },
        
        async cleanPet() {
            if (this.pet.cleanStatus && this.pet.cleanStatus.cleaned) {
                return;
            }
            this.pet.cleanliness = Math.min(100, this.pet.cleanliness + 30);
            this.pet.mood = Math.min(100, this.pet.mood + 5);
            this.pet.exp += 5;
            this.pet.cleanStatus = { cleaned: true, lastCleanReset: new Date().toDateString() };
            this.checkLevelUp();
            await this.savePet();
        },
        
        checkLevelUp() {
            const expNeeded = this.pet.level * 100;
            while (this.pet.exp >= expNeeded) {
                this.pet.exp -= expNeeded;
                this.pet.level++;
            }
        },
        
        // 探险系统
        async startAdventure() {
            if (this.pet.energy < 20) {
                alert('体力不足，无法探险！');
                return;
            }
            
            this.pet.energy -= 15;
            
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
            this.petGameView = 'adventure';
            await this.savePet();
        },
        
        async exploreOption(option) {
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
                await this.savePet();
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
                await this.savePet();
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
                await this.savePet();
            }
        },
        
        async attackEnemy() {
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
            await this.savePet();
        },
        
        async flee() {
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
            await this.savePet();
        },
        
        // 情侣对战系统
        async startCoupleBattle() {
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
            
            await this.savePet();
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
            if (isNaN(date.getTime())) {
                return '';
            }
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        },
        
        // 格式化日期时间
        formatDateTime(dateStr) {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return '';
            }
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        },
        
        // 绑定情侣关系
        async bindCouple() {
            const targetUsername = this.coupleUsername.trim();
            
            if (targetUsername === this.currentUser.username) {
                this.coupleBindError = '不能绑定自己哦~';
                this.coupleBindSuccess = '';
                return;
            }
            
            const result = await ApiService.bindPartner(targetUsername);
            
            if (result.success) {
                await this.loadPartner();
                this.coupleBindSuccess = '绑定成功！💕';
                this.coupleBindError = '';
                this.coupleUsername = '';
                
                setTimeout(() => {
                    this.coupleBindSuccess = '';
                }, 3000);
            } else {
                this.coupleBindError = result.error || '绑定失败';
                this.coupleBindSuccess = '';
            }
        },
        
        // 解除情侣关系
        async unbindCouple() {
            if (confirm('确定要解除情侣关系吗？')) {
                await ApiService.unbindPartner();
                this.partner = null;
                this.showCoupleBind = false;
            }
        },
        
        // 音乐文件选择
        handleMusicFileChange(e) {
            this.selectedMusicFile = e.target.files[0];
            if (this.selectedMusicFile && !this.musicName) {
                this.musicName = this.selectedMusicFile.name.replace(/\.[^/.]+$/, '');
            }
        },
        
        // 上传音乐
        async uploadMusic() {
            if (!this.selectedMusicFile) {
                alert('请选择音乐文件');
                return;
            }
            
            const formData = new FormData();
            formData.append('music', this.selectedMusicFile);
            formData.append('name', this.musicName || this.selectedMusicFile.name);
            
            await ApiService.uploadMusic(formData);
            await this.loadMusic();
            this.showAddMusic = false;
            this.selectedMusicFile = null;
            this.musicName = '';
            alert('上传成功');
        },
        
        // 播放音乐
        playMusic(index) {
            if (index === undefined) {
                index = this.currentMusicIndex;
            }
            this.currentMusicIndex = index;
            
            const music = this.musicList[index];
            if (!music) return;
            
            if (this.audio) {
                this.audio.pause();
                this.audio = null;
            }
            
            this.audio = new Audio(music.url);
            this.audio.volume = this.volume / 100;
            
            this.audio.onloadedmetadata = () => {
                this.duration = this.audio.duration;
            };
            
            this.audio.ontimeupdate = () => {
                this.currentTime = this.audio.currentTime;
            };
            
            this.audio.onended = () => {
                this.playNextMusic();
            };
            
            this.audio.play();
            this.isPlaying = true;
        },
        
        // 格式化音乐时间
        formatMusicTime(seconds) {
            if (!seconds || isNaN(seconds)) return '0:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${String(secs).padStart(2, '0')}`;
        },
        
        // 跳转音乐进度
        seekMusic(event) {
            if (this.audio) {
                this.audio.currentTime = parseFloat(event.target.value);
                this.currentTime = this.audio.currentTime;
            }
        },
        
        // 暂停音乐
        pauseMusic() {
            if (this.audio) {
                this.audio.pause();
                this.isPlaying = false;
            }
        },
        
        // 下一首
        playNextMusic() {
            if (this.musicList.length === 0) return;
            this.currentMusicIndex = (this.currentMusicIndex + 1) % this.musicList.length;
            this.playMusic(this.currentMusicIndex);
        },
        
        // 上一首
        playPrevMusic() {
            if (this.musicList.length === 0) return;
            this.currentMusicIndex = (this.currentMusicIndex - 1 + this.musicList.length) % this.musicList.length;
            this.playMusic(this.currentMusicIndex);
        },
        
        // 删除音乐
        async deleteMusic(id) {
            if (confirm('确定要删除这首歌吗？')) {
                await ApiService.deleteMusic(id);
                await this.loadMusic();
            }
        },
        
        // 切换播放状态
        toggleMusic() {
            if (this.isPlaying) {
                this.pauseMusic();
            } else {
                this.playMusic();
            }
        },
        
        // 更新音量
        updateVolume() {
            if (this.audio) {
                this.audio.volume = this.volume / 100;
            }
        }
    },
    mounted() {
        // 检查登录状态
        const token = localStorage.getItem('token');
        if (!token) {
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
        
        // 加载主题设置
        this.loadTheme();
        
        this.updateTime();
    },
    beforeUnmount() {
        clearInterval(this.timer);
        clearInterval(this.quoteTimer);
    }
}).mount('#app');