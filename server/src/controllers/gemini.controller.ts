import { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { AppError, asyncHandler } from '../middleware/errorHandler';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY not set. Gemini features will not work.');
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
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

/**
 * Basic regex parsing fallback
 */
const basicRegexParse = (prompt: string): Record<string, any> => {
  const params: Record<string, any> = {};

  const sref = prompt.match(/--sref\s+(\d+)/);
  if (sref) params.sref = sref[1];

  const ar = prompt.match(/--ar\s+([\d:]+)/);
  if (ar) params.ar = ar[1];

  const stylize = prompt.match(/--stylize\s+(\d+)/);
  if (stylize) params.stylize = parseInt(stylize[1], 10);

  const chaos = prompt.match(/--chaos\s+(\d+)/);
  if (chaos) params.chaos = parseInt(chaos[1], 10);

  const seed = prompt.match(/--seed\s+(\d+)/);
  if (seed) params.seed = parseInt(seed[1], 10);

  const weird = prompt.match(/--weird\s+(\d+)/);
  if (weird) params.weird = parseInt(weird[1], 10);

  const version = prompt.match(/--v\s+([\d.]+)/);
  if (version) params.version = version[1];

  if (prompt.includes('--tile')) params.tile = true;

  if (prompt.includes('--niji')) params.model = 'Niji';

  return params;
};

/**
 * Parse Midjourney prompt using Gemini AI
 * POST /api/gemini/parse-prompt
 */
export const parsePrompt = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      throw new AppError('Prompt is required and must be a string', 400);
    }

    if (prompt.length > 2000) {
      throw new AppError('Prompt is too long (max 2000 characters)', 400);
    }

    // Check if API is configured
    if (!ai || !API_KEY) {
      console.warn('Gemini API not configured, using fallback regex parser');
      const fallbackParams = basicRegexParse(prompt);
      res.json({
        params: { ...fallbackParams, raw: prompt },
        method: 'fallback',
      });
      return; // ✅ on sort proprement
    }

    try {
      const systemInstruction =
        'You are an expert at parsing Midjourney prompts. Extract all parameters from the user\'s text and return them as a JSON object matching the provided schema. The "model" can be inferred from parameters like "--niji". If a parameter is not present, omit its key from the JSON. The prompt text itself should be ignored. For example, from "a dog --ar 16:9 --sref 123", you extract { ar: "16:9", sref: "123" }.';

      const response = await ai.models.generateContent({
        model,
        contents: `Parse the following Midjourney prompt: "${prompt}"`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      // ✅ On vérifie que response.text existe bien
      if (!response || typeof response.text !== 'string') {
        console.error('Invalid Gemini response:', response);
        const fallbackParams = basicRegexParse(prompt);
        res.status(502).json({
          params: { ...fallbackParams, raw: prompt },
          method: 'fallback',
          warning: 'Gemini returned an invalid response, using fallback parser',
        });
        return;
      }

      const jsonText = response.text.trim();
      let parsedParams: Record<string, any>;

      try {
        parsedParams = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Failed to parse Gemini JSON response:', parseError, 'RAW:', jsonText);
        const fallbackParams = basicRegexParse(prompt);
        res.status(502).json({
          params: { ...fallbackParams, raw: prompt },
          method: 'fallback',
          warning: 'Gemini returned invalid JSON, using fallback parser',
        });
        return;
      }

      // Add raw prompt
      const finalParams = { ...parsedParams, raw: prompt };

      res.json({
        params: finalParams,
        method: 'gemini',
      });
      return; // ✅ on sort proprement

    } catch (error) {
      console.error('Gemini API error:', error);

      // Fallback to regex parsing
      const fallbackParams = basicRegexParse(prompt);

      res.json({
        params: { ...fallbackParams, raw: prompt },
        method: 'fallback',
        warning: 'Gemini API failed, using fallback parser',
      });
      return; // ✅ là aussi
    }
  }
);