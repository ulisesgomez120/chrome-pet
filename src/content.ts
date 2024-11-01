console.log("Web Pet Companion: Content script loaded");

// This will be expanded later to handle the pet's presence on the page
const initialize = () => {
  // Initialize content script functionality
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Web Pet Companion: Page loaded");
  });
};

initialize();

// This export is needed to make TypeScript happy when this file is imported as a module
export {};
