function limitDigits(event) {
  const input = event.currentTarget;
  const maxDigits = 8;
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
  }, 5000);
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

document.getElementById('image').onclick = async function (event) {
  if (!document.getElementById('r').reportValidity()) return;
  const r = document.getElementById('r').value;
  if (r) {
    const globalCoordinate = event.target.getBoundingClientRect();
    let x = event.clientX - globalCoordinate.left;
    let y = event.clientY - globalCoordinate.top;
    const coords = truePositionClick(x, y, r);
    x = coords.x;
    y = coords.y;
    try {
      const response = await sendRequest(x, y, r);
      const data = await response.text();
      const parsedData = JSON.parse(data);
      responseData(parsedData);
      drawPoint(event.clientX, event.clientY, parsedData.isHit);
    } catch (error) {
      showNotification(error.message);
    }
  } else {
    showNotification('Радиус не указан!');
  }
};

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
    throw new Error(`Ошибка ${response.status}`);
  }
  return response;
}

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
