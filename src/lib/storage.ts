// 1. The exact shape of your JSON Database
export interface SensaUserProfile {
  globalSettings: {
    hasSeenWelcome: boolean;
    activeMode: "visual" | "auditory" | null;
  };
  visualState: {
    ttsEnabled: boolean;
    readingSpeed: number;
    // We will add more Phase 2 settings here later!
  };
  auditoryState: {
    captionsEnabled: boolean;
    targetLanguage: string;
    // We will add more Phase 3 settings here later!
  };
}

// 2. The Default State (What a brand new user gets)
export const DEFAULT_PROFILE: SensaUserProfile = {
  globalSettings: {
    hasSeenWelcome: false,
    activeMode: null,
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