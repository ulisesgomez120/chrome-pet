// src/character/Character.ts
import { AnimationController } from "../animation/AnimationController";
import { StatsTracker } from "./StatsTracker";
import {
  CharacterState,
  CharacterStats,
  CharacterAppearance,
  Action,
  ActionType,
  Vector2D,
  PersonalityTraits,
} from "../types/character";

export class Character {
  private state: CharacterState;
  private animationController: AnimationController;
  private statsTracker: StatsTracker;
  private lastUpdate: number;
  private readonly UPDATE_INTERVAL = 1000 / 60; // 60 FPS

  constructor(initialState?: Partial<CharacterState>) {
    this.state = this.initializeState(initialState);
    this.animationController = new AnimationController();
    this.statsTracker = new StatsTracker();
    this.lastUpdate = performance.now();

    // Initialize shiny status (1/4096 chance)
    this.state.appearance.isShiny = Math.random() < 1 / 4096;
  }

  private initializeState(initialState?: Partial<CharacterState>): CharacterState {
    const defaultState: CharacterState = {
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      currentAction: {
        type: "idle",
        duration: 1000,
        startTime: performance.now(),
        complete: false,
      },
      personality: {
        playfulness: Math.random() * 100,
        energyLevel: Math.random() * 100,
        friendliness: Math.random() * 100,
      },
      stats: {
        totalPets: 0,
        favoriteSleepingSpots: new Map(),
        achievementsCompleted: [],
        timeActive: 0,
        lastInteractionTime: Date.now(),
      },
      appearance: {
        baseColor: this.generateRandomColor(),
        pattern: this.generateRandomPattern(),
        isShiny: false,
        customizations: {},
      },
    };

    return { ...defaultState, ...initialState };
  }

  public update(currentTime: number): void {
    const deltaTime = currentTime - this.lastUpdate;

    if (deltaTime < this.UPDATE_INTERVAL) {
      return;
    }

    // Update stats
    this.statsTracker.updateStats(this.state.stats, deltaTime);

    // Check if current action is complete
    if (this.isActionComplete(currentTime)) {
      this.decideNextAction();
    }

    // Update position based on current action
    this.updatePosition(deltaTime);

    // Update animation state
    this.animationController.update(this.state.currentAction, this.state.position);

    this.lastUpdate = currentTime;
  }

  public handleInteraction(type: ActionType, target?: HTMLElement): void {
    const currentTime = performance.now();

    switch (type) {
      case "pet":
        this.handlePetting(currentTime);
        break;
      case "play":
        this.handlePlaying(currentTime, target);
        break;
      // Add more interaction handlers as needed
    }

    this.state.stats.lastInteractionTime = currentTime;
  }

  private handlePetting(currentTime: number): void {
    this.state.stats.totalPets++;

    // Personality affects reaction
    if (this.state.personality.friendliness > 70) {
      this.setAction({
        type: "pet",
        duration: 1000,
        startTime: currentTime,
        complete: false,
      });
    } else {
      // Might run away if not friendly enough
      this.setAction({
        type: "run",
        duration: 500,
        startTime: currentTime,
        complete: false,
      });
    }
  }

  private handlePlaying(currentTime: number, target?: HTMLElement): void {
    if (this.state.personality.playfulness < 30) {
      // Might ignore play invitation if not playful
      return;
    }

    this.setAction({
      type: "play",
      duration: 2000,
      target,
      startTime: currentTime,
      complete: false,
    });
  }

  private isActionComplete(currentTime: number): boolean {
    const { currentAction } = this.state;
    return currentTime - currentAction.startTime >= currentAction.duration;
  }

  private decideNextAction(): void {
    const currentTime = performance.now();
    const actions: ActionType[] = ["idle", "walk", "sleep"];

    // Weight actions based on personality and current stats
    const weights = this.calculateActionWeights();
    const selectedAction = this.weightedRandomChoice(actions, weights);

    this.setAction({
      type: selectedAction,
      duration: this.getActionDuration(selectedAction),
      startTime: currentTime,
      complete: false,
    });
  }

  private calculateActionWeights(): number[] {
    const { energyLevel } = this.state.personality;

    // Example weights calculation based on energy level
    return [
      0.3 + (100 - energyLevel) / 200, // idle weight
      0.3 + energyLevel / 200, // walk weight
      0.4 - energyLevel / 200, // sleep weight
    ];
  }

  private weightedRandomChoice(items: ActionType[], weights: number[]): ActionType {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }

    return items[0];
  }

  private updatePosition(deltaTime: number): void {
    const { currentAction, position } = this.state;

    if (currentAction.type === "walk" || currentAction.type === "run") {
      // Calculate new position based on action type and personality
      const speed = this.calculateMovementSpeed(currentAction.type);
      const direction = this.calculateMovementDirection();

      position.x += direction.x * speed * deltaTime;
      position.y += direction.y * speed * deltaTime;

      // Ensure character stays within viewport
      this.keepInBounds();
    }
  }

  public getCurrentSprite(): HTMLCanvasElement | null {
    const state = this.getState();
    const frame = this.animationController.getCurrentFrame();

    if (!frame) return null;

    return this.animationController.getSprite(frame);
  }

  // We should also add getVelocity since it's used in the PetController
  public getVelocity(): Vector2D {
    const currentAction = this.state.currentAction;

    if (currentAction.type === "walk" || currentAction.type === "run") {
      const speed = this.calculateMovementSpeed(currentAction.type);
      const direction = this.calculateMovementDirection();
      return {
        x: direction.x * speed,
        y: direction.y * speed,
      };
    }

    return { x: 0, y: 0 };
  }

  private calculateMovementSpeed(actionType: ActionType): number {
    const baseSpeed = actionType === "run" ? 0.3 : 0.15;
    return baseSpeed * (0.8 + this.state.personality.energyLevel / 250);
  }

  private calculateMovementDirection(): Vector2D {
    // This should match the logic in your movement system
    return {
      x: Math.cos(performance.now() / 1000),
      y: Math.sin(performance.now() / 1000),
    };
  }

  private keepInBounds(): void {
    const margin = 50;
    const { position } = this.state;

    position.x = Math.max(margin, Math.min(window.innerWidth - margin, position.x));
    position.y = Math.max(margin, Math.min(window.innerHeight - margin, position.y));
  }

  private setAction(action: Action): void {
    this.state.currentAction = action;
    this.animationController.transition(action);
  }

  private generateRandomColor(): string {
    const colors = ["orange", "gray", "brown", "black", "white"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private generateRandomPattern(): string {
    const patterns = ["solid", "striped", "spotted", "tabby"];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  // Getters for external components
  public getState(): CharacterState {
    return { ...this.state };
  }

  public getPosition(): Vector2D {
    return { ...this.state.position };
  }

  public getCurrentAction(): Action {
    return { ...this.state.currentAction };
  }

  private getActionDuration(actionType: ActionType): number {
    const baseDurations: Record<ActionType, number> = {
      idle: 2000,
      walk: 3000,
      run: 1500,
      climb: 2000,
      sleep: 5000,
      play: 2000,
      pet: 1000,
    };

    // Add some randomness to duration
    const variation = 0.3; // ±30%
    const baseTime = baseDurations[actionType];
    return baseTime * (1 + (Math.random() * 2 - 1) * variation);
  }
}
