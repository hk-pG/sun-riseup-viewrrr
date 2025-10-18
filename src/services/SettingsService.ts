import { Store } from '@tauri-apps/plugin-store';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
}

class SettingsService {
  private store: Store | null = null;

  private async getStore(): Promise<Store> {
    if (!this.store) {
      try {
        this.store = await Store.load('settings.json');
      } catch (error) {
        // Fallback for test environments or when Tauri is not available
        console.warn('Store.load failed, using fallback:', error);

        // Create a mock store for testing/fallback
        const mockData: Record<string, unknown> = {};
        this.store = {
          get: async (key: string) => {
            return mockData[key] || null;
          },
          set: async (key: string, value: unknown) => {
            mockData[key] = value;
          },
          save: async () => {
            // Mock save - no persistence in fallback mode
          },
        } as unknown as Store;
      }
    }
    return this.store;
  }

  async loadTheme(): Promise<'light' | 'dark' | 'system'> {
    try {
      const store = await this.getStore();
      const theme = await store.get<'light' | 'dark' | 'system'>('theme');
      return theme || 'system';
    } catch (error) {
      console.warn('Failed to load theme setting:', error);
      return 'system';
    }
  }

  async saveTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    try {
      const store = await this.getStore();
      await store.set('theme', theme);
      await store.save();
    } catch (error) {
      console.error('Failed to save theme setting:', error);
    }
  }

  async loadSettings(): Promise<AppSettings> {
    try {
      const theme = await this.loadTheme();
      return { theme };
    } catch (error) {
      console.warn('Failed to load settings:', error);
      return { theme: 'system' };
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      if (settings.theme) {
        await this.saveTheme(settings.theme);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }
}

export const settingsService = new SettingsService();
