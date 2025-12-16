// types.ts (For reference)

export interface FinancialInputs {
  aiUseCase: string; // New AI Use Case field
  weeklyTimeSaved: number; // hrs
  avgLaborCost: number; // usd/hr
  implementationCost: number; // usd (One-time)
  operationalCost: number; // usd (Annual)
  // --- New Hard Metric ---
  projectedRevenueUplift: number; // usd
  // --- New Soft Metrics ---
  riskMitigationScore: number; // 1-10
  strategicAgilityScore: number; // 1-10
}

export interface FinancialReport {
  project_title: string;
  inputs_used: {
    ai_use_case: string;
    weekly_time_saved_hours: number;
    avg_labor_cost_per_hour_usd: number;
    one_time_implementation_cost_usd: number;
    operational_cost_per_year_usd: number;
    projected_revenue_uplift_usd: number;
    risk_mitigation_score_1_to_10: number;
    strategic_agility_score_1_to_10: number;
  };
  metrics: {
    annual_cost_savings_usd: number; // Savings from time only
    projected_revenue_uplift_usd: number; // Revenue increase
    total_annual_hard_savings_usd: number; // Combined Gross Savings
    roi_percentage: number;
    break_even_point_months: number;
    soft_roi_summary: string;
    slide_visual_recommendation: string[]; // New list for presentation
    // --- New PPTX Data Structure ---
    pptx_data_structure: {
        theme_colors: { green: string; blue: string; gold: string };
        slide_title: string;
        key_metrics: { label: string; value: string; color: string }[];
        summary_bullet_points: string[];
    };
  };
  executive_summary: string;
}

export enum FetchStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}