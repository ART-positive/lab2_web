function limitDigits(event) {
  const input = event.currentTarget;
  const maxDigits = 6;
  if (input.value.length > maxDigits) {
    input.value = input.value.slice(0, maxDigits);
  }
}

document.getElementById('y').addEventListener('input', limitDigits);
document.getElementById('r').addEventListener('input', limitDigits);

const timeOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};

let resultsCount = 0;
function updateResultsCount() {
  resultsCount++;
  const resultsCountElement = document.getElementById('resultsCount');
  resultsCountElement.textContent = resultsCount.toString();
}

function populateTable(data) {
  const tableBody = document.querySelector('.table-body');
  const row = document.createElement('div');
  row.classList.add('table-row');
  const {
    x,
    y,
    r,
    isHit,
    curTime,
    dur,
  } = data.at(-1);
  const cellData = [
    x,
    y,
    r,
    isHit ? 'Да' : 'Нет',
    new Intl.DateTimeFormat('ru-RU', timeOptions).format(new Date(+curTime)),
    `${dur} нс`,
  ];
  cellData.forEach((content) => {
    const cell = document.createElement('div');
    cell.classList.add('table-cell');
    cell.textContent = content;
    row.appendChild(cell);
  });
  tableBody.appendChild(row);
  updateResultsCount();
}

const result = [];

const minY = -3;
const maxY = 5;
const minR = 1;
const maxR = 4;
const inputY = document.getElementById('y');
const inputR = document.getElementById('r');

function validateInput(input, min, max) {
  const { value } = input;
  if (value.trim() === '') {
    input.setCustomValidity('Некорректное значение!');
    return false;
  }
  if (value.toString().includes('e')) {
    input.setCustomValidity('What are you doing??🤨');
    return false;
  }
  if (value < min) {
    input.setCustomValidity(`Значение слишком маленькое, должно быть не меньше ${min}`);
    return false;
  }
  if (value > max) {
    input.setCustomValidity(`Значение слишком большое, должно быть не больше ${max}`);
    return false;
  }
  input.setCustomValidity('');
  return true;
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerText = message;

  document.getElementById('notification-container').appendChild(notification);
  setTimeout(() => {
    document.getElementById('notification-container').removeChild(notification);
  }, 4000);
}

inputY.addEventListener('input', () => validateInput(inputY, minY, maxY));
inputR.addEventListener('input', () => validateInput(inputR, minR, maxR));
document.getElementById('dataForm').addEventListener('submit', (event) => {
  if (!validateInput(inputY, minY, maxY) || !validateInput(inputR, minR, maxR)) {
    showNotification('Пожалуйста, заполните все поля формы.');
    event.preventDefault();
  }
});

function handleError(status) {
  const message = {
    500: 'Ошибка сервера (500). Попробуйте позже.',
    502: 'Плохой шлюз (502). Проблема с сервером. Попробуйте позже.',
    503: 'Служба недоступна (503). Сервер перегружен или временно недоступен.',
    504: 'Время ожидания шлюза истекло (504). Попробуйте позже.',
  };
  showNotification(message[status] || `Произошла ошибка. Код ошибки: ${status}`);
}

function responseData(data) {
  if (data.error) {
    showNotification(data.error.toString());
  } else {
    result.push({
      x: data.x,
      y: data.y,
      r: data.r,
      isHit: data.isHit,
      curTime: data.curTime,
      dur: data.dur,
    });
    populateTable(result);
  }
}

const image = document.getElementById('image');
let lastActionTime = 0;
let manyBadR = 0;

function checkTime() {
  const now = Date.now();
  if (now - lastActionTime < 30) return false;
  lastActionTime = now;
  return true;
}

function checkR(r) {
  if (!document.getElementById('r').reportValidity()) return false;
  if (!r) {
    manyBadR++;
    if (manyBadR < 5) {
      showNotification('Радиус не указан!');
    }
    if (manyBadR === 5) {
      showNotification('Куда так много🤨!');
    }
    return false;
  }
  manyBadR = 0;
  return true;
}

async function handleMouseAction(event) {
  if (!checkTime()) return;
  const r = document.getElementById('r').value;
  if (!checkR(r)) return;
  const globalCoordinate = event.target.getBoundingClientRect();
  const x = event.clientX - globalCoordinate.left;
  const y = event.clientY - globalCoordinate.top;
  const coords = truePositionClick(x, y, r);
  try {
    const response = await sendRequest(coords.x, coords.y, r);
    const data = await response.text();
    const parsedData = JSON.parse(data);
    responseData(parsedData);
    drawPoint(event.clientX, event.clientY, parsedData.isHit);
  } catch (error) {
    showNotification(error.message);
  }
}

image.addEventListener('mousemove', async (event) => {
  if (event.shiftKey) {
    await handleMouseAction(event);
  }
});

image.addEventListener('click', async (event) => {
  await handleMouseAction(event);
});
async function sendRequest(x, y, r) {
  const formData = new FormData();
  formData.append('x', x.toString());
  formData.append('y', y.toString());
  formData.append('r', r.toString());
  const body = Object.keys({ x, y, r }).map((e) => `${e}=${formData.get(e)}`).join('&');
  const response = await fetch(`/lab2/?${body}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    handleError(response.status);
    throw new Error(`Ошибка: ${response.statusText}`);
  }
  return response;
}

document.getElementById('clearData').onclick = async function (event) {
  const response = await fetch('/lab2/', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) handleError(response.status);
  else document.cookie = 'dataCleared=true; path=/; max-age=3600';
  window.location.reload();
};
window.onload = function () {
  if (document.cookie.indexOf('dataCleared=true') !== -1) {
    showNotification('Данные успешно очищены');
    document.cookie = 'dataCleared=; path=/; max-age=0'; // Удаляем cookie
  }
};

function truePositionClick(x, y, r) {
  x -= 200; // x - 200 = центр
  y -= 198; // y - 198 = центр (центрирование)
  y = -y; // зеркальное отображение относительно y
  x = (x / 155) * r; // координаты x относительно r и моей картинки
  y = (y / 155) * r; // координаты y относительно r и моей картинки
  x = Math.round(x * 1e6) / 1e6;
  y = Math.round(y * 1e6) / 1e6;
  return { x, y };
}

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
function drawPoint(x, y, color, delta = 4) {
  if (x < 188 || x > 588 || y < 140 || y > 540) return; // точка не попадает на график
  context.beginPath();
  context.arc(x, y, delta, 0, 2 * Math.PI);
  context.fillStyle = color ? 'green' : 'red';
  context.fill();
  context.stroke();
}

function drawPointNewPage(x, y, r, color) {
  y = -y; // зеркальное отображение относительно y
  x = (x * 155) / r; // 155 = длина r относительно моей image
  y = (y * 155) / r;
  x += 389; // делаем относительно глобальных координат
  y += 339;
  drawPoint(x, y, color);
}

const months = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function getDayName(day) {
  switch (day) {
    case 0: return 'Воскресенье';
    case 1: return 'Понедельник';
    case 2: return 'Вторник';
    case 3: return 'Среда';
    case 4: return 'Четверг';
    case 5: return 'Пятница';
    case 6: return 'Суббота';
    default: return 'Неизвестный день';
  }
}

function updateDateTime() {
  const time = new Date();
  const thisMonth = months[time.getMonth()];
  const date = time.getDate();
  const thisYear = time.getFullYear();
  const day = time.getDay();

  document.getElementById('date').textContent = `${date} ${thisMonth} ${thisYear} года - ${getDayName(day)}`;

  const clockData = document.getElementById('clockData');
  clockData.innerHTML = time.toLocaleTimeString('ru-RU');
}

setInterval(updateDateTime, 1000);
updateDateTime();


