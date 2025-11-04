/**
 * Widget Types
 */

export interface WidgetProps {
  widgetUri: string;
  appEndpoint: string;
  data: any;
  onToolCall?: (name: string, args: any) => void;
  onFollowUp?: (message: string) => void;
  onStateChange?: (state: any) => void;
}

export interface WindowOpenAI {
  setWidgetState(state: Record<string, any>): Promise<void>;
  getWidgetState(): Promise<Record<string, any>>;
  callTool(toolName: string, args: Record<string, any>): Promise<any>;
  sendFollowUpMessage(text: string): Promise<void>;
  requestDisplayMode(mode: 'inline' | 'pip' | 'fullscreen'): Promise<void>;
}

export interface WidgetMessage {
  type: 'setWidgetState' | 'getWidgetState' | 'callTool' | 'sendFollowUpMessage' | 'requestDisplayMode' | 'stateSet' | 'stateGet' | 'toolResult';
  id?: string | number;
  payload?: any;
}
