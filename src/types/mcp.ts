/**
 * MCP (Model Context Protocol) Types
 * Based on JSON-RPC 2.0 specification
 */

export interface MCPRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, any>;
  id: number | string;
}

export interface MCPResponse<T = any> {
  jsonrpc: '2.0';
  id: number | string;
  result?: T;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface ContentItem {
  type: 'text' | 'image' | 'resource';
  text?: string;
  data?: string; // base64 for images
  uri?: string;
  resource?: {
    uri: string;
    data: Record<string, any>;
  };
}

export interface ToolCallResponse {
  content: ContentItem[];
  structuredContent?: Record<string, any>;
  isError?: boolean;
  _meta?: {
    'openai/outputTemplate'?: string;
    [key: string]: any;
  };
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}
