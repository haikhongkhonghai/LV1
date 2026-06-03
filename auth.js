// auth.js: Xử lý logic đăng nhập, đăng xuất và bảo vệ router (guard)

const Auth = (() => {
    // Tài khoản test mặc định
    const USERS = [
        { username: 'admin', password: 'admin123', fullName: 'Quản trị viên' },
        { username: 'doctor', password: 'doctor123', fullName: 'Bác sĩ Nguyễn Văn A' },
        { username: 'nurse', password: 'nurse123', fullName: 'Y tá Trần Thị B' }
    ];

    const SESSION_KEY = 'his_auth_session';

    // Xử lý login, check username/password với danh sách mockup
    function login(username, password) {
    
        if(!username&&!password){
            return { success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' };
        }
        else if(!username){
            return { success: false, message: 'Vui lòng nhập tên đăng nhập.' };
        }
        else if(!password){
            return { success: false, message: 'Vui lòng nhập mật khẩu.' };
        }

        const user = USERS.find(
            u => u.username === username.trim() && u.password === password
        );

        if (!user) {
            return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' };
        }

        // Lưu thông tin đăng nhập vào localStorage
        const session = { username: user.username, fullName: user.fullName, loggedInAt: new Date().toISOString() };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        return { success: true, message: 'Đăng nhập thành công!', user: session };
    }

    // Xóa session và redirect về trang login
    function logout() {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html';
    }

    // Lấy thông tin user hiện tại đang login
    function getCurrentUser() {
        const data = localStorage.getItem(SESSION_KEY);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    }

    // Khởi tạo trang login: Check session và gắn event submit form
    function initLoginPage() {
        // Nếu đã login rồi thì bay thẳng vào trang chủ index.html
        if (getCurrentUser()) {
            window.location.href = 'index.html';
            return;
        }

        document.getElementById('loginForm')?.addEventListener('submit', function (e) {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const errorEl = document.getElementById('login-error');

            const result = login(username, password);

            if (result.success) {
                errorEl.classList.remove('show');
                window.location.href = 'index.html';
            } else {
                errorEl.textContent = result.message;
                errorEl.classList.add('show');
            }
        });
    }

    // Gắn guard check đăng nhập ở trang index và bind sự kiện click logout
    function initAuthGuard() {
        if (!getCurrentUser()) {
            window.location.href = 'login.html';
            document.body.style.display = 'none';
            return false;
        }
        document.getElementById('btn-logout')?.addEventListener('click', () => logout());

        // Lắng nghe sự kiện storage từ tab khác để đồng bộ đăng xuất
        window.addEventListener('storage', (e) => {
            if (e.key === SESSION_KEY && !e.newValue) {
                window.location.href = 'login.html';
            }
        });

        return true;
    }

    return { login, logout, getCurrentUser, initLoginPage, initAuthGuard };
})();

// Tự động chạy init khi load xong login.html
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        Auth.initLoginPage();
    }
});
