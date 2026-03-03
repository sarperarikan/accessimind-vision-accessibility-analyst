export interface IJiraTicket {
  summary: string;
  description: string;
  observedResults: string[];
  expectedResults: string[];
  testSteps: string[];
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  wcagCriteria: string[];
  remediationPriority: 'High' | 'Medium' | 'Low';
}

export interface IJiraTicketHistory extends IJiraTicket {
  id: string;
  timestamp: string;
  platform: Platform;
  projectId?: string;
}

export interface IProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type Platform = 'iOS' | 'Android' | 'Web';
export type AiModel = 'gemini-2.0-flash-exp' | 'gemini-2.5-flash' | 'gemini-3-flash-preview';

export interface IAnalysisOptions {
  videoData: string;
  platform: Platform;
  mimeType: string;
  model?: string;
  language?: 'tr' | 'en';
  systemRules?: string;
  projectId?: string;
  detailLevel?: 'concise' | 'normal' | 'detailed';
}
