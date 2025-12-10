import React from 'react';
import { User, MessageCircle, Search, Shuffle, MapPin } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'producer' | 'sharer' | 'participant';
}

export function Navigation({ activeTab, onTabChange, userRole }: NavigationProps) {
  const firstIcon = Search;
  const firstLabel = 'Produits';

  const secondIcon = MapPin;
  const secondLabel = 'Carte';

  const centerIcon = Shuffle;
  const centerLabel = 'Swipe';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'home'
                ? 'text-[#FF6B4A]'
                : 'text-[#6B7280] hover:text-[#FF6B4A]'
            }`}
          >
            {React.createElement(firstIcon, { className: 'w-6 h-6' })}
            <span className="text-xs">{firstLabel}</span>
          </button>

          <button
            onClick={() => onTabChange('deck')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'deck'
                ? 'text-[#FF6B4A]'
                : 'text-[#6B7280] hover:text-[#FF6B4A]'
            }`}
          >
            {React.createElement(secondIcon, { className: 'w-6 h-6' })}
            <span className="text-xs">{secondLabel}</span>
          </button>

          <button
            onClick={() => onTabChange('create')}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg bg-[#FF6B4A] text-white shadow-lg -mt-6"
          >
            {React.createElement(centerIcon, { className: 'w-7 h-7' })}
            <span className="text-xs">{centerLabel}</span>
          </button>

          <button
            onClick={() => onTabChange('messages')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'messages'
                ? 'text-[#FF6B4A]'
                : 'text-[#6B7280] hover:text-[#FF6B4A]'
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Messages</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'text-[#FF6B4A]'
                : 'text-[#6B7280] hover:text-[#FF6B4A]'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
