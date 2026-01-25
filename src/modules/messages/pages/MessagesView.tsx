import React from 'react';
import { MessageCircle } from 'lucide-react';

export function MessagesView() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-6">
      <div className="max-w-2xl text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-[#FFD166]/20 flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-[#FFD166]" />
        </div>
        <h1 className="text-2xl sm:text-3xl text-[#1F2937] mb-3">
          Fonctionnalité message pas encore disponible
        </h1>
        <p className="text-base sm:text-lg text-[#6B7280]">
          Elle n'est pas fonctionnelle dans la MVP.
        </p>
      </div>
    </div>
  );
}
