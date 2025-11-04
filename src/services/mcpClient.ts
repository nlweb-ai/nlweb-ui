/**
 * MCP (Model Context Protocol) Client
 * Communicates with MCP servers via JSON-RPC 2.0
 */

import axios from 'axios';
import type { MCPRequest, MCPResponse, ToolCallResponse, Tool } from '../types/mcp';

export class MCPClient {
  private requestId = 1;

  /**
   * Initialize connection with MCP server (handshake)
   */
  async initialize(endpoint: string): Promise<void> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        clientInfo: {
          name: 'nlweb-ui',
          version: '1.0.0',
        },
      },
      id: this.requestId++,
    };

    try {
      const response = await axios.post<MCPResponse>(`${endpoint}/mcp`, request);

      if (response.data.error) {
        throw new Error(`MCP initialization failed: ${response.data.error.message}`);
      }
    } catch (error) {
      console.error('Failed to initialize MCP connection:', error);
      throw error;
    }
  }

  /**
   * List available tools from MCP server
   */
  async listTools(endpoint: string): Promise<Tool[]> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: this.requestId++,
    };

    try {
      const response = await axios.post<MCPResponse<{ tools: Tool[] }>>(`${endpoint}/mcp`, request);

      if (response.data.error) {
        throw new Error(`Failed to list tools: ${response.data.error.message}`);
      }

      return response.data.result?.tools || [];
    } catch (error) {
      console.error('Failed to list tools:', error);
      throw error;
    }
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(
    endpoint: string,
    toolName: string,
    args: Record<string, any>
  ): Promise<ToolCallResponse> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
      id: this.requestId++,
    };

    try {
      const response = await axios.post<MCPResponse<ToolCallResponse>>(`${endpoint}/mcp`, request);

      if (response.data.error) {
        throw new Error(`Tool call failed: ${response.data.error.message}`);
      }

      if (!response.data.result) {
        throw new Error('No result from tool call');
      }

      return response.data.result;
    } catch (error) {
      console.error(`Failed to call tool ${toolName}:`, error);
      throw error;
    }
  }
}
