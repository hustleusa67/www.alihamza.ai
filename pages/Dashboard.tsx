import React, { useState } from 'react';
import { Video, User, CreditCard } from 'lucide-react';
import MyVideos from '../components/dashboard/MyVideos';
import AccountSettings from '../components/dashboard/AccountSettings';
import SubscriptionStatus from '../components/dashboard/SubscriptionStatus';

type Tab = 'videos' | 'account' | 'subscription';

interface UserData {
  name: string;
  email: string;
}

interface DashboardProps {
    user: UserData;
    apiKey: string | null;
    onUpdateUser: (user: UserData) => void;
    onSetApiKey: (key: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, apiKey, onUpdateUser, onSetApiKey }) => {
  const [activeTab, setActiveTab] = useState<Tab>('videos');

  const renderContent = () => {
    switch (activeTab) {
      case 'videos':
        return <MyVideos />;
      case 'account':
        return <AccountSettings user={user} apiKey={apiKey} onUpdateUser={onUpdateUser} onSetApiKey={onSetApiKey} />;
      case 'subscription':
        return <SubscriptionStatus />;
      default:
        return <MyVideos />;
    }
  };
  
  const TabButton: React.FC<{tabName: Tab, icon: React.ReactNode, label: string}> = ({ tabName, icon, label }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`flex items-center space-x-2 py-3 px-4 rounded-lg transition-colors text-sm font-medium ${
          activeTab === tabName
            ? 'bg-brand-primary text-white'
            : 'text-dark-text-secondary hover:bg-dark-surface hover:text-dark-text'
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="md:col-span-1">
        <div className="bg-dark-surface p-4 rounded-xl border border-dark-border space-y-2">
            <h2 className="text-lg font-bold p-2">Dashboard</h2>
            <TabButton tabName="videos" icon={<Video className="w-5 h-5"/>} label="My Videos" />
            <TabButton tabName="account" icon={<User className="w-5 h-5"/>} label="Account Settings" />
            <TabButton tabName="subscription" icon={<CreditCard className="w-5 h-5"/>} label="Subscription" />
        </div>
      </div>
      <div className="md:col-span-3">
        <div className="bg-dark-surface p-6 rounded-xl border border-dark-border min-h-[60vh]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;