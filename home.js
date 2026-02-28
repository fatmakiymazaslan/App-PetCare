// ====================================
// home.js - Ana Sayfa ve Evcil Hayvan Yönetimi (SON KONTROL EDİLMİŞ VERSİYON)
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- YETKİ KONTROLÜ ---
    const activeUsername = localStorage.getItem('activeUser');
    if (!activeUsername) {
        window.location.href = "index.html"; 
        return; 
    }

    // --- DOM Elementleri ---
    const mainPetDisplay = document.getElementById('mainPetDisplay');
    const sidePetListEl = document.getElementById('sidePetList');
    const showAddFormBtn = document.getElementById('showAddFormBtn');
    
    // Form Elementleri
    const addPetForm = document.getElementById('addPetForm');
    const petPhotoDisplay = document.getElementById('petPhotoDisplay');
    const petPhotoInput = document.getElementById('petPhotoInputHome');
    const petNameInput = document.getElementById('petNameInputHome');
    const petAddErrorMessage = document.getElementById('petAddErrorMessage');
    
    // --- Veri Yükleme ve Durum ---

    let pets = JSON.parse(localStorage.getItem(`pets_${activeUsername}`) || "[]");
    let currentPhoto = ""; // Fotoğraf verisini tutar (Base64)
    
    // Başlangıçta listeyi render et
    renderPetManagement(); 


    // --- Fonksiyonlar ---
    
    // Hata Mesajı Yönetimi
    function displayError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    function clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }

    // 1. Pet Yönetim Ekranını Render Et
    function renderPetManagement() {
        if (pets.length === 0) {
            // Hiç hayvan yoksa, sadece ekleme formunu göster
            mainPetDisplay.innerHTML = '';
            addPetForm.style.display = 'flex';
            mainPetDisplay.appendChild(addPetForm);
            showAddFormBtn.classList.add('hidden');
            return;
        }

        // Formu gizle
        addPetForm.style.display = 'none';

        // 1. Ana Hayvan Kartını Göster
        const mainPet = pets[0]; // İlk hayvan ana kart
        displayMainPet(mainPet);

        // 2. Yan Listeyi Göster
        displaySidePets(pets.slice(1)); // Geri kalanlar yan liste
        
        // 3. Ekleme butonunu göster
        showAddFormBtn.classList.remove('hidden');
    }
// home.js - displayMainPet fonksiyonu:

    // 2. Ana Hayvan Kartını Oluştur ve Ekle
    function displayMainPet(pet) {
        // Fotoğraf varsa sınıfı ekle
        const photoClass = pet.photo ? 'has-photo' : '';
        const photoStyle = pet.photo ? `background-image: url('${pet.photo}')` : '';

        mainPetDisplay.innerHTML = `
            <div class="main-pet-info" data-id="${pet.id}">
                <div class="pet-photo ${photoClass}" style="${photoStyle}">
                    ${!pet.photo ? '🐶' : ''}
                </div>
                <h3>${pet.name}</h3>
                <p>Seçili Evcil Hayvanınız</p>
                <div class="main-actions">
                    <button class="delete-pet-btn secondary-btn" data-id="${pet.id}">❌ Sil</button>
                </div>
            </div>
        `;
        
        // Olay dinleyicilerini ata
        
        // Detay butonu dinleyicisi KALDIRILDI
        
        mainPetDisplay.querySelector('.delete-pet-btn').addEventListener('click', (e) => {
             // Silme işlemini başlat
             deletePet(e.target.dataset.id);
        });
    }
    // 3. Yan Hayvan Listesini Oluştur ve Ekle
    function displaySidePets(sidePets) {
        sidePetListEl.innerHTML = '';
        if (sidePets.length === 0) {
            sidePetListEl.innerHTML = '<p class="info-text">Başka dostunuz yok.</p>';
            return;
        }

        sidePets.forEach(pet => {
            const petCard = document.createElement('div');
            petCard.classList.add('small-pet-card');
            petCard.dataset.id = pet.id;
            
            const photoStyle = pet.photo ? `background-image: url('${pet.photo}')` : '';

            petCard.innerHTML = `
                <div class="small-pet-card-photo" style="${photoStyle}"></div>
                <span>${pet.name}</span>
                <button class="delete-pet-btn" data-id="${pet.id}">❌</button>
            `;
            
            // --- 1. SİLME BUTONUNA TIKLAMA (KRİTİK) ---
            const deleteButton = petCard.querySelector('.delete-pet-btn');
            deleteButton.addEventListener('click', (e) => {
                 // !!! KRİTİK DÜZELTME: Olayın kartın geneline yayılmasını engelle !!!
                 e.stopPropagation(); 
                 deletePet(e.target.dataset.id);
            });
            
            // --- 2. KARTIN KENDİSİNE TIKLAMA (Ana hayvan yapma) ---
            petCard.addEventListener('click', (e) => {
                 // Eğer tıklanan element silme butonu değilse (stopPropagation sayesinde bu gereksizleşti ama güvenilir):
                 makePetMain(pet.id);
            });

            sidePetListEl.appendChild(petCard);
        });
    }

    // 4. Hayvanı Ana Hayvan Yap (Listede başa taşı)
    function makePetMain(petId) {
        const petIndex = pets.findIndex(p => p.id == petId);
        if (petIndex === -1 || petIndex === 0) return; 

        // Seçilen hayvanı dizinin başına taşı
        const [petToMove] = pets.splice(petIndex, 1);
        pets.unshift(petToMove); 

        // LocalStorage'ı güncelle
        localStorage.setItem(`pets_${activeUsername}`, JSON.stringify(pets));
        
        // Ekranı yeniden çiz
        renderPetManagement();
    }

    // 5. Hayvanı Silme (Hatasız Düzeltilmiş)
    function deletePet(petId) {
        if (!confirm("Bu evcil hayvanı kalıcı olarak silmek istediğinizden emin misiniz?")) {
            return;
        }

        // Gelen string ID'yi sayıya çevirerek karşılaştırma yapalım, bu en güvenilir yoldur.
        const idToDelete = parseInt(petId, 10);

        // Silme işlemi: Diziden çıkar
        pets = pets.filter(p => p.id !== idToDelete); 
        
        // LocalStorage'ı güncelle
        localStorage.setItem(`pets_${activeUsername}`, JSON.stringify(pets)); 
        
        // Silme sonrası ekranı yeniden çiz
        renderPetManagement();

        // Not: Temizlik (cleanup) fonksiyonu burada çağrılmalıdır. 
        // İleride diğer modül verilerini de sileceğiz.
    }

    // --- Olay Dinleyiciler ---

    // Fotoğraf seçimi (Tıklanabilir div)
    petPhotoDisplay.addEventListener('click', () => {
        petPhotoInput.click();
    });

    petPhotoInput.addEventListener('change', () => {
        const file = petPhotoInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function() {
            currentPhoto = reader.result; // Base64 verisini kaydet
            petPhotoDisplay.style.backgroundImage = `url('${currentPhoto}')`;
            petPhotoDisplay.textContent = "";
            petPhotoDisplay.classList.add('has-photo');
        }
        reader.readAsDataURL(file); // Resmi Base64 formatında oku
    });

    // Yeni Hayvan Ekleme (Form submit olayı)
    addPetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearError('petAddErrorMessage');

        const name = petNameInput.value.trim();

        if (!name) {
            displayError('petAddErrorMessage', "Lütfen evcil hayvanınızın ismini giriniz.");
            return;
        }

        const newPet = { 
            id: Date.now(), 
            name, 
            photo: currentPhoto,
        };
        
        // Yeni hayvanı her zaman dizinin BAŞINA ekle (Ana hayvan olacak)
        pets.unshift(newPet);
        localStorage.setItem(`pets_${activeUsername}`, JSON.stringify(pets));
        
        // Ekranı yeniden çiz
        renderPetManagement();

        // Formu temizle
        petNameInput.value = "";
        currentPhoto = "";
        petPhotoInput.value = ""; 
        petPhotoDisplay.style.backgroundImage = "none";
        petPhotoDisplay.textContent = "📷";
        petPhotoDisplay.classList.remove('has-photo');
    });

    // "Yeni Pet Ekle" Butonuna Tıklama (Formu tekrar gösterir)
    showAddFormBtn.addEventListener('click', () => {
        mainPetDisplay.innerHTML = '';
        addPetForm.style.display = 'flex'; // Formu görünür yap
        mainPetDisplay.appendChild(addPetForm);
        showAddFormBtn.classList.add('hidden');
    });


    // --- Menü Butonları ---
    document.getElementById('goSettingsBtn')?.addEventListener('click', () => {
        window.location.href = "settings.html";
    });
    document.getElementById('reminderBtn')?.addEventListener('click', () => {
        window.location.href = "reminders.html"; 
    });
    document.getElementById('calendarBtn')?.addEventListener('click', () => {
        window.location.href = "calendar.html"; 
    });
    document.getElementById('foodWaterBtn')?.addEventListener('click', () => {
        window.location.href = "food-water.html"; 
    });
    document.getElementById('notesBtn')?.addEventListener('click', () => {
        window.location.href = "notes.html"; 
    });
});