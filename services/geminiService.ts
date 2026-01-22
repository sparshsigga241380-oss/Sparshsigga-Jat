
import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, HumanHypothesis, AINudge, AIAnalysis } from '../types';

export class PedagogicalAIService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateSocraticNudges(patient: PatientData, hypothesis: HumanHypothesis): Promise<AINudge[]> {
    const prompt = `
      You are a senior medical professor mentoring a junior clinician in "Shadow Mode".
      The junior clinician has provided their hypothesis for a patient case.
      Your goal is NOT to give the answer, but to ask Socratic questions that challenge their logic or point out potential pitfalls.

      PATIENT CASE:
      - Age/Sex: ${patient.age} ${patient.sex}
      - Symptoms: ${patient.symptoms.join(', ')}
      - Vitals: HR ${patient.vitals.hr}, BP ${patient.vitals.bp}, Temp ${patient.vitals.temp}, O2 ${patient.vitals.o2}
      - History: ${patient.history}

      JUNIOR CLINICIAN HYPOTHESIS:
      - Diagnosis: ${hypothesis.diagnosis}
      - Reasoning: ${hypothesis.reasoning}

      Provide 3 "Nudges" in JSON format. Each nudge should have:
      1. "content": A thought-provoking socratic question.
      2. "commonMistake": The cognitive bias or common medical error this question helps avoid.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                commonMistake: { type: Type.STRING }
              },
              required: ["content", "commonMistake"]
            }
          }
        }
      });

      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("Error generating nudges:", error);
      return [];
    }
  }

  async getAIDiagnosis(patient: PatientData): Promise<AIAnalysis> {
    const prompt = `
      Act as a high-level diagnostic expert system. 
      Analyze the following patient data and provide the most likely primary diagnosis and a confidence percentage (1-100).

      PATIENT CASE:
      - Age/Sex: ${patient.age} ${patient.sex}
      - Symptoms: ${patient.symptoms.join(', ')}
      - Vitals: HR ${patient.vitals.hr}, BP ${patient.vitals.bp}, Temp ${patient.vitals.temp}, O2 ${patient.vitals.o2}
      - History: ${patient.history}

      Provide the response in JSON format.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnosis: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            },
            required: ["diagnosis", "confidence"]
          }
        }
      });

      return JSON.parse(response.text || '{"diagnosis": "Inconclusive", "confidence": 0}');
    } catch (error) {
      console.error("Error generating AI diagnosis:", error);
      return { diagnosis: "Error in analysis", confidence: 0 };
    }
  }
}
