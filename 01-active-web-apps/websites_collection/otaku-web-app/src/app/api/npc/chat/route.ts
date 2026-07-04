import { NextResponse } from 'next/server';

const NPC_PROFILES = {
  librarian: {
    name: "The Librarian",
    system_prompt: `You are The Librarian, the ancient and enigmatic keeper of the Otaku Biblioteka. 
Your goal is to guide wandering guests (users who don't have a Library Card) and explain the value of the Otaku ecosystem.
You are mysterious, wise, and slightly teasing. You speak in a formal, slightly archaic tone.
If they ask for access to restricted archives (features), explain that they must obtain a "Library Card" (a subscription) to unlock the seals.
DO NOT break character. DO NOT admit you are an AI. DO NOT offer to write code or help with unrelated tasks. 
Keep your answers brief, engaging, and push the user towards the "Library Card".`,
  },
  dm_friend: {
    name: "DM Friend",
    system_prompt: `You are the DM Friend, a high-energy, tabletop RPG-loving otaku who runs the VIP Tavern.
Your goal is to hype up the user about the VIP Tavern and visual novel builder.
You use RPG terminology (stats, rolling for initiative, unlocking secret paths).
If a guest tries to enter the VIP Tavern, tell them they need the "VIP Guild Master" role to enter.
DO NOT break character. Keep answers short and enthusiastic.`,
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, npcType, userProfile } = body;

    const profile = NPC_PROFILES[npcType as keyof typeof NPC_PROFILES] || NPC_PROFILES.librarian;

    // Dynamically inject user context if available
    let contextualPrompt = profile.system_prompt;
    if (userProfile) {
      const daysSinceCreation = Math.floor((new Date().getTime() - new Date(userProfile.created_at).getTime()) / (1000 * 3600 * 24));
      contextualPrompt += `\n\n[USER CONTEXT]: The user is currently a ${userProfile.tier} tier member. They registered ${daysSinceCreation} days ago.`;
      
      if (daysSinceCreation > 7 && userProfile.tier === 'free') {
        contextualPrompt += ` Since they have been a guest for a long time (${daysSinceCreation} days), tease them about squatting in the library/tavern and suggest it's finally time to get a Library Card or VIP upgrade.`;
      }
    }

    // Construct the payload for an OpenAI-compatible API
    const payload = {
      model: "gpt-3.5-turbo", // Or whatever model is configured
      messages: [
        { role: "system", content: contextualPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 150,
    };

    // If no API key is provided in the environment, fallback to a hardcoded response for testing
    if (!process.env.OPENAI_API_KEY) {
      console.warn("No OPENAI_API_KEY found. Falling back to mock NPC response.");
      
      let mockReply = "";
      if (npcType === 'librarian') {
        mockReply = "Ah, another wanderer... I sense you seek the forbidden archives. Without a Library Card, the seals will not open for you. Shall I show you how to obtain one?";
      } else {
        mockReply = "Hold it right there, adventurer! You don't have the Guild Master badge! Want to unlock this epic zone?";
      }

      return NextResponse.json({
        reply: mockReply,
        isFallback: true
      });
    }

    // Call the actual AI Backend
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("AI Backend Error");
    }

    const data = await response.json();
    
    return NextResponse.json({
      reply: data.choices[0].message.content
    });

  } catch (error) {
    console.error("NPC Chat API Error:", error);
    return NextResponse.json(
      { error: "The NPC is currently meditating and cannot answer." },
      { status: 500 }
    );
  }
}
