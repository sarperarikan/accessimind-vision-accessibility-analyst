import { GoogleGenAI } from '@google/genai';
import { IAiService } from '../core/IAiService';
import { IAnalysisOptions, IJiraTicket } from '../domain/models';

export class GeminiAiService implements IAiService {
    private ai: GoogleGenAI;
    private readonly MAX_RETRIES = 3;
    private readonly INITIAL_RETRY_DELAY = 2000; // 2 seconds

    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({
            apiKey: apiKey,
        });
    }

    private async wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async analyzeAccessibility(options: IAnalysisOptions): Promise<IJiraTicket> {
        const responseLanguage = options.language === 'tr' ? 'Turkish' : 'English';
        const expertRules = options.systemRules || '';

        const config = {
            thinkingConfig: {
                thinkingLevel: 'HIGH',
            },
            systemInstruction: [
                {
                    text: `${expertRules}
                    
          You are a 20-year iOS, Android, and Web Accessibility Expert. Your goal is to analyze screen recordings with extreme precision, identifying WCAG 2.2 AA violations and providing professional remediation steps.
          
          Guidelines:
          1. Analyze the VIDEO entirely to identify actual failures (e.g., missing labels, low contrast, poor focus order, non-descriptive elements).
          2. NEVER return an empty analysis or placeholders. If the video shows a screen, there is ALWAYS something to analyze based on best practices.
          3. Base your findings on platform-specific standards (e.g., VoiceOver for iOS, TalkBack for Android).
          4. IMPORTANT: All text content in your response (summary, description, results, steps) MUST be in ${responseLanguage}.
          5. DETAIL LEVEL: ${options.detailLevel || 'normal'}.
             - Concise: Provide only critical violations and a brief summary. Omit explanation of standard pass criteria. Focus on top 3 critical issues.
             - Normal: Standard detailed analysis. Balance between brevity and depth.
             - Detailed: Provide comprehensive context, educational explanations for each violation, and detailed remediation steps including code snippets where possible.
          6. Format your response STRICTLY as a valid JSON object matching this structure:
             - summary: A concise technical summary of the primary accessibility issue.
             - description: A detailed technical breakdown of the observed accessibility context.
             - observedResults: A list of specific, evidence-based accessibility failures found in the video.
             - expectedResults: A list of specific, WCAG-conformant correction steps.
             - testSteps: A step-by-step reproduction guide to verify the accessibility issue using assistive tools.
             - impact: One of: "Critical", "High", "Medium", "Low".
             - wcagCriteria: A list of applicable WCAG 2.2 criteria (e.g., ["1.1.1 Non-text Content", "1.4.3 Contrast"]).
             - remediationPriority: One of: "High", "Medium", "Low".
          7. Response must be valid JSON and ONLY valid JSON.`,
                }
            ],
        };

        const model = options.model || 'gemini-3.0-flash';

        const contents = [
            {
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            data: options.videoData,
                            mimeType: options.mimeType,
                        },
                    },
                    {
                        text: `Analyze the provided ${options.platform} screen recording for critical accessibility violations. Think step-by-step as a world-class accessibility auditor. Record every issue you see and provide a comprehensive Jira ticket in JSON format. All textual descriptions must be in ${responseLanguage}. Do not omit details.`,
                    },
                ],
            },
        ];

        let lastError: Error | null = null;
        for (let i = 0; i < this.MAX_RETRIES; i++) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response = await (this.ai.models as any).generateContent({
                    model,
                    config,
                    contents,
                });

                const text = response.text;

                if (!text || text.trim().length === 0) {
                    if (i < this.MAX_RETRIES - 1) {
                        console.warn(`Empty response from Gemini API. Retrying in ${this.INITIAL_RETRY_DELAY}ms... (Attempt ${i + 1}/${this.MAX_RETRIES})`);
                        await this.wait(this.INITIAL_RETRY_DELAY);
                        continue;
                    }
                    throw new Error('Empty response from Gemini API');
                }

                try {
                    // Remove Markdown formatting if AI included it
                    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
                    const parsed = JSON.parse(cleanedText);

                    return {
                        summary: parsed.summary || 'Accessibility Analysis Report',
                        description: parsed.description || '',
                        observedResults: Array.isArray(parsed.observedResults) ? parsed.observedResults : [],
                        expectedResults: Array.isArray(parsed.expectedResults) ? parsed.expectedResults : [],
                        testSteps: Array.isArray(parsed.testSteps) ? parsed.testSteps : [],
                        impact: parsed.impact || 'Medium',
                        wcagCriteria: Array.isArray(parsed.wcagCriteria) ? parsed.wcagCriteria : [],
                        remediationPriority: parsed.remediationPriority || 'Medium',
                    } as IJiraTicket;
                } catch (e: unknown) {
                    console.error('Failed to parse AI response', text, e);
                    return this.parseTextToJira(text);
                }
            } catch (error: unknown) {
                lastError = error instanceof Error ? error : new Error(String(error));
                const message = lastError.message;
                const isOverloaded = message?.includes('503') || message?.includes('overloaded');

                if (isOverloaded && i < this.MAX_RETRIES - 1) {
                    const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, i);
                    console.warn(`Gemini model overloaded. Retrying in ${delay}ms... (Attempt ${i + 1}/${this.MAX_RETRIES})`);
                    await this.wait(delay);
                    continue;
                }

                console.error('Gemini API Error:', error);
                throw error;
            }
        }

        throw lastError || new Error('Failed to analyze accessibility after multiple retries');
    }

    private parseTextToJira(text: string): IJiraTicket {
        return {
            summary: 'Accessibility Analysis Report',
            description: text,
            observedResults: [],
            expectedResults: [],
            testSteps: [],
            impact: 'Medium',
            wcagCriteria: [],
            remediationPriority: 'Medium',
        };
    }

    async askFollowUp(ticket: IJiraTicket, question: string, platform: string, language: 'tr' | 'en' = 'en', expertRules: string = '', videoData?: string, mimeType?: string, modelPreference?: string): Promise<string> {
        const responseLanguage = language === 'tr' ? 'Turkish' : 'English';
        const platformExpert = language === 'tr' ? `${platform} Erişilebilirlik Uzmanı` : `${platform} Accessibility Expert`;

        const systemInstruction = `${expertRules}
        
        You are a world-class Accessibility Expert (WCAG 2.2 AA) with 20 years of experience.
        You are analyzing the PROVIDED VIDEO and a previously generated Jira ticket based on it:
        
        TICKET DETAILS:
        Summary: ${ticket.summary}
        Description: ${ticket.description}
        Impact: ${ticket.impact || 'Unknown'}
        WCAG Criteria: ${ticket.wcagCriteria?.join(', ') || 'None provided'}
        
        The user has a follow-up question. 
        IMPORTANT GUIDELINES:
        1. USE THE VIDEO as your primary source of truth. If the user asks about a specific moment or element, refer to what is visible in the video.
        2. Give technical, professional, and evidence-based answers.
        3. ALWAYS respond in ${responseLanguage}.
        4. If you see something in the video that wasn't in the initial ticket, feel free to point it out.
        5. Keep your answer concise but technical and helpful.`;

        const model = modelPreference || 'gemini-3.0-flash';

        const parts: unknown[] = [{ text: question }];
        if (videoData && mimeType) {
            parts.unshift({
                inlineData: {
                    data: videoData,
                    mimeType: mimeType,
                },
            });
        }

        try {
            console.log(`Sending follow-up question to ${model} for ${platform}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await (this.ai.models as any).generateContent({
                model,
                config: {
                    systemInstruction: [{ text: systemInstruction }]
                },
                contents: [{ role: 'user', parts }],
            });

            if (!result || !result.text) {
                console.warn('Gemini chat returned no text. result:', result);
                return 'No response generated from AI.';
            }

            return result.text;
        } catch (error: unknown) {
            console.error('Follow-up chat error details:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown provider error';
            throw new Error(`Failed to get answer: ${errorMessage}`);
        }
    }

    static async listModels(apiKey: string): Promise<{ name: string; displayName: string }[]> {
        if (!apiKey) return [];
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (!response.ok) {
                console.error('Failed to list models:', response.statusText);
                return [];
            }
            const data = await response.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (data.models || [])
                .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
                .map((m: any) => ({
                    // name is like "models/gemini-pro" -> we want "gemini-pro"
                    name: m.name.replace('models/', ''),
                    displayName: m.displayName || m.name.replace('models/', '')
                }))
                .sort((a: any, b: any) => b.name.localeCompare(a.name)); // Newest first
        } catch (error) {
            console.error('Error fetching models:', error);
            return [];
        }
    }
}
