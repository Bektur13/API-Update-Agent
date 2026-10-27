import { greet } from '@app/core';

export function startupMessage(): string {
  return greet('server');
}
