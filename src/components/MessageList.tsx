/**
 * MessageList Component
 * Displays the conversation history
 */

import { useEffect, useRef } from 'react';
import type { Message } from '../types/conversation';
import { WidgetRenderer } from './WidgetRenderer';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Welcome to NLWeb</p>
          <p className="text-sm mt-2">Start a conversation by typing a message below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-3xl ${
              message.role === 'user'
                ? 'bg-blue-600 text-white rounded-2xl px-4 py-2'
                : 'w-full'
            }`}
          >
            {message.role === 'user' ? (
              <p className="text-sm">{message.content}</p>
            ) : (
              <div className="space-y-4">
                {/* Source badge */}
                {message.sourceName && (
                  <div className="text-xs text-gray-500 font-medium">
                    {message.sourceName}
                  </div>
                )}

                {/* Text content */}
                {message.content && (
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {message.content}
                  </div>
                )}

                {/* Widgets */}
                {message.widgets && message.widgets.length > 0 && (
                  <div className="space-y-4">
                    {message.widgets.map((widget) => (
                      <WidgetRenderer key={widget.id} widget={widget} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
