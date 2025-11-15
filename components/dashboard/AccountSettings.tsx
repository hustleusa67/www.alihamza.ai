import React, { useState, useEffect } from 'react';
import { KeyRound, Save, CheckCircle } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
}

interface AccountSettingsProps {
    user: UserData;
    apiKey: string | null;
    onUpdateUser: (user: UserData) => void;
    onSetApiKey: (key: string) => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user, apiKey: initialApiKey, onUpdateUser, onSetApiKey }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [apiKeyInput, setApiKeyInput] = useState(initialApiKey || '');
    const [isEditingKey, setIsEditingKey] = useState(false);
    const [keySaved, setKeySaved] = useState(false);

    useEffect(() => {
        setApiKeyInput(initialApiKey || '');
    }, [initialApiKey]);

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser({ name, email });
    };
    
    const handleApiKeySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKeyInput.trim()) {
            onSetApiKey(apiKeyInput.trim());
            setIsEditingKey(false);
            setKeySaved(true);
            setTimeout(() => setKeySaved(false), 3000);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
            
            <form onSubmit={handleProfileSubmit} className="space-y-4 mb-10">
                <div>
                    <label className="text-sm font-medium text-dark-text-secondary mb-1 block">Full Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-1 focus:ring-brand-primary"
                    />
                </div>
                 <div>
                    <label className="text-sm font-medium text-dark-text-secondary mb-1 block">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-1 focus:ring-brand-primary"
                    />
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="flex items-center justify-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                        <Save className="w-4 h-4 mr-2"/> Save Changes
                    </button>
                </div>
            </form>

            <div className="border-t border-dark-border pt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center"><KeyRound className="w-5 h-5 mr-2 text-brand-secondary"/> API Key Management</h3>
                <p className="text-sm text-dark-text-secondary mb-4">Your API key is used to generate videos with the Gemini API. Keep it safe and do not share it publicly.</p>
                <form onSubmit={handleApiKeySubmit} className="space-y-2">
                    <div>
                        <label htmlFor="api-key-input" className="text-sm font-medium text-dark-text-secondary mb-1 block">Your Gemini API Key</label>
                        <div className="flex items-center space-x-2">
                            <input 
                                id="api-key-input"
                                type={isEditingKey ? 'text' : 'password'}
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                disabled={!isEditingKey}
                                placeholder={isEditingKey ? "Paste your API key here" : "••••••••••••••••••••"}
                                className="w-full bg-dark-bg border border-dark-border rounded-md p-2 font-mono disabled:opacity-70"
                            />
                            {isEditingKey ? (
                                <button type="submit" className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm">
                                    Save
                                </button>
                            ) : (
                                <button type="button" onClick={() => setIsEditingKey(true)} className="flex-shrink-0 bg-dark-border hover:bg-brand-primary text-white font-bold py-2 px-4 rounded-lg text-sm">
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                    {keySaved && (
                        <p className="text-sm text-green-400 flex items-center transition-opacity duration-300">
                            <CheckCircle className="w-4 h-4 mr-2"/> API Key saved successfully!
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;