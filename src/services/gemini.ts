import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function parseQuestionsFromImage(base64Image: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Analyze this image of academic questions. Extract ALL individual questions found in the image. 
            For each question, identify:
            1. The question text.
            2. The type (multiple choice 'choice' or fill-in-the-blank 'blank').
            3. Options (if multiple choice).
            4. The correct answer.
            5. A brief explanation in Chinese.
            6. Relevant tags (e.g., Grammar, Geometry, Mechanics).
            7. The subject (e.g., "英语", "数学", "语文", "物理", "化学", "生物").
            
            Return the result as an array of objects in JSON format. All explanations MUST be in Chinese.`,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      systemInstruction: "You are a versatile academic teacher. When analyzing questions, you MUST provide all explanations and analyses in Chinese. This is a strict requirement. Identify the subject correctly.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The question text" },
            type: { type: Type.STRING, enum: ["choice", "blank"], description: "The type of question" },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of options for multiple choice questions" 
            },
            answer: { type: Type.STRING, description: "The correct answer" },
            explanation: { type: Type.STRING, description: "Brief explanation of the answer" },
            subject: { type: Type.STRING, description: "The subject of the question" },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Suggested tags for the question" 
            },
          },
          required: ["text", "type", "answer", "subject"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
}
