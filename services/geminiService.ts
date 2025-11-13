import { geminiApi } from './api';
import { MidjourneyParams } from '../types';

/**
 * Parse Midjourney parameters using Gemini via the backend API
 */
export const parseMidjourneyParams = async (rawPrompt: string): Promise<Partial<MidjourneyParams>> => {
    try {
        // Call the backend endpoint instead of Gemini directly
        const response = await geminiApi.parsePrompt(rawPrompt);
        
        // The backend returns { params: {...}, method: "gemini" or "regex" }
        const parsedParams = response.params as Partial<MidjourneyParams>;
        
        // Ensure raw prompt is always included
        return { ...parsedParams, raw: rawPrompt };
    } catch (error) {
        console.error("Error parsing Midjourney parameters via backend:", error);
        
        // Fallback to basic regex parsing if backend fails
        return { raw: rawPrompt, ...basicRegexParse(rawPrompt) };
    }
};

/**
 * Basic regex-based parameter extraction as fallback
 */
const basicRegexParse = (prompt: string): Partial<MidjourneyParams> => {
    const params: Partial<MidjourneyParams> = {};
    
    const sref = prompt.match(/--sref\s+(\d+)/);
    if (sref) params.sref = sref[1];

    const ar = prompt.match(/--ar\s+([\d:]+)/);
    if (ar) params.ar = ar[1];

    const stylize = prompt.match(/--stylize\s+(\d+)/);
    if (stylize) params.stylize = parseInt(stylize[1], 10);

    const seed = prompt.match(/--seed\s+(\d+)/);
    if (seed) params.seed = parseInt(seed[1], 10);

    const chaos = prompt.match(/--chaos\s+(\d+)/);
    if (chaos) params.chaos = parseInt(chaos[1], 10);

    const weird = prompt.match(/--weird\s+(\d+)/);
    if (weird) params.weird = parseInt(weird[1], 10);

    const tile = /--tile/.test(prompt);
    if (tile) params.tile = true;

    const version = prompt.match(/--v\s+([\d.]+)/);
    if (version) params.version = version[1];

    const niji = prompt.match(/--niji\s+(\d+)/);
    if (niji) params.model = `Niji ${niji[1]}`;
    
    return params;
};