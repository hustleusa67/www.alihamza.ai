import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob as GenaiBlob } from "@google/genai";
import { encode } from '../services/geminiService';
import { Mic, MicOff, AlertTriangle } from 'lucide-react';

interface VoiceChatProps {
    apiKey: string | null;
}

// Audio decoding utilities
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
}


const VoiceChat: React.FC<VoiceChatProps> = ({ apiKey }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const cleanup = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
         if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        setIsActive(false);
        setIsConnecting(false);
    };

    useEffect(() => {
        return () => cleanup();
    }, []);

    const startConversation = async () => {
        if (!apiKey) {
            setError("API Key is required. Please set it in your dashboard.");
            return;
        }
        if (isActive || isConnecting) return;

        setIsConnecting(true);
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            const ai = new GoogleGenAI({ apiKey });
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                },
                callbacks: {
                    onopen: () => {
                        setIsConnecting(false);
                        setIsActive(true);
                        
                        const source = audioContextRef.current!.createMediaStreamSource(stream);
                        const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
                            
                            const pcmBlob: GenaiBlob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
                            }
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(audioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const outputCtx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            
                            source.addEventListener('ended', () => sourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live API Error:', e);
                        setError("A connection error occurred. Please try again.");
                        cleanup();
                    },
                    onclose: (e: CloseEvent) => cleanup(),
                }
            });
        } catch (err) {
            console.error(err);
            setError("Failed to access microphone. Please grant permission and try again.");
            cleanup();
        }
    };
    
    const stopConversation = () => {
      cleanup();
    };

    return (
        <div className="max-w-md mx-auto text-center">
            <div className="bg-dark-surface p-8 rounded-xl border border-dark-border shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Live Voice Chat</h1>
                <p className="text-dark-text-secondary mb-8">Have a real-time conversation with AI.</p>

                <div className="flex items-center justify-center h-48">
                    <button
                        onClick={isActive ? stopConversation : startConversation}
                        disabled={isConnecting || !apiKey}
                        className={`relative flex items-center justify-center w-32 h-32 rounded-full transition-colors duration-300 disabled:opacity-50 ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-primary hover:bg-brand-secondary'}`}
                    >
                        {isConnecting ? <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div> : (isActive ? <MicOff size={48} /> : <Mic size={48} />)}
                        {isActive && <span className="absolute w-full h-full rounded-full bg-red-500 animate-ping opacity-75"></span>}
                    </button>
                </div>

                <p className="h-6 mt-4 text-sm font-medium">
                    {isConnecting ? "Connecting..." : (isActive ? "Conversation is live..." : "Tap to start conversation")}
                </p>

                {!apiKey && (
                    <button onClick={() => navigate('/dashboard')} className="w-full mt-4 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg">
                        <AlertTriangle className="w-5 h-5 mr-2" /> Set API Key to Use
                    </button>
                )}
                 {error && (
                    <div className="mt-4 text-red-400 text-sm">
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceChat;
