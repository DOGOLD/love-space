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
            errorMsg: ''
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
                // 压缩图片
                this.compressImage(e.target.result, (compressed) => {
                    this.profileForm.avatar = compressed;
                    this.errorMsg = '';
                });
            };
            reader.readAsDataURL(file);
        },
        compressImage(base64, callback, maxWidth = 300, maxHeight = 300, quality = 0.8) {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // 计算缩放比例
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                callback(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = base64;
        },
        handleSave() {
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

            // 获取当前用户
            const currentUser = Storage.currentUser.get();
            if (!currentUser) {
                this.errorMsg = '请先登录';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                return;
            }

            // 保存资料
            const profileData = {
                avatar: this.profileForm.avatar,
                nickname: this.profileForm.nickname,
                age: this.profileForm.age,
                province: this.profileForm.province,
                city: this.profileForm.city,
                bio: this.profileForm.bio,
                updatedAt: new Date().toISOString()
            };

            // 更新用户资料
            if (Storage.users.update(currentUser.username, { profile: profileData })) {
                // 更新当前用户缓存
                Storage.currentUser.set({ ...currentUser, profile: profileData });
                
                // 初始化用户数据
                this.initUserData(currentUser.username);
                
                // 跳转首页
                window.location.href = 'home.html';
            } else {
                this.errorMsg = '保存失败，请重试';
            }
        },
        initUserData(username) {
            // 初始化默认纪念日
            if (!Storage.anniversary.get(username)) {
                Storage.anniversary.set(username, {
                    startDate: new Date().toISOString().split('T')[0],
                    customDates: []
                });
            }
            // 初始化默认语录
            if (!Storage.quotes.getAll(username).length) {
                Storage.quotes.saveAll(username, [
                    '愿得一心人，白首不相离',
                    '执子之手，与子偕老',
                    '山有木兮木有枝，心悦君兮君不知',
                    '玲珑骰子安红豆，入骨相思知不知',
                    '两情若是久长时，又岂在朝朝暮暮'
                ]);
            }
        }
    },
    mounted() {
        // 检查登录状态
        const currentUser = Storage.currentUser.get();
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // 如果已完善资料，直接跳转首页
        if (currentUser.profile && currentUser.profile.nickname && currentUser.profile.city) {
            window.location.href = 'home.html';
            return;
        }

        // 加载已有资料
        if (currentUser.profile) {
            this.profileForm = { ...currentUser.profile };
        }
    }
}).mount('#app');
