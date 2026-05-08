/**
 * LocalStorage 存储工具类
 * 统一管理所有本地数据的读写操作
 */
const Storage = {
    // 获取存储数据
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('读取存储数据失败:', e);
            return null;
        }
    },

    // 设置存储数据
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('存储数据失败:', e);
            return false;
        }
    },

    // 删除存储数据
    remove(key) {
        localStorage.removeItem(key);
    },

    // 清空所有存储
    clear() {
        localStorage.clear();
    },

    // 用户相关存储方法
    users: {
        // 获取所有用户列表
        getAll() {
            return Storage.get('couple_users') || [];
        },
        // 保存用户列表
        saveAll(users) {
            return Storage.set('couple_users', users);
        },
        // 根据用户名查找用户
        findByUsername(username) {
            const users = this.getAll();
            return users.find(u => u.username === username) || null;
        },
        // 添加新用户
        add(user) {
            const users = this.getAll();
            users.push(user);
            return this.saveAll(users);
        },
        // 更新用户信息
        update(username, data) {
            const users = this.getAll();
            const index = users.findIndex(u => u.username === username);
            if (index !== -1) {
                users[index] = { ...users[index], ...data };
                return this.saveAll(users);
            }
            return false;
        }
    },

    // 当前登录用户
    currentUser: {
        get() {
            return Storage.get('couple_current_user');
        },
        set(user) {
            return Storage.set('couple_current_user', user);
        },
        clear() {
            Storage.remove('couple_current_user');
        }
    },

    // 相册数据
    album: {
        getAll(username) {
            return Storage.get(`couple_album_${username}`) || [];
        },
        saveAll(username, data) {
            return Storage.set(`couple_album_${username}`, data);
        }
    },

    // 日记数据
    diary: {
        getAll(username) {
            return Storage.get(`couple_diary_${username}`) || [];
        },
        saveAll(username, data) {
            return Storage.set(`couple_diary_${username}`, data);
        }
    },

    // 心愿清单
    wishlist: {
        getAll(username) {
            return Storage.get(`couple_wishlist_${username}`) || [];
        },
        saveAll(username, data) {
            return Storage.set(`couple_wishlist_${username}`, data);
        }
    },

    // 语录数据
    quotes: {
        getAll(username) {
            return Storage.get(`couple_quotes_${username}`) || [];
        },
        saveAll(username, data) {
            return Storage.set(`couple_quotes_${username}`, data);
        }
    },

    // 纪念日数据
    anniversary: {
        get(username) {
            return Storage.get(`couple_anniversary_${username}`);
        },
        set(username, data) {
            return Storage.set(`couple_anniversary_${username}`, data);
        }
    },

    // 宠物数据
    pet: {
        get(username) {
            return Storage.get(`couple_pet_${username}`);
        },
        set(username, data) {
            return Storage.set(`couple_pet_${username}`, data);
        }
    },

    // 情侣关系数据
    couple: {
        // 获取情侣关系映射
        getRelationships() {
            return Storage.get('couple_relationships') || {};
        },
        // 保存情侣关系映射
        saveRelationships(relationships) {
            return Storage.set('couple_relationships', relationships);
        },
        // 绑定情侣关系（双向绑定）
        bind(username1, username2) {
            const relationships = this.getRelationships();
            relationships[username1] = username2;
            relationships[username2] = username1;
            return this.saveRelationships(relationships);
        },
        // 解除情侣关系（双向解除）
        unbind(username) {
            const relationships = this.getRelationships();
            const partner = relationships[username];
            if (partner) {
                delete relationships[username];
                delete relationships[partner];
                return this.saveRelationships(relationships);
            }
            return false;
        },
        // 获取指定用户的伴侣
        getPartner(username) {
            const relationships = this.getRelationships();
            return relationships[username] || null;
        }
    },

    // 设置数据
    settings: {
        get(username) {
            return Storage.get(`couple_settings_${username}`);
        },
        set(username, data) {
            return Storage.set(`couple_settings_${username}`, data);
        }
    }
};
