
import React from 'react';
import { Zap } from 'lucide-react';

const SubscriptionStatus: React.FC = () => {
    const planName = "Free Plan";
    const exportsUsed = 3;
    const exportsLimit = 10;
    const usagePercentage = (exportsUsed / exportsLimit) * 100;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2">My Subscription</h2>
            <p className="text-dark-text-secondary mb-6">Manage your plan and billing details.</p>

            <div className="bg-dark-bg border border-dark-border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-xl font-bold">Current Plan: <span className="text-brand-secondary">{planName}</span></h3>
                        <p className="text-sm text-dark-text-secondary">Your plan renews on July 30, 2024.</p>
                    </div>
                    <button className="flex items-center justify-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                        <Zap className="w-4 h-4 mr-2"/> Upgrade Plan
                    </button>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-dark-text-secondary">Monthly Video Exports</span>
                        <span>{exportsUsed} / {exportsLimit}</span>
                    </div>
                    <div className="w-full bg-dark-surface rounded-full h-2.5 border border-dark-border">
                        <div 
                            className="bg-brand-primary h-2.5 rounded-full" 
                            style={{ width: `${usagePercentage}%` }}
                        ></div>
                    </div>
                </div>

                 <div className="mt-6 border-t border-dark-border pt-4 text-center">
                    <a href="#" className="text-sm text-brand-secondary hover:underline">Manage Billing Details</a>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionStatus;