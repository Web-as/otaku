"use server";
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { MOCK_MEDIA_ITEMS } from "./mockData";

// Initialize the SDK lazily to prevent crashes when API_KEY is undefined
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI | null => {
  if (ai) return ai;
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

// --- Helper Types ---
export interface AIResult {
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
    data?: unknown;
}

// --- Tool Definitions ---
const queryDatabaseTool: FunctionDeclaration = {
    name: "queryDatabase",
    description: "Search the user's local anime library.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            searchQuery: {
                type: Type.STRING,
                description: "The title or keyword to search for."
            }
        },
        required: ["searchQuery"]
    }
};

async function executeQueryDatabase(searchQuery: string) {
    const query = searchQuery.toLowerCase();
    const results = MOCK_MEDIA_ITEMS.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
    );
    if (results.length === 0) return { count: 0, message: "No items found." };
    return {
        count: results.length,
        items: results.map(item => ({
            title: item.title,
            resolution: item.resolution,
            missingEpisodes: item.missing,
            progress: item.progress + "%",
            type: item.type
        }))
    };
}

// --- Specialized Agents ---

export const ArtAgent = {
    async generateImage(prompt: string, size: '1K' | '2K' | '4K' = '1K'): Promise<string> {
        const client = getAI();
        if (!client) throw new Error("AI not configured");

        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: { parts: [{ text: prompt }] }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image data received");
    }
};

export const ProfileArtistAgent = {
    async transmuteAvatar(imageBase64: string): Promise<string> {
        const client = getAI();
        if (!client) throw new Error("AI not configured");

        const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
                    { text: "Redraw this as an anime character." }
                ]
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("Avatar transmutation failed");
    }
};

export const VideoAgent = {
    async animateImage(_imageBase64: string, _prompt: string = "Animate this scene", _aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> {
        // Video generation not available without proper API setup
        throw new Error("Video generation requires API configuration");
    }
};

export const AnalystAgent = {
    async analyzeImage(imageBase64: string, prompt: string = "Analyze this image."): Promise<string> {
        const client = getAI();
        if (!client) return "AI not configured.";

        const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
                    { text: prompt }
                ]
            }
        });
        return response.text || "Analysis failed.";
    }
};

let chatSession: ReturnType<GoogleGenAI['chats']['create']> | null = null;

export async function startChatSession(useThinkingMode: boolean = false) {
    const client = getAI();
    if (!client) return;

    const config: Record<string, unknown> = {
        systemInstruction: "You are NEXUS-7, the Otaku Guild AI. Be helpful and tech-savvy.",
        tools: [{ functionDeclarations: [queryDatabaseTool] }]
    };

    if (useThinkingMode) {
        config.thinkingConfig = { thinkingBudget: 32768 };
    }

    chatSession = client.chats.create({
        model: 'gemini-2.0-flash-exp',
        config: config
    });
}

export async function sendChatMessage(message: string, isThinking: boolean = false): Promise<string> {
    if (!chatSession) await startChatSession(isThinking);
    if (!chatSession) return "AI not configured.";

    try {
        const result = await chatSession.sendMessage({ message });
        return result.text || "No response.";
    } catch (error) {
        console.error("ChatAgent Error:", error);
        return "Connection interrupted.";
    }
}

export async function quickQuery(prompt: string): Promise<string> {
    const client = getAI();
    if (!client) return "AI not configured.";

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt
        });
        return response.text || "";
    } catch {
        return "Fast response unavailable.";
    }
}
