/**
 * Chat Component
 * Main container for the chat interface
 */

import { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { MCPClient } from '../services/mcpClient';
import { AgentFinderClient } from '../services/agentFinder';
import { ConversationManager } from '../services/conversationManager';
import { parseURLParams } from '../utils/urlParams';
import type { Message } from '../types/conversation';

const mcpClient = new MCPClient();
const agentFinder = new AgentFinderClient();
const conversationManager = new ConversationManager();

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [urlParams, setUrlParams] = useState(() => parseURLParams());

  // Update URL params if they change
  useEffect(() => {
    const params = parseURLParams();
    setUrlParams(params);

    // Show info message if URL params are set
    if (params.endpoint || params.site) {
      const info: string[] = [];
      if (params.endpoint) info.push(`Endpoint: ${params.endpoint}`);
      if (params.site) info.push(`Site: ${params.site}`);
      if (params.num_results) info.push(`Results: ${params.num_results}`);

      console.log('URL Parameters:', info.join(', '));
    }
  }, []);

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
      // Determine endpoint
      let endpoint: string;
      let routingName: string;

      if (urlParams.endpoint) {
        // Use endpoint from URL
        endpoint = urlParams.endpoint;
        routingName = `Direct (${endpoint})`;
        console.log(`Using URL endpoint: ${endpoint}`);
      } else {
        // Route query via AgentFinder
        const routingInfo = await agentFinder.getRoutingInfo(text);
        endpoint = routingInfo.endpoint!;
        routingName = routingInfo.name || 'Unknown';
        console.log(`Routing to: ${routingName} (${endpoint})`);
      }

      // Build tool arguments
      const toolArgs: Record<string, any> = { query: text };

      // Add URL params to tool arguments
      if (urlParams.site) {
        toolArgs.site = urlParams.site;
      }
      if (urlParams.num_results) {
        toolArgs.num_results = urlParams.num_results;
      }

      // Add any other URL params
      Object.entries(urlParams).forEach(([key, value]) => {
        if (!['endpoint', 'site', 'num_results'].includes(key)) {
          toolArgs[key] = value;
        }
      });

      console.log('Calling ask tool with args:', toolArgs);

      // Call MCP server's "ask" tool
      const response = await mcpClient.callTool(endpoint, 'ask', toolArgs);

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
        sourceName: routingName,
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

        {/* URL Parameters Display */}
        {(urlParams.endpoint || urlParams.site || urlParams.num_results) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {urlParams.endpoint && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Endpoint: {urlParams.endpoint}
              </span>
            )}
            {urlParams.site && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                Site: {urlParams.site}
              </span>
            )}
            {urlParams.num_results && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                Results: {urlParams.num_results}
              </span>
            )}
          </div>
        )}
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
