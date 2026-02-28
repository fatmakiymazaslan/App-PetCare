// ====================================
// calendar.js - Takvim ve Olay Yönetimi
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- YETKİ KONTROLÜ ---
    const activeUsername = localStorage.getItem('activeUser');
    if (!activeUsername) {
        window.location.href = "index.html"; 
        return; 
    }

    // --- DOM Elementleri ---
    const petSelect = document.getElementById('petCalendarSelect');
    const calendarDaysGrid = document.getElementById('calendarDaysGrid');
    const currentMonthYearDisplay = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const addCalendarEventForm = document.getElementById('addCalendarEventForm');
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const dayEventsList = document.getElementById('dayEventsList');
    
    // Form Inputları
    const selectedDateInput = document.getElementById('selectedDateInput');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventTypeSelect = document.getElementById('eventTypeSelect');
    const eventNotesInput = document.getElementById('eventNotes');
    
    
    // --- Veri Yükleme ve Durum ---
    const pets = JSON.parse(localStorage.getItem(`pets_${activeUsername}`) || "[]");
    let calendarEvents = JSON.parse(localStorage.getItem(`calendarEvents_${activeUsername}`) || "[]");
    
    let currentDate = new Date(); // Şu anki ay/yılı takip eder
    let currentSelectedDate = null; // Takvimden seçilen günü takip eder

    // --- Başlangıç Yüklemesi ---
    loadPetsToDropdown();
    
    if (pets.length > 0) {
        // İlk evcil hayvanı otomatik seç
        petSelect.value = pets[0].id;
    }
    
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    
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

    // 2. Takvimi Çizme (Rendering)
    function renderCalendar(year, month) {
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // Ayın ilk günü (0=Paz, 1=Pzt...)
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Ayın toplam gün sayısı

        currentMonthYearDisplay.textContent = new Date(year, month).toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
        calendarDaysGrid.innerHTML = ''; // Temizle

        // Haftanın ilk gününü Pazar (0) yerine Pazartesi (1) yapmak için ayarlama
        const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

        // Başlangıç boşlukları (Önceki ayın günleri)
        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty');
            calendarDaysGrid.appendChild(emptyDay);
        }

        // Günleri yerleştir
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.textContent = day;
            dayElement.dataset.date = date.toISOString().split('T')[0]; // YYYY-MM-DD

            // Olayları kontrol et
            const dayEvents = getEventsByDate(dayElement.dataset.date);
            if (dayEvents.length > 0) {
                dayElement.classList.add('has-event');
                dayElement.title = dayEvents.map(e => e.title).join(', ');
            }
            
            // Bugünü işaretle
            if (date.toDateString() === new Date().toDateString()) {
                dayElement.classList.add('today');
            }

            dayElement.addEventListener('click', () => selectDate(dayElement));
            calendarDaysGrid.appendChild(dayElement);
        }
    }
    
    // 3. Tarih Seçme ve Olayları Görüntüleme
    function selectDate(dayElement) {
        // Eski seçimi kaldır
        document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
        
        // Yeni seçimi işaretle
        dayElement.classList.add('selected');
        
        const selectedDateStr = dayElement.dataset.date;
        currentSelectedDate = selectedDateStr;

        selectedDateInput.value = selectedDateStr;
        selectedDateDisplay.textContent = new Date(selectedDateStr).toLocaleDateString('tr-TR');
        document.getElementById('eventFormTitle').textContent = `${new Date(selectedDateStr).toLocaleDateString('tr-TR')} için Olay Ekle`;

        renderDayEvents(selectedDateStr);
    }
    
    // 4. Seçili Gün Olaylarını Listeleme
    function renderDayEvents(dateStr) {
        const petId = petSelect.value;
        const events = getEventsByDate(dateStr, petId);

        dayEventsList.innerHTML = '';
        
        if (events.length === 0) {
            dayEventsList.innerHTML = '<p class="info-text">Bu güne ait bir olay bulunmamaktadır.</p>';
            return;
        }

        events.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.classList.add('event-item', event.type); // type (vaccine, appointment) için stil sınıfı
            eventEl.innerHTML = `
                <h4>${event.title} (${event.type.charAt(0).toUpperCase() + event.type.slice(1)})</h4>
                <p>${event.notes}</p>
                <button class="delete-event-btn" data-id="${event.id}">Sil</button>
            `;
            
            eventEl.querySelector('.delete-event-btn').addEventListener('click', (e) => {
                deleteEvent(e.target.dataset.id);
            });
            
            dayEventsList.appendChild(eventEl);
        });
    }

    // 5. Olayları Tarihe Göre Filtreleme
    function getEventsByDate(dateStr, petId = null) {
        let events = calendarEvents.filter(e => e.date === dateStr);
        
        if (petId) {
            events = events.filter(e => e.petId == petId);
        }
        return events;
    }
    
    // 6. Olay Silme
    function deleteEvent(eventId) {
        calendarEvents = calendarEvents.filter(e => e.id != eventId);
        localStorage.setItem(`calendarEvents_${activeUsername}`, JSON.stringify(calendarEvents));
        
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Takvimi güncelle
        renderDayEvents(currentSelectedDate); // Olay listesini güncelle
    }


    // --- Olay Dinleyiciler ---
    
    // Ay değiştirme
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });
    
    // Evcil hayvan seçimi değiştiğinde takvimi ve olayları yeniden yükle
    petSelect.addEventListener('change', () => {
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
        if(currentSelectedDate) {
            renderDayEvents(currentSelectedDate);
        }
    });

    // Olay Ekleme Formu
    addCalendarEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const petId = petSelect.value;

        if (!petId) {
            alert('Lütfen önce bir evcil hayvan seçiniz.');
            return;
        }
        if (!currentSelectedDate) {
            alert('Lütfen takvimden bir gün seçiniz.');
            return;
        }
        
        const newEvent = {
            id: Date.now(),
            petId: petId,
            date: currentSelectedDate,
            title: eventTitleInput.value.trim(),
            type: eventTypeSelect.value,
            notes: eventNotesInput.value.trim(),
            // Ek Bilgiler: Randevu saati, tamamlandı durumu vb. eklenebilir.
        };

        calendarEvents.push(newEvent);
        localStorage.setItem(`calendarEvents_${activeUsername}`, JSON.stringify(calendarEvents));

        // Takvimi ve olay listesini yenile
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
        renderDayEvents(currentSelectedDate); 
        
        // Formu temizle
        addCalendarEventForm.reset();
        eventTypeSelect.value = ""; // Dropdown'ı sıfırla
    });

});