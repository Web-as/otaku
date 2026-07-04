import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { getCurrentUser } from '../../shared/firebase';
import { fetchUserWatchlist } from './watchlistService';

// Initialize the SDK
const apiKey =
  (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ||
  (import.meta.env.GEMINI_API_KEY as string | undefined) ||
  '';
const ai = new GoogleGenAI({ apiKey });

// --- Helper Types ---
export interface AIResult {
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
    data?: any;
}

// --- Tool Definitions ---
const queryDatabaseTool: FunctionDeclaration = {
    name: "queryDatabase",
    description: "Search the user's local anime library. Returns JSON details about files, missing episodes, and resolution.",
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
    const user = getCurrentUser();
    let items: Array<{ title: string; progress?: number; episodes?: number }> = [];

    if (user) {
        const watchlist = await fetchUserWatchlist();
        items = watchlist.map((w) => ({
            title: w.title,
            progress: w.progress,
            episodes: w.episodes,
        }));
    }

    if (!items.length) {
        try {
            const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&limit=10`;
            const res = await fetch(url);
            if (res.ok) {
                const json = await res.json();
                items = (json.data || []).map((a: { title: string }) => ({ title: a.title }));
            }
        } catch {
            /* fallback */
        }
    }

    const results = items.filter((item) => item.title.toLowerCase().includes(query));
    if (results.length === 0) return { count: 0, message: "No items found. Sign in and add anime on the tracker, or try another search." };
    return {
        count: results.length,
        items: results.map((item) => ({
            title: item.title,
            progress: item.progress != null ? `${item.progress}%` : "—",
            episodes: item.episodes,
        })),
    };
}

// --- Specialized Agents ---

/**
 * ArtAgent: Handles Image Generation
 * Model: gemini-3-pro-image-preview (Nano Banana Pro)
 */
export const ArtAgent = {
    async generateImage(prompt: string, size: '1K' | '2K' | '4K' = '1K'): Promise<string> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [{ text: prompt }]
                },
                config: {
                    imageConfig: {
                        imageSize: size,
                        aspectRatio: "1:1" // Default square for art
                    }
                }
            });

            // Extract image from response parts
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
            throw new Error("No image data received");
        } catch (e) {
            console.error("ArtAgent Error:", e);
            throw e;
        }
    }
};

/**
 * ProfileArtistAgent: Redraws avatars in anime style
 * Model: gemini-3-pro-image-preview
 */
export const ProfileArtistAgent = {
    async transmuteAvatar(imageBase64: string): Promise<string> {
        try {
            const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [
                        { 
                            inlineData: { 
                                mimeType: 'image/png', // Assuming PNG/JPEG generic 
                                data: cleanBase64 
                            } 
                        },
                        { 
                            text: "Redraw this person as a high-quality fantasy anime character. Keep the composition, gender, and hair color similar, but change the art style to vibrant, cel-shaded anime aesthetics. The background should be a magical fantasy guild setting." 
                        }
                    ]
                },
                config: {
                    imageConfig: {
                        imageSize: "1K",
                        aspectRatio: "1:1"
                    }
                }
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
            throw new Error("Avatar transmutation failed");
        } catch (e) {
            console.error("ProfileArtistAgent Error:", e);
            throw e;
        }
    }
};

/**
 * VideoAgent: Handles Video Generation
 * Model: veo-3.1-fast-generate-preview
 */
export const VideoAgent = {
    async animateImage(imageBase64: string, prompt: string = "Animate this scene naturally", aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> {
        try {
            // Remove header if present for raw bytes
            const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
            
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                image: {
                    imageBytes: cleanBase64,
                    mimeType: 'image/png' // Assuming PNG/JPEG from upload
                },
                config: {
                    numberOfVideos: 1,
                    resolution: '720p', // Fast preview default
                    aspectRatio: aspectRatio
                }
            });

            // Poll for completion
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!videoUri) throw new Error("Video generation failed");

            // Fetch the actual MP4 bytes using the key
            const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
            const blob = await videoResponse.blob();
            return URL.createObjectURL(blob);

        } catch (e) {
            console.error("VideoAgent Error:", e);
            throw e;
        }
    }
};

/**
 * AnalystAgent: Handles Image Understanding
 * Model: gemini-3-pro-preview
 */
export const AnalystAgent = {
    async analyzeImage(imageBase64: string, prompt: string = "Analyze this image in detail."): Promise<string> {
        try {
            const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
                        { text: prompt }
                    ]
                }
            });
            return response.text || "Analysis failed.";
        } catch (e) {
            console.error("AnalystAgent Error:", e);
            throw e;
        }
    }
};

/**
 * ChatAgent: Main Chatbot
 * Models: 
 * - gemini-3-pro-preview (Complex/Thinking)
 * - gemini-2.5-flash-lite (Fast)
 */
export class ChatAgent {
    private chatSession: any;
    private modelName: string = 'gemini-3-pro-preview';

    async startChat(useThinkingMode: boolean = false) {
        const config: any = {
            systemInstruction: "You are NEXUS-7, the Otaku Guild AI. Use tools to check the library. Be helpful and tech-savvy.",
            tools: [
                { functionDeclarations: [queryDatabaseTool] },
                { googleSearch: {} }
            ]
        };

        if (useThinkingMode) {
            this.modelName = 'gemini-3-pro-preview';
            config.thinkingConfig = { thinkingBudget: 32768 }; // Max budget for deep thought
        } else {
            // Use Lite for speed if explicitly requested, otherwise default Pro for quality
            // The prompt requests "Fast AI responses" feature using flash-lite
            // We'll expose a method for fast one-off queries, but keep chat session on Pro by default
            this.modelName = 'gemini-3-pro-preview';
        }

        this.chatSession = ai.chats.create({
            model: this.modelName,
            config: config
        });
    }

    async sendMessage(message: string, isThinking: boolean = false): Promise<string> {
        if (!this.chatSession) await this.startChat(isThinking);

        try {
            const result = await this.chatSession.sendMessage({ message });
            
            // Handle Tool Calls
            const calls = result.functionCalls;
            if (calls && calls.length > 0) {
                const call = calls[0];
                if (call.name === "queryDatabase") {
                    const args = call.args as any;
                    const toolResult = await executeQueryDatabase(args.searchQuery);
                    
                    const toolResponse = await this.chatSession.sendToolResponse({
                        functionResponses: [{
                            name: "queryDatabase",
                            id: call.id,
                            response: { result: toolResult }
                        }]
                    });
                    return toolResponse.text;
                }
            }
            return result.text;
        } catch (error) {
            console.error("ChatAgent Error:", error);
            return "Connection interrupted. Neural link unstable.";
        }
    }

    /**
     * Fast Response Mode
     * Uses gemini-2.5-flash-lite for low latency
     */
    async quickQuery(prompt: string): Promise<string> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-lite',
                contents: prompt
            });
            return response.text || "";
        } catch (e) {
            return "Fast response unavailable.";
        }
    }
}

export const nexusAgent = new ChatAgent();