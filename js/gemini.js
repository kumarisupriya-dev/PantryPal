const GEMINI_KEY_STORAGE = 'pantrypal_gemini_key';
export function getSavedApiKey() {
    return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
}
export function saveApiKey(key) {
    if (key && key.trim()) {
        localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
    } else {
        localStorage.removeItem(GEMINI_KEY_STORAGE);
    }
}
export function hasApiKey() {
    return !!getSavedApiKey();
}
export async function askGeminiChef(userPrompt, currentIngredients = []) {
    const apiKey = getSavedApiKey();
    if (!apiKey) {
        throw new Error("No Gemini API key configured.");
    }
    const pantryList = currentIngredients.length > 0
    ? currentIngredients.join(', ')
    : 'Empty shelf (ask user what they have if suggesting recipes)';
    const systemInstruction = `You are Chef Supriya, a warm, encouraging, and experienced homestyle culinary guide inside the PantryPal app.
    The user currently has these ingredients in their kitchen: [${pantryList}].
    Guidelines: 
    1. Provide practical, appetizing cooking advice, substitutions, and recipe guidance.
    2. Keep replies conversational, concise, and focused (2-4 paragraphs or crisp bullet points).
    3. Do not overwhelm with long culinary essays.
    4. Bold key ingredient names or timings using markdown.
    5. If the user asks for a recipe, prioritize their existing ingredients, but feel free to suggest 1-2 common staples if missing.`;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
        contents: [
            {
                role: "user",
                parts: [{text: userPrompt}]
            }
        ],
        systemInstruction: {
            parts: [{text: systemInstruction}]
        },
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600
        }
    };
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API error (Status ${response.status})`);
    }
    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const replyText = parts.find(p => p.text)?.text;
    if (!replyText) {
        throw new Error("Empty response received from Gemini");
    }
    return replyText;
}