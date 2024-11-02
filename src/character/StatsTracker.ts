// src/character/StatsTracker.ts
import { CharacterStats } from "../types/character";

interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  reward?: string;
}

interface StatProgress {
  current: number;
  total: number;
  lastUpdated: number;
}

export class StatsTracker {
  private stats: Map<string, StatProgress>;
  private achievements: Map<string, Achievement>;
  private readonly SAVE_INTERVAL = 60000; // Save every minute
  private lastSave: number;

  constructor() {
    this.stats = new Map();
    this.achievements = new Map();
    this.lastSave = performance.now();
    this.initializeAchievements();
  }

  private initializeAchievements(): void {
    const defaultAchievements: Achievement[] = [
      {
        id: "first_steps",
        name: "First Steps",
        description: "Walk 1000 pixels total",
        progress: 0,
        maxProgress: 1000,
        completed: false,
      },
      {
        id: "friendly_pet",
        name: "Friendly Pet",
        description: "Get petted 100 times",
        progress: 0,
        maxProgress: 100,
        completed: false,
      },
      {
        id: "sleepy_head",
        name: "Sleepy Head",
        description: "Sleep for 1 hour total",
        progress: 0,
        maxProgress: 3600000, // 1 hour in milliseconds
        completed: false,
      },
      {
        id: "explorer",
        name: "Explorer",
        description: "Visit 50 different websites",
        progress: 0,
        maxProgress: 50,
        completed: false,
      },
    ];

    defaultAchievements.forEach((achievement) => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  public updateStats(characterStats: CharacterStats, deltaTime: number): void {
    const currentTime = performance.now();

    // Update active time
    characterStats.timeActive += deltaTime;

    // Track walking distance if currently moving
    if (this.stats.has("distanceWalked")) {
      const walkStat = this.stats.get("distanceWalked")!;
      walkStat.current += deltaTime * 0.1; // Example: 0.1 pixels per ms
      this.checkAchievement("first_steps", walkStat.current);
    }

    // Check for achievements
    this.checkAchievement("friendly_pet", characterStats.totalPets);
    this.checkAchievement("sleepy_head", characterStats.timeActive);

    // Save stats periodically
    if (currentTime - this.lastSave >= this.SAVE_INTERVAL) {
      this.saveStats(characterStats);
      this.lastSave = currentTime;
    }
  }

  private checkAchievement(id: string, currentValue: number): void {
    const achievement = this.achievements.get(id);
    if (achievement && !achievement.completed) {
      achievement.progress = Math.min(currentValue, achievement.maxProgress);

      if (achievement.progress >= achievement.maxProgress) {
        achievement.completed = true;
        this.onAchievementComplete(achievement);
      }
    }
  }

  private onAchievementComplete(achievement: Achievement): void {
    // Trigger achievement notification
    this.dispatchAchievementEvent(achievement);

    // Save achievement progress
    this.saveAchievements();
  }

  private dispatchAchievementEvent(achievement: Achievement): void {
    const event = new CustomEvent("achievementCompleted", {
      detail: {
        achievement: {
          name: achievement.name,
          description: achievement.description,
          reward: achievement.reward,
        },
      },
    });
    document.dispatchEvent(event);
  }

  public recordInteraction(type: string, value: number = 1): void {
    const stat = this.stats.get(type) || {
      current: 0,
      total: 0,
      lastUpdated: performance.now(),
    };

    stat.current += value;
    stat.total += value;
    stat.lastUpdated = performance.now();

    this.stats.set(type, stat);
  }

  public getAchievementProgress(id: string): number {
    const achievement = this.achievements.get(id);
    return achievement ? achievement.progress / achievement.maxProgress : 0;
  }

  public getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  private async saveStats(characterStats: CharacterStats): Promise<void> {
    try {
      const statsData = {
        stats: Object.fromEntries(this.stats),
        characterStats,
        lastSaved: Date.now(),
      };

      await chrome.storage.local.set({ characterStats: statsData });
    } catch (error) {
      console.error("Failed to save stats:", error);
    }
  }

  private async saveAchievements(): Promise<void> {
    try {
      const achievementsData = Array.from(this.achievements.values());
      await chrome.storage.local.set({ achievements: achievementsData });
    } catch (error) {
      console.error("Failed to save achievements:", error);
    }
  }

  public async loadSavedData(): Promise<void> {
    try {
      const data = await chrome.storage.local.get(["characterStats", "achievements"]);

      if (data.characterStats) {
        this.stats = new Map(Object.entries(data.characterStats.stats));
      }

      if (data.achievements) {
        data.achievements.forEach((achievement: Achievement) => {
          this.achievements.set(achievement.id, achievement);
        });
      }
    } catch (error) {
      console.error("Failed to load saved data:", error);
    }
  }
}
