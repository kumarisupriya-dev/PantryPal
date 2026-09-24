import {loadPantry, savePantry} from "./storage.js";
import {generateBotReply} from "./bot.js";
import {fetchRecipes, findMatchingRecipes} from "./recipes.js";

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
async function showRecipeRecommendations() {
    if (state.ingredients.length === 0) return;
    showTypingIndicator();
    const allRecipes = await fetchRecipes();
    const matchedRecipes = findMatchingRecipes(state.ingredients, allRecipes);
    setTimeout(() => {
        removeTypingIndicator();
        if (matchedRecipes.length === 0) {
            appendMessage(
                'Chef Supriya', `I couldn't find a direct for those exact items yet. Try adding a staple like **rice**, **pasta**, or **eggs**!`,
                false
            );
            return;
        }
        const cardsHtml = matchedRecipes.map(recipe => {
            const isPerfect = recipe.matchPercent === 100;
            const matchPill = isPerfect
            ? `<span class="match-pill match-perfect">100% Match • Ready!</span>`
            : `<span class="match-pill match-partial">${recipe.matchPercent}% Match</span>`;
            const missingText = recipe.missing.length > 0
            ? `<div class="missing-tag">Missing: ${recipe.missing.join(', ')}</div>`
            : `<div class="have-tag">All ingredients in pantry!</div>`;
            return `
            <div class="recipe-card" data-recipe-id="${recipe.id}">
            <div class="recipe-card-top">
            <h4 class="recipe-card-title">${recipe.title}</h4>
            ${matchPill}
        </div>
        <p class="recipe-desc">${recipe.description}</p>
        <div class="ingredient-breakdown">
        <div class="have-tag">Have: ${recipe.matched.join(', ')}</div>
        ${missingText}
        </div>
        <button type="button" class="cook-now-btn" data-recipe-id="${recipe.id}">
        Start Cooking (${recipe.prepTime}) &rarr;
</button>
</div>
`;
        }).join('');
        const introText = `I found **${matchedRecipes.length}** recipes you can make! Dishes with higher match scores are listed first:`;
        const containerEl = document.createElement('div');
        containerEl.className = 'message bot-message';
        containerEl.innerHTML = `
        <div class="message-sender">Chef Supriya</div>
        <div class="message-content">
        <p>${introText}</p>
        <div class="recipe-card-list">${cardsHtml}</div>
     </div>
`;
        chatMessages.appendChild(containerEl);
        scrollChatToBottom();
    }, 500);
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
findRecipesBtn.addEventListener('click', () => {
    showRecipeRecommendations();
});
renderPantry();