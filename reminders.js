// ====================================
// reminders.js - Hatırlatıcı Yönetimi
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- YETKİ KONTROLÜ ---
    const activeUsername = localStorage.getItem('activeUser');
    if (!activeUsername) {
        window.location.href = "index.html"; 
        return; 
    }

    // --- DOM Elementleri ---
    const petSelect = document.getElementById('petSelect');
    const addReminderForm = document.getElementById('addReminderForm');
    const reminderList = document.getElementById('reminderList');

    // --- Veri Yükleme ---
    const pets = JSON.parse(localStorage.getItem(`pets_${activeUsername}`) || "[]");
    let reminders = JSON.parse(localStorage.getItem(`reminders_${activeUsername}`) || "[]");

    // --- Fonksiyonlar ---

    // 1. Evcil Hayvanları Dropdown'a yükle
    function loadPetsToDropdown() {
        pets.forEach(pet => {
            const option = document.createElement('option');
            option.value = pet.id; // Evcil hayvan ID'si
            option.textContent = pet.name;
            petSelect.appendChild(option);
        });
    }

    // 2. Hatırlatıcıyı Listede Göster
    function displayReminder(reminder) {
        const pet = pets.find(p => p.id == reminder.petId);
        
        const card = document.createElement('div');
        card.classList.add('reminder-card');
        // Geçmişteki hatırlatıcılar için farklı stil
        if (new Date(reminder.dateTime) < new Date()) {
            card.classList.add('is-past');
        }

        card.innerHTML = `
            <div class="reminder-header">
                <h3>${reminder.title}</h3>
                <span class="pet-name-tag">${pet ? pet.name : 'Bilinmeyen'}</span>
            </div>
            <p class="reminder-time">
                ${new Date(reminder.dateTime).toLocaleString('tr-TR', { 
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
            </p>
            ${reminder.notes ? `<p class="reminder-notes">${reminder.notes}</p>` : ''}
            <button class="delete-btn" data-id="${reminder.id}">Sil</button>
        `;
        
        // Listenin başına ekle (en yeniyi üste koy)
        reminderList.prepend(card);
        
        // Silme olayını ekle
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            deleteReminder(e.target.dataset.id);
        });
    }

    // 3. Hatırlatıcıları LocalStorage'dan yükle ve sırala
    function loadReminders() {
        // Tarihe göre sırala (en yakın olan en üstte)
        reminders.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

        reminderList.innerHTML = ''; // Listeyi temizle
        if (reminders.length === 0) {
            reminderList.innerHTML = '<p class="info-text">Henüz ayarlanmış bir hatırlatıcı yok.</p>';
            return;
        }

        reminders.forEach(displayReminder);
    }
    
    // 4. Hatırlatıcıyı Silme İşlemi
    function deleteReminder(id) {
        reminders = reminders.filter(r => r.id != id);
        localStorage.setItem(`reminders_${activeUsername}`, JSON.stringify(reminders));
        loadReminders(); // Listeyi yeniden yükle
    }


    // --- Olay Dinleyiciler ---
    
    // Form Gönderme
    addReminderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const petId = petSelect.value;
        const title = document.getElementById('reminderTitle').value.trim();
        const dateTime = document.getElementById('reminderDateTime').value;
        const notes = document.getElementById('reminderNotes').value.trim();
        
        if (!petId || !title || !dateTime) {
            // Hata mesajı gösterimi için displayError/clearError fonksiyonlarını kullanabilirsiniz
            alert('Lütfen tüm zorunlu alanları doldurun.'); 
            return;
        }

        const newReminder = {
            id: Date.now(), 
            petId: petId,
            title: title,
            dateTime: dateTime,
            notes: notes
        };
        
        reminders.push(newReminder);
        localStorage.setItem(`reminders_${activeUsername}`, JSON.stringify(reminders));
        
        loadReminders(); // Listeyi yenile
        addReminderForm.reset(); // Formu temizle
        petSelect.value = ""; // Dropdown'ı sıfırla
    });

    // --- Başlangıç Yüklemesi ---
    loadPetsToDropdown();
    loadReminders();
});