import { useState } from 'react';
import { Message } from '@/lib/mock-data';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
}

export function ChatBox({ messages, onSendMessage, currentUserId }: ChatBoxProps) {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-[#FF6B4A] to-[#FFD166]">
        <h3 className="text-white">Chat de la commande</h3>
        <p className="text-white/80 text-sm">
          Communiquez avec les participants
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Aucun message pour le moment
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.userId === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isCurrentUser
                      ? 'bg-[#FF6B4A] text-white'
                      : 'bg-muted text-foreground'
                  } rounded-2xl px-4 py-3`}
                >
                  {!isCurrentUser && (
                    <div className="text-xs mb-1 opacity-80">
                      {message.userName}
                    </div>
                  )}
                  <div className="break-words">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-white/70' : 'text-muted-foreground'
                    }`}
                  >
                    {format(new Date(message.timestamp), 'HH:mm', {
                      locale: fr,
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/50">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
