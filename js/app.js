import {loadPantry, savePantry} from "./storage.js";
import {generateBotReply} from "./bot.js";

const state = {ingredients: loadPantry()};
const form = document.getElementById('ingredient-form');
const input = document.getElementById('ingredient-input');
const pantryList = document.getElementById('pantry-list');
const itemCountBadge = document.getElementById('item-count');
const findRecipesBtn = document.getElementById('find-recipes-btn');
const clearShelfBtn = document.getElementById('clear-shelf-btn');
const quickChips = document.querySelectorAll('.quick-chip');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

function formatIngredientName(name) {
    const trimmed = name.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}
function addIngredient(rawName) {
    const name = formatIngredientName(rawName);
    if (!name) return;
    const isDuplicate = state.ingredients.some(
        item => item.toLowerCase() === name.toLowerCase()
    );
    if (isDuplicate) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 400);
        return;
    }
    state.ingredients.push(name);
    savePantry(state.ingredients);
    renderPantry();
}
function removeIngredient(nameToRemove) {
    state.ingredients = state.ingredients.filter(
        item => item.toLowerCase() !== nameToRemove.toLowerCase()
    );
    savePantry(state.ingredients);
    renderPantry();
}
function clearPantry() {
    if (state.ingredients.length === 0) return;
    state.ingredients = [];
    savePantry(state.ingredients);
    renderPantry();
}
function renderPantry() {
    const count = state.ingredients.length;
    itemCountBadge.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
    findRecipesBtn.disabled = count === 0;
    if (count === 0) {
        pantryList.innerHTML = `<div class="empty-state">
<p>Your shelf is empty.<br>Add ingredients above to start!</p>
</div>
`;
        return;
    }
    pantryList.innerHTML = state.ingredients
        .map(ingredient => `
        <span class="ingredient-tag">${ingredient}
        <button 
        type="button"
        class="remove-btn"
        data-ingredient="${ingredient}"
        title="Remove ${ingredient}"
        aria-label="Remove ${ingredient}"
        >&times;</button>
        </span>`)
        .join('');
}
function scrollChatToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
function appendMessage(senderName, text, isUser = false) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('message');
    messageEl.classList.add(isUser ? 'user-message' : 'bot-message');
    const formattedText = text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    messageEl.innerHTML = `
    <div class="message-sender">${senderName}</div>
    <div class="message-content">${formattedText}</div>
`;
    chatMessages.appendChild(messageEl);
    scrollChatToBottom();
}
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'bot-typing-indicator';
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
`;
    chatMessages.appendChild(indicator);
    scrollChatToBottom();
}
function removeTypingIndicator() {
    const indicator = document.getElementById('bot-typing-indicator');
    if (indicator) indicator.remove();
}
function handleChatSubmit(text) {
    if (!text.trim()) return;
    appendMessage('You', text, true);
    chatInput.value = '';
    showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator();
        const reply = generateBotReply(text, state.ingredients);
        appendMessage('Chef Supriya', reply, false);
    }, 600);
}
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value;
    if (value.trim()) {
        addIngredient(value);
        input.value = '';
        input.focus();
    }
});
quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const stapleName = chip.textContent.replace('+', '').trim();
        addIngredient(stapleName);
    });
});
pantryList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
        const item = e.target.getAttribute('data-ingredient');
        removeIngredient(item);
    }
});
clearShelfBtn.addEventListener('click', () => {
    clearPantry();
});
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleChatSubmit(chatInput.value);
});
renderPantry();