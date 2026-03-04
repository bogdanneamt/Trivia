let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// Elements
const setupContainer = document.getElementById('setup-container');
const categorySelect = document.getElementById('category-select');
const startBtn = document.getElementById('start-btn');
const quizDiv = document.getElementById('quiz');
const questionEl = document.getElementById('question');
const answerButtonsEl = document.getElementById('answer-buttons');
const nextBtn = document.getElementById('next-btn');
const resultContainer = document.getElementById('result-container');
const scoreText = document.getElementById('score-text');
const restartBtn = document.getElementById('restart-btn');

// Start Logic
startBtn.addEventListener('click', fetchQuestions);

async function fetchQuestions() {
    const categoryId = categorySelect.value;
    const url = `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`;

    // Show Quiz, Hide Setup
    setupContainer.classList.add('hide');
    quizDiv.classList.remove('hide');
    questionEl.innerText = "Loading Questions...";
    resetState();

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        questions = data.results.map(q => {
            const formatted = {
                question: decodeHTML(q.question),
                answers: [...q.incorrect_answers.map(a => decodeHTML(a))],
                correct: 0 
            };
            const randomIndex = Math.floor(Math.random() * 4);
            formatted.answers.splice(randomIndex, 0, decodeHTML(q.correct_answer));
            formatted.correct = randomIndex;
            return formatted;
        });

        currentQuestionIndex = 0;
        score = 0;
        showQuestion();
    } catch (e) {
        questionEl.innerText = "Error loading quiz. Please try again.";
    }
}

function showQuestion() {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    questionEl.innerText = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;

    currentQuestion.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.onclick = () => selectAnswer(index);
        answerButtonsEl.appendChild(button);
    });
}

function resetState() {
    nextBtn.classList.add('hide');
    while (answerButtonsEl.firstChild) {
        answerButtonsEl.removeChild(answerButtonsEl.firstChild);
    }
}

function selectAnswer(index) {
    const correct = questions[currentQuestionIndex].correct;
    const buttons = answerButtonsEl.children;

    if (index === correct) {
        score++;
        buttons[index].classList.add('correct');
    } else {
        buttons[index].classList.add('wrong');
        buttons[correct].classList.add('correct');
    }
    
    Array.from(buttons).forEach(btn => btn.disabled = true);
    nextBtn.classList.remove('hide');
}

nextBtn.onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
};

function showResults() {
    quizDiv.classList.add('hide');
    resultContainer.classList.remove('hide');
    scoreText.innerText = `You scored ${score} out of ${questions.length}!`;
}

restartBtn.onclick = () => {
    resultContainer.classList.add('hide');
    setupContainer.classList.remove('hide');
};

function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
