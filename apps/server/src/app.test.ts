import { expect, it } from 'vitest';
import { startupMessage } from './app.js';

it('builds the startup message from core', () => {
  expect(startupMessage()).toBe('Hello, server!');
});
