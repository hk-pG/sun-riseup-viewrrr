import { Store } from '@tauri-apps/plugin-store';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
}

class SettingsService {
  private store: Store | null = null;

  private async getStore(): Promise<Store> {
    if (!this.store) {
      this.store = await Store.load('settings.json');
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
