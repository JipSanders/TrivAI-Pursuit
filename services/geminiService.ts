import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, QuestionResponse, AspectRatio, ImageSize } from "../types";

// Helper to get a fresh AI client. 
// Crucial for the Image Generation flow where the API key might change dynamically via the selector.
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateTriviaQuestion = async (category: string, difficulty: string): Promise<Question> => {
  const ai = getAiClient();
  
  const prompt = `Generate a unique and interesting trivia question about ${category} with ${difficulty} difficulty. 
  The output must be a valid JSON object.`;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      correct_answer: { type: Type.STRING },
      incorrect_answers: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Three incorrect answers"
      }
    },
    required: ["question", "correct_answer", "incorrect_answers"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.8
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as QuestionResponse;
    return {
      questionText: data.question,
      correctAnswer: data.correct_answer,
      incorrectAnswers: data.incorrect_answers,
      category: category
    };
  } catch (error) {
    console.error("Error generating question:", error);
    // Fallback question to prevent app crash
    return {
      questionText: "Who is known as the father of modern physics?",
      correctAnswer: "Albert Einstein",
      incorrectAnswers: ["Isaac Newton", "Galileo Galilei", "Nikola Tesla"],
      category: "Science"
    };
  }
};

export const generateRewardImage = async (
  prompt: string, 
  aspectRatio: AspectRatio, 
  size: ImageSize
): Promise<string> => {
  const ai = getAiClient();
  
  // According to instructions, we use gemini-3-pro-image-preview for high quality images
  // and specific control over size/aspect ratio.
  const model = 'gemini-3-pro-image-preview';

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: size
        }
      }
    });

    // Parse response for image
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated in response");
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};
