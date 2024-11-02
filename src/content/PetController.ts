// src/content/PetController.ts
import { Character } from "../character/Character";
import { ElementDetector } from "./ElementDetector";
import { PerformanceManager } from "./PerformanceManager";
import { Vector2D } from "../types/character";

export class PetController {
  private canvas!: HTMLCanvasElement; // Using definite assignment assertion
  private ctx!: CanvasRenderingContext2D; // Using definite assignment assertion
  private character: Character;
  private elementDetector: ElementDetector;
  private performanceManager: PerformanceManager;
  private isRunning: boolean = false;
  private boundingRect!: DOMRect;

  constructor() {
    this.setupCanvas();
    this.character = new Character();
    this.elementDetector = new ElementDetector();
    this.performanceManager = new PerformanceManager();
    this.boundingRect = this.canvas.getBoundingClientRect();

    this.bindEventListeners();
    this.start();
  }

  private setupCanvas(): void {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;

    // Set canvas properties
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9999;
    `;

    // Set initial size
    this.resizeCanvas();

    // Add to document
    document.body.appendChild(this.canvas);
  }

  private resizeCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Set display size
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";

    // Set actual size in memory
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;

    // Scale all drawing operations
    this.ctx.scale(dpr, dpr);

    // Update bounding rect
    this.boundingRect = this.canvas.getBoundingClientRect();
  }

  private bindEventListeners(): void {
    // Handle window resize
    window.addEventListener("resize", this.handleResize.bind(this));

    // Handle scroll events
    window.addEventListener("scroll", this.handleScroll.bind(this));

    // Handle visibility changes
    document.addEventListener("visibilitychange", this.handleVisibility.bind(this));

    // Handle mouse interactions
    this.canvas.addEventListener("click", this.handleClick.bind(this));

    // Handle messages from popup/background
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  private handleResize = (): void => {
    this.resizeCanvas();
  };

  private handleScroll = (): void => {
    // Update character position relative to scroll
    const scrollY = window.scrollY;
    const characterPos = this.character.getPosition();

    // Keep character in view as page scrolls
    if (characterPos.y - scrollY < 0) {
      this.character.getState().position.y = scrollY + 50;
    } else if (characterPos.y - scrollY > window.innerHeight) {
      this.character.getState().position.y = scrollY + window.innerHeight - 50;
    }
  };

  private handleVisibility = (): void => {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  };

  private handleClick = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is near character
    const charPos = this.character.getPosition();
    const distance = Math.hypot(x - charPos.x, y - charPos.y);

    if (distance < 50) {
      // 50px interaction radius
      this.character.handleInteraction("pet");
    }
  };

  private handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): void {
    switch (message.type) {
      case "TOGGLE_PET":
        this.isRunning ? this.pause() : this.resume();
        sendResponse({ status: "success", isRunning: this.isRunning });
        break;

      case "UPDATE_SETTINGS":
        // Handle settings updates
        sendResponse({ status: "success" });
        break;

      default:
        sendResponse({ status: "error", message: "Unknown message type" });
    }
  }

  private start(): void {
    this.isRunning = true;
    this.update();
  }

  private pause(): void {
    this.isRunning = false;
  }

  private resume(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.update();
    }
  }

  private update = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();

    // Only update if performance allows
    if (this.performanceManager.shouldUpdate(currentTime)) {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Update character
      this.character.update(currentTime);

      // Render character
      this.render();

      // Check for interactive elements
      this.elementDetector.scanVisible();
    }

    // Request next frame
    requestAnimationFrame(this.update);
  };

  private render(): void {
    const state = this.character.getState();
    const { position } = state;

    // Get current sprite based on state
    const sprite = this.character.getCurrentSprite();
    if (!sprite) return;

    // Draw character
    this.ctx.save();
    this.ctx.translate(position.x, position.y);

    // If character is facing left, flip the context
    if (state.currentAction.type === "walk" || state.currentAction.type === "run") {
      const velocity = this.character.getVelocity();
      if (velocity.x < 0) {
        this.ctx.scale(-1, 1);
      }
    }

    // Draw the sprite
    this.ctx.drawImage(
      sprite,
      -sprite.width / 2, // Center the sprite
      -sprite.height, // Bottom-center anchor point
      sprite.width,
      sprite.height
    );

    this.ctx.restore();
  }

  public cleanup(): void {
    this.pause();
    this.canvas.remove();
    // Remove event listeners
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("scroll", this.handleScroll);
    document.removeEventListener("visibilitychange", this.handleVisibility);
  }
}

// Initialize controller when content script loads
let petController: PetController | null = null;

document.addEventListener("DOMContentLoaded", () => {
  petController = new PetController();
});

// Cleanup on navigation
window.addEventListener("unload", () => {
  if (petController) {
    petController.cleanup();
    petController = null;
  }
});
