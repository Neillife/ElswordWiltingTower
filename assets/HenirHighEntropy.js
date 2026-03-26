const TOTAL_PLATFORMS = 8;
const PLATFORMS_PER_FLOOR = 4;

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

let symbols = [], step = 0;
let finalAnswer = "";
let timer = null, timeLeft = 20;
let selectValue = "";
let finalResult = "";

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSymbols() {
  if (finalResult === "same") {
    let topFiller = shuffle([...SYMBOLS, ...SYMBOLS, ...SYMBOLS]).slice(0, TOTAL_PLATFORMS / 2);
    let topTotalNum = 0;
    topFiller.forEach(symbols => {
      topTotalNum += parseInt(SYMBOL_TO_NUM[symbols]);
    });

    let botFiller;
    let botTotalNum;
    while (topTotalNum != botTotalNum) {
      botTotalNum = 0;
      botFiller = shuffle([...SYMBOLS, ...SYMBOLS, ...SYMBOLS]).slice(0, TOTAL_PLATFORMS / 2);
      botFiller.forEach(symbols => {
        botTotalNum += parseInt(SYMBOL_TO_NUM[symbols]);
      });
    }

    symbols = [...topFiller, ...botFiller];
  } else {
    let topFiller = shuffle([...SYMBOLS, ...SYMBOLS, ...SYMBOLS]).slice(0, TOTAL_PLATFORMS / 2);
    let topTotalNum = 0;
    topFiller.forEach(item => {
      topTotalNum += parseInt(SYMBOL_TO_NUM[item]);
    });

    let botFiller;
    let botTotalNum = topTotalNum;
    while (topTotalNum === botTotalNum) {
      botTotalNum = 0;
      botFiller = shuffle([...SYMBOLS, ...SYMBOLS, ...SYMBOLS]).slice(0, TOTAL_PLATFORMS / 2);
      botFiller.forEach(item => {
        botTotalNum += parseInt(SYMBOL_TO_NUM[item]);
      });

      let tempFiller = [...topFiller, ...botFiller];
      const checkDiffHaveSymbol = tempFiller.map((item, index) => SYMBOL_TO_NUM[item] === Math.abs((topTotalNum - botTotalNum)).toString() ? index : null).filter(i => i !== '').join('');
      if (checkDiffHaveSymbol === '' || topTotalNum - botTotalNum > 8) {
        botTotalNum = topTotalNum;
      }
    }

    symbols = [...topFiller, ...botFiller];
  }
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 20;
  timerDisplay.textContent = `⏱️ ${timeLeft}`;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏱️ ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      let totalDiff = getTotalDiff();
      resultBox.innerHTML = `⏰ 時間到! </br> 上層總和: ${totalDiff[1]} </br> 下層總和: ${totalDiff[2]} </br> 總和差異: ${totalDiff[0]}`;
      recapImages();
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

  finalResult = Math.random() < 0.5 ? "same" : "diff";
  modeDisplay.innerHTML = `高熵-數數兒`;

  generateSymbols();

  renderRow(topRow, [...Array(PLATFORMS_PER_FLOOR).keys()]);
  renderRow(bottomRow, [...Array(PLATFORMS_PER_FLOOR).keys()].map(i => i + PLATFORMS_PER_FLOOR));

  topRow.style.display = "flex";
  bottomRow.style.display = "none";
  updatePlaceholder();
  startTimer();
}

function renderRow(row, indices) {
  row.innerHTML = '';

  const leftDiv = document.createElement("div");
  leftDiv.className = "left-row";
  row.appendChild(leftDiv);

  const rightDiv = document.createElement("div");
  rightDiv.className = "right-row";
  row.appendChild(rightDiv);

  indices.forEach(idx => {
      const div = document.createElement("div");
      div.className = "platform";
      const sym = symbols[idx];
      const img = document.createElement("img");
      img.src = SYMBOL_IMG[sym];
      div.appendChild(img);

      if (row.id === "topRow") {
        if (idx < 2 ) {
          leftDiv.appendChild(div);
        } else {
          rightDiv.appendChild(div);
        }
      } else {
        if (idx < 6) {
          leftDiv.appendChild(div);
        } else {
          rightDiv.appendChild(div);
        }
      }
  });
}

function updatePlaceholder() {
  if (step === 0) {
    inputBox.placeholder = "輸入你看到的數字總和 (上層)";
  } else if (step === 1) {
    inputBox.placeholder = "輸入你看到的數字總和 (下層)";
  } else if (step === 2) {
    inputBox.placeholder = "輸入上層和下層的總和差異 (沒有差輸入 0)";
  }
}

function handleInput(value) {
  if (!value.trim()) return;

  switch(step) {
    case 0:
      chatlog.innerHTML += `<div><strong>上層數字總和:</strong> ${value}</div>`;
      topRow.style.display = "none";
      bottomRow.style.display = "flex";
      break;
    case 1:
      chatlog.innerHTML += `<div><strong>下層數字總和:</strong> ${value}</div>`;
      break;
    case 2:
      chatlog.innerHTML += `<div><strong>總和差異:</strong> ${value}</div>`;
      finalAnswer = value;
      judge();
      recapImages();
      retryBtn.style.display = "inline-block";
      processSelectElement(resultBox);
      clearInterval(timer); inputBox.disabled = true;
      break;
  }
  step++;
  inputBox.value = '';
  updatePlaceholder();
}

function getTotalDiff() {
  const topNumTotal = symbols.slice(0, 4).reduce((acc, cur) => acc + parseInt(SYMBOL_TO_NUM[cur]), 0);
  const botNumTotal = symbols.slice(-4).reduce((acc, cur) => acc + parseInt(SYMBOL_TO_NUM[cur]), 0);

  return [Math.abs(topNumTotal - botNumTotal), topNumTotal, botNumTotal];
}

function judge() {
  let totalDiff = getTotalDiff();
  resultBox.innerHTML = parseInt(finalAnswer) === totalDiff[0]
    ? `✅ 正確! </br> 上層總和: ${totalDiff[1]} </br> 下層總和: ${totalDiff[2]} </br> 總和差異: ${totalDiff[0]}`
    : `❌ 錯誤! </br> 上層總和: ${totalDiff[1]} </br> 下層總和: ${totalDiff[2]} </br> 總和差異: ${totalDiff[0]}`;
}

function recapImages() {
  recapBox.style.display = 'block';
  recapBox.innerHTML = "<h3>🔁 最終結果: 上層數字總和 / 下層數字總和</h3>";

  let totalDiff = getTotalDiff();
  const safeSpotIndices = symbols.map((s, i) => SYMBOL_TO_NUM[s] === totalDiff[0].toString() ? i : null).filter(i => i !== null);

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
      if (isSafe(idx)) {
        img.classList.add("correct-tile");
      } else if (totalDiff[0] === 0) {
        img.classList.add("correct-tile");
      }
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
