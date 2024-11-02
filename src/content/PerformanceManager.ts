// src/content/PerformanceManager.ts
export class PerformanceManager {
  private lastUpdate: number = 0;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  private currentFps: number = 0;

  private readonly TARGET_FPS = 60;
  private readonly MIN_FPS = 30;
  private readonly FPS_UPDATE_INTERVAL = 1000; // Update FPS every second
  private frameBudget: number; // Changed from readonly constant to variable

  constructor() {
    this.frameBudget = 1000 / this.TARGET_FPS; // Initialize frame budget
    this.resetMetrics();
  }

  public shouldUpdate(currentTime: number): boolean {
    // Always allow first frame
    if (this.lastUpdate === 0) {
      this.lastUpdate = currentTime;
      return true;
    }

    const deltaTime = currentTime - this.lastUpdate;

    // Update FPS counter
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= this.FPS_UPDATE_INTERVAL) {
      this.currentFps = (this.frameCount * 1000) / (currentTime - this.lastFpsUpdate);
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;

      // Adjust frame budget based on performance
      this.adjustFrameBudget();
    }

    // Check if enough time has passed
    if (deltaTime >= this.frameBudget) {
      this.lastUpdate = currentTime;
      return true;
    }

    return false;
  }

  private adjustFrameBudget(): void {
    // If FPS is too low, increase frame budget to skip frames
    if (this.currentFps < this.MIN_FPS) {
      const newBudget = 1000 / (this.MIN_FPS * 0.8); // Aim for slightly higher than min
      this.frameBudget = Math.min(newBudget, 1000 / 30); // Cap at 30fps
    } else if (this.currentFps > this.TARGET_FPS * 1.1) {
      // If FPS is too high, gradually return to target
      this.frameBudget = 1000 / this.TARGET_FPS;
    }
  }

  public getFPS(): number {
    return Math.round(this.currentFps);
  }

  public resetMetrics(): void {
    this.lastUpdate = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.currentFps = this.TARGET_FPS;
    this.frameBudget = 1000 / this.TARGET_FPS; // Reset frame budget
  }

  public getPerformanceMetrics(): {
    fps: number;
    frameTime: number;
    lastUpdate: number;
  } {
    return {
      fps: this.currentFps,
      frameTime: this.frameBudget,
      lastUpdate: this.lastUpdate,
    };
  }
}
