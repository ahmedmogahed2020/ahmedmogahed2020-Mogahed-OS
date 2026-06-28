export const APP_VERSION = '1.5.0';

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
  recentItems: []
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
    settings: { ...defaultSettings }
  };
}

export const collectionNames = ['goals','projects','tasks','knowledge','decisions','reviews','wins','campaigns','emergencyLogs'];
