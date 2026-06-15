import type { RegionId } from '../data/types';

type EventCallback = (...args: never[]) => void;

class GameEventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  on<T>(event: string, callback: (payload: T) => void): void {
    const callbacks = this.listeners.get(event) ?? new Set<EventCallback>();
    callbacks.add(callback as EventCallback);
    this.listeners.set(event, callbacks);
  }

  off<T>(event: string, callback: (payload: T) => void): void {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  emit<T>(event: string, payload: T): void {
    this.listeners.get(event)?.forEach((callback) => callback(payload as never));
  }
}

export const gameEvents = new GameEventBus();

export const EVENTS = {
  REGION_SELECTED: 'region-selected',
  QUIZ_CLOSED: 'quiz-closed',
} as const;

export interface QuizClosedPayload {
  region: RegionId;
  passed: boolean;
}
