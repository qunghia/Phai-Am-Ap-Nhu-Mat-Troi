const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyn07o08Ihp6jj9HPd_Kh4hzppBabVEbh3A13RV7GvnPvjQ8pdtnTi1UOtSutCEbOP8/exec";

// Muốn đổi câu hiện sau khi gửi thì chỉ sửa dòng này.
const SUCCESS_MESSAGE =
  "sentttt. have a nice day nhe embekim (✿◕‿◕✿)";


// =====================================================
// QUESTIONS
// =====================================================

const questions = [

  // TOP ROW

  {
    id: "q01",
    text: "how are you todayy?",
    x: 12,
    y: 11,
    rotate: -3
  },

  {
    id: "q02",
    text: "did you sleep well last night?",
    x: 34,
    y: 9,
    rotate: 2
  },

  {
    id: "q03",
    text: "how's the weather at your place rn?",
    x: 66,
    y: 9,
    rotate: 3
  },

  {
    id: "q04",
    text: "what made you smile today?",
    x: 88,
    y: 11,
    rotate: -2
  },


  // FAR LEFT

  {
    id: "q05",
    text: "have you eaten anything good today?",
    x: 8,
    y: 31,
    rotate: 2
  },

  {
    id: "q06",
    text: "what do you need more of lately?",
    x: 8,
    y: 52,
    rotate: -2
  },

  {
    id: "q07",
    text: "when do you feel most loved?",
    x: 8,
    y: 73,
    rotate: 2
  },


  // INNER LEFT

  {
    id: "q08",
    text: "what makes you feel safe with someone?",
    x: 25,
    y: 29,
    rotate: -2
  },

  {
    id: "q09",
    text: "what do you think is the most important thing in a relationship?",
    x: 25,
    y: 52,
    rotate: 2
  },

  {
    id: "q10",
    text: "what's something you wish people understood about you?",
    x: 25,
    y: 75,
    rotate: -2
  },


  // INNER RIGHT

  {
    id: "q11",
    text: "what's been on your mind lately?",
    x: 75,
    y: 29,
    rotate: 2
  },

  {
    id: "q12",
    text: "what are you proud of yourself for recently?",
    x: 75,
    y: 52,
    rotate: -2
  },

  {
    id: "q13",
    text: "when you’re upset, do you want space or company?",
    x: 75,
    y: 75,
    rotate: 2
  },


  // FAR RIGHT

  {
    id: "q14",
    text: "what do you want us to experience together someday?",
    x: 92,
    y: 31,
    rotate: -2
  },

  {
    id: "q15",
    text: "would you still talk to me if I was a worm?",
    x: 92,
    y: 52,
    rotate: 2
  },

  {
    id: "q16",
    text: "what's one thing you want me to know today?",
    x: 92,
    y: 73,
    rotate: -2
  },


  // BOTTOM CENTRE

  {
    id: "q17",
    text: "if I turned into a chair, would you sit on me?",
    x: 50,
    y: 91,
    rotate: 1
  }

];


// =====================================================
// CARD COLORS
// =====================================================

const cardColors = [
  "#ffd9e2", // pink
  "#ffedc7", // warm yellow
  "#e3d8ff", // lavender
  "#d8eedf", // mint
  "#ffd8c2"  // peach
];

// =====================================================
// HTML ELEMENTS
// =====================================================

const questionCloud =
  document.getElementById("questionCloud");

const modalBackdrop =
  document.getElementById("modalBackdrop");

const modalQuestion =
  document.getElementById("modalQuestion");

const closeModalButton =
  document.getElementById("closeModal");

const answerForm =
  document.getElementById("answerForm");

const answerInput =
  document.getElementById("answerInput");

const characterCount =
  document.getElementById("characterCount");

const toast =
  document.getElementById("toast");


let activeQuestion = null;


// =====================================================
// SESSION ID
// =====================================================

function getSessionId() {

  let sessionId =
    sessionStorage.getItem("helloDauYeuSession");

  if (!sessionId) {

    sessionId =
      `session-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;

    sessionStorage.setItem(
      "helloDauYeuSession",
      sessionId
    );

  }

  return sessionId;

}


// =====================================================
// ANSWERED QUESTIONS
// =====================================================

function getAnsweredQuestions() {

  try {

    return JSON.parse(
      sessionStorage.getItem("answeredQuestions") || "[]"
    );

  } catch {

    return [];

  }

}


function markAnswered(questionId) {

  const answered =
    new Set(getAnsweredQuestions());

  answered.add(questionId);

  sessionStorage.setItem(
    "answeredQuestions",
    JSON.stringify([...answered])
  );

  const card =
    document.querySelector(
      `[data-question-id="${questionId}"]`
    );

  if (card) {

    card.classList.add("answered");

  }

}


// =====================================================
// RENDER QUESTIONS
// =====================================================

function renderQuestions() {

  const answered =
    new Set(getAnsweredQuestions());

  questions.forEach(
    (question, index) => {

      const button =
        document.createElement("button");

      button.type = "button";

      button.className =
        "question-card";

      button.dataset.questionId =
        question.id;

      button.textContent =
        question.text;


      if (answered.has(question.id)) {

        button.classList.add(
          "answered"
        );

      }


      button.style.setProperty(
        "--x",
        `${question.x}%`
      );

      button.style.setProperty(
        "--y",
        `${question.y}%`
      );

      button.style.setProperty(
        "--rotate",
        `${question.rotate}deg`
      );

      button.style.setProperty(
        "--card-bg",
        cardColors[
          index % cardColors.length
        ]
      );

      button.style.setProperty(
        "--duration",
        `${3.6 + (index % 5) * 0.45}s`
      );

      button.style.setProperty(
        "--delay",
        `${(index % 4) * -0.65}s`
      );


      button.addEventListener(
        "click",
        () => openQuestion(question)
      );


      questionCloud.appendChild(
        button
      );

    }
  );

}


// =====================================================
// OPEN QUESTION
// =====================================================

function openQuestion(question) {

  activeQuestion = question;

  modalQuestion.textContent =
    question.text;

  answerInput.value = "";

  updateCharacterCount();

  modalBackdrop.hidden = false;

  document.body.style.overflow =
    "hidden";


  requestAnimationFrame(() => {

    answerInput.focus();

  });

}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeModal() {

  modalBackdrop.hidden = true;

  document.body.style.overflow = "";

  activeQuestion = null;

  answerInput.value = "";

  updateCharacterCount();

}


// =====================================================
// CHARACTER COUNT
// =====================================================

function updateCharacterCount() {

  characterCount.textContent =
    `${answerInput.value.length} / 2000`;

}


// =====================================================
// TOAST
// =====================================================

function showToast(message) {

  toast.textContent = message;

  toast.classList.add("show");


  window.clearTimeout(
    showToast.timer
  );


  showToast.timer =
    window.setTimeout(() => {

      toast.classList.remove("show");

    }, 3000);

}


// =====================================================
// EVENTS
// =====================================================

answerInput.addEventListener(
  "input",
  updateCharacterCount
);


closeModalButton.addEventListener(
  "click",
  closeModal
);


modalBackdrop.addEventListener(
  "click",
  (event) => {

    if (
      event.target === modalBackdrop
    ) {

      closeModal();

    }

  }
);


document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape" &&
      !modalBackdrop.hidden
    ) {

      closeModal();

    }

  }
);


// =====================================================
// SUBMIT ANSWER
// =====================================================

answerForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();


    if (!activeQuestion) {
      return;
    }


    const answer =
      answerInput.value.trim();


    if (!answer) {
      return;
    }


    if (!APPS_SCRIPT_URL) {

      showToast(
        "Apps Script URL is missing :("
      );

      return;

    }


    const questionId =
      activeQuestion.id;

    const questionText =
      activeQuestion.text;


    const payload =
      new URLSearchParams({

        sessionId:
          getSessionId(),

        questionId:
          questionId,

        question:
          questionText,

        answer:
          answer,

        page:
          window.location.href,

        userAgent:
          navigator.userAgent

      });


    // Send to Google Apps Script.
    // We do not wait for Google before closing the modal,
    // so the website feels instant.

    fetch(
      APPS_SCRIPT_URL,
      {

        method: "POST",

        mode: "no-cors",

        keepalive: true,

        headers: {

          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8"

        },

        body:
          payload.toString()

      }
    )
    .catch(
      (error) => {

        console.error(
          "Send error:",
          error
        );

      }
    );


    // Update UI immediately.

    markAnswered(
      questionId
    );

    closeModal();


    showToast(
      SUCCESS_MESSAGE
    );

  }
);


// =====================================================
// START
// =====================================================

renderQuestions();
