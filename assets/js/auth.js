/**
 * 登录注册页面逻辑
 * 处理用户认证、表单校验、页面跳转
 */

// 获取当前页面名称
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
console.log('当前页面:', currentPage);

// 登录页面逻辑
if (currentPage === 'index.html' || currentPage === '') {
    console.log('初始化登录页面');
    const { createApp } = Vue;
    
    createApp({
        data() {
            return {
                loginForm: {
                    username: '',
                    password: ''
                },
                errorMsg: ''
            };
        },
        methods: {
            handleLogin(event) {
                if (event) event.preventDefault();
                console.log('尝试登录:', this.loginForm);
                this.errorMsg = '';
                
                // 表单校验
                if (!this.loginForm.username || !this.loginForm.password) {
                    this.errorMsg = '请输入账号和密码';
                    return;
                }

                // 查找用户
                const user = Storage.users.findByUsername(this.loginForm.username);
                console.log('查找用户结果:', user);
                if (!user) {
                    this.errorMsg = '账号不存在，请先注册';
                    return;
                }

                // 验证密码
                if (user.password !== this.loginForm.password) {
                    this.errorMsg = '密码错误，请重新输入';
                    return;
                }

                // 登录成功，保存当前用户
                Storage.currentUser.set(user);
                console.log('登录成功，跳转中...');

                // 检查是否完善资料
                if (user.profile && user.profile.nickname && user.profile.city) {
                    window.location.href = 'home.html';
                } else {
                    window.location.href = 'profile.html';
                }
            }
        },
        mounted() {
            console.log('登录页面已挂载');
            // 如果已登录，直接跳转首页
            const currentUser = Storage.currentUser.get();
            if (currentUser) {
                window.location.href = 'home.html';
            }
        }
    }).mount('#app');
}

// 注册页面逻辑
if (currentPage === 'register.html') {
    console.log('初始化注册页面');
    const { createApp } = Vue;
    
    createApp({
        data() {
            return {
                registerForm: {
                    username: '',
                    password: '',
                    confirmPassword: ''
                },
                usernameError: '',
                passwordError: '',
                confirmPasswordError: '',
                successMsg: '',
                errorMsg: ''
            };
        },
        computed: {
            canSubmit() {
                return !this.usernameError && !this.passwordError && 
                       !this.confirmPasswordError && this.registerForm.username && 
                       this.registerForm.password && this.registerForm.confirmPassword;
            }
        },
        methods: {
            validateUsername() {
                const username = this.registerForm.username;
                if (!username) {
                    this.usernameError = '';
                    return;
                }
                if (username.length < 6) {
                    this.usernameError = '账号长度至少6个字符';
                    return;
                }
                if (!/^[a-zA-Z0-9]+$/.test(username)) {
                    this.usernameError = '账号仅支持纯英文、英文+数字、纯数字';
                    return;
                }
                // 检查是否已存在
                if (Storage.users.findByUsername(username)) {
                    this.usernameError = '该账号已被注册';
                    return;
                }
                this.usernameError = '';
            },
            validatePassword() {
                const password = this.registerForm.password;
                if (!password) {
                    this.passwordError = '';
                    return;
                }
                if (password.length < 6) {
                    this.passwordError = '密码长度至少6个字符';
                    return;
                }
                if (!/^[a-zA-Z0-9]+$/.test(password)) {
                    this.passwordError = '密码仅支持英文和数字';
                    return;
                }
                this.passwordError = '';
                this.validateConfirmPassword();
            },
            validateConfirmPassword() {
                const confirmPassword = this.registerForm.confirmPassword;
                if (!confirmPassword) {
                    this.confirmPasswordError = '';
                    return;
                }
                if (confirmPassword !== this.registerForm.password) {
                    this.confirmPasswordError = '两次输入的密码不一致';
                    return;
                }
                this.confirmPasswordError = '';
            },
            handleRegister(event) {
                if (event) event.preventDefault();
                console.log('尝试注册:', this.registerForm);
                this.errorMsg = '';
                this.successMsg = '';
                
                // 最终校验
                this.validateUsername();
                this.validatePassword();
                this.validateConfirmPassword();

                if (this.usernameError || this.passwordError || this.confirmPasswordError) {
                    this.errorMsg = '请检查输入是否符合要求';
                    console.log('校验失败:', { usernameError: this.usernameError, passwordError: this.passwordError, confirmPasswordError: this.confirmPasswordError });
                    return;
                }

                // 创建新用户
                const newUser = {
                    username: this.registerForm.username,
                    password: this.registerForm.password,
                    profile: null,
                    createdAt: new Date().toISOString()
                };

                console.log('保存新用户:', newUser);

                // 保存用户
                const result = Storage.users.add(newUser);
                console.log('保存结果:', result);
                
                if (result) {
                    this.successMsg = '注册成功！即将跳转到登录页...';
                    this.errorMsg = '';
                    // 清空表单
                    this.registerForm = { username: '', password: '', confirmPassword: '' };
                    // 3秒后跳转
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000);
                } else {
                    this.errorMsg = '注册失败，请重试';
                    this.successMsg = '';
                }
            }
        },
        mounted() {
            console.log('注册页面已挂载');
        }
    }).mount('#app');
}
