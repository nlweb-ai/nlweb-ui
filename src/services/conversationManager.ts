/**
 * Conversation Manager
 * Tracks conversation history and persists to localStorage
 */

import { v4 as uuidv4 } from 'uuid';
import type { Conversation, Message, WidgetInstance } from '../types/conversation';

const STORAGE_KEY_PREFIX = 'nlweb:conversation:';

export class ConversationManager {
  private currentConversation: Conversation | null = null;

  /**
   * Create a new conversation
   */
  createConversation(): Conversation {
    const conversation: Conversation = {
      id: uuidv4(),
      messages: [],
      widgetStates: new Map(),
      metadata: {
        startedAt: new Date(),
        lastActivity: new Date(),
      },
    };

    this.currentConversation = conversation;
    this.persist(conversation.id);

    return conversation;
  }

  /**
   * Get current conversation (or create if none exists)
   */
  getCurrentConversation(): Conversation {
    if (!this.currentConversation) {
      this.currentConversation = this.createConversation();
    }
    return this.currentConversation;
  }

  /**
   * Add a message to the conversation
   */
  addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
    const conversation = this.getCurrentConversation();

    const fullMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };

    conversation.messages.push(fullMessage);
    conversation.metadata.lastActivity = new Date();

    this.persist(conversation.id);

    return fullMessage;
  }

  /**
   * Get conversation history
   */
  getHistory(conversationId?: string): Message[] {
    const id = conversationId || this.currentConversation?.id;
    if (!id) return [];

    const conversation = this.restore(id);
    return conversation?.messages || [];
  }

  /**
   * Set widget state
   */
  setWidgetState(widgetId: string, state: Record<string, any>): void {
    const conversation = this.getCurrentConversation();
    conversation.widgetStates.set(widgetId, state);
    this.persist(conversation.id);
  }

  /**
   * Get widget state
   */
  getWidgetState(widgetId: string): Record<string, any> | undefined {
    const conversation = this.getCurrentConversation();
    return conversation.widgetStates.get(widgetId);
  }

  /**
   * Persist conversation to localStorage
   */
  persist(conversationId: string): void {
    const conversation = conversationId === this.currentConversation?.id
      ? this.currentConversation
      : this.restore(conversationId);

    if (!conversation) return;

    try {
      // Convert Map to object for JSON serialization
      const serialized = {
        ...conversation,
        widgetStates: Object.fromEntries(conversation.widgetStates),
      };

      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${conversationId}`,
        JSON.stringify(serialized)
      );
    } catch (error) {
      console.error('Failed to persist conversation:', error);
    }
  }

  /**
   * Restore conversation from localStorage
   */
  restore(conversationId: string): Conversation | null {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${conversationId}`);
      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // Convert dates from strings
      parsed.metadata.startedAt = new Date(parsed.metadata.startedAt);
      parsed.metadata.lastActivity = new Date(parsed.metadata.lastActivity);
      parsed.messages = parsed.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));

      // Convert object back to Map
      parsed.widgetStates = new Map(Object.entries(parsed.widgetStates || {}));

      return parsed as Conversation;
    } catch (error) {
      console.error('Failed to restore conversation:', error);
      return null;
    }
  }

  /**
   * Clear conversation
   */
  clearConversation(): void {
    if (this.currentConversation) {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${this.currentConversation.id}`);
    }
    this.currentConversation = null;
  }
}
