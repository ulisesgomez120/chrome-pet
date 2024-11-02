// src/types/character.d.ts

export interface CharacterStats {
  totalPets: number;
  favoriteSleepingSpots: Map<string, number>;
  achievementsCompleted: string[];
  timeActive: number;
  lastInteractionTime: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface CharacterState {
  position: Vector2D;
  currentAction: Action;
  personality: PersonalityTraits;
  stats: CharacterStats;
  appearance: CharacterAppearance;
}

export interface CharacterAppearance {
  baseColor: string;
  pattern: string;
  isShiny: boolean;
  customizations: Record<string, string>;
}

export type ActionType = "idle" | "walk" | "run" | "climb" | "sleep" | "play" | "pet";

export interface Action {
  type: ActionType;
  duration: number;
  target?: HTMLElement;
  startTime: number;
  complete: boolean;
}

export interface PersonalityTraits {
  playfulness: number;
  energyLevel: number;
  friendliness: number;
}
