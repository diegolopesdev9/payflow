// Type definitions for Hono context with custom variables

import { Context } from 'hono';

// Extend Hono context to include our custom variables
export interface AppContext extends Context {
  get(key: 'userId'): string;
  set(key: 'userId', value: string): void;
}

// Type for authenticated context variables
export interface ContextVariables {
  userId: string;
}