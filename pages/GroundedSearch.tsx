import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, AlertTriangle } from 'lucide-react';
import { groundedSearch } from '../services/geminiService';
import { GroundingResult } from '../types';

interface GroundedSearchProps {
    apiKey: string | null;
}

const GroundedSearch: React.FC<GroundedSearchProps> = ({ apiKey }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GroundingResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSearch = async () => {
        if (!prompt.trim() || !apiKey) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const searchResult = await groundedSearch(prompt, apiKey);
            setResult(searchResult);
        } catch (err: any) {
            setError(err.message || 'An error occurred during the search.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-dark-surface p-6 rounded-xl border border-dark-border shadow-lg text-center">
                <h1 className="text-3xl font-bold mb-2">Grounded Search</h1>
                <p className="text-dark-text-secondary mb-6">Get up-to-date, factual answers powered by Google Search.</p>
                
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Who won the last soccer world cup?"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-brand-primary transition-colors"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={!prompt.trim() || isLoading || !apiKey}
                        className="flex items-center justify-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Search className="w-5 h-5" />}
                    </button>
                </div>
                {!apiKey && (
                    <button onClick={() => navigate('/dashboard')} className="w-full mt-4 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg">
                        <AlertTriangle className="w-5 h-5 mr-2" /> Set API Key in Dashboard to Use
                    </button>
                )}
            </div>

            {isLoading && (
                 <div className="text-center p-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
                    <p className="mt-4 text-dark-text-secondary">Searching the web for answers...</p>
                 </div>
            )}

            {error && (
                <div className="mt-6 bg-red-900/20 border border-red-500/30 text-red-300 p-4 rounded-lg text-center">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="font-bold">Search Failed</h3>
                    <p className="text-sm">{error}</p>
                </div>
            )}
            
            {result && (
                <div className="mt-6 bg-dark-surface p-6 rounded-xl border border-dark-border">
                    <h2 className="text-xl font-semibold mb-4">Response</h2>
                    <div className="prose prose-invert max-w-none text-dark-text" style={{whiteSpace: 'pre-wrap'}}>
                       {result.text}
                    </div>

                    {result.chunks && result.chunks.length > 0 && (
                        <div className="mt-6 border-t border-dark-border pt-4">
                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <Globe className="w-5 h-5 mr-2 text-brand-secondary"/> Sources
                            </h3>
                            <ul className="space-y-2">
                                {result.chunks.filter(c => c.web && c.web.uri).map((chunk, index) => (
                                    <li key={index}>
                                        <a href={chunk.web?.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-secondary hover:underline hover:text-brand-primary truncate block">
                                            {chunk.web?.title || chunk.web?.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GroundedSearch;
