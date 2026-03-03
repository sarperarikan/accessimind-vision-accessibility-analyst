import { JsonDatabaseService } from './JsonDatabaseService';

export class SettingsRepository {
    private db = JsonDatabaseService.getInstance();

    getSetting(key: string): string | null {
        return this.db.getSetting(key);
    }

    setSetting(key: string, value: string): void {
        this.db.setSetting(key, value);
    }

    getAllSettings(): Record<string, string> {
        return this.db.getAllSettings();
    }
}
