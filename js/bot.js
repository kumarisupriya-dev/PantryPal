const SUBSTITUTIONS = {
    "butter": "In sauteing, use equal amounts of olive oil, ghee, or vegetable oil. In baking, use coconut oil or applesauce.",
    "mustard oil": "Substitute with olive oil, sesame oil, or neutral vegetable oil with a pinch of crushed mustard seeds.",
    "olive oil": "Canola oil, sunflower oil, avocado oil, or melted butter work as great substitutes.",
    "eggs": "For binding, use 1/4 cup unsweetened applesauce, half a mashed banana, or 1 tbsp ground chia/flax with 3 tbsp water.",
    "garlic": "1/8 teaspoon of garlic powder replaces roughly 1 fresh clove. Chives or minced shallots also work well.",
    "onion": "1 tablespoon of onion powder, 2 small shallots, or leeks/scallions replace 1 medium fresh onion.",
    "pasta": "Egg noodles, ramen noodles, or rice can step in as a comfort starch base.",
    "rice": "Quinoa, couscous, or riced vegetables make great grains to carry sauces.",
    "sour cream": "Use Greek Yogurt (1:1 ratio), or cottage cheese blended with a splash of lemon juice.",
    "milk": "You can substitute with oat milk, almond milk, soy milk (1:1), or water with a small pat of butter.",
    "heavy cream": "Combine 3/4 cup whole milk with 1/4 cup melted unsalted butter."
};
export function generateBotReply(userText, currentIngredients = []) {
    const query = userText.toLowerCase().trim();
  if (/^(hi|hello|hey|hlo|good morning|good evening|howdy)/.test(query)) {
      if (currentIngredients.length > 0) {
          return `Hey there! I see you currently have ${currentIngredients.join(',')} on your shelf. Ready to find something to cook, or have a specific question?`;
      }
      return "Hello! I'm here to help you turn whatever is in your kitchen into a great meal. Add a few ingredients on the left, or ask me for cooking tips!";
  }
    const isPantryQuery =
        query.includes("my ingredients") ||
        query.includes("my pantry") ||
        query.includes("shelf") ||
        query.includes("fridge") ||
        (query.includes("what") && query.includes("have")) ||
        (query.includes("ingredient") && query.includes("have"));
  if (isPantryQuery) {
      if (currentIngredients.length === 0) {
          return "Your shelf is currently empty! Add a few items using the input on the left or tap the staple chips.";
      }
      return `Right now your shelf has: **${currentIngredients.join(', ')}**. Tap**Find Recipes** when you want to see what we can make!`;
  }
    for (const [ingredient, replacement] of Object.entries(SUBSTITUTIONS)) {
        if (query.includes(ingredient) && (query.includes("replace") || query.includes("substitute") || query.includes("instead of") || query.includes("swap"))) {
            return `**${ingredient.toUpperCase()} SUBSTITUTION:** ${replacement}`;
        }
    }
    if (query.includes("replace") || query.includes("substitute") || query.includes("instead of")) {
        return "I can suggest substitutions for common ingredients like eggs, butter, sour cream, milk, buttermilk, garlic, olive oil, and more! Which specific item do you need to replace?";
    }
    if (query.includes("what can i cook") || query.includes("recipe") || query.includes("dinner") || query.includes("lunch")) {
        if (currentIngredients.length === 0) {
            return "Tell me what ingredients you have first! Add them on the shelf to your left, then hit Find Recipes.";
        }
        return `With ${currentIngredients.slice(0, 3).join(', ')} (and more), we have delicious options. Click the **Find Recipes** button below your shelf to view matched dishes!`;
    }
    return "That's a good kitchen question! You can ask me things like:\n• 'What can I replace sour cream with?'\n• 'What can I cook with my ingredients?'\n• Or add ingredients to your pantry shelf on the left to see matching recipes.";
}