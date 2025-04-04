import React from 'react';
import { Message } from '@chat/domain';

interface MessageProps {
  message: Message;
}

export const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  // Generate a placeholder avatar if none is provided
  const avatarUrl =
    message.sender.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      message.sender.name
    )}&background=random`;

  // Format the timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-start p-3 space-x-3 rounded-lg hover:bg-gray-50">
      <div className="flex-shrink-0">
        <img
          src={avatarUrl}
          alt={`${message.sender.name}'s avatar`}
          className="w-10 h-10 rounded-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <p className="font-medium text-gray-900">{message.sender.name}</p>
          <span className="ml-2 text-xs text-gray-500">{formattedTime}</span>
        </div>
        <p className="mt-1 text-gray-800 break-words whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
};
