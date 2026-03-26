const TOTAL_PLATFORMS = 12;
const PLATFORMS_PER_FLOOR = 6;

const INAGE_ROOT_PATH = "./images/";
const SYMBOLS = ["Ⅰ","Ⅱ","Ⅲ","Ⅳ","Ⅴ","Ⅵ","Ⅶ","Ⅷ"];
const SYMBOL_TO_NUM = { "Ⅰ":"1", "Ⅱ":"2", "Ⅲ":"3", "Ⅳ":"4", "Ⅴ":"5", "Ⅵ":"6", "Ⅶ":"7", "Ⅷ":"8" };
const SYMBOL_IMG = Object.fromEntries(SYMBOLS.map((s,i)=>[s,`${INAGE_ROOT_PATH}symbol_${i+1}.png`]));

const topRow = document.getElementById("topRow");
const bottomRow = document.getElementById("bottomRow");
const chatlog = document.getElementById("chatlog");
const inputBox = document.getElementById("inputBox");
const modeDisplay = document.getElementById("modeDisplay");
const resultBox = document.getElementById("result");
const controls = document.getElementById("controls");
const retryBtn = document.getElementById("retryBtn");
const startBtn = document.getElementById("startBtn");
const recapBox = document.getElementById("recap");
const timerDisplay = document.getElementById("timer");

let mode = "";
let symbols = [];
let step = 0;
let finalAnswer = "";
let playerTopIdx = [];
let playerBotIdx = [];
let compTopIdx = [];
let compBotIdx = [];
let timer = null, timeLeft = 40;
let selectValue = "";

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function assignVisibility() {
  const topCount = getRandomInt(2, 6);
  const botCount = getRandomInt(2, 6);

  const topIndices = shuffle([...Array(PLATFORMS_PER_FLOOR).keys()]);
  playerTopIdx = topIndices.slice(0, topCount);
  compTopIdx = topIndices.slice(topCount);

  const bottomIndices = shuffle([...Array(PLATFORMS_PER_FLOOR).keys()].map(i => i + PLATFORMS_PER_FLOOR));
  playerBotIdx = bottomIndices.slice(0, botCount);
  compBotIdx = bottomIndices.slice(botCount);
}

function generateSymbols() {
  const main = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const others = SYMBOLS.filter(s => s !== main);
  let base;

  if (mode === 'open') {
    const filler = shuffle([...others, ...others, ...others]).slice(0, 6);
    base = Array(6).fill(main).concat(filler);
  } else {
    const filler = shuffle(others).slice(0, 6);
    base = Array(6).fill(main).concat(filler);
  }
  symbols = shuffle(base.slice(0, TOTAL_PLATFORMS));
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 40;
  timerDisplay.textContent = `⏱️ ${timeLeft}`;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏱️ ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      resultBox.innerHTML = "⏰ 時間到!";
      inputBox.disabled = true;
      retryBtn.style.display = "inline-block";
      processSelectElement(resultBox);
    }
  }, 1000);
}

function processSelectElement(element) {
  const newSelect = document.createElement('select');
  newSelect.id = 'selectMode';

  const options = {"12 選 6":"MagicCircleSearch", "高熵":"HenirHighEntropy"};
  Object.entries(options).forEach(([key, value]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = key;
    newSelect.appendChild(opt);
  });

  element.insertAdjacentElement('afterend', newSelect);
  newSelect.value = selectValue;
}

export function startGame() {
  const selectElement = document.querySelector('#selectMode');
  if (selectElement !== null) {
    selectValue = selectElement.value;
    selectElement.remove();
  }

  clearInterval(timer);
  step = 0;
  finalAnswer = "";
  symbols = [];
  chatlog.innerHTML = '';
  resultBox.innerHTML = '';
  recapBox.innerHTML = '';
  inputBox.value = '';
  inputBox.disabled = false;
  recapBox.style.display = "none";
  retryBtn.style.display = "none";
  controls.style.display = "block";
  startBtn.style.display = "none";

  mode = Math.random() < 0.5 ? "open" : "closed";
  
  const modeImageSrc = mode === 'open' ? `${INAGE_ROOT_PATH}open.png` : `${INAGE_ROOT_PATH}close.png`;
  modeDisplay.innerHTML = `目前狀態: <img src="${modeImageSrc}" alt="${mode} eye mode" style="height: 40px; vertical-align: middle; margin-left: 10px;">`;

  generateSymbols();
  assignVisibility();

  renderRow(topRow, [...Array(PLATFORMS_PER_FLOOR).keys()]);
  renderRow(bottomRow, [...Array(PLATFORMS_PER_FLOOR).keys()].map(i => i + PLATFORMS_PER_FLOOR));

  topRow.style.display = "flex";
  bottomRow.style.display = "none";
  updatePlaceholder();
  startTimer();

  // 上層或下層全部都有數字的話重抽
  if (compTopIdx.length === 0 || compBotIdx.length === 0) {
    startGame();
  }
}

function renderRow(row, indices) {
  row.innerHTML = '';
  const visibleSet = (row.id === "topRow") ? playerTopIdx : playerBotIdx;

  const leftDiv = document.createElement("div");
  leftDiv.className = "left-row";
  row.appendChild(leftDiv);

  const rightDiv = document.createElement("div");
  rightDiv.className = "right-row";
  row.appendChild(rightDiv);

  indices.forEach(idx => {
      const div = document.createElement("div");
      div.className = "platform";
      if (visibleSet.includes(idx)) {
        const sym = symbols[idx];
        if (sym && SYMBOL_IMG[sym]) {
          const img = document.createElement("img");
          img.src = SYMBOL_IMG[sym];
          div.appendChild(img);
        }
      }

      if (row.id === "topRow") {
        if (idx < 3 ) {
          leftDiv.appendChild(div);
        } else {
          rightDiv.appendChild(div);
        }
      } else {
        if (idx < 9) {
          leftDiv.appendChild(div);
        } else {
          rightDiv.appendChild(div);
        }
      }
  });
}

function updatePlaceholder() {
  if (step <= 1) {
    inputBox.placeholder = "輸入你看到的數字 (e.g., x1x / x68)";
  } else if (step === 2) {
    inputBox.placeholder = "整合你和隊友的數字 (上層)";
  } else if (step === 3) {
    inputBox.placeholder = "整合你和隊友的數字 (下層)";
  } else {
    inputBox.placeholder = "輸入\"安全點\"的數字";
  }
}

function formatBrief(indices, visibleSet) {
  const sortedIndices = [...indices].sort((a, b) => a - b);
  const briefingPairs = [];

  for (let i = 0; i < sortedIndices.length; i++) {
    const idx1 = sortedIndices[i];
    const char1 = visibleSet.includes(idx1) ? SYMBOL_TO_NUM[symbols[idx1]] : '-';
    briefingPairs.push(char1);
  }

  const chunks = 3;

  return Array.from(
    {length: Math.ceil(briefingPairs.length / chunks)},
    (_, idx) => briefingPairs.slice(idx * chunks, idx * chunks + chunks).join('')
  ).join(' / ');
}

function handleInput(value) {
  if (!value.trim()) return;
  const topFloorIndices = [...Array(PLATFORMS_PER_FLOOR).keys()];
  const botFloorIndices = topFloorIndices.map(i => i + PLATFORMS_PER_FLOOR);

  switch(step) {
    case 0:
      chatlog.innerHTML += `<div><strong>我 (上層):</strong> ${value}</div>`;
      chatlog.innerHTML += `<div><strong>隊友 (上層):</strong> ${formatBrief(topFloorIndices, compTopIdx)}</div>`;
      topRow.style.display = "none"; bottomRow.style.display = "flex"; break;
    case 1:
      chatlog.innerHTML += `<div><strong>我 (下層):</strong> ${value}</div>`;
      chatlog.innerHTML += `<div><strong>隊友 (下層):</strong> ${formatBrief(botFloorIndices, compBotIdx)}</div>`;
      break;
    case 2: 
      chatlog.innerHTML += `<div><strong>上層整合數字:</strong> ${value}</div>`;
      break;
    case 3: 
      chatlog.innerHTML += `<div><strong>下層整合數字:</strong> ${value}</div>`;
      break;
    case 4:
      finalAnswer = value;
      judge();
      recapImages();
      retryBtn.style.display = "inline-block";
      processSelectElement(resultBox);
      clearInterval(timer); inputBox.disabled = true;
      break;
  }
  step++; inputBox.value = ''; updatePlaceholder();
}

function judge() {
  const counts = {};
  for (let i = 0; i < TOTAL_PLATFORMS; i++) {
    const num = SYMBOL_TO_NUM[symbols[i]];
    counts[num] = (counts[num] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
  const [mainNumber, mainCount] = sorted[0];

  if (mode === 'open') {
    if (mainCount !== 6) {
      resultBox.innerHTML = `❌ 面板數字顯示錯誤! (主號碼出現了 ${mainCount} 次, 不符合規定的 6 次)`;
      return;
    }
    resultBox.innerHTML = finalAnswer === mainNumber
      ? `✅ 正確! 安全點是 ${mainNumber}`
      : `❌ 錯誤! 安全點是 ${mainNumber}`;
  } else { // closed eye
    const safeNumbers = Object.keys(counts).filter(num => num !== mainNumber);
    if (mainCount !== 6) {
      resultBox.innerHTML = `❌ 面板數字顯示錯誤! (主號碼出現了 ${mainCount} 次, 不符合規定的 6 次)`;
      return;
    }
    if (safeNumbers.includes(finalAnswer)) {
        resultBox.innerHTML = `✅ 正確 (閉眼)! '${finalAnswer}' 是其中一個安全點。 其餘的安全點是... ${Object.keys(counts).filter(num => (num !== finalAnswer && num !== mainNumber)).join(', ')}`;
    } else {
        resultBox.innerHTML = `❌ 錯誤! '${finalAnswer}' 不是安全點。 安全的地方是... ${safeNumbers.join(', ')}`;
    }
  }
}

function recapImages() {
  recapBox.style.display = 'block';
  recapBox.innerHTML = "<h3>🔁 最終結果: 我的數字 / 隊友的數字</h3>";

  const counts = {};
  for (let i = 0; i < TOTAL_PLATFORMS; i++) {
    const num = SYMBOL_TO_NUM[symbols[i]];
    counts[num] = (counts[num] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
  const [mainNumber] = sorted[0];

  const safeSpotIndices = mode === "open"
    ? symbols.map((s, i) => SYMBOL_TO_NUM[s] === mainNumber ? i : null).filter(i => i !== null)
    : symbols.map((s, i) => SYMBOL_TO_NUM[s] !== mainNumber ? i : null).filter(i => i !== null);

  const isSafe = (idx) => safeSpotIndices.includes(idx);

  const showRow = (title, indices) => {
    const row = document.createElement("div");
    row.className = "recap-row";
    row.innerHTML = `<strong>${title}:</strong> `;
    indices.forEach(idx => {
      const sym = symbols[idx];
      const img = document.createElement("img");
      img.src = SYMBOL_IMG[sym];
      img.style.width = "60px";
      img.style.margin = "4px";
      if (!playerTopIdx.includes(idx) && !playerBotIdx.includes(idx)) {
          img.classList.add("comp-view");
      }
      if (isSafe(idx)) img.classList.add("correct-tile");
      row.appendChild(img);
    });
    recapBox.appendChild(row);
  };

  const topFloorIndices = [...Array(PLATFORMS_PER_FLOOR).keys()];
  const botFloorIndices = topFloorIndices.map(i => i + PLATFORMS_PER_FLOOR);

  showRow("上層", topFloorIndices);
  showRow("下層", botFloorIndices);
}

export function init(signal) {
  inputBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleInput(inputBox.value);
  }, { signal });

  startBtn.addEventListener('click', startGame, { signal });
  retryBtn.addEventListener('click', startGame, { signal });
}
