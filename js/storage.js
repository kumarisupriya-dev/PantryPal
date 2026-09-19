const STORAGE_KEY = 'pantrypal_ingredients';
export function loadPantry() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (err) {
        console.error("Could not load pantry from storage:", err);
        return [];
    }
}
export function savePantry(ingredients) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
    } catch (err) {
        console.error("Could not save pantry to storage:", err);
    }
}