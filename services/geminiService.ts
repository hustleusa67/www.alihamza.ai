import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { AspectRatio, Voice, GroundingChunk, GroundingResult } from "../types";

export const generateVideo = async (
  prompt: string,
  aspectRatio: AspectRatio,
  onProgress: (message: string) => void,
  apiKey: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is required for video generation.");
  const ai = new GoogleGenAI({ apiKey });
  
  onProgress("Initializing video generation...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  let pollCount = 0;
  onProgress("Video generation started. This may take a few minutes...");
  while (!operation.done) {
    pollCount++;
    const waitTime = Math.min(30000, 10000 * pollCount); // wait longer on subsequent polls
    onProgress(`Checking progress... (Attempt ${pollCount})`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    try {
      operation = await ai.operations.getVideosOperation({ operation: operation });
    } catch (error) {
      console.error("Error polling for video status:", error);
      // Let it retry on the next loop
    }
  }

  onProgress("Finalizing video...");
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation completed, but no download link was found.");
  }

  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  if (!response.ok) {
    throw new Error(`Failed to download video file: ${response.statusText}`);
  }
  
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
};

/**
 * Decodes a base64 string into a Uint8Array.
 * @param base64 The base64 string to decode.
 * @returns The decoded Uint8Array.
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes a Uint8Array into a base64 string.
 * @param bytes The Uint8Array to encode.
 * @returns The encoded base64 string.
 */
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Adds a WAV header to raw PCM data to create a playable audio file.
 * @param pcmData The raw PCM audio data.
 * @param sampleRate The sample rate of the audio.
 * @param numChannels The number of audio channels.
 * @param bitsPerSample The number of bits per sample.
 * @returns A Blob representing the WAV file.
 */
const addWavHeader = (pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Blob => {
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');

    // fmt sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size for PCM
    view.setUint16(20, 1, true); // AudioFormat for PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    view.setUint32(28, byteRate, true);
    const blockAlign = numChannels * (bitsPerSample / 8);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data sub-chunk
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM data
    for (let i = 0; i < pcmData.length; i++) {
        view.setUint8(44 + i, pcmData[i]);
    }
    
    return new Blob([view], { type: 'audio/wav' });
};

export const generateVoiceover = async (
  text: string,
  voice: Voice,
  apiKey: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is required for voiceover generation.");
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Please say the following with a clear and engaging tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice.apiName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Audio generation failed, no audio data received.");
  }
  
  const audioBytes = decode(base64Audio);
  const audioBlob = addWavHeader(audioBytes, 24000, 1, 16);
  return URL.createObjectURL(audioBlob);
};

export const generateImage = async (
  prompt: string,
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
  apiKey: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is required for image generation.");
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: aspectRatio,
    },
  });

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const editImage = async (
  prompt: string,
  base64Image: string,
  mimeType: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is required for image editing.");
  const ai = new GoogleGenAI({ apiKey });

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
  if (imagePart && imagePart.inlineData) {
    const base64ImageBytes: string = imagePart.inlineData.data;
    const imageMimeType = imagePart.inlineData.mimeType;
    return `data:${imageMimeType};base64,${base64ImageBytes}`;
  }

  throw new Error("Image editing failed, no image data received.");
};

export const animateImage = async (
  prompt: string | null,
  base64Image: string,
  mimeType: string,
  aspectRatio: "16:9" | "9:16",
  onProgress: (message: string) => void,
  apiKey: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is required for image animation.");
  const ai = new GoogleGenAI({ apiKey });
  
  onProgress("Initializing image animation...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || "Animate this image.",
    image: {
      imageBytes: base64Image,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  let pollCount = 0;
  onProgress("Animation started. This may take a few minutes...");
  while (!operation.done) {
    pollCount++;
    const waitTime = Math.min(30000, 10000 * pollCount);
    onProgress(`Checking progress... (Attempt ${pollCount})`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    try {
      operation = await ai.operations.getVideosOperation({ operation: operation });
    } catch (error) {
      console.error("Error polling for animation status:", error);
    }
  }

  onProgress("Finalizing animation...");
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Animation completed, but no download link was found.");
  }

  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  if (!response.ok) {
    throw new Error(`Failed to download video file: ${response.statusText}`);
  }
  
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
};

export const groundedSearch = async (
  prompt: string,
  apiKey: string
): Promise<GroundingResult> => {
  if (!apiKey) throw new Error("API Key is required for grounded search.");
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{googleSearch: {}}],
    },
  });

  const text = response.text;
  const chunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[];
  
  return { text, chunks };
};