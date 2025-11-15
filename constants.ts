import { AspectRatio, Voice, Template, Pacing } from './types';

export const ASPECT_RATIOS: { id: AspectRatio; name: string }[] = [
  { id: '9:16', name: 'Portrait (TikTok, Reels, Shorts)' },
  { id: '16:9', name: 'Landscape (YouTube)' },
  { id: '1:1', name: 'Square (Instagram Post)' },
];

export const PACING_OPTIONS: { id: Pacing; name: string; promptModifier: string }[] = [
    { id: 'Medium', name: 'Medium', promptModifier: '' },
    { id: 'Fast', name: 'Fast', promptModifier: 'fast-paced, quick cuts, high energy, ' },
    { id: 'Slow', name: 'Slow', promptModifier: 'slow-paced, cinematic, lingering shots, ' },
];

export const VOICES: Voice[] = [
  { id: 'us-male-1', name: 'American Male', gender: 'Male', accent: 'US', apiName: 'Zephyr' },
  { id: 'us-female-1', name: 'American Female', gender: 'Female', accent: 'US', apiName: 'Kore' },
  { id: 'uk-male-1', name: 'British Male', gender: 'Male', accent: 'UK', apiName: 'Puck' },
  { id: 'uk-female-1', name: 'British Female', gender: 'Female', accent: 'UK', apiName: 'Charon' },
  { id: 'arabic-male-1', name: 'Arabic Male', gender: 'Male', accent: 'Arabic', apiName: 'Fenrir' }, // Fenrir is generic, using as example
];

export const TEMPLATES: Template[] = [
  { 
    id: 'default', 
    name: 'Default Style', 
    promptPrefix: '',
    description: 'A clean, standard style with no specific visual effects applied.'
  },
  { 
    id: 'cinematic', 
    name: 'Cinematic', 
    promptPrefix: 'cinematic, epic lighting, high definition, dramatic color grading, ',
    description: 'Creates a dramatic, movie-like feel with epic lighting and rich colors.'
  },
  { 
    id: 'vintage', 
    name: 'Vintage Film', 
    promptPrefix: 'vintage film look, 8mm film grain, sepia tones, light leaks, ',
    description: 'Mimics the look of old 8mm film, with grain, sepia tones, and light leaks.'
  },
  { 
    id: 'anime', 
    name: 'Anime', 
    promptPrefix: 'anime style, vibrant colors, cel shading, Japanese animation aesthetic, ',
    description: 'Generates visuals in a vibrant, cel-shaded Japanese anime style.'
  },
  { 
    id: 'neon', 
    name: 'Neon Noir', 
    promptPrefix: 'neon noir style, cyberpunk, glowing lights, rainy city streets, futuristic, ',
    description: 'A futuristic, cyberpunk look with glowing neon lights and dark, rainy cityscapes.'
  },
];

export const GENERATION_MESSAGES = [
  "Warming up the AI... this can take a moment.",
  "Analyzing your prompt for creative direction...",
  "Generating script from your topic...",
  "Casting AI actors for your video...",
  "Rendering scene 1: The opening shot...",
  "Generating realistic voiceover...",
  "Searching for perfect B-roll footage...",
  "Syncing audio and video tracks...",
  "Applying trendy template styles...",
  "Adding automatic subtitles...",
  "Composing a fitting background score...",
  "Finalizing render... almost there!",
  "Polishing the final cut...",
  "Running quality checks...",
];