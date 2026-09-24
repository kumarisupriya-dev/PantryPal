let cachedRecipes = null;

export async function fetchRecipes() {
    if (cachedRecipes) return cachedRecipes;
    try {
        const res = await fetch('./data/recipes.json');
        cachedRecipes = await res.json();
        return cachedRecipes;
    } catch (err) {
        console.error("Failed to load recipes.json:", err);
        return [];
    }
}
function isIngredientMatch(recipeItem, pantryItem) {
    const r = recipeItem.toLowerCase().trim();
    const p = pantryItem.toLowerCase().trim();
    return r === p || r.includes(p) || p .includes(r);
}
export function findMatchingRecipes(pantryIngredients, recipes) {
    if (!pantryIngredients || pantryIngredients.length === 0) {
        return [];
    }
    const results = recipes.map(recipe => {
        const matched = [];
        const missing = [];
        recipe.ingredients.forEach(reqIng => {
            const hasItem = pantryIngredients.some(pantryItem => isIngredientMatch(reqIng, pantryItem)
            );
            if (hasItem) {
                matched.push(reqIng);
            } else {
                missing.push(reqIng);
            }
        });
        const matchPercent = Math.round((matched.length / recipe.ingredients.length) * 100);
        return {
            ...recipe,
            matched,
            missing,
            matchPercent
        };
    });
    return results
        .filter(r => r.matched.length > 0)
        .sort((a, b) => b.matchPercent - a.matchPercent);
}