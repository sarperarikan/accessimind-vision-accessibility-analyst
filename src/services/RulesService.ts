import fs from 'fs';
import path from 'path';

export class RulesService {
    private static instance: RulesService;
    private rulesPath: string;

    private constructor() {
        this.rulesPath = path.join(process.cwd(), 'src', 'config', 'rules');
    }

    public static getInstance(): RulesService {
        if (!RulesService.instance) {
            RulesService.instance = new RulesService();
        }
        return RulesService.instance;
    }

    public getRulesForPlatform(platform: string, language: string = 'en'): string {
        try {
            const langSuffix = language === 'tr' ? '_tr' : '';
            const fileName = `${platform.toLowerCase()}_accessibility_expert${langSuffix}.md`;
            const fallbackFileName = `${platform.toLowerCase()}_accessibility_expert.md`;

            let filePath = path.join(this.rulesPath, fileName);
            if (!fs.existsSync(filePath)) {
                filePath = path.join(this.rulesPath, fallbackFileName);
            }

            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath, 'utf-8');
            }
            return '';
        } catch (error) {
            console.error(`Error reading rules for platform ${platform}:`, error);
            return '';
        }
    }

    public getGeneralRules(language: string = 'en'): string {
        try {
            const langSuffix = language === 'tr' ? '_tr' : '';
            const fileName = langSuffix ? `rules${langSuffix}.md` : 'rules.md';
            const filePath = path.join(this.rulesPath, fileName);

            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath, 'utf-8');
            }
            // Fallback to rules.md
            const fallbackPath = path.join(this.rulesPath, 'rules.md');
            if (fs.existsSync(fallbackPath)) {
                return fs.readFileSync(fallbackPath, 'utf-8');
            }
            return '';
        } catch (error) {
            console.error('Error reading general rules:', error);
            return '';
        }
    }

    public getCombinedRules(platform: string, language: string = 'en'): string {
        const generalRules = this.getGeneralRules(language);
        const platformRules = this.getRulesForPlatform(platform, language);

        return `${generalRules}\n\n${platformRules}`;
    }
}
