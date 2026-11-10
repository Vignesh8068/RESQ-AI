import { AIAnalysis, EmergencyCategory, IncidentSeverity } from '../types';
import { analyzeIncident } from '../lib/demoData';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(
  GEMINI_API_KEY &&
  GEMINI_API_KEY !== 'your_gemini_api_key'
);

export async function triageIncidentWithAI(title: string, description: string): Promise<AIAnalysis> {
  if (!isGeminiConfigured) {
    // Transparent rule-based fallback
    return analyzeIncident(title, description);
  }

  try {
    const prompt = `You are RESQ INTELLIGENCE, an elite emergency triage AI.
Analyze the following incident report:
Title: "${title}"
Description: "${description}"

Respond ONLY with valid JSON in this exact structure:
{
  "suggestedCategory": "fire" | "road_accident" | "medical" | "flood" | "building_collapse" | "other",
  "suggestedSeverity": "critical" | "high" | "medium" | "low",
  "summary": "one sentence concise summary",
  "riskIndicators": ["risk 1", "risk 2"],
  "recommendedActions": ["action 1", "action 2"],
  "confidence": 0.95,
  "keywords": ["keyword1", "keyword2"]
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);

    return {
      suggestedCategory: parsed.suggestedCategory as EmergencyCategory,
      suggestedSeverity: parsed.suggestedSeverity as IncidentSeverity,
      summary: parsed.summary,
      riskIndicators: parsed.riskIndicators || [],
      recommendedActions: parsed.recommendedActions || [],
      confidence: parsed.confidence || 0.95,
      method: 'gemini',
      keywords: parsed.keywords || [],
    };
  } catch (error) {
    console.warn('Gemini API call failed, falling back to rule-based analysis:', error);
    return analyzeIncident(title, description);
  }
}
