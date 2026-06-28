export const APP_VERSION = '1.0.0';

export const defaultSettings = {
  userName: 'مجاهد',
  lastSavedAt: null,
  lastPage: 'home',
  seedLoaded: false,
  autoSave: true,
  youtubeApiKey: ''
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
