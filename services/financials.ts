// financials.ts
// Single source of truth for all ROI math. Imported by BOTH the Express
// server (to feed correct numbers into the LLM prompt) and the client
// dashboard (to render). The model never computes these numbers — it only
// writes narrative around them — so the deck, the cards, and the prose can
// never disagree.

import { FinancialInputs } from "../types";

// Working weeks per year used for labor-savings projection.
export const WEEKS_PER_YEAR = 50;

// EBT brand palette reused by the dashboard and the PPTX export.
export const THEME_COLORS = {
  green: "#10B981",
  blue: "#3B82F6",
  gold: "#F59E0B",
} as const;

export interface ComputedMetrics {
  /** Annual savings from reclaimed labor hours. */
  annualLaborSavings: number;
  /** Projected annual revenue increase (passed through from input). */
  revenueUplift: number;
  /** Labor savings + revenue uplift (gross, before OpEx). */
  grossBenefit: number;
  /** Annual operational cost (passed through from input). */
  operationalCost: number;
  /** Gross benefit - operational cost. */
  netBenefit: number;
  /** One-time implementation cost (passed through from input). */
  implementationCost: number;
  /** netBenefit / 12. */
  monthlyNetBenefit: number;
  /** Year-1 net profit: netBenefit - implementationCost. */
  netProfitYear1: number;
  /** ROI as a decimal ratio (0.5 = 50%). null when implementation cost is 0. */
  roi: number | null;
  /** Months to recover implementation cost. null = never recovers (net benefit <= 0). */
  breakEvenMonths: number | null;
}

const num = (v: number) => (Number.isFinite(v) ? v : 0);

/**
 * Deterministic ROI computation. Pure function, no side effects.
 * Mirrors the procedure that used to live in the system prompt.
 */
export function computeFinancials(inputs: FinancialInputs): ComputedMetrics {
  const weeklyTimeSaved = num(inputs.weeklyTimeSaved);
  const avgLaborCost = num(inputs.avgLaborCost);
  const revenueUplift = num(inputs.projectedRevenueUplift);
  const operationalCost = num(inputs.operationalCost);
  const implementationCost = num(inputs.implementationCost);

  const annualLaborSavings = weeklyTimeSaved * WEEKS_PER_YEAR * avgLaborCost;
  const grossBenefit = annualLaborSavings + revenueUplift;
  const netBenefit = grossBenefit - operationalCost;
  const monthlyNetBenefit = netBenefit / 12;
  const netProfitYear1 = netBenefit - implementationCost;

  const roi =
    implementationCost > 0 ? (netBenefit - implementationCost) / implementationCost : null;

  const breakEvenMonths =
    monthlyNetBenefit > 0 ? implementationCost / monthlyNetBenefit : null;

  return {
    annualLaborSavings,
    revenueUplift,
    grossBenefit,
    operationalCost,
    netBenefit,
    implementationCost,
    monthlyNetBenefit,
    netProfitYear1,
    roi,
    breakEvenMonths,
  };
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num(value));

/** ROI as a display string, e.g. "150%" or "N/A" when undefined. */
export const formatRoiPercent = (roi: number | null, decimals = 0) =>
  roi === null ? "N/A" : `${(roi * 100).toFixed(decimals)}%`;

/** Break-even as a display string, e.g. "8.4" months or "Never". */
export const formatBreakEven = (months: number | null) =>
  months === null ? "Never" : new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(months);
