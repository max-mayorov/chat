import React, { useState } from 'react';

interface UserInputProps {
  onSetUsername: (username: string) => void;
  disabled?: boolean;
}

export const UserInput: React.FC<UserInputProps> = ({
  onSetUsername,
  disabled = false,
}) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    setError(null);

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('Username cannot be empty');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!disabled) {
      try {
        onSetUsername(trimmedUsername);
      } catch (err) {
        console.error('Error setting username:', err);
        setError('Failed to set username. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200">
      <div className="flex flex-col space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-gray-700">
          Enter your username to start chatting
        </label>
        <div className="flex space-x-2">
          <input
            id="username"
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!username.trim() || disabled}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set Username
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
};
