const API_URL = "https://opentdb.com/api.php?amount=10&type=multiple";

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

const questionNumber = document.getElementById("question-number");
const timerElement = document.getElementById("timer");
const progress = document.getElementById("progress");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options");

const finalScore = document.getElementById("final-score");
const resultMessage = document.getElementById("result-message");

let questions = [];
let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;
let timeLeft = 10;
let timer = null;

// Screen change function
function showScreen(screen) {
  document.querySelectorAll(".screen").forEach(item => {
    item.classList.remove("active");
  });
  screen.classList.add("active");
}

// Start quiz
startBtn.addEventListener("click", startQuiz);
restartBtn.addEventListener("click", startQuiz);

async function startQuiz() {
  currentQuestion = 0;
  score = 0;

  showScreen(quizScreen);
  questionText.textContent = "Loading questions...";

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.response_code !== 0) {
      questionText.textContent = "Questions load nahi ho saki. Dobara try karein.";
      return;
    }

    questions = data.results;
    loadQuestion();
  } catch (error) {
    questionText.textContent = "Internet connection check karein.";
  }
}

// Load one question
function loadQuestion() {
  selectedAnswer = null;
  nextBtn.disabled = true;

  const question = questions[currentQuestion];

  questionNumber.textContent = `Question ${currentQuestion + 1} / ${questions.length}`;
  questionText.textContent = decodeText(question.question);

  progress.style.width = `${(currentQuestion / questions.length) * 100}%`;

  // Correct + wrong answers mix karo
  const answers = [...question.incorrect_answers, question.correct_answer];
  shuffleAnswers(answers);

  optionsContainer.innerHTML = "";

  answers.forEach(answer => {
    const label = document.createElement("label");
    label.className = "option";

    label.innerHTML = `
      <input type="radio" name="answer" value="${answer}">
      ${decodeText(answer)}
    `;

    label.addEventListener("click", () => selectAnswer(label, answer));
    optionsContainer.appendChild(label);
  });

  startTimer();
}

// Shuffle answers
function shuffleAnswers(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Decode HTML entities like &quot;
function decodeText(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

// Select answer using radio input
function selectAnswer(selectedLabel, answer) {
  if (selectedAnswer !== null) return;

  selectedAnswer = answer;

  document.querySelectorAll(".option").forEach(option => {
    option.classList.remove("selected");
  });

  selectedLabel.classList.add("selected");
  nextBtn.disabled = false;
}

// Timer: 10 seconds
function startTimer() {
  clearInterval(timer);
  timeLeft = 10;
  timerElement.textContent = `${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      checkAnswer(true);
    }
  }, 1000);
}

// Check answer and show correct/wrong
function checkAnswer(timeUp = false) {
  clearInterval(timer);

  const correctAnswer = questions[currentQuestion].correct_answer;

  document.querySelectorAll(".option").forEach(option => {
    const optionText = option.textContent.trim();

    if (optionText === decodeText(correctAnswer)) {
      option.classList.add("correct");
    }

    if (selectedAnswer === optionText && selectedAnswer !== correctAnswer) {
      option.classList.add("wrong");
    }
  });

  if (selectedAnswer === correctAnswer) {
    score++;
  }

  nextBtn.disabled = false;
  nextBtn.textContent = currentQuestion === questions.length - 1
    ? "Show Result"
    : "Next Question";

  if (timeUp) {
    timerElement.textContent = "Time Up!";
  }
}

// Next question
nextBtn.addEventListener("click", () => {
  if (selectedAnswer === null) return;

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    nextBtn.textContent = "Next Question";
    loadQuestion();
  } else {
    showResult();
  }
});

// Final score
function showResult() {
  showScreen(resultScreen);

  finalScore.textContent = `Your Score: ${score} / ${questions.length}`;

  if (score >= 8) {
    resultMessage.textContent = "Excellent! Bohat acha score hai.";
  } else if (score >= 5) {
    resultMessage.textContent = "Good job! Thori aur practice karo.";
  } else {
    resultMessage.textContent = "Keep learning! Dobara try karo.";
  }
}