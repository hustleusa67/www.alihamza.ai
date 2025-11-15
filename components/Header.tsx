
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Film, User, LogOut, ChevronDown } from 'lucide-react';

interface HeaderProps {
    isAuthenticated: boolean;
    user: { name: string };
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, user, onLogout }) => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors ${isActive ? 'text-dark-text' : 'text-dark-text-secondary hover:text-dark-text'}`;

  return (
    <header className="bg-dark-surface/80 backdrop-blur-sm sticky top-0 z-50 border-b border-dark-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-4">
            <Film className="w-8 h-8 text-brand-primary" />
            <h1 className="text-xl font-bold text-dark-text">VidGen AI</h1>
          </Link>
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                 <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <NavLink to="/" className={navLinkClass} end>Generator</NavLink>
                     
                    <div className="relative" onMouseLeave={() => setIsToolsOpen(false)}>
                      <button 
                        onMouseEnter={() => setIsToolsOpen(true)}
                        className="flex items-center space-x-1 text-dark-text-secondary hover:text-dark-text transition-colors"
                      >
                        <span>AI Tools</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isToolsOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-dark-surface border border-dark-border rounded-lg shadow-lg py-1 z-10" onMouseLeave={() => setIsToolsOpen(false)}>
                          <NavLink to="/image-studio" className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'text-dark-text' : 'text-dark-text-secondary'} hover:bg-dark-bg hover:text-dark-text`} onClick={() => setIsToolsOpen(false)}>Image Studio</NavLink>
                          <NavLink to="/animate-image" className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'text-dark-text' : 'text-dark-text-secondary'} hover:bg-dark-bg hover:text-dark-text`} onClick={() => setIsToolsOpen(false)}>Animate Image</NavLink>
                          <NavLink to="/voice-chat" className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'text-dark-text' : 'text-dark-text-secondary'} hover:bg-dark-bg hover:text-dark-text`} onClick={() => setIsToolsOpen(false)}>Voice Chat</NavLink>
                          <NavLink to="/grounded-search" className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'text-dark-text' : 'text-dark-text-secondary'} hover:bg-dark-bg hover:text-dark-text`} onClick={() => setIsToolsOpen(false)}>Grounded Search</NavLink>
                        </div>
                      )}
                    </div>

                    <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                    <a href="#" className="text-dark-text-secondary hover:text-dark-text transition-colors">Pricing</a>
                </nav>
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="flex items-center space-x-2 p-2 rounded-full bg-dark-bg cursor-pointer">
                      <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium hidden lg:block">{user.name}</span>
                    </Link>
                    <button onClick={onLogout} className="p-2 rounded-full hover:bg-dark-border transition-colors" title="Sign Out">
                        <LogOut className="w-5 h-5 text-dark-text-secondary" />
                    </button>
                </div>
              </>
            ) : (
                <div className="flex items-center space-x-2">
                    <Link to="/login" className="text-sm font-medium text-dark-text-secondary hover:text-dark-text transition-colors">
                        Sign In
                    </Link>
                    <Link to="/login" className="text-sm font-medium bg-brand-primary hover:bg-brand-secondary text-white py-2 px-4 rounded-lg transition-colors">
                        Sign Up
                    </Link>
                </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;