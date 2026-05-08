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
    }
};

export default ApiService;