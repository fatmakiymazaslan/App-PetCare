// ====================================
// auth.js - Giriş ve Kayıt İşlemleri
// ====================================

(function() {
    // Yönlendirme Linklerini Yönetme (index.html ve signup.html'de de çalışır)
    document.getElementById('goSignup')?.addEventListener('click', (e) => {
        e.preventDefault(); 
        window.location.href = "signup.html";
    });

    document.getElementById('goLogin')?.addEventListener('click', (e) => {
        e.preventDefault(); 
        window.location.href = "index.html";
    });

    // --- Giriş (Login) İşlemleri ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => { 
            e.preventDefault();

            clearError('loginErrorMessage');

            const username = document.getElementById('loginUsername').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value.trim();

            if (!username || !password) {
                displayError('loginErrorMessage', "Lütfen tüm alanları doldurun.");
                return;
            }

            const userData = JSON.parse(localStorage.getItem(`users_${username}`));

            if (!userData) {
                displayError('loginErrorMessage', "Kullanıcı adı veya şifre yanlış.");
                return;
            }

            // Şifreyi hashleyip, kaydedilmiş hash ile karşılaştır
            const hashedPassword = await hashPassword(password);
            
            if (userData.passwordHash !== hashedPassword) {
                 displayError('loginErrorMessage', "Kullanıcı adı veya şifre yanlış.");
                 return;
            }
            
            // Başarılı giriş
            localStorage.setItem('activeUser', username);
            window.location.href = "home.html";
        });
    }

    // --- Kayıt (Signup) İşlemleri ---
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            clearError('signupErrorMessage');

            const fullName = document.getElementById('signupFullName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const username = document.getElementById('signupUsername').value.trim().toLowerCase();
            const password = document.getElementById('signupPassword').value.trim();

            if (!fullName || !email || !username || !password) {
                displayError('signupErrorMessage', "Lütfen tüm alanları doldurun!");
                return;
            }

            if (localStorage.getItem(`users_${username}`)) {
                displayError('signupErrorMessage', "Bu kullanıcı adı zaten mevcut!");
                return;
            }

            // Şifreyi hashle
            const passwordHash = await hashPassword(password);

            const userData = {
                fullName,
                email,
                username,
                passwordHash // Şifre yerine hash kaydedildi
            };

            // Kullanıcı kaydediliyor
            localStorage.setItem(`users_${username}`, JSON.stringify(userData));

            // Başarılı kayıt, Giriş sayfasına yönlendir
            window.location.href = "index.html";
        });
    }
})(); // IIFE ile global kapsam temiz tutulur