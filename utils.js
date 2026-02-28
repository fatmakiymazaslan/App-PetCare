// ====================================
// utils.js - Yardımcı Fonksiyonlar
// ====================================

/**
 * Belirtilen HTML elementine hata mesajını yazar ve gösterir.
 * @param {string} elementId - Hata mesajının yazılacağı elementin ID'si.
 * @param {string} message - Gösterilecek hata mesajı.
 */
function displayError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden'); 
    }
}

/**
 * Hata mesajını temizler ve elementi gizler.
 * @param {string} elementId - Temizlenecek elementin ID'si.
 */
function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }
}

/**
 * Şifreyi hash'lemek için basit bir SHA-256 (localStorage için) kullanır.
 * NOT: Gerçek sunucu uygulamalarında daha güçlü kütüphaneler (bcrypt) kullanılmalıdır.
 * @param {string} password - Hashlenecek şifre.
 * @returns {Promise<string>} - Hashlenmiş şifre (base64).
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    // Şifre hash'leme için SublteCrypto API kullanımı.
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Hash'i base64 string'e dönüştür
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));
    
    return hashBase64;
}

// Global scope'u kirletmemek için fonksiyonları window objesine atayabiliriz.
window.displayError = displayError;
window.clearError = clearError;
window.hashPassword = hashPassword;