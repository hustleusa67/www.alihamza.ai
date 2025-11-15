
import React from 'react';
import { PlayCircle } from 'lucide-react';

const MyVideos: React.FC = () => {
    const placeholderVideos = Array(8).fill({
        title: "AI Generated Short #123",
        duration: "0:15",
        thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop"
    });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Generated Videos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {placeholderVideos.map((video, index) => (
          <div key={index} className="group relative rounded-lg overflow-hidden border border-dark-border cursor-pointer">
            <img src={`${video.thumbnailUrl}&ixid=${index}`} alt={video.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="w-12 h-12 text-white/80"/>
            </div>
            <div className="absolute bottom-0 left-0 p-3">
                <h3 className="font-semibold text-sm">{video.title}</h3>
                <p className="text-xs text-dark-text-secondary">{video.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyVideos;