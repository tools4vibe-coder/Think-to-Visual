
import { GoogleGenAI, Type } from "@google/genai";
import { Scene, StoryboardResponse } from "./types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateStoryboardData = async (story: string): Promise<StoryboardResponse> => {
  // Always create a new instance to pick up the latest selected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Act as a world-class Hollywood Creative Director and Identity Supervisor. 
    Your mission is to transform the provided story into a cinematic storyboard with 100% CHARACTER IDENTITY LOCK.

    STORY: "${story}"

    REQUIREMENTS:
    1. MASTER IDENTITY DNA: Define a technical architectural profile of the character (Face bone structure, specific eye details, body build, height).
    2. THINKING DEPTH: Analyze the subtext, emotional tone, and conceptual weight of each scene.
    3. VISUAL NOTES: For each scene, provide technical directorial notes on how composition (e.g., negative space, leading lines), camera angle, and character posture should combine to amplify the emotional subtext.
    4. LIGHTING: Strictly SOFT CINEMATIC LIGHTING. Zero harsh background glare. Zero blown-out highlights.
    5. PROMPT GENERATION: Create technical prompts starting with the MASTER IDENTITY DNA verbatim.

    Output in JSON format only.`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          characterProfile: { type: Type.STRING },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                number: { type: Type.INTEGER },
                description: { type: Type.STRING },
                shotType: { type: Type.STRING },
                movement: { type: Type.STRING },
                lighting: { type: Type.STRING },
                tone: { type: Type.STRING },
                visualNotes: { 
                  type: Type.STRING,
                  description: "Directorial notes on composition and emotional framing."
                },
                prompt: { type: Type.STRING },
              },
              required: ["number", "description", "shotType", "movement", "lighting", "tone", "visualNotes", "prompt"],
            },
          },
        },
        required: ["characterProfile", "scenes"],
      },
    },
  });

  return JSON.parse(response.text.trim()) as StoryboardResponse;
};

export const generateSceneImage = async (prompt: string, retries = 3): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const enhancedPrompt = `ELITE CINEMATIC PRODUCTION STILL. Arri Alexa 65 70mm, Master Anamorphic.
  [CHARACTER DNA]: ${prompt}
  [LIGHTING & LOOK]: Ultra-soft cinematic lighting, Rembrandt shadows, naturalistic skin shaders, 35mm grain. NO HARSH LIGHTING. NO BLOWN HIGHLIGHTS.
  [QUALITY]: Photorealistic, 8k reference, master color grade, zero facial drift.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K" 
        },
      },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data found");
  } catch (error: any) {
    if (error.message?.includes("entity was not found")) {
        throw new Error("API Key configuration error. Please re-select your key.");
    }
    if (retries > 0 && (error.message?.includes("429") || error.status === 429)) {
      await delay(Math.pow(2, 4 - retries) * 2000);
      return generateSceneImage(prompt, retries - 1);
    }
    throw error;
  }
};
