// src/animation/AnimationController.ts
import { SpriteManager } from "./SpriteManager";
import { Action, ActionType, Vector2D } from "../types/character";

interface AnimationState {
  currentFrame: number;
  frameCount: number;
  frameDuration: number;
  lastFrameTime: number;
  direction: "left" | "right";
  sequence: string[];
}

export class AnimationController {
  private spriteManager: SpriteManager;
  private currentState: AnimationState;
  private transitionState: AnimationState | null = null;
  private readonly defaultFrameDuration = 150; // ms per frame

  constructor() {
    this.spriteManager = new SpriteManager();
    this.currentState = this.createDefaultState();

    // Initialize sprite loading
    this.initializeSprites();
  }

  private async initializeSprites(): Promise<void> {
    try {
      await this.spriteManager.loadSprites();
    } catch (error) {
      console.error("Failed to load sprites:", error);
      // Fallback to basic animation state if needed
    }
  }

  private createDefaultState(): AnimationState {
    return {
      currentFrame: 0,
      frameCount: 4,
      frameDuration: this.defaultFrameDuration,
      lastFrameTime: performance.now(),
      direction: "right",
      sequence: ["idle1", "idle2", "idle3", "idle2"],
    };
  }

  public update(action: Action, position: Vector2D): void {
    const currentTime = performance.now();

    // Handle transition state if exists
    if (this.transitionState) {
      if (this.isTransitionComplete()) {
        this.completeTransition();
      } else {
        this.updateTransitionState(currentTime);
        return;
      }
    }

    // Update frame if enough time has passed
    if (currentTime - this.currentState.lastFrameTime >= this.currentState.frameDuration) {
      this.updateFrame(currentTime);
    }

    // Update direction based on movement
    this.updateDirection(action, position);
  }

  public transition(action: Action): void {
    const newSequence = this.getAnimationSequence(action.type);
    const transitionSequence = this.getTransitionSequence(this.currentState.sequence, newSequence);

    if (transitionSequence) {
      this.transitionState = {
        currentFrame: 0,
        frameCount: transitionSequence.length,
        frameDuration: this.getFrameDuration(action.type),
        lastFrameTime: performance.now(),
        direction: this.currentState.direction,
        sequence: transitionSequence,
      };
    } else {
      // Direct transition if no transition sequence
      this.currentState = {
        currentFrame: 0,
        frameCount: newSequence.length,
        frameDuration: this.getFrameDuration(action.type),
        lastFrameTime: performance.now(),
        direction: this.currentState.direction,
        sequence: newSequence,
      };
    }
  }

  private updateFrame(currentTime: number): void {
    this.currentState.currentFrame = (this.currentState.currentFrame + 1) % this.currentState.frameCount;
    this.currentState.lastFrameTime = currentTime;
  }

  private updateDirection(action: Action, position: Vector2D): void {
    if (action.type === "walk" || action.type === "run") {
      // Update direction based on movement
      const previousX = this.spriteManager.getLastPosition()?.x;
      if (previousX !== undefined && position.x !== previousX) {
        this.currentState.direction = position.x > previousX ? "right" : "left";
      }
    }
    // Store current position for next update
    this.spriteManager.setLastPosition(position);
  }

  private isTransitionComplete(): boolean {
    return this.transitionState!.currentFrame >= this.transitionState!.frameCount - 1;
  }

  private completeTransition(): void {
    const newSequence = this.getAnimationSequence(this.getCurrentAction());
    this.currentState = {
      currentFrame: 0,
      frameCount: newSequence.length,
      frameDuration: this.transitionState!.frameDuration,
      lastFrameTime: performance.now(),
      direction: this.transitionState!.direction,
      sequence: newSequence,
    };
    this.transitionState = null;
  }

  private updateTransitionState(currentTime: number): void {
    if (currentTime - this.transitionState!.lastFrameTime >= this.transitionState!.frameDuration) {
      this.transitionState!.currentFrame++;
      this.transitionState!.lastFrameTime = currentTime;
    }
  }

  private getAnimationSequence(actionType: ActionType): string[] {
    const sequences: Record<ActionType, string[]> = {
      idle: ["idle1", "idle2", "idle3", "idle2"],
      walk: ["walk1", "walk2", "walk3", "walk2"],
      run: ["run1", "run2", "run3", "run2"],
      climb: ["climb1", "climb2", "climb3", "climb2"],
      sleep: ["sleep1", "sleep2"],
      play: ["play1", "play2", "play3", "play2"],
      pet: ["pet1", "pet2", "pet3", "pet2"],
    };
    return sequences[actionType];
  }

  private getTransitionSequence(currentSeq: string[], targetSeq: string[]): string[] | null {
    // Define transition animations between states
    const transitionKey = `${currentSeq[0]}_to_${targetSeq[0]}`;
    const transitions: Record<string, string[]> = {
      idle_to_walk: ["transition1", "transition2"],
      walk_to_run: ["speedup1", "speedup2"],
      idle_to_sleep: ["laydown1", "laydown2"],
      // Add more transitions as needed
    };
    return transitions[transitionKey] || null;
  }

  private getFrameDuration(actionType: ActionType): number {
    const durations: Record<ActionType, number> = {
      idle: 300,
      walk: 150,
      run: 100,
      climb: 200,
      sleep: 500,
      play: 150,
      pet: 200,
    };
    return durations[actionType];
  }

  private getCurrentAction(): ActionType {
    // Extract action type from current sequence name
    const firstFrame = this.currentState.sequence[0];
    return firstFrame.split("1")[0] as ActionType;
  }

  public getCurrentFrame(): string {
    const state = this.transitionState || this.currentState;
    const frame = state.sequence[state.currentFrame];
    return `${frame}_${state.direction}`;
  }

  public getSprite(frameId: string) {
    return this.spriteManager.getSprite(frameId);
  }
}
