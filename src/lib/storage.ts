// 1. Define the shape of your JSON Database profile
export interface SensaUserProfile {
  globalSettings: {
    hasSeenWelcome: boolean;
    activeMode: "visual" | "auditory" | null;
    theme: "light" | "dark"; // New persistent setting
  };
  visualState: {
    ttsEnabled: boolean;
    readingSpeed: number;
    // ... Phase 2 settings pending
  };
  auditoryState: {
    captionsEnabled: boolean;
    targetLanguage: string;
    // ... Phase 3 settings pending
  };
}

// 2. Define the exact default profile for new users
export const DEFAULT_PROFILE: SensaUserProfile = {
  globalSettings: {
    hasSeenWelcome: false,
    activeMode: null,
    theme: "light", // Default is light mode
  },
  visualState: {
    ttsEnabled: false,
    readingSpeed: 1.0,
  },
  auditoryState: {
    captionsEnabled: false,
    targetLanguage: "en-US",
  },
};