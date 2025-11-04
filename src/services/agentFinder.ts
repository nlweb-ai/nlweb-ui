/**
 * AgentFinder Client
 * Routes queries to appropriate MCP backends
 */

import axios from 'axios';
import type { AgentFinderRequest, AgentFinderResponse } from '../types/agentFinder';
import { CONFIG } from '../config';

export class AgentFinderClient {
  constructor(
    private agentFinderUrl: string = CONFIG.agentFinderUrl,
    private defaultEndpoint: string = CONFIG.defaultNLWebUrl
  ) {}

  /**
   * Route a query to the appropriate backend
   * Returns endpoint URL (never null - falls back to default)
   */
  async routeQuery(query: string): Promise<string> {
    try {
      const request: AgentFinderRequest = { query };
      const response = await axios.post<AgentFinderResponse>(this.agentFinderUrl, request);

      // Return endpoint from AgentFinder, or fallback to default
      return response.data.endpoint || this.defaultEndpoint;
    } catch (error) {
      // AgentFinder service down or error - use default
      console.warn('AgentFinder unavailable, using default NLWeb:', error);
      return this.defaultEndpoint;
    }
  }

  /**
   * Get full routing information (includes name, type, confidence)
   */
  async getRoutingInfo(query: string): Promise<AgentFinderResponse> {
    try {
      const request: AgentFinderRequest = { query };
      const response = await axios.post<AgentFinderResponse>(this.agentFinderUrl, request);

      // If no endpoint returned, set it to default
      if (!response.data.endpoint) {
        response.data.endpoint = this.defaultEndpoint;
        response.data.name = response.data.name || 'NLWeb Default';
        response.data.type = 'nlweb';
      }

      return response.data;
    } catch (error) {
      // AgentFinder service down - return default routing
      console.warn('AgentFinder unavailable, using default NLWeb:', error);
      return {
        endpoint: this.defaultEndpoint,
        name: 'NLWeb Default',
        type: 'nlweb',
      };
    }
  }
}
