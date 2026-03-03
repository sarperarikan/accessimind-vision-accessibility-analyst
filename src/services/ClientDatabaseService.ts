import { IJiraTicketHistory } from '../domain/models';

export class ClientDatabaseService {
    private static instance: ClientDatabaseService;
    private readonly SETTINGS_KEY = 'ACCESSIMIND_SETTINGS';
    private readonly HISTORY_KEY = 'ACCESSIMIND_HISTORY';

    private inMemorySettings: Record<string, string> = {};
    private inMemoryHistory: IJiraTicketHistory[] = [];
    private inMemoryProjects: import('../domain/models').IProject[] = [];
    private isElectron = false;
    private initialized = false;

    private constructor() {
        if (typeof window !== 'undefined') {
            // Check for electron bridge
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.isElectron = !!(window as any).electron?.fs;
            this.loadInitialData();
        }
    }

    // Add an init method that can be awaited in app root
    public async init(): Promise<void> {
        if (this.initialized) return;

        if (typeof window !== 'undefined') {
            try {
                if (this.isElectron) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const fs = (window as any).electron.fs;
                    await fs.ensureDirs();

                    const settings = await fs.readData('settings.json');
                    if (settings) this.inMemorySettings = settings;
                    else this.inMemorySettings = this.getSettingsObjFromLocal();

                    const history = await fs.readData('history.json');
                    if (history) this.inMemoryHistory = history;
                    else this.inMemoryHistory = this.getHistoryFromLocal();

                    const projects = await fs.readData('projects.json');
                    if (projects) this.inMemoryProjects = projects;
                    else this.inMemoryProjects = this.getProjectsFromLocal();

                } else {
                    this.inMemorySettings = this.getSettingsObjFromLocal();
                    this.inMemoryHistory = this.getHistoryFromLocal();
                    this.inMemoryProjects = this.getProjectsFromLocal();
                }
            } catch (e) {
                console.error('Failed to initialize DB', e);
            }
        }
        this.initialized = true;
    }

    private loadInitialData() {
        // Synchronous fallback load
        if (!this.isElectron) {
            this.inMemorySettings = this.getSettingsObjFromLocal();
            this.inMemoryHistory = this.getHistoryFromLocal();
            this.inMemoryProjects = this.getProjectsFromLocal();
        }
    }

    static getInstance(): ClientDatabaseService {
        if (typeof window === 'undefined') {
            return new ClientDatabaseService();
        }
        if (!this.instance) {
            this.instance = new ClientDatabaseService();
        }
        return this.instance;
    }

    getSetting(key: string): string | null {
        if (typeof window === 'undefined') return null;
        return this.inMemorySettings[key] || null;
    }

    setSetting(key: string, value: string): void {
        if (typeof window === 'undefined') return;
        this.inMemorySettings[key] = value;
        this.persist(this.SETTINGS_KEY, this.inMemorySettings, 'settings.json');
    }

    getHistory(): IJiraTicketHistory[] {
        if (typeof window === 'undefined') return [];
        return this.inMemoryHistory;
    }

    addToHistory(item: IJiraTicketHistory): void {
        if (typeof window === 'undefined') return;
        this.inMemoryHistory.unshift(item);
        if (this.inMemoryHistory.length > 50) {
            this.inMemoryHistory = this.inMemoryHistory.slice(0, 50);
        }
        this.persist(this.HISTORY_KEY, this.inMemoryHistory, 'history.json');
    }

    deleteFromHistory(id: string): void {
        if (typeof window === 'undefined') return;
        this.inMemoryHistory = this.inMemoryHistory.filter(h => h.id !== id);
        this.persist(this.HISTORY_KEY, this.inMemoryHistory, 'history.json');
    }

    // Project Management
    private readonly PROJECTS_KEY = 'ACCESSIMIND_PROJECTS';

    getProjects(): import('../domain/models').IProject[] {
        if (typeof window === 'undefined') return [];
        return this.inMemoryProjects.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    getProject(id: string): import('../domain/models').IProject | undefined {
        return this.inMemoryProjects.find(p => p.id === id);
    }

    createProject(project: import('../domain/models').IProject): void {
        if (typeof window === 'undefined') return;
        this.inMemoryProjects.unshift(project);
        this.persist(this.PROJECTS_KEY, this.inMemoryProjects, 'projects.json');
    }

    updateProject(id: string, updates: Partial<import('../domain/models').IProject>): void {
        if (typeof window === 'undefined') return;
        const index = this.inMemoryProjects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.inMemoryProjects[index] = { ...this.inMemoryProjects[index], ...updates, updatedAt: new Date().toISOString() };
            this.persist(this.PROJECTS_KEY, this.inMemoryProjects, 'projects.json');
        }
    }

    deleteProject(id: string): void {
        if (typeof window === 'undefined') return;
        this.inMemoryProjects = this.inMemoryProjects.filter(p => p.id !== id);
        this.persist(this.PROJECTS_KEY, this.inMemoryProjects, 'projects.json');

        // Update history unlink
        let historyChanged = false;
        this.inMemoryHistory = this.inMemoryHistory.map(h => {
            if (h.projectId === id) {
                historyChanged = true;
                const { projectId, ...rest } = h;
                return rest;
            }
            return h;
        });

        if (historyChanged) {
            this.persist(this.HISTORY_KEY, this.inMemoryHistory, 'history.json');
        }
    }

    getProjectHistory(projectId: string): IJiraTicketHistory[] {
        return this.inMemoryHistory.filter(h => h.projectId === projectId);
    }

    // Helpers
    private getSettingsObjFromLocal(): Record<string, string> {
        const raw = localStorage.getItem(this.SETTINGS_KEY);
        return raw ? JSON.parse(raw) : {};
    }

    private getHistoryFromLocal(): IJiraTicketHistory[] {
        const raw = localStorage.getItem(this.HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    }

    private getProjectsFromLocal(): import('../domain/models').IProject[] {
        const raw = localStorage.getItem(this.PROJECTS_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch (e) {
            return [];
        }
    }

    private persist(key: string, data: any, filename: string) {
        // Always save to local storage as backup/sync 
        localStorage.setItem(key, JSON.stringify(data));

        if (this.isElectron) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).electron.fs.writeData(filename, data).catch((e: any) => console.error('FS Write Failed', e));
        }
    }
}
