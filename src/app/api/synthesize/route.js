import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize the Gemini client (keep your API key safe in .env.local)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        // 1. Extract the payload from the frontend
        const { dishName, ingredients, brandVoice } = await req.json();

        if (!dishName) {
            return NextResponse.json({ error: 'Dish nomenclature is required.' }, { status: 400 });
        }

        // 2. Select the high-speed model
        // gemini-2.5-flash is lightning fast, perfect for real-time UI updates
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            // We pass the absolute rules as a System Instruction
            systemInstruction: `You are an elite culinary copywriter and expert in Georgian gastronomy. 
      Generate appetizing, culturally accurate dish descriptions and origin stories.

    RULES:
1. Localize perfectly into Georgian(ka), English(en), and Russian(ru).
      2. The English translation must sound like a Michelin - starred menu.
      3. "description" field must be a short, comma - separated list of ingredients.
      4. "story" field must be 2 - 3 sentences max, capturing cultural heritage.
      5. Strictly follow the provided Brand Voice parameters.
         - If "Traditional & Warm": Focus on heritage, grandmothers' recipes, Supra culture, and comforting nostalgia.
         - If "Modern & Minimalist": Focus on avant-garde techniques, clean presentation, simplicity, and the raw quality of ingredients.
         - If "High-End / Fine Dining": Focus on exclusivity, prestige, the chef's visionary approach, and rare origins of produce.
      
      OUTPUT SCHEMA:
{
    "title": { "ka": "", "en": "", "ru": "" },
    "description": { "ka": "", "en": "", "ru": "" },
    "story": { "ka": "", "en": "", "ru": "" }
} `
        });

        // 3. The Trigger Prompt
        const prompt = `
      Target Dish: ${dishName}
      Known Ingredients: ${ingredients || 'Infer traditional ingredients based on the dish name'}
      Brand Voice Parameter: ${brandVoice || 'Modern & Minimalist'}
      
      Remember: The entire tone of the story and description MUST reflect the Brand Voice Parameter above.
`;

        // 4. The Secret Weapon: Forcing JSON output
        const generationConfig = {
            temperature: 0.7, // Slightly creative but highly disciplined
            responseMimeType: "application/json",
        };

        // 5. Execute the synthesis
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig,
        });

        // 6. Parse and deliver to the frontend
        const rawResponse = result.response.text();
        const cleanJson = JSON.parse(rawResponse);

        return NextResponse.json(cleanJson, { status: 200 });

    } catch (error) {
        console.error('AI Synthesis Error:', error);
        return NextResponse.json(
            { error: 'Failed to synthesize culinary data.' },
            { status: 500 }
        );
    }
}
