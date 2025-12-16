
export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type AIProvider = 'gemini' | 'openai';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface Correction {
  original: string;
  suggestion: string;
  reason: string;
  type: 'grammar' | 'typo' | 'style' | 'punctuation';
  location_snippet: string; // A small snippet of text around the error to help locate it
}

export interface TitleAnalysis {
  score: number;
  viralPotential: 'High' | 'Medium' | 'Low';
  critique: string;
  suggestions: string[];
  examples: string[];
}

export interface ArticleScores {
  total: number;
  readability: number;
  logic: number;
  emotion: number;
  creativity: number;
}

export interface StructureNode {
  name: string; // The concept or section title
  type: 'root' | 'main_point' | 'sub_point' | 'evidence' | 'conclusion';
  description?: string;
  children?: StructureNode[];
}

export interface AnalysisResult {
  scores: ArticleScores;
  summary: string;
  keywords: string[];
  corrections: Correction[];
  titleAnalysis: TitleAnalysis;
  polishedContent: string; // The full rewritten article
  toneAnalysis: string;
  structure: StructureNode; // Root node of the logic tree
}

export interface EditorState {
  title: string;
  content: string;
}
