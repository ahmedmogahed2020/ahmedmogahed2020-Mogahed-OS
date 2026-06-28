import { createEmptyData } from './data/schema.js';

export const appState = {
  data: createEmptyData(),
  activePage: 'home',
  filters: {
    goals: 'all', projects: 'all', tasks: 'today', knowledge: 'all', campaigns: 'all'
  },
  searchQuery: '',
  selectedItems: {},
  ui: { quickActionsOpen: false }
};

export function setData(data) { appState.data = data; }
export function setActivePage(page) { appState.activePage = page; appState.data.settings.lastPage = page; }
export function setFilter(section, value) { appState.filters[section] = value; }
export function updateCollection(collection, items) { appState.data[collection] = items; }
export function getCollection(collection) { return appState.data[collection] || []; }
