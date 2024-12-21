let questions = [];
let answeredQuestions = [];
let answeredCorrectlyQuestions = []; // Track correctly answered questions
let correctAnswers = 0;
let totalAnswered = 0;

async function loadQuestions() {
    const response = await fetch('list_of_questions.txt');
    const data = await response.text();
    questions = data.split('\n').map(line => line.split('\t'));
}

// Shuffle function to randomize questions and answers
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Display question and answers
function displayQuestion() {
    // Check if all questions are answered correctly
    if (answeredCorrectlyQuestions.length === questions.length) {
        document.getElementById('quiz').innerHTML = `
            <h2>Congratulations!</h2>
            <p>You answered all the questions correctly!</p>
        `;
        return;
    }

    const quizDiv = document.getElementById('quiz');
    const questionDiv = quizDiv.querySelector('.question');
    const answersDiv = quizDiv.querySelector('.answers');
    const feedbackDiv = quizDiv.querySelector('.feedback');
    const nextButton = document.getElementById('next-question');
    const counterDiv = quizDiv.querySelector('#counter');

    // Get random question from questions that were not answered correctly
    const availableQuestions = questions.filter(q => !answeredCorrectlyQuestions.includes(q));
    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    const questionData = availableQuestions[questionIndex];
    answeredQuestions.push(questionData);

    const [question, correctAnswer, ...wrongAnswersAndExplanation] = questionData;
    const wrongAnswers = wrongAnswersAndExplanation.slice(0, 3);
    const explanation = wrongAnswersAndExplanation[3];

    // Shuffle answers
    const allAnswers = shuffle([correctAnswer, ...wrongAnswers]);

    // Display question
    questionDiv.textContent = question;

    // Calculate success rate
    const successRate = totalAnswered > 0 ? ((correctAnswers / totalAnswered) * 100).toFixed(0) : 0;

    // Display counter with success rate
    counterDiv.textContent = `Correct: ${correctAnswers} | Total: ${totalAnswered} | Success Rate: ${successRate}%`;

    // Display answers
    answersDiv.innerHTML = '';
    feedbackDiv.textContent = '';
    allAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.onclick = () => {
            if (answersDiv.dataset.answered === "true") return;

            totalAnswered++;
            answersDiv.dataset.answered = "true";

            if (answer === correctAnswer) {
                correctAnswers++;
                answeredCorrectlyQuestions.push(questionData); // Mark this question as answered correctly
                feedbackDiv.innerHTML = `<span style="color: green;">Correct!</span><br>${explanation}`;
            } else {
                feedbackDiv.innerHTML = `<span style="color: red;">Wrong!<br>The correct answer is: ${correctAnswer}. </span><br>${explanation}`;
            }

            // Update success rate and counter
            const updatedSuccessRate = (correctAnswers / totalAnswered) * 100;
            counterDiv.textContent = `Correct: ${correctAnswers} / Total: ${totalAnswered} | Success Rate: ${updatedSuccessRate.toFixed(0)}%`;

            nextButton.style.display = 'inline-block';

            // Disable all answer buttons
            Array.from(answersDiv.children).forEach(btn => (btn.disabled = true));
        };
        answersDiv.appendChild(button);
    });

    // Reset Next button visibility and disable tracking
    nextButton.style.display = 'none';
    answersDiv.dataset.answered = "false";
}

function loadNextQuestion() {
    displayQuestion();
}

// Initialize Quiz
async function initQuiz() {
    await loadQuestions();
    displayQuestion();

    const nextButton = document.getElementById('next-question');
    nextButton.onclick = loadNextQuestion;
}

initQuiz();
