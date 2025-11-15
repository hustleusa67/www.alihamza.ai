import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import VideoGenerator from './components/VideoGenerator';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import ImageStudio from './pages/ImageStudio';
import AnimateImage from './pages/AnimateImage';
import VoiceChat from './pages/VoiceChat';
import GroundedSearch from './pages/GroundedSearch';

interface User {
  name: string;
  email: string;
}

const ProtectedRoute: React.FC<{ isAuthenticated: boolean; children: React.ReactNode }> = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User>({ name: "Demo User", email: "user@example.com" });
  const [apiKey, setApiKey] = useState<string | null>(null);

  const handleLogin = (name?: string, email?: string) => {
    if (name && email) {
      setUser({ name, email });
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setApiKey(null); // Also clear API key on logout
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleSetApiKey = (key: string) => {
    setApiKey(key);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Header isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {!isAuthenticated ? (
            <>
              <Route path="/login" element={<Auth onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<VideoGenerator apiKey={apiKey} />} />
              <Route path="/image-studio" element={<ImageStudio apiKey={apiKey} />} />
              <Route path="/animate-image" element={<AnimateImage apiKey={apiKey} />} />
              <Route path="/voice-chat" element={<VoiceChat apiKey={apiKey} />} />
              <Route path="/grounded-search" element={<GroundedSearch apiKey={apiKey} />} />
              <Route 
                path="/dashboard" 
                element={<Dashboard user={user} apiKey={apiKey} onUpdateUser={handleUpdateUser} onSetApiKey={handleSetApiKey} />} 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </main>
      <footer className="text-center py-4 text-dark-text-secondary text-sm">
        <p>&copy; {new Date().getFullYear()} VidGen AI. All rights reserved.</p>
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
}

export default App;