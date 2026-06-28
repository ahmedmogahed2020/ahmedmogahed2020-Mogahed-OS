const DEFAULT_KEY = 'mogahed_os_data_v1';
const TEST_KEY = '__mogahed_os_storage_test__';

function assertStorage() {
  if (typeof localStorage === 'undefined') throw new Error('LocalStorage غير متاح في هذا المتصفح.');
  return localStorage;
}

export const localStorageAdapter = {
  id: 'localStorage',
  label: 'LocalStorage Adapter',
  mode: 'local',
  key: DEFAULT_KEY,

  read(key = DEFAULT_KEY) {
    const storage = assertStorage();
    return storage.getItem(key);
  },

  write(value, key = DEFAULT_KEY) {
    const storage = assertStorage();
    storage.setItem(key, value);
    return { ok: true, adapter: this.id, key };
  },

  remove(key = DEFAULT_KEY) {
    const storage = assertStorage();
    storage.removeItem(key);
    return { ok: true, adapter: this.id, key };
  },

  health() {
    try {
      const storage = assertStorage();
      storage.setItem(TEST_KEY, 'ok');
      storage.removeItem(TEST_KEY);
      return { ok: true, adapter: this.id, message: 'التخزين المحلي يعمل بشكل سليم.' };
    } catch (error) {
      return { ok: false, adapter: this.id, message: error?.message || 'فشل اختبار التخزين المحلي.', error };
    }
  },

  estimateSize(value) {
    try {
      return new Blob([String(value || '')]).size;
    } catch {
      return String(value || '').length;
    }
  }
};
