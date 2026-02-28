// ====================================
// notes.js - Not Yönetimi
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- YETKİ KONTROLÜ ---
    const activeUsername = localStorage.getItem('activeUser');
    if (!activeUsername) {
        window.location.href = "index.html"; 
        return; 
    }

    // --- DOM Elementleri ---
    const petSelect = document.getElementById('petNotesSelect');
    const currentPetNameDisplay = document.getElementById('currentPetNameDisplay');
    const addNoteForm = document.getElementById('addNoteForm');
    const notesList = document.getElementById('notesList');
    
    // Form Inputları
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContentInput = document.getElementById('noteContent');

    // --- Veri Yükleme ve Durum ---
    const pets = JSON.parse(localStorage.getItem(`pets_${activeUsername}`) || "[]");
    // Tüm notları tek bir anahtarda tutuyoruz
    let petNotes = JSON.parse(localStorage.getItem(`petNotes_${activeUsername}`) || "[]");
    
    // --- Fonksiyonlar ---

    // 1. Evcil Hayvanları Dropdown'a yükle
    function loadPetsToDropdown() {
        if (pets.length === 0) {
            alert("Lütfen önce bir evcil hayvan ekleyin.");
            window.location.href = "home.html";
            return;
        }
        
        pets.forEach(pet => {
            const option = document.createElement('option');
            option.value = pet.id;
            option.textContent = pet.name;
            petSelect.appendChild(option);
        });

        // İlk evcil hayvanı otomatik olarak seç ve notları yükle
        if (pets.length > 0) {
            const initialPetId = pets[0].id;
            petSelect.value = initialPetId; 
            const initialPetName = pets[0].name;
            loadNotes(initialPetId, initialPetName);
        }
    }

    // 2. Notları Listede Göster
    function displayNote(note) {
        const card = document.createElement('div');
        card.classList.add('note-card');

        card.innerHTML = `
            <div class="note-header">
                <h3>${note.title}</h3>
                <span class="note-date">${new Date(note.date).toLocaleDateString('tr-TR')}</span>
            </div>
            <p class="note-content">${note.content.replace(/\n/g, '<br>')}</p>
            <button class="delete-btn" data-id="${note.id}">Sil</button>
        `;
        
        
         notesList.appendChild(card);
        
        // Silme olayını ekle
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            deleteNote(e.target.dataset.id, note.petId);
        });
    }

    // 3. Evcil Hayvana Ait Notları Yükle
    function loadNotes(petId, petName) {
        notesList.innerHTML = ''; // Listeyi temizle
        
        if (!petId || petId === "") {
            notesList.innerHTML = '<p class="info-text">Lütfen yukarıdan bir evcil hayvan seçiniz.</p>';
            currentPetNameDisplay.textContent = "Seçiniz";
            return;
        }
        
        currentPetNameDisplay.textContent = petName;

        // İlgili evcil hayvana ait notları filtrele ve tarihe göre sırala
        const filteredNotes = petNotes
            .filter(note => note.petId == petId)
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // En yeniyi üste

        if (filteredNotes.length === 0) {
            notesList.innerHTML = '<p class="info-text">Bu evcil hayvan için henüz bir not eklenmedi.</p>';
            return;
        }

        filteredNotes.forEach(displayNote);
    }
    
    // 4. Notu Silme İşlemi
    function deleteNote(id, petId) {
        petNotes = petNotes.filter(n => n.id != id);
        localStorage.setItem(`petNotes_${activeUsername}`, JSON.stringify(petNotes));
        
        // Silinen notun ait olduğu evcil hayvanın adını al
        const petName = pets.find(p => p.id == petId)?.name || "Seçiniz";

        loadNotes(petId, petName); // Listeyi yeniden yükle
    }


    // --- Olay Dinleyiciler ---
    
    // Evcil hayvan seçimi değiştiğinde
    petSelect.addEventListener('change', (e) => {
        const selectedPetId = e.target.value;
        const selectedPetName = pets.find(p => p.id == selectedPetId)?.name || "Seçiniz";
        loadNotes(selectedPetId, selectedPetName);
    });

    // Form Gönderme
    addNoteForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const selectedPetId = petSelect.value;
        
        if (!selectedPetId || selectedPetId === "") {
            alert('Lütfen önce bir evcil hayvan seçiniz.');
            return;
        }
        
        const petName = pets.find(p => p.id == selectedPetId)?.name;
        
        const newNote = {
            id: Date.now(), 
            petId: selectedPetId,
            title: noteTitleInput.value.trim(),
            content: noteContentInput.value.trim(),
            date: new Date().toISOString() // Kayıt tarihi
        };
        
        petNotes.push(newNote);
        localStorage.setItem(`petNotes_${activeUsername}`, JSON.stringify(petNotes));
        
        loadNotes(selectedPetId, petName); // Listeyi yenile
        addNoteForm.reset(); // Formu temizle
    });

    // --- Başlangıç Yüklemesi ---
    loadPetsToDropdown();
});