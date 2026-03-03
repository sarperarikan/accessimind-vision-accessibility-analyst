import fs from 'fs';
import path from 'path';
import { IJiraTicketHistory } from '../domain/models';

export class JsonDatabaseService {
    private static instance: JsonDatabaseService;
    private dataPath: string;
    private data: { settings: Record<string, string>; analysis_history: IJiraTicketHistory[] } = { settings: {}, analysis_history: [] };

    private constructor() {
        const dbDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir);
        }
        this.dataPath = path.join(dbDir, 'app_db.json');
        this.load();
    }

    static getInstance(): JsonDatabaseService {
        if (!this.instance) {
            this.instance = new JsonDatabaseService();
        }
        return this.instance;
    }

    private load() {
        if (fs.existsSync(this.dataPath)) {
            try {
                const content = fs.readFileSync(this.dataPath, 'utf-8');
                this.data = JSON.parse(content);
            } catch (e) {
                console.error('Failed to parse database file, starting fresh', e);
                this.data = { settings: {}, analysis_history: [] };
            }
        } else {
            this.data = { settings: {}, analysis_history: [] };
            this.save();
        }
    }

    private save() {
        try {
            fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf-8');
        } catch (e) {
            console.error('Failed to save database file', e);
        }
    }

    getSetting(key: string): string | null {
        return this.data.settings[key] || null;
    }

    setSetting(key: string, value: string): void {
        if (!this.data.settings) this.data.settings = {};
        this.data.settings[key] = value;
        this.save();
    }

    getAllSettings(): Record<string, string> {
        return this.data.settings || {};
    }

    getHistory(): IJiraTicketHistory[] {
        return this.data.analysis_history || [];
    }

    addToHistory(item: IJiraTicketHistory): void {
        if (!this.data.analysis_history) this.data.analysis_history = [];
        this.data.analysis_history.unshift(item); // Add to the beginning
        // Limit history to 50 items
        if (this.data.analysis_history.length > 50) {
            this.data.analysis_history = this.data.analysis_history.slice(0, 50);
        }
        this.save();
    }

    deleteFromHistory(id: string): void {
        if (!this.data.analysis_history) return;
        this.data.analysis_history = this.data.analysis_history.filter((item) => item.id !== id);
        this.save();
    }
}
