/**
 * 资料完善页面逻辑
 * 处理头像上传、省市选择、资料保存
 */

const { createApp } = Vue;

// 省份城市数据
const provinceCityData = {
    '北京市': ['北京市'],
    '上海市': ['上海市'],
    '天津市': ['天津市'],
    '重庆市': ['重庆市'],
    '河北省': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市'],
    '山西省': ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市'],
    '辽宁省': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市'],
    '吉林省': ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市'],
    '黑龙江省': ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市'],
    '江苏省': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市'],
    '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市'],
    '安徽省': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市'],
    '福建省': ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市'],
    '江西省': ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市'],
    '山东省': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市'],
    '河南省': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市'],
    '湖北省': ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市'],
    '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市'],
    '广东省': ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市'],
    '广西壮族自治区': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市'],
    '海南省': ['海口市', '三亚市', '三沙市', '儋州市'],
    '四川省': ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市'],
    '贵州省': ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市'],
    '云南省': ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市'],
    '西藏自治区': ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市'],
    '陕西省': ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市'],
    '甘肃省': ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市'],
    '青海省': ['西宁市', '海东市'],
    '内蒙古自治区': ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市'],
    '宁夏回族自治区': ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
    '新疆维吾尔自治区': ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉市']
};

// API 服务模块
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
        
        const response = await fetch(`${this.baseUrl}${url}`, options);
        return await response.json();
    },
    
    async getUser() {
        return this.request('GET', '/user');
    },
    
    async updateUser(formData) {
        return this.request('POST', '/user', formData, true);
    }
};

createApp({
    data() {
        return {
            profileForm: {
                avatar: '',
                nickname: '',
                age: null,
                province: '',
                city: '',
                bio: ''
            },
            provinces: Object.keys(provinceCityData),
            errorMsg: '',
            loading: false
        };
    },
    computed: {
        currentCities() {
            return provinceCityData[this.profileForm.province] || [];
        }
    },
    methods: {
        handleAvatarUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            // 验证文件类型
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                this.errorMsg = '仅支持 JPG/PNG/GIF/WEBP 格式图片';
                return;
            }

            // 验证文件大小（5MB以内）
            if (file.size > 5 * 1024 * 1024) {
                this.errorMsg = '图片大小不能超过5MB';
                return;
            }

            // 读取图片并转换为base64
            const reader = new FileReader();
            reader.onload = (e) => {
                this.profileForm.avatar = e.target.result;
                this.errorMsg = '';
            };
            reader.readAsDataURL(file);
        },
        async handleSave() {
            // 校验必填项
            if (!this.profileForm.nickname) {
                this.errorMsg = '请输入昵称';
                return;
            }
            if (!this.profileForm.age || this.profileForm.age < 1 || this.profileForm.age > 150) {
                this.errorMsg = '请输入有效年龄';
                return;
            }
            if (!this.profileForm.province) {
                this.errorMsg = '请选择省份';
                return;
            }
            if (!this.profileForm.city) {
                this.errorMsg = '请选择城市';
                return;
            }

            this.loading = true;
            this.errorMsg = '';

            try {
                // 创建 FormData
                const formData = new FormData();
                formData.append('nickname', this.profileForm.nickname);
                formData.append('age', this.profileForm.age ? String(this.profileForm.age) : '');
                formData.append('province', this.profileForm.province);
                formData.append('city', this.profileForm.city);
                formData.append('bio', this.profileForm.bio || '');

                // 如果有头像，转换为文件上传
                if (this.profileForm.avatar && this.profileForm.avatar.startsWith('data:')) {
                    const blob = await (await fetch(this.profileForm.avatar)).blob();
                    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                    formData.append('avatar', file);
                }

                // 调用 API 保存
                const result = await ApiService.updateUser(formData);

                if (result.success || !result.error) {
                    // 保存成功，跳转首页
                    window.location.href = 'home.html';
                } else {
                    this.errorMsg = result.error || '保存失败，请重试';
                }
            } catch (error) {
                console.error('保存失败:', error);
                this.errorMsg = '网络错误，请稍后重试';
            } finally {
                this.loading = false;
            }
        }
    },
    async mounted() {
        // 检查登录状态
        if (!localStorage.getItem('token')) {
            window.location.href = 'index.html';
            return;
        }

        // 加载已有资料
        try {
            const user = await ApiService.getUser();
            if (user && !user.error) {
                this.profileForm.nickname = user.nickname || '';
                this.profileForm.age = user.age || null;
                this.profileForm.province = user.province || '';
                this.profileForm.city = user.city || '';
                this.profileForm.bio = user.bio || '';
                if (user.avatar) {
                    this.profileForm.avatar = user.avatar;
                }
            }
        } catch (error) {
            console.error('加载资料失败:', error);
        }

        // 应用主题
        const theme = localStorage.getItem('theme') || 'theme-pink';
        document.body.classList.add(theme);
    }
}).mount('#app');
