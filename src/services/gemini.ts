import { GoogleGenAI, Type } from "@google/genai";
import { MatchPrediction, PredictionStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeMatch(homeTeam: string, awayTeam: string, league: string): Promise<Partial<MatchPrediction>> {
  const prompt = `Analyze the upcoming football match between ${homeTeam} and ${awayTeam} in the ${league}. 
  Provide a detailed prediction including:
  1. Recommended bet (e.g., Home Win, Over 2.5, BTTS)
  2. Odds estimation
  3. Confidence score (0-100)
  4. Detailed tactical analysis and reasoning.
  
  Use Google Search to find the latest team news, injuries, and recent form.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prediction: { type: Type.STRING },
          odds: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
          analysis: { type: Type.STRING },
          isElite: { type: Type.BOOLEAN }
        },
        required: ["prediction", "odds", "confidence", "analysis", "isElite"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return {
      homeTeam,
      awayTeam,
      league,
      startTime: new Date().toISOString(), // In real app, fetch actual time
      status: PredictionStatus.PENDING,
      ...result
    };
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {};
  }
}

export async function generateDailyBetSlip(): Promise<MatchPrediction[]> {
  const prompt = `Find the top 3 highest confidence football match predictions for today. 
  Focus on major leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1).
  Return them as a JSON array of match objects.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            homeTeam: { type: Type.STRING },
            awayTeam: { type: Type.STRING },
            league: { type: Type.STRING },
            prediction: { type: Type.STRING },
            odds: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
            isElite: { type: Type.BOOLEAN }
          },
          required: ["homeTeam", "awayTeam", "league", "prediction", "odds", "confidence", "analysis", "isElite"]
        }
      }
    }
  });

  try {
    const results = JSON.parse(response.text || "[]");
    return results.map((r: any) => ({
      id: Math.random().toString(36).substring(7),
      startTime: new Date().toISOString(),
      status: PredictionStatus.PENDING,
      ...r
    }));
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}
