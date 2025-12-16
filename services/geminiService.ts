import { GoogleGenAI, Type } from "@google/genai";
import { FinancialInputs, FinancialReport } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Role: AI ROI Analyst (Senior Financial and Strategic Consultant)

Your mission is to perform a comprehensive financial and strategic projection for an AI integration. You must act as a strict financial and analytical engine.

### Calculation Procedure
1.  **Annual Labor Savings (USD):** (Weekly Time Saved * 50 weeks) * (Average Labor Cost / Hour).
2.  **Total Annual Gross Benefit (USD):** Annual Labor Savings + Projected Revenue Uplift.
3.  **Annual Net Benefit (USD):** Total Annual Gross Benefit - Annual Operational Cost.
4.  **ROI (Year 1):** (Annual Net Benefit - One-Time Implementation Cost) / One-Time Implementation Cost.
5.  **Break-Even Point (Months):** One-Time Implementation Cost / (Annual Net Benefit / 12).
6.  **Soft ROI Synthesis:** Use the Risk Mitigation Score and Strategic Agility Score to generate a cohesive paragraph summarizing the non-financial, strategic value of the AI integration.
7.  **Final PPTX Data Structure Generation:** Assemble all key metrics (ROI, Savings, Break-Even, Use Case, and Executive Summary) into a single, comprehensive JSON object structure designed for immediate consumption by a presentation generation library, ensuring the theme and colors are explicitly defined.

### Input Data
The user provides specific values and the selected AI Use Case:
1.  ai_use_case: The specific business function being automated (e.g., Customer Service).
2.  weekly_time_saved_hours: Estimated hours of manual work saved per week.
3.  avg_labor_cost_per_hour_usd: Average fully loaded labor cost per hour.
4.  one_time_implementation_cost_usd: Total cost to develop/deploy.
5.  annual_operational_cost_usd: Ongoing annual costs.
6.  projected_revenue_uplift_usd: Estimated annual revenue increase.
7.  risk_mitigation_score_1_to_10: Qualitative score.
8.  strategic_agility_score_1_to_10: Qualitative score.

### Constraints
1.  **Output ONLY a single JSON object** that strictly adheres to the provided schema.
2.  The 'executive_summary' must be the final conclusion, factoring in both hard and soft ROI.
3.  All monetary and numeric values must be raw numbers (integers or floats).
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    project_title: { type: Type.STRING },
    inputs_used: {
      type: Type.OBJECT,
      properties: {
        ai_use_case: { type: Type.STRING, description: "The specific AI use case being analyzed." },
        weekly_time_saved_hours: { type: Type.NUMBER },
        avg_labor_cost_per_hour_usd: { type: Type.NUMBER },
        one_time_implementation_cost_usd: { type: Type.NUMBER },
        operational_cost_per_year_usd: { type: Type.NUMBER },
        projected_revenue_uplift_usd: { type: Type.NUMBER },
        risk_mitigation_score_1_to_10: { type: Type.NUMBER },
        strategic_agility_score_1_to_10: { type: Type.NUMBER },
      },
      required: [
        "ai_use_case",
        "weekly_time_saved_hours", 
        "avg_labor_cost_per_hour_usd", 
        "one_time_implementation_cost_usd", 
        "operational_cost_per_year_usd",
        "projected_revenue_uplift_usd", 
        "risk_mitigation_score_1_to_10", 
        "strategic_agility_score_1_to_10"
      ]
    },
    metrics: {
      type: Type.OBJECT,
      properties: {
        annual_cost_savings_usd: { type: Type.NUMBER, description: "Annual savings derived solely from time/labor reduction." },
        projected_revenue_uplift_usd: { type: Type.NUMBER, description: "Projected annual increase in sales/CLV from AI." },
        total_annual_hard_savings_usd: { type: Type.NUMBER, description: "Sum of Annual Cost Savings and Projected Revenue Uplift (Gross)." },
        roi_percentage: { type: Type.NUMBER },
        break_even_point_months: { type: Type.NUMBER },
        soft_roi_summary: { type: Type.STRING, description: "A strategic summary based on the soft scores." },
        slide_visual_recommendation: { 
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-5 key talking points and visual ideas for a presentation slide."
        },
        pptx_data_structure: {
            type: Type.OBJECT,
            description: "Structured data for a 1-slide executive summary presentation export.",
            properties: {
                theme_colors: { 
                  type: Type.OBJECT, 
                  properties: { 
                    green: { type: Type.STRING, enum: ["#10B981"] }, 
                    blue: { type: Type.STRING, enum: ["#3B82F6"] }, 
                    gold: { type: Type.STRING, enum: ["#F59E0B"] } 
                  } 
                },
                slide_title: { type: Type.STRING, description: "Executive Recommendation for AI Use Case" },
                key_metrics: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { 
                      label: { type: Type.STRING }, 
                      value: { type: Type.STRING }, 
                      color: { type: Type.STRING } 
                    } 
                  } 
                },
                summary_bullet_points: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["theme_colors", "slide_title", "key_metrics", "summary_bullet_points"]
        }
      },
      required: ["annual_cost_savings_usd", "projected_revenue_uplift_usd", "total_annual_hard_savings_usd", "roi_percentage", "break_even_point_months", "soft_roi_summary", "slide_visual_recommendation", "pptx_data_structure"]
    },
    executive_summary: { type: Type.STRING }
  },
  required: ["project_title", "inputs_used", "metrics", "executive_summary"]
};

export const generateProfitabilityReport = async (inputs: FinancialInputs): Promise<FinancialReport> => {
  try {
    const prompt = `
### Input Data
Please perform the profitability calculation based on the following metrics:

1.  ai_use_case: "${inputs.aiUseCase}"
2.  weekly_time_saved_hours: ${inputs.weeklyTimeSaved}
3.  avg_labor_cost_per_hour_usd: ${inputs.avgLaborCost}
4.  one_time_implementation_cost_usd: ${inputs.implementationCost}
5.  annual_operational_cost_usd: ${inputs.operationalCost}
6.  projected_revenue_uplift_usd: ${inputs.projectedRevenueUplift}
7.  risk_mitigation_score_1_to_10: ${inputs.riskMitigationScore}
8.  strategic_agility_score_1_to_10: ${inputs.strategicAgilityScore}

### Required Output Schema
Adhere strictly to this JSON schema for your output. Use your established Calculation Procedure to populate the 'metrics' section with raw numeric values.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.1, 
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text) as FinancialReport;

  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};