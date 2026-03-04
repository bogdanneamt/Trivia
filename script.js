const setupContainer = document.getElementById('setup-container');
const quizContainer = document.getElementById('quiz');
const resultContainer = document.getElementById('result-container');
const categorySelect = document.getElementById('category-select');
const bestScoreVal = document.getElementById('best-score-val');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const backBtn = document.getElementById('back-btn');
const restartBtn = document.getElementById('restart-btn');
const questionEl = document.getElementById('question');
const answerButtonsEl = document.getElementById('answer-buttons');
const scoreTextEl = document.getElementById('score-text');
const newRecordMsg = document.getElementById('new-record-msg');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// --- High Score Logic ---
function updateHighScoreDisplay() {
    const category = categorySelect.value;
    const highScore = localStorage.getItem(`highScore_${category}`) || 0;
    bestScoreVal.innerText = highScore;
}

function checkAndSaveHighScore() {
    const category = categorySelect.value;
    const prevHigh = parseInt(localStorage.getItem(`highScore_${category}`)) || 0;
    
    if (score > prevHigh) {
        localStorage.setItem(`highScore_${category}`, score);
        newRecordMsg.classList.remove('hide');
    } else {
        newRecordMsg.classList.add('hide');
    }
}

// Initial display load
categorySelect.addEventListener('change', updateHighScoreDisplay);
updateHighScoreDisplay();

// --- Event Listeners ---
startBtn.addEventListener('click', initGame);

backBtn.addEventListener('click', () => {
    quizContainer.classList.add('hide');
    setupContainer.classList.remove('hide');
    updateHighScoreDisplay();
});

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
});

restartBtn.addEventListener('click', () => {
    resultContainer.classList.add('hide');
    setupContainer.classList.remove('hide');
    updateHighScoreDisplay();
});

// --- Game Functions ---
async function initGame() {
    const category = categorySelect.value;
    const url = `https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`;
    
    startBtn.innerText = "Fetching...";
    startBtn.disabled = true;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        questions = data.results.map(item => {
            const formatted = {
                question: decodeHTML(item.question),
                answers: item.incorrect_answers.map(a => ({ text: decodeHTML(a), correct: false }))
            };
            const correctAns = { text: decodeHTML(item.correct_answer), correct: true };
            formatted.answers.splice(Math.floor(Math.random() * 4), 0, correctAns);
            return formatted;
        });

        setupContainer.classList.add('hide');
        quizContainer.classList.remove('hide');
        currentQuestionIndex = 0;
        score = 0;
        showQuestion();

    } catch (err) {
        alert("API Error. Please try again later!");
    } finally {
        startBtn.innerText = "Start Game";
        startBtn.disabled = false;
    }
}

function showQuestion() {
    resetState();
    const q = questions[currentQuestionIndex];
    questionEl.innerText = `${currentQuestionIndex + 1}. ${q.question}`;

    q.answers.forEach(ans => {
        const button = document.createElement('button');
        button.innerText = ans.text;
        if (ans.correct) button.dataset.correct = true;
        button.addEventListener('click', selectAnswer);
        answerButtonsEl.appendChild(button);
    });
}

function resetState() {
    nextBtn.classList.add('hide');
    while (answerButtonsEl.firstChild) {
        answerButtonsEl.removeChild(answerButtonsEl.firstChild);
    }
}

function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";

    if (isCorrect) {
        score++;
        selectedBtn.classList.add('correct');
    } else {
        selectedBtn.classList.add('wrong');
    }

    Array.from(answerButtonsEl.children).forEach(btn => {
        if (btn.dataset.correct === "true") btn.classList.add('correct');
        btn.disabled = true;
    });

    nextBtn.classList.remove('hide');
}

function showResults() {
    quizContainer.classList.add('hide');
    resultContainer.classList.remove('hide');
    scoreTextEl.innerText = `Final Score: ${score} / 10`;
    checkAndSaveHighScore();
}

function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
