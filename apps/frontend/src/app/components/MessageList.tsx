import React from 'react';
import { Message } from '@chat/domain';
import { MessageComponent } from './Message';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  // Create a ref for the message container to auto-scroll to bottom
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-4 space-y-2 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-center text-gray-500">
            No messages yet. Start the conversation!
          </p>
        </div>
      ) : (
        messages.map((message) =>
          message ? (
            'UNDEF'
          ) : (
            <MessageComponent key={message.id} message={message} />
          )
        )
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
