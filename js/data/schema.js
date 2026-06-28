export const APP_VERSION = '1.11.0';

export const defaultSettings = {
  userName: 'مجاهد',
  lastSavedAt: null,
  lastPage: 'home',
  seedLoaded: false,
  autoSave: true,
  youtubeApiKey: '',
  storeName: 'Mogahed OS',
  currency: 'EGP',
  dailyTaskTarget: 5,
  learningMinutesTarget: 30,
  quietMode: false,
  compactMode: false,
  enableSeedData: true,
  lastSystemTestAt: null,
  lastSystemTestSummary: null,
  recentItems: [],
  notifications: { enabled: true, soundEnabled: true, browserNotifications: false, leadMinutes: 10, volume: 0.35, soundType: 'soft', focusSound: true }
};

export function createEmptyData() {
  return {
    version: APP_VERSION,
    goals: [],
    projects: [],
    tasks: [],
    knowledge: [],
    decisions: [],
    reviews: [],
    wins: [],
    campaigns: [],
    emergencyLogs: [],
    notificationLogs: [],
    settings: { ...defaultSettings }
  };
}

export const collectionNames = ['goals','projects','tasks','knowledge','decisions','reviews','wins','campaigns','emergencyLogs','notificationLogs'];
