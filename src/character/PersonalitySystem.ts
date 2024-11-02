// src/character/PersonalitySystem.ts
import { PersonalityTraits } from "../types/character";

export type PersonalityModifier = {
  trait: keyof PersonalityTraits;
  amount: number;
  duration: number;
  startTime: number;
};

export class PersonalitySystem {
  private traits: PersonalityTraits;
  private modifiers: PersonalityModifier[] = [];
  private readonly TRAIT_MIN = 0;
  private readonly TRAIT_MAX = 100;

  constructor(initialTraits?: Partial<PersonalityTraits>) {
    this.traits = this.initializeTraits(initialTraits);
  }

  private initializeTraits(initial?: Partial<PersonalityTraits>): PersonalityTraits {
    const randomTrait = () => Math.floor(Math.random() * (this.TRAIT_MAX + 1));

    return {
      playfulness: initial?.playfulness ?? randomTrait(),
      energyLevel: initial?.energyLevel ?? randomTrait(),
      friendliness: initial?.friendliness ?? randomTrait(),
    };
  }

  public getTraits(): PersonalityTraits {
    const currentTime = performance.now();
    const baseTraits = { ...this.traits };

    // Apply active modifiers
    this.modifiers = this.modifiers.filter((mod) => {
      const isActive = currentTime - mod.startTime < mod.duration;
      if (isActive) {
        baseTraits[mod.trait] = this.clampTrait(baseTraits[mod.trait] + mod.amount);
      }
      return isActive;
    });

    return baseTraits;
  }

  public addModifier(modifier: Omit<PersonalityModifier, "startTime">): void {
    this.modifiers.push({
      ...modifier,
      startTime: performance.now(),
    });
  }

  public updateTrait(trait: keyof PersonalityTraits, amount: number): void {
    this.traits[trait] = this.clampTrait(this.traits[trait] + amount);
  }

  private clampTrait(value: number): number {
    return Math.max(this.TRAIT_MIN, Math.min(this.TRAIT_MAX, value));
  }

  public getTraitLevel(trait: keyof PersonalityTraits): "low" | "medium" | "high" {
    const value = this.traits[trait];
    if (value < 33) return "low";
    if (value < 66) return "medium";
    return "high";
  }

  public calculateActionProbability(action: string, baseChance: number): number {
    const traits = this.getTraits();
    let probability = baseChance;

    switch (action) {
      case "play":
        probability *= traits.playfulness / 50;
        probability *= traits.energyLevel / 50;
        break;
      case "interact":
        probability *= traits.friendliness / 50;
        break;
      case "sleep":
        probability *= (100 - traits.energyLevel) / 50;
        break;
      // Add more action probability calculations as needed
    }

    return Math.max(0, Math.min(1, probability));
  }

  public getInteractionResponse(interactionType: string): "positive" | "neutral" | "negative" {
    const traits = this.getTraits();

    switch (interactionType) {
      case "pet":
        if (traits.friendliness > 70) return "positive";
        if (traits.friendliness < 30) return "negative";
        return "neutral";

      case "play":
        if (traits.playfulness > 70 && traits.energyLevel > 50) return "positive";
        if (traits.playfulness < 30 || traits.energyLevel < 20) return "negative";
        return "neutral";

      default:
        return "neutral";
    }
  }

  public evolvePersonality(interaction: string, outcome: "positive" | "negative"): void {
    const evolutionRate = 0.5; // How quickly personality evolves

    switch (interaction) {
      case "pet":
        this.updateTrait("friendliness", outcome === "positive" ? evolutionRate : -evolutionRate);
        break;

      case "play":
        this.updateTrait("playfulness", outcome === "positive" ? evolutionRate : -evolutionRate);
        this.updateTrait("energyLevel", outcome === "positive" ? -evolutionRate : -evolutionRate * 2);
        break;

      // Add more interaction types as needed
    }
  }

  public async save(): Promise<void> {
    try {
      await chrome.storage.local.set({
        personalityTraits: this.traits,
        personalityModifiers: this.modifiers,
      });
    } catch (error) {
      console.error("Failed to save personality data:", error);
    }
  }

  public async load(): Promise<void> {
    try {
      const data = await chrome.storage.local.get(["personalityTraits", "personalityModifiers"]);

      if (data.personalityTraits) {
        this.traits = data.personalityTraits;
      }

      if (data.personalityModifiers) {
        this.modifiers = data.personalityModifiers;
      }
    } catch (error) {
      console.error("Failed to load personality data:", error);
    }
  }
}
