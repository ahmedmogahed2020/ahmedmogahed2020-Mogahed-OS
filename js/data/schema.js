export const APP_VERSION = '1.13.0';

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
  claimedWinRewards: [],
  notifications: { enabled: true, soundEnabled: true, browserNotifications: false, leadMinutes: 10, volume: 0.35, soundType: 'soft', categorySounds: { tasks: 'clear', goals: 'goal', projects: 'project', knowledge: 'knowledge', decisions: 'decision', reviews: 'review', wins: 'success', campaigns: 'campaign', emergency: 'emergency', backup: 'minimal', system: 'soft' }, focusSound: true }
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
