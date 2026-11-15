import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import {
    SynthesizeRequestSchema,
    SynthesizeResponseSchema,
    extractJsonObject,
    sanitizePromptValue,
    type SynthesizeRequest,
} from '@/lib/ai-synthesis';
import { ensureRedisReady, getRedisClient } from '@/lib/server/redis';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute window
const RATE_LIMIT_MAX = 8; // 8 requests allowed per IP

function getClientKey(req: NextRequest): string {
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    return 'local';
}

// --- REDIS RATE LIMITER ---
// Safely tracks text generation requests across all PM2 cluster cores
async function isRateLimited(key: string): Promise<boolean> {
    try {
        const redis = getRedisClient();
        const isReady = await ensureRedisReady(redis);
        if (!isReady) {
            return false;
        }

        const redisKey = `text_synthesis_limit:${key}`;
        const currentCount = await redis.incr(redisKey);

        if (currentCount === 1) {
            await redis.expire(redisKey, RATE_LIMIT_WINDOW_SECONDS);
        }

        return currentCount > RATE_LIMIT_MAX;
    } catch {
        return false;
    }
}

function buildPrompt(input: SynthesizeRequest): string {
    const dishName = sanitizePromptValue(input.dishName);
    const ingredients = sanitizePromptValue(
        input.ingredients || 'Infer traditional ingredients based on the dish name'
    );
    const brandVoice = sanitizePromptValue(input.brandVoice);

    return [
        `Target Dish: ${dishName}`,
        `Known Ingredients: ${ingredients}`,
        `Brand Voice Parameter: ${brandVoice}`,
        '',
        'Return valid JSON only.',
        'Do not include markdown fences.',
        'Do not add extra keys.',
        'Descriptions must be concise ingredient lists.',
        'Stories must stay culturally grounded, elegant, and compact.',
    ].join('\n');
}

export async function POST(req: NextRequest) {
    try {
        if (!genAI) {
            return NextResponse.json(
                { error: 'AI provider is not configured on the server.' },
                { status: 500 }
            );
        }

        const clientKey = getClientKey(req);
        
        // Await the Redis rate limiter
        if (await isRateLimited(clientKey)) {
            return NextResponse.json(
                { error: 'Too many synthesis requests. Please try again in a minute.' },
                { status: 429 }
            );
        }

        const rawBody = await req.json().catch(() => null);
        const parsedInput = SynthesizeRequestSchema.safeParse(rawBody);

        if (!parsedInput.success) {
            return NextResponse.json(
                {
                    error: 'Invalid synthesis payload.',
                    details: parsedInput.error.flatten(),
                },
                { status: 400 }
            );
        }

        const input = parsedInput.data;

        // Upgrade to Gemini 3.1 Flash Preview for identical cost, 
        // vastly superior Georgian translations, and stricter JSON adherence
        const model = genAI.getGenerativeModel({
            model: 'gemini-3-flash-preview', 
            systemInstruction: `
You are an elite culinary copywriter and expert in Georgian gastronomy.

TASK:
Generate culturally accurate, appetizing dish copy in Georgian (ka), English (en), and Russian (ru).

RULES:
1. Return JSON only.
2. Use this exact schema:
{
  "title": { "ka": "", "en": "", "ru": "" },
  "description": { "ka": "", "en": "", "ru": "" },
  "story": { "ka": "", "en": "", "ru": "" }
}
3. "title" must be natural and menu-ready.
4. "description" must be a short comma-separated ingredient/composition line.
5. "story" must be 1-3 short sentences, culturally grounded, elegant, and concise.
6. Follow the brand voice exactly:
   - Traditional & Warm: heritage, family, supra, comfort
   - Modern & Minimalist: precision, restraint, ingredient clarity
   - High-End / Fine Dining: refinement, rarity, chef-led composition
7. Never include markdown, commentary, explanations, or extra keys.
8. Keep all values non-empty.
      `.trim(),
        });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: buildPrompt(input) }] }],
            generationConfig: {
                temperature: 0.6,
                responseMimeType: 'application/json',
            },
        });

        const rawText = result.response.text();
        const jsonText = extractJsonObject(rawText);

        const parsedJson = JSON.parse(jsonText);
        const validatedOutput = SynthesizeResponseSchema.safeParse(parsedJson);

        if (!validatedOutput.success) {
            console.error('Invalid AI response shape:', validatedOutput.error.flatten());
            return NextResponse.json(
                { error: 'AI returned an invalid response shape.' },
                { status: 502 }
            );
        }

        return NextResponse.json(validatedOutput.data, { status: 200 });
    } catch (error) {
        console.error('AI Synthesis Error:', error);
        return NextResponse.json(
            { error: 'Failed to synthesize culinary data.' },
            { status: 500 }
        );
    }
}
