// types.ts

import { ComputedMetrics } from "./services/financials";

export interface FinancialInputs {
  aiUseCase: string;
  weeklyTimeSaved: number; // hrs/week
  avgLaborCost: number; // usd/hr
  implementationCost: number; // usd (one-time)
  operationalCost: number; // usd (annual)
  projectedRevenueUplift: number; // usd (annual)
  riskMitigationScore: number; // 1-10
  strategicAgilityScore: number; // 1-10
}

/**
 * The narrative fields the LLM is responsible for. It receives the
 * already-computed metrics and writes prose/slide content around them —
 * it does NOT produce any of the numbers.
 */
export interface NarrativeContent {
  project_title: string;
  executive_summary: string;
  soft_roi_summary: string;
  /** 3-5 talking points / visual ideas for a presentation slide. */
  slide_visual_recommendation: string[];
  /** Title for the exported executive slide. */
  slide_title: string;
  /** Bullet points for the exported slide. */
  summary_bullet_points: string[];
}

/**
 * Assembled, authoritative report returned by the server to the client.
 * `inputs` and `metrics` are code-owned; `narrative` is model-owned.
 */
export interface FinancialReport {
  inputs: FinancialInputs;
  metrics: ComputedMetrics;
  narrative: NarrativeContent;
}

export enum FetchStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}
