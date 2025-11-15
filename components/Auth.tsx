
import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthProps {
  onLogin: (name?: string, email?: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle form data and API calls here
    onLogin(isLogin ? undefined : name, email);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-dark-surface p-8 rounded-xl border border-dark-border shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-2">
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>
        <p className="text-center text-dark-text-secondary mb-8">
          {isLogin ? 'Sign in to continue to VidGen AI.' : 'Get started with your AI video assistant.'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
             <div>
                <label className="text-sm font-medium text-dark-text-secondary mb-1 block">Full Name</label>
                <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-md p-3 focus:ring-1 focus:ring-brand-primary"
                    placeholder="John Doe"
                />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-dark-text-secondary mb-1 block">Email Address</label>
            <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-md p-3 focus:ring-1 focus:ring-brand-primary"
                placeholder="you@example.com"
            />
          </div>
           <div>
            <label className="text-sm font-medium text-dark-text-secondary mb-1 block">Password</label>
            <input 
                type="password" 
                required 
                className="w-full bg-dark-bg border border-dark-border rounded-md p-3 focus:ring-1 focus:ring-brand-primary"
                placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-transform transform active:scale-95"
          >
            {isLogin ? <><LogIn className="w-5 h-5 mr-2"/> Sign In</> : <><UserPlus className="w-5 h-5 mr-2"/> Sign Up</>}
          </button>
        </form>

        <p className="text-center text-sm text-dark-text-secondary mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-brand-secondary hover:underline ml-2">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;