// src/content.ts
import { PetController } from "./content/PetController";

class ContentScript {
  protected static instance: ContentScript | null = null; // Changed from private to protected
  private petController: PetController | null = null;
  private initialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): ContentScript {
    if (!ContentScript.instance) {
      ContentScript.instance = new ContentScript();
    }
    return ContentScript.instance;
  }

  // Add public method to access cleanup
  public static cleanupInstance(): void {
    if (ContentScript.instance) {
      ContentScript.instance.cleanup();
      ContentScript.instance = null;
    }
  }

  private async initialize(): Promise<void> {
    // Prevent multiple initializations
    if (this.initialized) return;

    try {
      // Check if we're in a valid context for initialization
      if (!this.isValidContext()) {
        console.log("Web Pet: Skipping initialization in this context");
        return;
      }

      console.log("Web Pet: Initializing content script");

      // Initialize messaging with background script
      this.setupMessageHandlers();

      // Create pet controller
      this.petController = new PetController();

      // Mark as initialized
      this.initialized = true;

      // Notify background script that initialization is complete
      chrome.runtime.sendMessage({ type: "CONTENT_INITIALIZED" });
    } catch (error) {
      console.error("Web Pet: Failed to initialize content script:", error);
      this.cleanup();
    }
  }

  private isValidContext(): boolean {
    // Skip initialization in invalid contexts
    const invalidProtocols = ["chrome:", "chrome-extension:", "about:"];
    if (invalidProtocols.includes(window.location.protocol)) {
      return false;
    }

    // Skip for iframes unless specifically enabled
    if (window !== window.top) {
      return false;
    }

    return true;
  }

  private setupMessageHandlers(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case "TOGGLE_PET":
          this.handleTogglePet(sendResponse);
          break;

        case "UPDATE_SETTINGS":
          this.handleSettingsUpdate(message.settings, sendResponse);
          break;

        case "CHECK_STATUS":
          sendResponse({
            initialized: this.initialized,
            active: this.petController !== null,
          });
          break;

        default:
          sendResponse({ error: "Unknown message type" });
      }

      // Return true to indicate async response
      return true;
    });
  }

  public handleTogglePet(sendResponse: (response: any) => void): void {
    try {
      if (this.petController) {
        // Toggle existing controller
        this.cleanup();
        sendResponse({ status: "success", active: false });
      } else {
        // Create new controller
        this.petController = new PetController();
        sendResponse({ status: "success", active: true });
      }
    } catch (error: any) {
      console.error("Web Pet: Failed to toggle pet:", error);
      sendResponse({ status: "error", message: error.message });
    }
  }

  private handleSettingsUpdate(settings: any, sendResponse: (response: any) => void): void {
    try {
      if (this.petController) {
        // Update controller settings
        // Implementation depends on what settings we support
        sendResponse({ status: "success" });
      } else {
        sendResponse({ status: "error", message: "Pet not active" });
      }
    } catch (error: any) {
      console.error("Web Pet: Failed to update settings:", error);
      sendResponse({ status: "error", message: error.message });
    }
  }

  private cleanup(): void {
    if (this.petController) {
      this.petController.cleanup();
      this.petController = null;
    }
  }
}

// Initialize content script
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    ContentScript.getInstance();
  });
} else {
  ContentScript.getInstance();
}

// Cleanup on navigation
window.addEventListener("beforeunload", () => {
  ContentScript.cleanupInstance();
});

// Handle visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    const instance = ContentScript.getInstance();
    instance.handleTogglePet((response) => {
      console.log("Web Pet: Paused due to page visibility change");
    });
  }
});
