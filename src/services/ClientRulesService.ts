export class ClientRulesService {
    private static instance: ClientRulesService;

    private constructor() { }

    public static getInstance(): ClientRulesService {
        if (!ClientRulesService.instance) {
            ClientRulesService.instance = new ClientRulesService();
        }
        return ClientRulesService.instance;
    }

    public async getRulesForPlatform(platform: string, language: string = 'en'): Promise<string> {
        try {
            const langSuffix = language === 'tr' ? '_tr' : '';
            const fileName = `${platform.toLowerCase()}_accessibility_expert${langSuffix}.md`;
            const fallbackFileName = `${platform.toLowerCase()}_accessibility_expert.md`;

            let rules = await this.fetchRules(fileName);
            if (!rules) {
                rules = await this.fetchRules(fallbackFileName);
            }
            return rules || '';
        } catch (error) {
            console.error(`Error reading rules for platform ${platform}:`, error);
            return '';
        }
    }

    public async getGeneralRules(language: string = 'en'): Promise<string> {
        try {
            const langSuffix = language === 'tr' ? '_tr' : '';
            const fileName = langSuffix ? `rules${langSuffix}.md` : 'rules.md';

            let rules = await this.fetchRules(fileName);
            if (!rules) {
                rules = await this.fetchRules('rules.md');
            }
            return rules || '';
        } catch (error) {
            console.error('Error reading general rules:', error);
            return '';
        }
    }

    private async fetchRules(filename: string): Promise<string | null> {
        try {
            // Check for Electron FS first
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof window !== 'undefined' && (window as any).electron?.fs) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const content = await (window as any).electron.fs.readRule(filename);
                if (content) return content;
            }

            // Fallback to fetch (Next.js public folder)
            const response = await fetch(`rules/${filename}`);
            if (!response.ok) return null;
            return await response.text();
        } catch (e) {
            console.error(`Failed to fetch rule ${filename}`, e);
            return null;
        }
    }

    public async getCombinedRules(platform: string, language: string = 'en'): Promise<string> {
        const generalRules = await this.getGeneralRules(language);
        const platformRules = await this.getRulesForPlatform(platform, language);

        return `${generalRules}\n\n${platformRules}`;
    }
}
