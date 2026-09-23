// 1) Deploy your Google Apps Script as a Web App.
// 2) Paste the /exec URL below.
const APPS_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

const questions = [
  { id: "q01", text: "how are you todayy?", x: 15, y: 12, rotate: -4 },
  { id: "q02", text: "how are you feeling, really?", x: 49, y: 9, rotate: 2 },
  { id: "q03", text: "how's the weather at your place rn?", x: 83, y: 14, rotate: 4 },
  { id: "q04", text: "what made you smile today?", x: 9, y: 35, rotate: 3 },
  { id: "q05", text: "did anything make your heart feel heavy today?", x: 90, y: 36, rotate: -3 },
  { id: "q06", text: "what do you need more of lately?", x: 8, y: 64, rotate: -2 },
  { id: "q07", text: "when do you feel most loved?", x: 92, y: 63, rotate: 3 },
  { id: "q08", text: "what makes you feel safe with someone?", x: 16, y: 87, rotate: 3 },
  { id: "q09", text: "what do you think is the most important thing in a relationship?", x: 49, y: 91, rotate: -2 },
  { id: "q10", text: "what's something you wish people understood about you?", x: 84, y: 87, rotate: -4 },
  { id: "q11", text: "what's been on your mind lately?", x: 26, y: 25, rotate: 2 },
  { id: "q12", text: "what are you proud of yourself for recently?", x: 74, y: 26, rotate: -2 },
  { id: "q13", text: "what does a peaceful life look like to you?", x: 24, y: 74, rotate: -3 },
  { id: "q14", text: "what do you want us to experience together someday?", x: 76, y: 75, rotate: 2 },
  { id: "q15", text: "is there anything you've been scared to say out loud?", x: 22, y: 50, rotate: 4 },
  { id: "q16", text: "what's one thing you want me to know today?", x: 78, y: 50, rotate: -4 }
];

const cardColors = [
  "rgba(253, 232, 236, 0.90)",
  "rgba(255, 243, 223, 0.92)",
  "rgba(232, 221, 251, 0.90)",
  "rgba(221, 239, 228, 0.92)",
  "rgba(255, 216, 198, 0.88)"
];

const questionCloud = document.getElementById("questionCloud");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalQuestion = document.getElementById("modalQuestion");
const closeModalButton = document.getElementById("closeModal");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answerInput");
const characterCount = document.getElementById("characterCount");
const toast = document.getElementById("toast");

let activeQuestion = null;

function getSessionId() {
  let sessionId = sessionStorage.getItem("helloDauYeuSession");

  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem("helloDauYeuSession", sessionId);
  }

  return sessionId;
}

function getAnsweredQuestions() {
  try {
    return JSON.parse(sessionStorage.getItem("answeredQuestions") || "[]");
  } catch {
    return [];
  }
}

function markAnswered(questionId) {
  const answered = new Set(getAnsweredQuestions());
  answered.add(questionId);
  sessionStorage.setItem("answeredQuestions", JSON.stringify([...answered]));

  const card = document.querySelector(`[data-question-id="${questionId}"]`);
  if (card) card.classList.add("answered");
}

function renderQuestions() {
  const answered = new Set(getAnsweredQuestions());

  questions.forEach((question, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "question-card";
    button.dataset.questionId = question.id;
    button.textContent = question.text;

    if (answered.has(question.id)) {
      button.classList.add("answered");
    }

    button.style.setProperty("--x", `${question.x}%`);
    button.style.setProperty("--y", `${question.y}%`);
    button.style.setProperty("--rotate", `${question.rotate}deg`);
    button.style.setProperty("--card-bg", cardColors[index % cardColors.length]);
    button.style.setProperty("--duration", `${3.6 + (index % 5) * 0.45}s`);
    button.style.setProperty("--delay", `${(index % 4) * -0.65}s`);

    button.addEventListener("click", () => openQuestion(question));

    questionCloud.appendChild(button);
  });
}

function openQuestion(question) {
  activeQuestion = question;
  modalQuestion.textContent = question.text;
  answerInput.value = "";
  updateCharacterCount();
  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => answerInput.focus());
}

function closeModal() {
  modalBackdrop.hidden = true;
  document.body.style.overflow = "";
  activeQuestion = null;
  answerInput.value = "";
}

function updateCharacterCount() {
  characterCount.textContent = `${answerInput.value.length} / 2000`;
}

function showToast(message = "your answer found its way to me ♡") {
  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

answerInput.addEventListener("input", updateCharacterCount);

closeModalButton.addEventListener("click", closeModal);

modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalBackdrop.hidden) {
    closeModal();
  }
});

answerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!activeQuestion) return;

  const answer = answerInput.value.trim();
  if (!answer) return;

  if (
    !APPS_SCRIPT_URL ||
    APPS_SCRIPT_URL.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT")
  ) {
    showToast("paste your Apps Script URL into script.js first ♡");
    return;
  }

  const sendButton = answerForm.querySelector(".send-button");
  const originalButtonText = sendButton.textContent;

  sendButton.disabled = true;
  sendButton.textContent = "sending...";

  const payload = new URLSearchParams({
    sessionId: getSessionId(),
    questionId: activeQuestion.id,
    question: activeQuestion.text,
    answer,
    page: window.location.href,
    userAgent: navigator.userAgent
  });

  try {
    // no-cors is deliberate here: it avoids browser CORS issues with
    // Google Apps Script while still allowing the POST request to arrive.
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: payload.toString()
    });

    markAnswered(activeQuestion.id);
    closeModal();
    showToast();
  } catch (error) {
    console.error(error);
    showToast("something went wrong — try again in a sec");
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = originalButtonText;
  }
});

renderQuestions();
