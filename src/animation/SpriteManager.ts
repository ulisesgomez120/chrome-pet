// src/animation/SpriteManager.ts
import { Vector2D } from "../types/character";

interface SpriteSheet {
  image: HTMLImageElement;
  frames: Map<string, SpriteFrame>;
  loaded: boolean;
}

interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  anchorX: number; // Added this
  anchorY: number; // Added this
}

interface SpriteCache {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  lastAccessed: number;
}

export class SpriteManager {
  private spriteSheets: Map<string, SpriteSheet>;
  private spriteCache: Map<string, SpriteCache>;
  private lastPosition: Vector2D | null = null;
  private readonly CACHE_LIFETIME = 30000; // 30 seconds
  private readonly MAX_CACHE_SIZE = 50;

  // Sprite frame configurations
  private readonly SPRITE_CONFIG = {
    frameWidth: 64,
    frameHeight: 64,
    scale: 1,
    defaultAnchor: { x: 0.5, y: 1.0 }, // Bottom center
  };

  constructor() {
    this.spriteSheets = new Map();
    this.spriteCache = new Map();
    this.initializeSpritesheets();
  }

  private async initializeSpritesheets(): Promise<void> {
    const sheets = [
      {
        id: "cat-base",
        path: "assets/sprites/cat-base.png",
        frameMap: this.createCatFrameMap(),
      },
      {
        id: "cat-effects",
        path: "assets/sprites/cat-effects.png",
        frameMap: this.createEffectsFrameMap(),
      },
    ];

    for (const sheet of sheets) {
      await this.loadSpriteSheet(sheet.id, sheet.path, sheet.frameMap);
    }
  }

  private createCatFrameMap(): Map<string, SpriteFrame> {
    const frameMap = new Map<string, SpriteFrame>();
    const { frameWidth, frameHeight } = this.SPRITE_CONFIG;

    // Define frame positions for each animation state
    const animations = {
      idle: { row: 0, frames: 4 },
      walk: { row: 1, frames: 6 },
      run: { row: 2, frames: 6 },
      sleep: { row: 3, frames: 4 },
      play: { row: 4, frames: 6 },
      pet: { row: 5, frames: 4 },
      climb: { row: 6, frames: 4 },
    };

    Object.entries(animations).forEach(([anim, config]) => {
      for (let frame = 0; frame < config.frames; frame++) {
        // Right-facing frames
        frameMap.set(`${anim}${frame + 1}_right`, {
          x: frame * frameWidth,
          y: config.row * frameHeight,
          width: frameWidth,
          height: frameHeight,
          anchorX: 0.5, // Center horizontally
          anchorY: 1.0, // Bottom aligned
        });

        // Left-facing frames
        frameMap.set(`${anim}${frame + 1}_left`, {
          x: frame * frameWidth,
          y: config.row * frameHeight,
          width: frameWidth,
          height: frameHeight,
          anchorX: 0.5, // Center horizontally
          anchorY: 1.0, // Bottom aligned
        });
      }
    });

    return frameMap;
  }

  private createEffectsFrameMap(): Map<string, SpriteFrame> {
    const frameMap = new Map<string, SpriteFrame>();
    const { frameWidth, frameHeight } = this.SPRITE_CONFIG;

    // Define effects animations
    const effects = {
      spawn: { row: 0, frames: 6 },
      despawn: { row: 1, frames: 6 },
      hearts: { row: 2, frames: 4 },
      sleep: { row: 3, frames: 4 },
    };

    Object.entries(effects).forEach(([effect, config]) => {
      for (let frame = 0; frame < config.frames; frame++) {
        frameMap.set(`${effect}${frame + 1}`, {
          x: frame * frameWidth,
          y: config.row * frameHeight,
          width: frameWidth,
          height: frameHeight,
          anchorX: this.SPRITE_CONFIG.defaultAnchor.x, // Center horizontally
          anchorY: this.SPRITE_CONFIG.defaultAnchor.y, // Bottom aligned
        });
      }
    });

    return frameMap;
  }

  public async loadSprites(): Promise<void> {
    try {
      // Initialize base spritesheets
      await this.initializeSpritesheets();

      // Wait for all sprite images to load
      const loadPromises = Array.from(this.spriteSheets.values()).map((sheet) => {
        if (!sheet.loaded) {
          return new Promise<void>((resolve, reject) => {
            sheet.image.onload = () => {
              sheet.loaded = true;
              resolve();
            };
            sheet.image.onerror = () => reject(new Error(`Failed to load sprite sheet`));
          });
        }
        return Promise.resolve();
      });

      await Promise.all(loadPromises);
    } catch (error) {
      console.error("Error loading sprites:", error);
      // Set up fallback sprites if loading fails
      this.setupFallbackSprites();
    }
  }

  private async loadSpriteSheet(id: string, path: string, frameMap: Map<string, SpriteFrame>): Promise<void> {
    try {
      const image = new Image();
      image.src = chrome.runtime.getURL(path);

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error(`Failed to load spritesheet: ${path}`));
      });

      this.spriteSheets.set(id, {
        image,
        frames: frameMap,
        loaded: true,
      });
    } catch (error) {
      console.error(`Error loading spritesheet ${id}:`, error);
      // Set up fallback/placeholder sprite
      this.setupFallbackSprite(id);
    }
  }

  private setupFallbackSprites(): void {
    // Set up fallback sprites for all required animations
    const requiredSprites = ["idle", "walk", "run", "sleep", "play", "pet", "climb"];

    requiredSprites.forEach((sprite) => {
      this.setupFallbackSprite(`${sprite}-fallback`);
    });
  }

  private setupFallbackSprite(id: string): void {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = this.SPRITE_CONFIG.frameWidth;
    canvas.height = this.SPRITE_CONFIG.frameHeight;

    // Draw a simple placeholder shape
    ctx.fillStyle = "#FF69B4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    const image = new Image();
    image.src = canvas.toDataURL();

    this.spriteSheets.set(id, {
      image,
      frames: new Map([
        [
          "fallback",
          {
            x: 0,
            y: 0,
            width: this.SPRITE_CONFIG.frameWidth,
            height: this.SPRITE_CONFIG.frameHeight,
            anchorX: 0.5, // Center horizontally
            anchorY: 1.0, // Bottom aligned
          },
        ],
      ]),
      loaded: true,
    });
  }

  public getSprite(frameId: string): HTMLCanvasElement {
    // Check cache first
    const cached = this.spriteCache.get(frameId);
    if (cached) {
      cached.lastAccessed = performance.now();
      return cached.canvas;
    }

    // Create new sprite canvas
    const sprite = this.createSprite(frameId);
    this.cacheSprite(frameId, sprite);
    return sprite;
  }

  private createSprite(frameId: string): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const { frameWidth, frameHeight, scale } = this.SPRITE_CONFIG;

    canvas.width = frameWidth * scale;
    canvas.height = frameHeight * scale;

    // Find the correct spritesheet and frame
    const [sheetId, frame] = this.findSpriteSheetAndFrame(frameId);
    const sheet = this.spriteSheets.get(sheetId);

    if (!sheet || !frame) {
      console.warn(`Sprite not found: ${frameId}`);
      return this.createPlaceholderSprite();
    }

    // Check if this is a left-facing frame
    const isLeftFacing = frameId.endsWith("_left");

    if (isLeftFacing) {
      // Flip context for left-facing sprites
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }

    // Draw the sprite
    ctx.drawImage(sheet.image, frame.x, frame.y, frame.width, frame.height, 0, 0, canvas.width, canvas.height);

    return canvas;
  }

  private createPlaceholderSprite(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const { frameWidth, frameHeight, scale } = this.SPRITE_CONFIG;

    canvas.width = frameWidth * scale;
    canvas.height = frameHeight * scale;

    // Draw placeholder
    ctx.fillStyle = "#FF00FF"; // Magenta for visibility
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    return canvas;
  }

  private findSpriteSheetAndFrame(frameId: string): [string, SpriteFrame | undefined] {
    // Remove direction suffix for lookup
    const baseFrameId = frameId.replace(/_(?:left|right)$/, "");

    for (const [sheetId, sheet] of this.spriteSheets) {
      const frame = sheet.frames.get(frameId);
      if (frame) {
        return [sheetId, frame];
      }
    }

    return ["cat-base", this.spriteSheets.get("cat-base")?.frames.get("idle1_right")];
  }

  private cacheSprite(frameId: string, canvas: HTMLCanvasElement): void {
    // Clean old cache entries if needed
    this.cleanCache();

    // Add new sprite to cache
    this.spriteCache.set(frameId, {
      canvas,
      context: canvas.getContext("2d")!,
      lastAccessed: performance.now(),
    });
  }

  private cleanCache(): void {
    const currentTime = performance.now();

    // Remove old entries
    for (const [frameId, cache] of this.spriteCache) {
      if (currentTime - cache.lastAccessed > this.CACHE_LIFETIME) {
        this.spriteCache.delete(frameId);
      }
    }

    // If still too many entries, remove oldest
    if (this.spriteCache.size > this.MAX_CACHE_SIZE) {
      const oldest = Array.from(this.spriteCache.entries())
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
        .slice(0, this.spriteCache.size - this.MAX_CACHE_SIZE);

      oldest.forEach(([frameId]) => this.spriteCache.delete(frameId));
    }
  }

  public setLastPosition(position: Vector2D): void {
    this.lastPosition = position;
  }

  public getLastPosition(): Vector2D | null {
    return this.lastPosition;
  }

  public getSpriteSize(): { width: number; height: number } {
    return {
      width: this.SPRITE_CONFIG.frameWidth * this.SPRITE_CONFIG.scale,
      height: this.SPRITE_CONFIG.frameHeight * this.SPRITE_CONFIG.scale,
    };
  }

  public isLoaded(): boolean {
    return Array.from(this.spriteSheets.values()).every((sheet) => sheet.loaded);
  }
}
