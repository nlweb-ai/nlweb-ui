/**
 * Chat Component
 * Main container for the chat interface
 */

import { useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { MCPClient } from '../services/mcpClient';
import { AgentFinderClient } from '../services/agentFinder';
import { ConversationManager } from '../services/conversationManager';
import type { Message } from '../types/conversation';

const mcpClient = new MCPClient();
const agentFinder = new AgentFinderClient();
const conversationManager = new ConversationManager();

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = conversationManager.addMessage({
      role: 'user',
      content: text,
    });

    setMessages([...conversationManager.getCurrentConversation().messages]);
    setIsLoading(true);

    try {
      // Route query via AgentFinder
      const routingInfo = await agentFinder.getRoutingInfo(text);
      const endpoint = routingInfo.endpoint!;

      console.log(`Routing to: ${routingInfo.name} (${endpoint})`);

      // Call MCP server's "ask" tool
      const response = await mcpClient.callTool(endpoint, 'ask', { query: text });

      // Extract text from response
      const contentText = response.content
        .filter((item) => item.type === 'text')
        .map((item) => item.text)
        .join('\n');

      // Check for widget
      const widgetUri = response._meta?.['openai/outputTemplate'];
      const widgets = widgetUri
        ? [
            {
              id: `widget-${Date.now()}`,
              widgetUri,
              appEndpoint: endpoint,
              data: response.structuredContent || response.content,
            },
          ]
        : undefined;

      // Add assistant message
      conversationManager.addMessage({
        role: 'assistant',
        content: contentText || 'Response received',
        widgets,
        endpoint,
        sourceName: routingInfo.name,
      });

      setMessages([...conversationManager.getCurrentConversation().messages]);
    } catch (error) {
      console.error('Failed to process query:', error);

      // Add error message
      conversationManager.addMessage({
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });

      setMessages([...conversationManager.getCurrentConversation().messages]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">NLWeb Chat</h1>
        <p className="text-sm text-gray-500">Universal host for ChatGPT Apps</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200">
        <MessageInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
