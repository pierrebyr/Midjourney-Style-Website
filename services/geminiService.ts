
import { GoogleGenAI, Type } from '@google/genai';
import { MidjourneyParams } from '../types';

// Assume process.env.API_KEY is available
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const model = 'gemini-2.5-flash';

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        sref: { type: Type.STRING, description: 'The --sref value, a string of numbers.', nullable: true },
        model: { type: Type.STRING, description: 'The Midjourney model used, e.g., "Niji 6" or "MJ 6.0".', nullable: true },
        seed: { type: Type.INTEGER, description: 'The --seed value.', nullable: true },
        ar: { type: Type.STRING, description: 'The --ar (aspect ratio) value, e.g., "16:9".', nullable: true },
        chaos: { type: Type.INTEGER, description: 'The --chaos value, from 0 to 100.', nullable: true },
        stylize: { type: Type.INTEGER, description: 'The --stylize value, from 0 to 1000.', nullable: true },
        weird: { type: Type.INTEGER, description: 'The --weird value, from 0 to 3000.', nullable: true },
        tile: { type: Type.BOOLEAN, description: 'Whether the --tile parameter is present.', nullable: true },
        version: { type: Type.STRING, description: 'The --v (version) value, e.g., "6.0".', nullable: true },
    },
};

export const parseMidjourneyParams = async (rawPrompt: string): Promise<Partial<MidjourneyParams>> => {
    if (!API_KEY) {
        throw new Error("Gemini API key is not configured.");
    }

    const systemInstruction = `You are an expert at parsing Midjourney prompts. Extract all parameters from the user's text and return them as a JSON object matching the provided schema. The "model" can be inferred from parameters like "--niji". If a parameter is not present, omit its key from the JSON. The prompt text itself should be ignored. For example, from "a dog --ar 16:9 --sref 123", you extract { ar: "16:9", sref: "123" }.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Parse the following Midjourney prompt: "${rawPrompt}"`,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedParams: MidjourneyParams = JSON.parse(jsonText);
        
        // Ensure raw prompt is always included
        const finalParams: Partial<MidjourneyParams> = { ...parsedParams, raw: rawPrompt };
        
        return finalParams;
    } catch (error) {
        console.error("Error parsing Midjourney parameters with Gemini:", error);
        // Fallback to basic regex parsing if API fails
        return { raw: rawPrompt, ...basicRegexParse(rawPrompt) };
    }
};

const basicRegexParse = (prompt: string): Partial<MidjourneyParams> => {
    const params: Partial<MidjourneyParams> = {};
    const sref = prompt.match(/--sref\s+(\d+)/);
    if (sref) params.sref = sref[1];

    const ar = prompt.match(/--ar\s+([\d:]+)/);
    if (ar) params.ar = ar[1];

    const stylize = prompt.match(/--stylize\s+(\d+)/);
    if (stylize) params.stylize = parseInt(stylize[1], 10);
    
    return params;
}
