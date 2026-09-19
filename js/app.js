import {loadPantry, savePantry} from "./storage.js";

const state = {ingredients: loadPantry()};
const form = document.getElementById('ingredient-form');
const input = document.getElementById('ingredient-input');
const pantryList = document.getElementById('pantry-list');
const itemCountBadge = document.getElementById('item-count');
const findRecipesBtn = document.getElementById('find-recipes-btn');
const clearShelfBtn = document.getElementById('clear-shelf-btn');
const quickChips = document.querySelectorAll('.quick-chip');
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
        setTimeout(() => input.classList.remove('shake'),400);
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
        pantryList.innerHTML = `
        <div class="empty-state">
        <p>Your shelf is empty.<br>Add ingredients above to start!</p>
</div>`;
        return;
    }
    pantryList.innerHTML = state.ingredients
        .map(ingredient => `<span class="ingredient-tag">${ingredient}
<button 
type="button"
class="remove-btn"
data-ingredient="${ingredient}"
title="Remove ${ingredient}"
aria-label="Remove ${ingredient}"
>&times;</button></span>
`)
        .join('');
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
renderPantry();