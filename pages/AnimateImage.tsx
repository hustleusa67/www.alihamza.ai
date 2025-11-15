import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Film, Sparkles, AlertTriangle, Video } from 'lucide-react';
import { animateImage } from '../services/geminiService';

interface AnimateImageProps {
    apiKey: string | null;
}

const AnimateImage: React.FC<AnimateImageProps> = ({ apiKey }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const [progressMessage, setProgressMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };
    
    const handleAnimate = async () => {
        if (!imageFile || !apiKey) return;

        setStatus('generating');
        setError(null);
        setVideoUrl(null);
        setProgressMessage('Preparing image for animation...');

        try {
            const base64Image = await fileToBase64(imageFile);
            const generatedUrl = await animateImage(
                prompt,
                base64Image,
                imageFile.type,
                aspectRatio,
                setProgressMessage,
                apiKey
            );
            setVideoUrl(generatedUrl);
            setStatus('success');
        } catch (err: any) {
            setError(err.message || 'An error occurred during animation.');
            setStatus('error');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-dark-surface p-6 rounded-xl border border-dark-border shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Animate Image</h1>
                    <p className="text-dark-text-secondary mb-6">Bring your static images to life with AI.</p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-dark-text-secondary mb-2 block">1. Upload Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dark-border border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto rounded-md" />
                                    ) : (
                                        <UploadCloud className="mx-auto h-12 w-12 text-dark-text-secondary" />
                                    )}
                                    <div className="flex text-sm text-dark-text-secondary">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-dark-bg rounded-md font-medium text-brand-primary hover:text-brand-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-dark-surface focus-within:ring-brand-primary px-1">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-dark-text-secondary">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-dark-text-secondary mb-1 block">2. Add a Prompt (Optional)</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., A gentle breeze blows through the trees"
                                className="w-full h-20 bg-dark-bg border border-dark-border rounded-lg p-2 focus:ring-2 focus:ring-brand-primary transition-colors"
                                disabled={status === 'generating'}
                            />
                        </div>

                        <div>
                             <label className="text-sm font-medium text-dark-text-secondary mb-1 block">3. Select Aspect Ratio</label>
                            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')} className="w-full bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-1 focus:ring-brand-primary">
                               <option value="16:9">Landscape (16:9)</option>
                               <option value="9:16">Portrait (9:16)</option>
                            </select>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleAnimate}
                        disabled={!imageFile || status === 'generating' || !apiKey}
                        className="w-full mt-6 flex items-center justify-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'generating' ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>Animating...</> : <><Sparkles className="w-5 h-5 mr-2" />Animate Image</>}
                    </button>
                    {!apiKey && (
                        <button onClick={() => navigate('/dashboard')} className="w-full mt-4 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg">
                            <AlertTriangle className="w-5 h-5 mr-2" /> Set API Key in Dashboard to Use
                        </button>
                    )}
                </div>
            </div>
            <div className="lg:col-span-3">
                 <div className="bg-dark-surface w-full aspect-video rounded-xl border border-dark-border flex items-center justify-center p-2 sticky top-20 shadow-2xl">
                    {status === 'idle' && (
                        <div className="text-center text-dark-text-secondary">
                            <Film className="w-16 h-16 mx-auto mb-4" />
                            <h3 className="font-bold text-lg text-dark-text">Your animation will appear here</h3>
                            <p className="text-sm">Upload an image and click "Animate" to start.</p>
                        </div>
                    )}
                    {status === 'generating' && (
                        <div className="text-center">
                            <div className="relative w-24 h-24 mx-auto mb-6"><div className="absolute inset-0 border-4 border-dark-border rounded-full"></div><div className="absolute inset-0 border-4 border-brand-primary rounded-full animate-spin border-t-transparent"></div><div className="absolute inset-0 flex items-center justify-center"><Video className="w-10 h-10 text-brand-secondary" /></div></div>
                            <h3 className="font-bold text-lg text-dark-text animate-pulse">Animating your image...</h3>
                            <p className="text-sm text-dark-text-secondary mt-2 min-h-[20px]">{progressMessage}</p>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="text-center text-red-400 p-4">
                            <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
                            <h3 className="font-bold text-lg text-red-300">Animation Failed</h3>
                            <p className="text-sm mt-2">{error}</p>
                        </div>
                    )}
                    {status === 'success' && videoUrl && (
                        <video key={videoUrl} className="w-full h-full object-contain rounded-lg" controls autoPlay loop>
                            <source src={videoUrl} type="video/mp4" />
                        </video>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnimateImage;
