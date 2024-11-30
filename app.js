// Инициализация данных сеансов в LocalStorage, если их нет
function initializeData() {
    const data = localStorage.getItem('cinemaBooking');
    if (!data) {
      const defaultData = generateDefaultData();
      localStorage.setItem('cinemaBooking', JSON.stringify(defaultData));
    }
  }
  
  // Генерация данных по умолчанию для сеансов
  function generateDefaultData() {
    const defaultData = {};
    const today = new Date();
  
    // Генерация данных на неделю
    for (let i = -7; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const sessions = generateSessions();
      defaultData[dateString] = sessions;
    }
  
    return defaultData;
  }
  
  // Генерация данных сеансов
  function generateSessions() {
    const sessionTimes = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
    const sessions = {};
    sessionTimes.forEach(time => {
      sessions[time] = {
        totalSeats: 100,
        bookedSeats: 0
      };
    });
    return sessions;
  }
  
  // Функция для отображения доступных дат
  function renderCalendar() {
    const calendarContainer = document.getElementById('calendar');
    const currentDate = new Date();
    const data = JSON.parse(localStorage.getItem('cinemaBooking'));
  
    calendarContainer.innerHTML = ''; // Очистка календаря перед перерисовкой
  
    for (let i = -7; i <= 7; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const button = document.createElement('button');
      button.innerText = dateString;
      button.disabled = date < currentDate; // Делаем даты в прошлом недоступными
      button.classList.add('calendar-button');
      
      // Если день выбран, добавляем класс активной даты
      if (dateString === selectedDate) {
        button.classList.add('selected-date');
      }
  
      button.addEventListener('click', () => {
        selectedDate = dateString; // Сохраняем выбранную дату
        renderCalendar(); // Перерисовываем календарь
        renderSessions(dateString); // Отображаем сеансы для выбранного дня
        resetTicketSelection(); // Сбрасываем выбор количества билетов
      });
      
      calendarContainer.appendChild(button);
    }
  }
  
  // Функция для отображения сеансов для выбранной даты
  function renderSessions(dateString) {
    const data = JSON.parse(localStorage.getItem('cinemaBooking'));
    const sessionContainer = document.getElementById('sessions');
    sessionContainer.innerHTML = ''; // Очистка списка сеансов
  
    if (data && data[dateString]) {
      const sessions = data[dateString];
  
      Object.keys(sessions).forEach(time => {
        const session = sessions[time];
        const sessionButton = document.createElement('button');
        sessionButton.innerText = `${time} (${session.bookedSeats}/${session.totalSeats})`;
        
        sessionButton.disabled = new Date(`${dateString}T${time}:00`) < new Date();
        sessionButton.addEventListener('click', () => selectSession(dateString, time));
        
        sessionContainer.appendChild(sessionButton);
      });
    } else {
      sessionContainer.innerHTML = 'Нет доступных сеансов для этой даты.';
    }
  }
  
  // Функция для выбора сеанса
  function selectSession(date, time) {
    selectedTime = time;
    const data = JSON.parse(localStorage.getItem('cinemaBooking'));
    const session = data[date][time];
    availableSeats = session.totalSeats - session.bookedSeats;
  
    updateTicketCountAvailability();
  
    // Активируем поле для выбора билетов и кнопку бронирования
    document.getElementById('ticket-selector').style.display = 'block';
    document.getElementById('book-ticket').disabled = false;
  }
  
  // Функция для обновления доступности количества билетов
  function updateTicketCountAvailability() {
    const ticketInput = document.getElementById('ticket-count');
    const increaseButton = document.getElementById('increase-ticket');
    const decreaseButton = document.getElementById('decrease-ticket');
  
    if (availableSeats <= 0) {
      ticketInput.value = 0;
      increaseButton.disabled = true;
      decreaseButton.disabled = true;
    } else {
      increaseButton.disabled = false;
      decreaseButton.disabled = false;
    }
  }
  
  // Обработчики кнопок изменения количества билетов
  document.getElementById('increase-ticket').addEventListener('click', () => {
    const ticketInput = document.getElementById('ticket-count');
    if (ticketInput.value < availableSeats) {
      ticketInput.value = parseInt(ticketInput.value) + 1;
    }
  });
  
  document.getElementById('decrease-ticket').addEventListener('click', () => {
    const ticketInput = document.getElementById('ticket-count');
    if (ticketInput.value > 1) {
      ticketInput.value = parseInt(ticketInput.value) - 1;
    }
  });
  
  // Обработчик бронирования билетов
  document.getElementById('book-ticket').addEventListener('click', () => {
    const ticketCount = document.getElementById('ticket-count').value;
    const data = JSON.parse(localStorage.getItem('cinemaBooking'));
  
    // Обновляем количество забронированных билетов для выбранного сеанса
    data[selectedDate][selectedTime].bookedSeats += parseInt(ticketCount);
  
    localStorage.setItem('cinemaBooking', JSON.stringify(data));
  
    // Показываем уведомление о успешном бронировании
    const notification = document.getElementById('notification');
    notification.style.display = 'block';
    notification.innerText = `Вы забронировали ${ticketCount} билетов на ${selectedTime} ${selectedDate}.`;
  
    resetTicketSelection(); // Сбрасываем форму выбора билетов
  });
  
  // Сбрасываем форму выбора билетов
  function resetTicketSelection() {
    document.getElementById('ticket-selector').style.display = 'none';
    document.getElementById('ticket-count').value = 1;
  }
  
  // Инициализация страницы
  let selectedDate = null;
  let selectedTime = null;
  let availableSeats = 0;
  
  initializeData();
  renderCalendar();
  