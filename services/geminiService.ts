
import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';

// In a real application, this would be handled by environment variables.
// The execution environment is expected to have process.env.API_KEY set.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This will prevent the app from running if the API key is not set.
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash-image-preview';

interface ImageInput {
  base64: string;
  mimeType: string;
}

const fileToBase64 = (file: File): Promise<ImageInput> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = result.split(';')[0].split(':')[1];
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};

const generateSingleImage = async (
  personImage: ImageInput,
  garmentImage: ImageInput,
  aspectRatio: string,
  userPrompt: string
): Promise<string> => {
  let prompt = `
    You are an expert virtual stylist AI.
    Your task is to generate a photorealistic image of the person from the first image wearing the garment from the second image.
    - Seamlessly blend the clothing onto the person, respecting their body shape, pose, and the lighting of the original photo.
    - The output should be a high-quality, realistic image.
    - The final image MUST have a ${aspectRatio} aspect ratio.
    - The background should be clean and neutral, enhancing the focus on the person and the new outfit.
  `;

  if (userPrompt) {
      prompt += `\n- Additional user instructions: ${userPrompt}`;
  }


  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { data: personImage.base64, mimeType: personImage.mimeType } },
          { inlineData: { data: garmentImage.base64, mimeType: garmentImage.mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    } else {
      const textResponse = response.text || 'No text response available.';
      throw new Error(`API did not return an image. Response: ${textResponse}`);
    }
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate virtual try-on image: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the image.');
  }
};


export const generateTryOnImages = async (
  personFile: File,
  garmentFile: File,
  count: number,
  aspectRatio: string,
  prompt: string
): Promise<string[]> => {
    const personImageInput = await fileToBase64(personFile);
    const garmentImageInput = await fileToBase64(garmentFile);

    const imagePromises = Array(count).fill(0).map(() => 
        generateSingleImage(personImageInput, garmentImageInput, aspectRatio, prompt)
    );

    const results = await Promise.all(imagePromises);
    return results;
};
