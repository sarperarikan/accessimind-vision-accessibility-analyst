import { IAnalysisOptions, IJiraTicket } from '../domain/models';

export interface IAiService {
    analyzeAccessibility(options: IAnalysisOptions): Promise<IJiraTicket>;
    askFollowUp(ticket: IJiraTicket, question: string, platform: string, language: 'tr' | 'en', systemRules?: string, videoData?: string, mimeType?: string, model?: string): Promise<string>;
}
