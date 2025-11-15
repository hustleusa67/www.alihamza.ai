import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Edit3, Sparkles, AlertTriangle, UploadCloud } from 'lucide-react';
import { generateImage, editImage } from '../services/geminiService';

interface ImageStudioProps {
  apiKey: string | null;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 py-3 px-6 rounded-t-lg transition-colors font-medium ${
      active ? 'bg-dark-surface border-dark-border border-b-0 text-dark-text' : 'text-dark-text-secondary hover:bg-dark-surface/50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const GeneratePanel: React.FC<{ apiKey: string | null }> = ({ apiKey }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
    const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleGenerate = async () => {
        if (!prompt.trim() || !apiKey) return;
        setStatus('generating');
        setError(null);
        setImageUrl(null);

        try {
            const resultUrl = await generateImage(prompt, aspectRatio, apiKey);
            setImageUrl(resultUrl);
            setStatus('success');
        } catch (err: any) {
            setError(err.message || "An error occurred during image generation.");
            setStatus('error');
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Generate Image</h2>
                <p className="text-dark-text-secondary">Describe the image you want to create.</p>
                <div>
                    <label className="text-sm font-medium text-dark-text-secondary mb-1 block">Prompt</label>
                    <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="A robot holding a red skateboard." className="w-full h-28 bg-dark-bg border border-dark-border rounded-lg p-2" disabled={status === 'generating'} />
                </div>
                <div>
                    <label className="text-sm font-medium text-dark-text-secondary mb-1 block">Aspect Ratio</label>
                    <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} className="w-full bg-dark-bg border border-dark-border rounded-md p-2">
                        <option value="1:1">Square (1:1)</option>
                        <option value="16:9">Landscape (16:9)</option>
                        <option value="9:16">Portrait (9:16)</option>
                        <option value="4:3">Standard (4:3)</option>
                        <option value="3:4">Tall (3:4)</option>
                    </select>
                </div>
                 <button onClick={handleGenerate} disabled={!prompt.trim() || status === 'generating' || !apiKey} className="w-full flex items-center justify-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50">
                    {status === 'generating' ? 'Generating...' : 'Generate'}
                </button>
                 {!apiKey && <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg"><AlertTriangle className="w-5 h-5 mr-2" /> Set API Key to Generate</button>}
            </div>
             <div className="bg-dark-bg w-full aspect-square rounded-lg border border-dark-border flex items-center justify-center p-2">
                {status === 'idle' && <div className="text-center text-dark-text-secondary"><Image className="w-16 h-16 mx-auto mb-4" /><p>Your image will appear here.</p></div>}
                {status === 'generating' && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>}
                {status === 'error' && <div className="text-center text-red-400"><AlertTriangle className="w-16 h-16 mx-auto mb-4" /><p>{error}</p></div>}
                {status === 'success' && imageUrl && <img src={imageUrl} alt="Generated" className="max-w-full max-h-full object-contain rounded-md" />}
            </div>
        </div>
    );
};

const EditPanel: React.FC<{ apiKey: string | null }> = ({ apiKey }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });

    const handleEdit = async () => {
        if (!prompt.trim() || !imageFile || !apiKey) return;
        setStatus('generating');
        setError(null);
        setEditedImageUrl(null);

        try {
            const base64Image = await fileToBase64(imageFile);
            const resultUrl = await editImage(prompt, base64Image, imageFile.type, apiKey);
            setEditedImageUrl(resultUrl);
            setStatus('success');
        } catch (err: any) {
            setError(err.message || "An error occurred during image editing.");
            setStatus('error');
        }
    };

    return (
         <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Edit Image</h2>
                    <p className="text-dark-text-secondary">Upload an image and describe the changes you want to make.</p>
                    
                    <div>
                        <label className="text-sm font-medium text-dark-text-secondary mb-1 block">1. Upload Image</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dark-border border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto rounded-md" /> : <UploadCloud className="mx-auto h-12 w-12 text-dark-text-secondary" />}
                                <div className="flex text-sm text-dark-text-secondary"><label htmlFor="file-upload" className="relative cursor-pointer bg-dark-bg rounded-md font-medium text-brand-primary hover:text-brand-secondary px-1"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" /></label></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-dark-text-secondary mb-1 block">2. Describe your edit</label>
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Add a retro filter" className="w-full h-24 bg-dark-bg border border-dark-border rounded-lg p-2" disabled={status === 'generating'} />
                    </div>
                    <button onClick={handleEdit} disabled={!prompt.trim() || !imageFile || status === 'generating' || !apiKey} className="w-full flex items-center justify-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50">
                        {status === 'generating' ? 'Editing...' : 'Edit Image'}
                    </button>
                    {!apiKey && <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg"><AlertTriangle className="w-5 h-5 mr-2" /> Set API Key to Edit</button>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold mb-2 text-center">Original</h3>
                        <div className="bg-dark-bg w-full aspect-square rounded-lg border border-dark-border flex items-center justify-center p-2">
                             {imagePreview ? <img src={imagePreview} alt="Original" className="max-w-full max-h-full object-contain rounded-md" /> : <div className="text-center text-xs text-dark-text-secondary">Upload an image</div>}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 text-center">Edited</h3>
                        <div className="bg-dark-bg w-full aspect-square rounded-lg border border-dark-border flex items-center justify-center p-2">
                            {status === 'idle' && <div className="text-center text-xs text-dark-text-secondary">Your edited image will appear here.</div>}
                            {status === 'generating' && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>}
                            {status === 'error' && <div className="text-center text-red-400 text-xs"><AlertTriangle className="w-8 h-8 mx-auto mb-2" /><p>{error}</p></div>}
                            {status === 'success' && editedImageUrl && <img src={editedImageUrl} alt="Edited" className="max-w-full max-h-full object-contain rounded-md" />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ImageStudio: React.FC<ImageStudioProps> = ({ apiKey }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-center border-b border-dark-border">
        <TabButton active={activeTab === 'generate'} onClick={() => setActiveTab('generate')} icon={<Sparkles />} label="Generate Image" />
        <TabButton active={activeTab === 'edit'} onClick={() => setActiveTab('edit')} icon={<Edit3 />} label="Edit Image" />
      </div>
      <div className="bg-dark-surface p-8 rounded-b-xl border border-t-0 border-dark-border">
        {activeTab === 'generate' ? <GeneratePanel apiKey={apiKey} /> : <EditPanel apiKey={apiKey} />}
      </div>
    </div>
  );
};

export default ImageStudio;
