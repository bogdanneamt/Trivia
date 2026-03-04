// --- Elements ---
const setupContainer = document.getElementById('setup-container');
const quizContainer = document.getElementById('quiz');
const resultContainer = document.getElementById('result-container');
const categorySelect = document.getElementById('category-select');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const questionEl = document.getElementById('question');
const answerButtonsEl = document.getElementById('answer-buttons');
const scoreTextEl = document.getElementById('score-text');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// --- Event Listeners ---
startBtn.addEventListener('click', initGame);

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
});

// --- Core Functions ---

async function initGame() {
    const category = categorySelect.value;
    const url = `https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`;
    
    // UI Loading State
    startBtn.innerText = "Loading...";
    startBtn.disabled = true;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results.length === 0) throw new Error("No data");

        // Format data
        questions = data.results.map(item => {
            const formatted = {
                question: decodeHTML(item.question),
                answers: item.incorrect_answers.map(a => ({ text: decodeHTML(a), correct: false }))
            };
            const correctAns = { text: decodeHTML(item.correct_answer), correct: true };
            
            // Randomly insert the correct answer
            const randPos = Math.floor(Math.random() * 4);
            formatted.answers.splice(randPos, 0, correctAns);
            return formatted;
        });

        // Switch Screens
        setupContainer.classList.add('hide');
        quizContainer.classList.remove('hide');
        
        currentQuestionIndex = 0;
        score = 0;
        startBtn.innerText = "Start Game";
        startBtn.disabled = false;
        showQuestion();

    } catch (err) {
        alert("Failed to fetch questions. Check your connection!");
        startBtn.innerText = "Start Game";
        startBtn.disabled = false;
    }
}

function showQuestion() {
    resetQuestionState();
    const currentQ = questions[currentQuestionIndex];
    questionEl.innerText = `${currentQuestionIndex + 1}. ${currentQ.question}`;

    currentQ.answers.forEach(ans => {
        const button = document.createElement('button');
        button.innerText = ans.text;
        if (ans.correct) button.dataset.correct = true;
        button.addEventListener('click', handleAnswerSelection);
        answerButtonsEl.appendChild(button);
    });
}

function resetQuestionState() {
    nextBtn.classList.add('hide');
    while (answerButtonsEl.firstChild) {
        answerButtonsEl.removeChild(answerButtonsEl.firstChild);
    }
}

function handleAnswerSelection(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";

    if (isCorrect) {
        score++;
        selectedBtn.classList.add('correct');
    } else {
        selectedBtn.classList.add('wrong');
    }

    // Highlight the right answer even if user was wrong
    Array.from(answerButtonsEl.children).forEach(btn => {
        if (btn.dataset.correct === "true") btn.classList.add('correct');
        btn.disabled = true;
    });

    nextBtn.classList.remove('hide');
}

function showResults() {
    quizContainer.classList.add('hide');
    resultContainer.classList.remove('hide');
    scoreTextEl.innerText = `You got ${score} out of ${questions.length} correct!`;
}

// Utility to handle weird HTML characters like &quot;
function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
