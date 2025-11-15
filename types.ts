
export type AspectRatio = "9:16" | "16:9" | "1:1";
export type GenerationStatus = "idle" | "generating" | "success" | "error";
export type Pacing = "Fast" | "Medium" | "Slow";

export interface Voice {
  id: string;
  name: string;
  gender: "Male" | "Female";
  accent: "US" | "UK" | "Arabic";
  apiName: string;
}

export interface Template {
  id: string;
  name: string;
  promptPrefix: string;
  description: string;
}

export interface GenerationResult {
  videoUrl: string;
  audioUrl: string;
  subtitles: string;
}

// New types for multi-scene and editing
export interface Scene {
    id: string;
    prompt: string;
}

export interface Clip {
    id: string;
    sceneId: string;
    videoUrl: string;
    startTime: number;
    endTime: number | null; // null means to the end of the clip
}

export interface TextOverlay {
    id: string;
    text: string;
    // Position, timing etc. would go here in a real app
}

// New types for Grounded Search
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingResult {
  text: string;
  chunks: GroundingChunk[];
}