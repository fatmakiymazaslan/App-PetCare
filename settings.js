// ====================================
// settings.js - Ayarlar ve Veri Yönetimi
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- YETKİ KONTROLÜ ---
    let activeUsername = localStorage.getItem('activeUser');
    if (!activeUsername) {
        window.location.href = "index.html"; 
        return; 
    }

    // --- Kullanıcı Verisini Çekme ---
    let userData = JSON.parse(localStorage.getItem(`users_${activeUsername}`));

    // --- DOM Elementleri ---
    const changeUsernameForm = document.getElementById('changeUsernameForm');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const logoutBtn = document.getElementById('logoutBtn');

    // Hata/Başarı Mesajı Yardımcı Fonksiyonları
    function showMessage(elementId, message, isError = true) {
        const el = document.getElementById(elementId);
        el.textContent = message;
        el.classList.remove('hidden');
        if (isError) {
            el.classList.add('error-text');
            el.classList.remove('success-text');
        } else {
            el.classList.add('success-text');
            el.classList.remove('error-text');
        }
    }

    function hideMessage(elementId) {
        document.getElementById(elementId).classList.add('hidden');
    }

    // 1. Kullanıcı Adı Değiştirme ve VERİ GÖÇÜ (Data Migration)
    changeUsernameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideMessage('usernameErrorMessage');
        hideMessage('usernameSuccessMessage');

        const newUsername = document.getElementById('newUsername').value.trim().toLowerCase();

        if (!newUsername) return;

        if (newUsername === activeUsername) {
            showMessage('usernameErrorMessage', "Zaten bu kullanıcı adını kullanıyorsunuz.");
            return;
        }

        if (localStorage.getItem(`users_${newUsername}`)) {
            showMessage('usernameErrorMessage', "Bu kullanıcı adı maalesef başkası tarafından alınmış.");
            return;
        }

        // A) Kullanıcı profilini yeni anahtara taşı
        userData.username = newUsername;
        localStorage.setItem(`users_${newUsername}`, JSON.stringify(userData));
        localStorage.removeItem(`users_${activeUsername}`);

        // B) Kullanıcıya ait tüm verileri yeni isme aktar (Veri Göçü)
        const dataCategories = ['pets', 'calendarEvents', 'foodWaterLogs', 'petNotes', 'reminders'];
        
        dataCategories.forEach(category => {
            const oldData = localStorage.getItem(`${category}_${activeUsername}`);
            if (oldData) {
                // Veriyi yeni kullanıcı adına kopyala
                localStorage.setItem(`${category}_${newUsername}`, oldData);
                // Eski veriyi sil
                localStorage.removeItem(`${category}_${activeUsername}`);
            }
        });

        // C) Aktif kullanıcıyı güncelle
        localStorage.setItem('activeUser', newUsername);
        activeUsername = newUsername; // Değişkeni de güncelle

        showMessage('usernameSuccessMessage', "Kullanıcı adınız başarıyla güncellendi!", false);
        changeUsernameForm.reset();
    });

    // 2. Şifre Değiştirme
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage('passwordErrorMessage');
        hideMessage('passwordSuccessMessage');

        const currentPassword = document.getElementById('currentPassword').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();

        if (!currentPassword || !newPassword) return;

        // Mevcut şifreyi kontrol et (utils.js içindeki hashPassword fonksiyonunu kullanıyoruz)
        const hashedCurrent = await hashPassword(currentPassword);
        
        if (hashedCurrent !== userData.passwordHash) {
            showMessage('passwordErrorMessage', "Mevcut şifrenizi yanlış girdiniz.");
            return;
        }

        // Yeni şifreyi kaydet
        const hashedNew = await hashPassword(newPassword);
        userData.passwordHash = hashedNew;
        localStorage.setItem(`users_${activeUsername}`, JSON.stringify(userData));

        showMessage('passwordSuccessMessage', "Şifreniz başarıyla güncellendi!", false);
        changePasswordForm.reset();
    });

    // 3. Çıkış Yapma İşlemi
    logoutBtn.addEventListener('click', () => {
        if (confirm("Hesabınızdan çıkış yapmak istediğinize emin misiniz?")) {
            localStorage.removeItem('activeUser');
            window.location.href = "index.html";
        }
    });

});