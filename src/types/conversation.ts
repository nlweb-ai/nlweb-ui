/**
 * Conversation and Message Types
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  widgets?: WidgetInstance[];
  timestamp: Date;
  endpoint?: string; // Which backend responded
  sourceName?: string; // Name of the backend
}

export interface WidgetInstance {
  id: string;
  widgetUri: string;
  appEndpoint: string;
  data: any;
  state?: Record<string, any>;
}

export interface Conversation {
  id: string;
  messages: Message[];
  widgetStates: Map<string, Record<string, any>>;
  metadata: {
    startedAt: Date;
    lastActivity: Date;
  };
}
