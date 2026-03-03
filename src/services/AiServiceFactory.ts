import { IAiService } from '../core/IAiService';
import { GeminiAiService } from './GeminiAiService';

export type AiProvider = 'gemini';

export interface AiServiceConfig {
    provider: AiProvider;
    apiKey?: string;
    baseUrl?: string;
}

export class AiServiceFactory {
    static create(config: AiServiceConfig): IAiService {
        if (!config.apiKey) {
            throw new Error('API Key required for Gemini');
        }
        return new GeminiAiService(config.apiKey);
    }
}
