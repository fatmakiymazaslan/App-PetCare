// ====================================
// food-water.js - Mama ve Su Takibi Yönetimi (Hatasız Son Hali)
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- YETKİ KONTROLÜ ---
    const activeUsername = localStorage.getItem('activeUser');
    if (!activeUsername) {
        window.location.href = "index.html"; 
        return; 
    }

    // --- DOM Elementleri ---
    const petSelect = document.getElementById('petFoodWaterSelect');
    const lastFoodLogEl = document.getElementById('lastFoodLog');
    const lastWaterLogEl = document.getElementById('lastWaterLog');
    const trackingCardsSection = document.querySelector('.tracking-cards-section');

    // --- Veri Yükleme ve Durum ---
    const pets = JSON.parse(localStorage.getItem(`pets_${activeUsername}`) || "[]");
    let foodWaterLogs = JSON.parse(localStorage.getItem(`foodWaterLogs_${activeUsername}`) || "[]");
    
    // currentPetId artık global değil, petSelect.value üzerinden alınacak.
    
    // --- Yardımcı Fonksiyonlar ---

    // Zaman Farkını Hesaplama (Basitleştirilmiş)
    function getTimeDifference(date1, date2) {
        const diff = Math.abs(date2 - date1);
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 60) return `${minutes} dakika`;
        if (hours < 24) return `${hours} saat ${minutes % 60} dakika`;
        return `${days} günden fazla`;
    }
    
    // Ekranı Güncelleyen Yardımcı Fonksiyon
    function updateLogDisplay(element, log, typeName) {
        element.classList.remove('urgent'); // Önceki uyarıları temizle

        if (log) {
            const timeAgo = getTimeDifference(new Date(log.dateTime), new Date());
            element.innerHTML = `
                <p><strong>En Son Verilme:</strong></p>
                <p class="log-time-ago">${timeAgo} önce</p>
                <p class="log-details">${new Date(log.dateTime).toLocaleString('tr-TR', { 
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</p>
            `;
            // Kaba bir gösterge: Belirlenen süreden eskiyse uyarı rengi ver
            const diffHours = (new Date() - new Date(log.dateTime)) / (1000 * 60 * 60);
            
            // Mama için 12 saat, Su için 8 saat üst sınır koyalım.
            if ((typeName === 'Mama' && diffHours > 12) || (typeName === 'Su' && diffHours > 8)) {
                 element.classList.add('urgent');
            } 
        } else {
            element.innerHTML = `<p class="info-text">Henüz ${typeName.toLowerCase()} verilmedi.</p>`;
        }
    }


    // --- Ana Fonksiyonlar ---
// food-water.js içinde loadPetsToDropdown fonksiyonu:

    // 1. Evcil Hayvanları Dropdown'a yükle
    function loadPetsToDropdown() {
        if (pets.length === 0) {
            // ... (Uyarı ve yönlendirme kısmı) ...
            return;
        }
        
        pets.forEach(pet => {
            const option = document.createElement('option');
            option.value = pet.id;
            option.textContent = pet.name;
            petSelect.appendChild(option);
        });

        // KRİTİK KONTROL: İlk hayvanı seç ve logları yükle
        if (pets.length > 0) {
            const initialPetId = pets[0].id;
            
            // 1. Dropdown'ı ayarla
            petSelect.value = initialPetId; 
            
            // 2. Logları yükle (Doğrudan bu ID'yi fonksiyona geçir)
            loadLastLogs(initialPetId); 
        }
    }

// ... (Geri kalan kod)

    // 2. En Son Kayıtları Bul ve Göster
    function loadLastLogs(petId) {
        if (!petId || petId === "") {
            lastFoodLogEl.innerHTML = '<p class="info-text">Lütfen bir evcil hayvan seçiniz.</p>';
            lastWaterLogEl.innerHTML = '<p class="info-text">Lütfen bir evcil hayvan seçiniz.</p>';
            return;
        }

        const petLogs = foodWaterLogs.filter(log => log.petId == petId);

        // Mama ve su loglarını filtrele ve en sonuncuyu al (zamanı en büyük olan)
        const lastFood = petLogs
            .filter(log => log.type === 'food')
            .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))[0];

        const lastWater = petLogs
            .filter(log => log.type === 'water')
            .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))[0];
        
        // DOM Güncelleme
        updateLogDisplay(lastFoodLogEl, lastFood, 'Mama');
        updateLogDisplay(lastWaterLogEl, lastWater, 'Su');
    }

    // 3. Yeni Kayıt Ekleme
    function addNewLog(type, petId, dateTime) {
        if (!petId) return;

        const newLog = {
            id: Date.now(),
            petId: petId, // Doğru pet ID'si
            type: type, 
            dateTime: dateTime 
        };

        foodWaterLogs.push(newLog);
        localStorage.setItem(`foodWaterLogs_${activeUsername}`, JSON.stringify(foodWaterLogs));
        
        // Sadece ilgili evcil hayvanın loglarını yeniden yükle
        loadLastLogs(petId); 
    }


    // --- Olay Dinleyiciler ---

    // Evcil hayvan seçimi değiştiğinde
    petSelect.addEventListener('change', (e) => {
        const selectedPetId = e.target.value;
        loadLastLogs(selectedPetId);
    });

    // Form Gönderimlerini Yönetme
    trackingCardsSection.querySelectorAll('.log-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const selectedPetId = petSelect.value; // Form gönderme anında güncel değeri al.
            
            const type = e.target.dataset.type;
            const dateTimeInput = e.target.querySelector('input[type="datetime-local"]');
            const dateTimeValue = dateTimeInput.value;

            // Güvenilir kontrol: Dropdown'da seçili bir değer var mı?
            if (!selectedPetId || selectedPetId === "") { 
                alert('Lütfen önce bir evcil hayvan seçiniz.');
                return;
            }
            if (!dateTimeValue) {
                alert('Lütfen mama/su verildiği saati giriniz.');
                return;
            }

            addNewLog(type, selectedPetId, dateTimeValue); 
            dateTimeInput.value = ''; // Inputu temizle
        });
    });

    // --- Başlangıç ---
    loadPetsToDropdown();
});