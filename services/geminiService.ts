
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import type { LiteraryExcerpt } from "../types";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateContent = async (ai: GoogleGenAI, file: File) => {
    const imagePart = await fileToGenerativePart(file);

    const prompt = `Analyse cette image et fournis les informations suivantes en français. Réponds uniquement avec un seul objet JSON.
1. 'titles': Un tableau de 2-3 chaînes de caractères pour des titres créatifs.
2. 'captions': Un tableau de 2-3 chaînes de caractères pour des légendes courtes pour les réseaux sociaux.
3. 'excerpts': Un tableau de 2 objets pour des extraits littéraires. Chaque objet doit contenir 'extrait', 'auteur', 'oeuvre', et 'traduction'. Si l'extrait original est en français, le champ 'traduction' doit être une chaîne vide.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            titles: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            captions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            excerpts: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        extrait: { type: Type.STRING },
                        traduction: { type: Type.STRING },
                        auteur: { type: Type.STRING },
                        oeuvre: { type: Type.STRING },
                    },
                    required: ['extrait', 'auteur', 'oeuvre', 'traduction']
                }
            }
        },
        required: ['titles', 'captions', 'excerpts']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema
        }
    });
    
    try {
        const text = response.text.trim();
        return JSON.parse(text) as {
            titles: string[];
            captions: string[];
            excerpts: LiteraryExcerpt[];
        };
    } catch (e) {
        console.error("Failed to parse JSON from Gemini:", e);
        console.error("Raw response text:", response.text);
        throw new Error("Réponse invalide de l'API Gemini.");
    }
};

export const generateChatResponse = async (
    ai: GoogleGenAI,
    message: string,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<AsyncGenerator<GenerateContentResponse>> => {
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: "Tu es un assistant IA amical et serviable pour l'application Image Insight. Tu aides les utilisateurs à propos de leurs images, de la photographie, ou de tout autre sujet. Réponds en français.",
        },
    });

    const result = await chat.sendMessageStream({ message });
    return result;
};
