// State
let authToken = localStorage.getItem('token');
let sessionId = null;
let currentTargetIndex = null;
let questionsLeft = 3;

// DOM Elements
const authSection = document.getElementById('auth-section');
const gameSection = document.getElementById('game-section');
const authForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const authMessage = document.getElementById('auth-message');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const displayUsername = document.getElementById('display-username');

const qLeftSpan = document.getElementById('q-left');
const chatHistory = document.getElementById('chat-history');
const questionInput = document.getElementById('question-input');
const btnSubmitQ = document.getElementById('btn-submit-q');
const targetIndicator = document.getElementById('target-indicator');
const godCards = document.querySelectorAll('.god-card');

// Modal
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

// Init
let isRegisterMode = false;

if (authToken) {
    showGame();
}

// Auth Tabs
tabLogin.onclick = () => setAuthMode(false);
tabRegister.onclick = () => setAuthMode(true);

function setAuthMode(register) {
    isRegisterMode = register;
    if (register) {
        tabRegister.classList.add('text-indigo-400', 'border-b-2', 'border-indigo-400', 'font-medium');
        tabRegister.classList.remove('text-gray-400');
        tabLogin.classList.remove('text-indigo-400', 'border-b-2', 'border-indigo-400', 'font-medium');
        tabLogin.classList.add('text-gray-400');
        authForm.querySelector('button').innerText = "Register & Start";
    } else {
        tabLogin.classList.add('text-indigo-400', 'border-b-2', 'border-indigo-400', 'font-medium');
        tabLogin.classList.remove('text-gray-400');
        tabRegister.classList.remove('text-indigo-400', 'border-b-2', 'border-indigo-400', 'font-medium');
        tabRegister.classList.add('text-gray-400');
        authForm.querySelector('button').innerText = "Login & Start";
    }
    authMessage.classList.add('hidden');
}

// Auth Logic
authForm.onsubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegisterMode ? '/register' : '/token';
    const body = isRegisterMode
        ? JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
        : new URLSearchParams({ username: usernameInput.value, password: passwordInput.value }); // OAuth2 expects form data

    const headers = isRegisterMode
        ? { 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/x-www-form-urlencoded' };

    try {
        const res = await fetch(endpoint, { method: 'POST', headers, body });
        const data = await res.json();

        if (!res.ok) throw new Error(data.detail || 'Auth failed');

        authToken = data.access_token;
        localStorage.setItem('token', authToken);
        showGame();
    } catch (err) {
        authMessage.innerText = err.message;
        authMessage.classList.remove('hidden');
    }
};

document.getElementById('btn-logout').onclick = () => {
    localStorage.removeItem('token');
    location.reload();
};

// Game Logic
async function showGame() {
    authSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
    displayUsername.innerText = usernameInput.value || "User"; // Simple fallback

    await startNewGame();
}

async function startNewGame() {
    try {
        const res = await fetch('/game/start', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.status === 401) {
            localStorage.removeItem('token');
            location.reload();
            return;
        }
        const data = await res.json();
        sessionId = data.session_id;

        // Reset UI
        questionsLeft = 3;
        qLeftSpan.innerText = 3;
        chatHistory.innerHTML = '<p class="text-gray-500 italic text-center">No questions asked yet.</p>';
        document.querySelectorAll('.god-guess').forEach(s => s.value = 'Unsure');
        currentTargetIndex = null;
        updateTargetUI();

    } catch (err) {
        console.error(err);
    }
}

// Selection Logic
window.prepareQuestion = (index) => {
    currentTargetIndex = index;
    // Visual feedback
    godCards.forEach(c => c.classList.remove('border-indigo-500', 'shadow-lg', 'bg-gray-700'));
    const target = document.querySelector(`.god-card[data-index="${index}"]`);
    target.classList.add('border-indigo-500', 'shadow-lg', 'bg-gray-700');

    updateTargetUI();
};

function updateTargetUI() {
    const span = targetIndicator.querySelector('span');
    if (currentTargetIndex === null) {
        span.innerText = "None";
        questionInput.disabled = true;
        btnSubmitQ.disabled = true;
        btnSubmitQ.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        const gods = ['A', 'B', 'C'];
        span.innerText = `God ${gods[currentTargetIndex]}`;
        questionInput.disabled = false;
        btnSubmitQ.disabled = false;
        btnSubmitQ.classList.remove('opacity-50', 'cursor-not-allowed');
        questionInput.focus();
    }
}

// Asking Questions
btnSubmitQ.onclick = async () => {
    if (currentTargetIndex === null || !questionInput.value.trim()) return;
    if (questionsLeft <= 0) {
        alert("No questions left! Please submit your judgment.");
        return;
    }

    const qText = questionInput.value.trim();
    const godLetter = ['A', 'B', 'C'][currentTargetIndex];

    // Optimistic UI update
    if (chatHistory.querySelector('.text-center')) chatHistory.innerHTML = ''; // Remove empty msg

    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble-user';
    userBubble.innerHTML = `<strong>To God ${godLetter}:</strong> ${qText}`;
    chatHistory.appendChild(userBubble);
    questionInput.value = '';

    // Scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
        const res = await fetch('/game/ask', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: sessionId,
                god_index: currentTargetIndex,
                question: qText
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail);

        const godBubble = document.createElement('div');
        godBubble.className = 'chat-bubble-god';
        godBubble.innerHTML = `<strong>God ${godLetter}:</strong> ${data.answer}`;
        chatHistory.appendChild(godBubble);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        questionsLeft = data.questions_left;
        qLeftSpan.innerText = questionsLeft;

    } catch (err) {
        alert(err.message);
    }
};

// Final Submission
document.getElementById('btn-finalize').onclick = async () => {
    const guesses = [];
    document.querySelectorAll('.god-guess').forEach(s => guesses.push(s.value));

    if (guesses.includes('Unsure')) {
        if (!confirm("You haven't assigned identities to all Gods. Submit anyway?")) return;
    }

    try {
        const res = await fetch('/game/submit', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: sessionId,
                guesses: guesses
            })
        });

        const data = await res.json();
        showResultModal(data);
    } catch (err) {
        console.error(err);
    }
};

function showResultModal(data) {
    modalOverlay.classList.remove('hidden');
    modalTitle.innerText = data.win ? "🎉 VICTORY! 🎉" : "💀 DEFEAT 💀";

    let html = `
        <div class="text-lg mb-4 text-center">${data.win ? "You have correctly solved the riddle!" : "Your logic was flawed."}</div>
        <div class="bg-gray-900 p-4 rounded text-sm font-mono">
            <div class="mb-2 text-indigo-300 border-b border-gray-700 pb-2">The Truth Revealed:</div>
            <div class="flex justify-between mb-1"><span>God A:</span> <span class="text-white">${data.identities[0]}</span></div>
            <div class="flex justify-between mb-1"><span>God B:</span> <span class="text-white">${data.identities[1]}</span></div>
            <div class="flex justify-between mb-1"><span>God C:</span> <span class="text-white">${data.identities[2]}</span></div>
            <div class="mt-4 pt-2 border-t border-gray-700 text-yellow-500">
                Language: Yes = "${data.language_map['Yes']}", No = "${data.language_map['No']}"
            </div>
        </div>
    `;
    modalContent.innerHTML = html;
}

modalClose.onclick = () => {
    modalOverlay.classList.add('hidden');
    startNewGame(); // Auto restart
};

// History (Simple Alert for now, could be a modal)
document.getElementById('btn-history').onclick = async () => {
    const res = await fetch('/history', { headers: { 'Authorization': `Bearer ${authToken}` } });
    const data = await res.json();
    let text = "Recent Games:\n";
    data.slice(0, 5).forEach(g => {
        text += `${g.date.split('T')[0]}: ${g.win ? 'WIN' : 'LOSS'}\n`;
    });
    alert(text);
};
