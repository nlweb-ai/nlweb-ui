/**
 * AgentFinder Service Types
 */

export interface AgentFinderRequest {
  query: string;
  conversationHistory?: Message[];
}

export interface AgentFinderResponse {
  endpoint: string | null; // null when AgentFinder doesn't know where to route
  name?: string;
  type?: 'nlweb' | 'chatgpt-app';
  confidence?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}
