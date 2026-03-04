Here is the complete, consolidated script.js. I’ve organized it so that it handles the category selection, fetches data from the API, and manages the game flow from start to finish.

I also included a "Loading" state and a "Return to Menu" function so the user experience feels smooth.

JavaScript
// --- 1. State Variables ---
let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// --- 2. Element Selectors ---
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

// --- 3. API Logic ---

// This function pulls data based on the dropdown selection
async function fetchQuestions() {
    const categoryId = categorySelect.value;
    const url = `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`;
    
    // UI Transition: Show loading, hide setup
    setupContainer.classList.add('hide');
    quizDiv.classList.remove('hide');
    questionEl.innerText = "Loading questions from the vault...";
    resetState();

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results.length === 0) {
            questionEl.innerText = "Oops! No questions found for this topic. Try another.";
            return;
        }

        // Transform the API's messy format into a clean object we can use
        questions = data.results.map(q => {
            const formattedQuestion = {
                question: decodeHTML(q.question),
                answers: [...q.incorrect_answers.map(a => decodeHTML(a))],
                correct: 0 
            };
            
            // Randomly shuffle the correct answer into the list
            const randomIndex = Math.floor(Math.random() * 4);
            formattedQuestion.answers.splice(randomIndex, 0, decodeHTML(q.correct_answer));
            formattedQuestion.correct = randomIndex;
            
            return formattedQuestion;
        });

        startQuiz();
    } catch (error) {
        console.error(error);
        questionEl.innerText = "Connection error. Please check your internet and try again.";
    }
}

// Helper to fix symbols like &quot; and &#039; that come from the API
function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// --- 4. Quiz Logic ---

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    resultContainer.classList.add('hide');
    showQuestion();
}

function showQuestion() {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    
    // Update the question text
    questionEl.innerText = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;

    // Create a button for each answer
    currentQuestion.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.classList.add('btn');
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
        buttons[correct].classList.add('correct'); // Show user the right answer
    }
    
    // Lock buttons so they can't change their answer
    Array.from(buttons).forEach(button => button.disabled = true);
    nextBtn.classList.remove('hide');
}

function showResults() {
    quizDiv.classList.add('hide');
    resultContainer.classList.remove('hide');
    scoreText.innerText = `You got ${score} out of ${questions.length} correct!`;
}

// --- 5. Event Listeners ---

startBtn.addEventListener('click', fetchQuestions);

nextBtn.onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
};

restartBtn.onclick = () => {
    resultContainer.classList.add('hide');
    setupContainer.classList.remove('hide'); // Go back to topic selection
};
