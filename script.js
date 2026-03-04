let questions = [];
let currentQuestionIndex = 0;
let score = 0;

const questionEl = document.getElementById('question');
const answerButtonsEl = document.getElementById('answer-buttons');
const nextBtn = document.getElementById('next-btn');
const resultContainer = document.getElementById('result-container');
const scoreText = document.getElementById('score-text');

// 1. Fetch questions from the API
async function fetchQuestions() {
    questionEl.innerText = "Loading questions...";
    try {
        // We fetch 10 multiple-choice questions from any category
        const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
        const data = await response.json();
        
        // Transform the API data into our quiz format
        questions = data.results.map(q => {
            const formattedQuestion = {
                question: decodeHTML(q.question),
                answers: [...q.incorrect_answers.map(a => decodeHTML(a))],
                correct: 0 // Will set this in a second
            };
            
            // Randomly insert the correct answer into the array
            const randomIndex = Math.floor(Math.random() * 4);
            formattedQuestion.answers.splice(randomIndex, 0, decodeHTML(q.correct_answer));
            formattedQuestion.correct = randomIndex;
            
            return formattedQuestion;
        });

        startQuiz();
    } catch (error) {
        questionEl.innerText = "Failed to load questions. Please refresh!";
    }
}

// 2. Helper to fix weird symbols like &quot; or &#039;
function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    resultContainer.classList.add('hide');
    document.getElementById('quiz').classList.remove('hide');
    showQuestion();
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
    if (index === correct) {
        score++;
        answerButtonsEl.children[index].classList.add('correct');
    } else {
        answerButtonsEl.children[index].classList.add('wrong');
        answerButtonsEl.children[correct].classList.add('correct');
    }
    
    Array.from(answerButtonsEl.children).forEach(button => button.disabled = true);
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
    document.getElementById('quiz').classList.add('hide');
    resultContainer.classList.remove('hide');
    scoreText.innerText = `Final Score: ${score} / ${questions.length}`;
}

document.getElementById('restart-btn').onclick = fetchQuestions;

// Initialize by fetching from API
fetchQuestions();