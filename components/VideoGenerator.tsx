import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AspectRatio, GenerationStatus, Voice, Template, Pacing, Scene, Clip, TextOverlay } from '../types';
import { ASPECT_RATIOS, VOICES, TEMPLATES, GENERATION_MESSAGES, PACING_OPTIONS } from '../constants';
import { generateVideo, generateVoiceover } from '../services/geminiService';
import { Sparkles, Video, Download, AlertTriangle, Film, Mic, Settings, Plus, Trash2, Edit } from 'lucide-react';

interface VideoGeneratorProps {
    apiKey: string | null;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ apiKey }) => {
  const [scenes, setScenes] = useState<Scene[]>([{ id: crypto.randomUUID(), prompt: '' }]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [pacing, setPacing] = useState<Pacing>('Medium');
  const [voice, setVoice] = useState<Voice>(VOICES[0]);
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const [clips, setClips] = useState<Clip[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [progressMessage, setProgressMessage] = useState<string>('');
  const [editorMode, setEditorMode] = useState(false);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [newText, setNewText] = useState('');

  const [exportFormat, setExportFormat] = useState<'mp4' | 'mov'>('mp4');
  const [exportAspectRatio, setExportAspectRatio] = useState<AspectRatio>(aspectRatio);

  const messageIntervalRef = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setExportAspectRatio(aspectRatio);
  }, [aspectRatio]);

  const handleGenerate = async () => {
    const validScenes = scenes.filter(s => s.prompt.trim());
    if (validScenes.length === 0 || status === 'generating' || !apiKey) return;

    setStatus('generating');
    setError(null);
    setClips([]);
    setAudioUrl(null);
    setEditorMode(false);
    let messageIndex = 0;
    setProgressMessage(GENERATION_MESSAGES[messageIndex]);

    messageIntervalRef.current = window.setInterval(() => {
      messageIndex = (messageIndex + 1) % GENERATION_MESSAGES.length;
      setProgressMessage(GENERATION_MESSAGES[messageIndex]);
    }, 4000);

    try {
      const selectedPacing = PACING_OPTIONS.find(p => p.id === pacing);
      
      const updateProgress = (message: string, isFinal: boolean) => {
        if (isFinal && messageIntervalRef.current) clearInterval(messageIntervalRef.current);
        setProgressMessage(message);
      };
      
      const fullVoiceoverScript = validScenes.map(s => s.prompt).join('. ');
      const genAudioPromise = generateVoiceover(fullVoiceoverScript, voice, apiKey);

      const generatedClips: Clip[] = [];
      for (let i = 0; i < validScenes.length; i++) {
        const scene = validScenes[i];
        updateProgress(`Generating video for scene ${i + 1}/${validScenes.length}...`, false);
        const fullPrompt = `${template.promptPrefix}${selectedPacing?.promptModifier || ''}${scene.prompt}`;
        const videoUrl = await generateVideo(fullPrompt, aspectRatio, (msg) => updateProgress(msg, false), apiKey);
        generatedClips.push({ id: crypto.randomUUID(), sceneId: scene.id, videoUrl, startTime: 0, endTime: null });
      }

      const generatedAudioUrl = await genAudioPromise;
      setAudioUrl(generatedAudioUrl);
      
      setClips(generatedClips);
      setStatus('success');
      setEditorMode(true);
    } catch (err: any) {
      console.error(err);
      let errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
       if (errorMessage.includes("API Key") || errorMessage.includes("permission denied") || err.message.includes("API key not valid")) {
        errorMessage = "Your API Key is invalid or lacks permissions. Please update it in your dashboard.";
      }
      setError(errorMessage);
      setStatus('error');
    } finally {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    }
  };

  const handleAddScene = () => setScenes([...scenes, { id: crypto.randomUUID(), prompt: '' }]);
  const handleRemoveScene = (id: string) => setScenes(scenes.filter(s => s.id !== id));
  const handleSceneChange = (id: string, prompt: string) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, prompt } : s));
  };

  const handleAddTextOverlay = () => {
      if (newText.trim()) {
          setTextOverlays([...textOverlays, { id: crypto.randomUUID(), text: newText.trim() }]);
          setNewText('');
      }
  }
  
  const handleExport = () => {
    const clipToExport = clips[0];
    if (!clipToExport || !clipToExport.videoUrl) {
      alert("No video available to export.");
      return;
    }

    const a = document.createElement('a');
    a.href = clipToExport.videoUrl;
    a.download = `VidGen_AI_${exportAspectRatio.replace(':', 'x')}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const OptionCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-dark-surface p-4 rounded-lg border border-dark-border">
      <div className="flex items-center mb-3">
        {icon}
        <h3 className="font-semibold ml-2">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-dark-surface p-6 rounded-xl border border-dark-border shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-brand-secondary" />
            Create Your AI Video
          </h2>
          <div className="space-y-3">
            {scenes.map((scene, index) => (
                <div key={scene.id} className="flex items-center space-x-2">
                    <span className="font-bold text-dark-text-secondary">{index + 1}</span>
                    <textarea
                        className="w-full h-20 bg-dark-bg border border-dark-border rounded-lg p-2 focus:ring-2 focus:ring-brand-primary transition-colors placeholder-dark-text-secondary"
                        placeholder={`Scene ${index + 1} prompt...`}
                        value={scene.prompt}
                        onChange={(e) => handleSceneChange(scene.id, e.target.value)}
                        disabled={status === 'generating'}
                    />
                    <button onClick={() => handleRemoveScene(scene.id)} disabled={scenes.length <= 1} className="p-2 rounded-full hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed">
                        <Trash2 className="w-5 h-5 text-red-500"/>
                    </button>
                </div>
            ))}
          </div>
          <button onClick={handleAddScene} className="mt-4 text-sm flex items-center text-brand-secondary hover:text-brand-primary font-medium">
            <Plus className="w-4 h-4 mr-1"/> Add Scene
          </button>
        </div>

        <OptionCard icon={<Settings className="w-5 h-5 text-brand-secondary" />} title="Video Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-dark-text-secondary mb-1 block">Aspect Ratio</label>
                    <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-1 focus:ring-brand-primary">
                        {ASPECT_RATIOS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-dark-text-secondary mb-1 block">Video Style</label>
                    <select value={template.id} onChange={(e) => setTemplate(TEMPLATES.find(t => t.id === e.target.value) || TEMPLATES[0])} className="w-full bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-1 focus:ring-brand-primary">
                        {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <div className="mt-2 p-2 bg-dark-bg rounded-md">
                        <p className="text-xs text-dark-text-secondary">{template.description}</p>
                    </div>
                </div>
                 <div className="md:col-span-2">
                    <label className="text-sm font-medium text-dark-text-secondary mb-1 block">Pacing</label>
                    <select value={pacing} onChange={(e) => setPacing(e.target.value as Pacing)} className="w-full bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-1 focus:ring-brand-primary">
                        {PACING_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>
        </OptionCard>
        
        <OptionCard icon={<Mic className="w-5 h-5 text-brand-secondary" />} title="AI Voiceover">
             <select value={voice.id} onChange={(e) => setVoice(VOICES.find(v => v.id === e.target.value) || VOICES[0])} className="w-full bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-1 focus:ring-brand-primary">
                {VOICES.map(v => <option key={v.id} value={v.id}>{`${v.name} (${v.accent} ${v.gender})`}</option>)}
            </select>
        </OptionCard>
        
        <button
          onClick={handleGenerate}
          disabled={scenes.every(s => !s.prompt.trim()) || status === 'generating' || !apiKey}
          className="w-full flex items-center justify-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'generating' ? (
            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>Generating...</>
          ) : (
            <><Sparkles className="w-5 h-5 mr-2" />Generate Video</>
          )}
        </button>
        {!apiKey && (
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg">
              <AlertTriangle className="w-5 h-5 mr-2" /> Set API Key in Dashboard to Generate
            </button>
        )}
      </div>
      <div className="lg:col-span-3">
        <div className="bg-dark-surface w-full aspect-video rounded-xl border border-dark-border flex items-center justify-center p-2 sticky top-20 shadow-2xl">
          {status === 'idle' && (
            <div className="text-center text-dark-text-secondary">
              <Film className="w-16 h-16 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-dark-text">Your video will appear here</h3>
              <p className="text-sm">Enter a prompt and click "Generate Video" to start.</p>
            </div>
          )}
          {status === 'generating' && (
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6"><div className="absolute inset-0 border-4 border-dark-border rounded-full"></div><div className="absolute inset-0 border-4 border-brand-primary rounded-full animate-spin border-t-transparent"></div><div className="absolute inset-0 flex items-center justify-center"><Video className="w-10 h-10 text-brand-secondary" /></div></div>
              <h3 className="font-bold text-lg text-dark-text animate-pulse">Generating your masterpiece...</h3>
              <p className="text-sm text-dark-text-secondary mt-2 min-h-[20px]">{progressMessage}</p>
            </div>
          )}
           {status === 'error' && (
            <div className="text-center text-red-400 p-4">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-red-300">Generation Failed</h3>
              <p className="text-sm mt-2">{error}</p>
            </div>
          )}
          {(status === 'success' || editorMode) && clips.length > 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center relative group">
                <video key={clips[0].videoUrl} className="w-full h-full object-contain rounded-lg" controls autoPlay loop>
                    <source src={clips[0].videoUrl} type="video/mp4" />
                </video>
                 <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-2">
                    {textOverlays.map(overlay => (
                        <div key={overlay.id} className="text-white text-2xl font-bold p-2 bg-black/50 rounded" style={{ textShadow: '2px 2px 4px #000000' }}>
                           {overlay.text}
                        </div>
                    ))}
                </div>
                {audioUrl && <div className="absolute bottom-4 left-4 right-4 bg-black/50 p-2 rounded-lg backdrop-blur-sm"><audio key={audioUrl} src={audioUrl} controls className="w-full" /></div>}
            </div>
          )}
        </div>
        
        {editorMode && (
          <div className="mt-6 bg-dark-surface p-4 rounded-lg border border-dark-border space-y-4">
            <h3 className="font-semibold text-lg flex items-center"><Edit className="w-5 h-5 mr-2"/>Video Editor</h3>
            
            <div>
                <h4 className="font-medium mb-2 text-dark-text-secondary">Timeline / Clips</h4>
                <div className="flex space-x-2 p-2 bg-dark-bg rounded-md overflow-x-auto">
                    {clips.map((clip, index) => (
                        <div key={clip.id} className="flex-shrink-0 w-32 text-center">
                           <video src={clip.videoUrl} className="w-full h-20 object-cover rounded-md border-2 border-transparent hover:border-brand-primary"/>
                           <p className="text-xs mt-1">Clip {index + 1}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-medium mb-2 text-dark-text-secondary">Tools</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-dark-bg p-3 rounded-md">
                        <label className="text-sm font-medium">Add Text Overlay</label>
                        <div className="flex space-x-2 mt-2">
                            <input type="text" value={newText} onChange={e => setNewText(e.target.value)} placeholder="Enter text..." className="w-full bg-dark-surface border border-dark-border rounded-md p-2"/>
                            <button onClick={handleAddTextOverlay} className="bg-brand-primary p-2 rounded-md"><Plus className="w-5 h-5"/></button>
                        </div>
                    </div>
                    <div className="bg-dark-bg p-3 rounded-md">
                        <label className="text-sm font-medium">Trim Clip (Conceptual)</label>
                         <p className="text-xs text-dark-text-secondary mt-1">Select a clip in the timeline to set start/end times.</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-dark-border pt-4">
                <h4 className="font-medium mb-2 text-dark-text-secondary">Export Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-dark-bg p-3 rounded-md">
                        <label htmlFor="format-select" className="text-sm font-medium mb-2 block">File Format</label>
                        <select
                            id="format-select"
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value as 'mp4' | 'mov')}
                            className="w-full bg-dark-surface border border-dark-border rounded-md p-2 focus:ring-1 focus:ring-brand-primary"
                        >
                            <option value="mp4">MP4</option>
                            <option value="mov">MOV (simulated)</option>
                        </select>
                    </div>
                    <div className="bg-dark-bg p-3 rounded-md">
                        <label htmlFor="aspect-ratio-export" className="text-sm font-medium mb-2 block">Aspect Ratio</label>
                        <select
                            id="aspect-ratio-export"
                            value={exportAspectRatio}
                            onChange={(e) => setExportAspectRatio(e.target.value as AspectRatio)}
                            className="w-full bg-dark-surface border border-dark-border rounded-md p-2 focus:ring-1 focus:ring-brand-primary"
                        >
                            {ASPECT_RATIOS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <button onClick={handleExport} className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform active:scale-95">
                <Download className="w-5 h-5 mr-2"/> Export Final Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;