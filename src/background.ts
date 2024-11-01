console.log("Web Pet Companion: Background script loaded");

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Web Pet Companion: Extension installed");
});

// This export is needed to make TypeScript happy when this file is imported as a module
export {};
