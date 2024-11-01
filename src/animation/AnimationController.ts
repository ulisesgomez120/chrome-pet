// File: src/animation/AnimationController.ts
import { SpriteManager } from "./SpriteManager";
import { AnimationState } from "./AnimationStates";

export class AnimationController {
  private currentState: AnimationState;
  private spriteManager: SpriteManager;

  constructor() {
    // TODO: Initialize animation system
  }

  transition(newState: AnimationState): void {
    // TODO: Handle animation state transitions
  }

  update(): void {
    // TODO: Update current animation frame
  }
}
