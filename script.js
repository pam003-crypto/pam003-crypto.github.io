const mainDisplay = document.querySelector("#mainDisplay");
const keypad = document.querySelector(".keypad");

const state = {
  first: "",
  second: "",
  active: "first",
  locked: false,
  resultVisible: false,
  result: null,
  showTarget: false,
};

function getBeijingParts() {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(new Date());

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function getTargetNumber(parts = getBeijingParts()) {
  return Number(`${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}`);
}

function getActiveValue() {
  return state.active === "first" ? state.first : state.second;
}

function setActiveValue(value) {
  if (state.active === "first") {
    state.first = value;
  } else {
    state.second = value;
  }
}

function moveToSecond() {
  state.active = "second";
}

function calculateThird(parts = getBeijingParts()) {
  const target = getTargetNumber(parts);
  const first = state.first === "" ? null : Number(state.first);
  const second = state.second === "" ? null : Number(state.second);

  if (first === null || second === null) {
    return null;
  }

  return target - first - second;
}

function updateClockAndTarget() {
  const parts = getBeijingParts();
  render(parts);
}

function render(parts = getBeijingParts()) {
  if (state.showTarget) {
    mainDisplay.textContent = String(getTargetNumber(parts));
    return;
  }

  if (state.resultVisible) {
    mainDisplay.textContent = String(state.result ?? calculateThird(parts) ?? 0);
    return;
  }

  mainDisplay.textContent = getActiveValue() || "0";
}

function appendDigit(digit) {
  if (state.showTarget) {
    state.first = "";
    state.second = "";
    state.active = "first";
  }

  state.showTarget = false;
  state.resultVisible = false;
  state.result = null;
  const current = getActiveValue();

  if (current.length >= 12) {
    return;
  }

  if ((current === "0" || current === "-0") && digit === "0") {
    return;
  }

  if (current === "0") {
    setActiveValue(digit);
  } else if (current === "-0") {
    setActiveValue(`-${digit}`);
  } else {
    setActiveValue(current + digit);
  }

  render();
}

function appendDot() {
  state.showTarget = false;
  state.resultVisible = false;
  state.result = null;
  const current = getActiveValue();

  if (current.includes(".")) {
    return;
  }

  setActiveValue(current === "" ? "0." : `${current}.`);
  render();
}

function toggleSign() {
  state.showTarget = false;
  state.resultVisible = false;
  state.result = null;
  const current = getActiveValue();

  if (current === "") {
    setActiveValue("-0");
  } else if (current.startsWith("-")) {
    setActiveValue(current.slice(1));
  } else {
    setActiveValue(`-${current}`);
  }

  render();
}

function percent() {
  state.showTarget = false;
  state.resultVisible = false;
  state.result = null;
  const current = getActiveValue();

  if (current === "") {
    return;
  }

  setActiveValue(String(Number(current) / 100));
  render();
}

function backspace() {
  state.showTarget = false;
  state.resultVisible = false;
  state.result = null;
  const current = getActiveValue();
  setActiveValue(current.slice(0, -1));
  render();
}

function clearAll() {
  state.first = "";
  state.second = "";
  state.active = "first";
  state.locked = false;
  state.resultVisible = false;
  state.result = null;
  state.showTarget = false;
  render();
}

function handlePlus() {
  if (state.first === "") {
    return;
  }

  if (state.second === "") {
    moveToSecond();
    render();
    return;
  }

  state.result = calculateThird();
  state.resultVisible = true;
  state.locked = true;
  state.showTarget = false;
  render();
}

function unlock() {
  if (!state.locked) {
    return;
  }

  state.locked = false;
  state.resultVisible = false;
  state.result = null;
  state.showTarget = true;
  state.active = "first";
  render();
}

function handleAction(action) {
  if (state.locked) {
    if (action === "unlock") {
      unlock();
    }

    return;
  }

  switch (action) {
    case "clear":
      clearAll();
      break;
    case "backspace":
      backspace();
      break;
    case "dot":
      appendDot();
      break;
    case "sign":
      toggleSign();
      break;
    case "percent":
      percent();
      break;
    case "next":
      moveToSecond();
      render();
      break;
    case "plus":
      handlePlus();
      break;
    case "finish":
      break;
    case "divide":
      break;
    case "unlock":
      break;
  }
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.dataset.digit) {
    if (state.locked) {
      return;
    }

    appendDigit(button.dataset.digit);
    return;
  }

  handleAction(button.dataset.action);
});

updateClockAndTarget();
setInterval(updateClockAndTarget, 1000);
