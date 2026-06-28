import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser to read payload
  app.use(express.json());

  // API Route to extract inputs from unstructured text
  app.post("/api/extract", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Missing required text parameter." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured on the server. Please check your Settings/Secrets configuration."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const EXTRACT_SYSTEM_INSTRUCTION = `
You are an expert financial metrics extractor. Your role is to read an unstructured project proposal, meeting notes, email, or discussion text, and carefully extract 8 standard financial parameters for an AI Investment ROI calculation.

Guidelines:
1. Parse the text and find references to:
   - "aiUseCase": The category or operation being automated. Match it to one of the standard categories if possible, or summarize it in 2-4 words. Standard cases: "Customer Service Automation", "Automated Code Generation (Dev)", "Automated Invoice Processing", "Content Generation & Marketing", "Customer Churn Prediction", "Cybersecurity Threat Detection", "Drug Discovery & Research", "Dynamic Pricing Optimization", "Financial Fraud Detection", "Fleet Route Optimization", "HR Resume Screening & Recruiting", "Inventory Demand Forecasting", "Knowledge Base Search & Retrieval", "Legal Contract Analysis", "Medical Image Analysis", "Personalized Recommendations", "Predictive Maintenance (IoT)", "Quality Control Visual Inspection", "Regulatory Compliance Monitoring", "Sales Forecasting & Lead Scoring", "Supply Chain Optimization", "Other".
   - "weeklyTimeSaved": Hours saved per week (number). If not mentioned, infer a conservative reasonable number (e.g. 5 to 20 depending on scale) or default to 10.
   - "avgLaborCost": Loaded hourly labor cost in USD (number). If not mentioned, estimate based on industry average or default to 50.
   - "implementationCost": One-time upfront development/deployment cost in USD (number). If not mentioned, default to 10000.
   - "operationalCost": Annual ongoing costs in USD (number). If not mentioned, default to 2000.
   - "projectedRevenueUplift": Expected annual revenue increase/uplift in USD (number). If not mentioned, default to 0.
   - "riskMitigationScore": Qualitative index between 1 and 10 of how well it reduces compliance, legal, security, or financial risk. If not mentioned, infer a reasonable figure or default to 5.
   - "strategicAgilityScore": Qualitative index between 1 and 10 of how much flexibility or speed it gives the business. If not mentioned, default to 5.

2. Ensure all numbers are raw floats or integers, not strings or decorated text.
3. Be helpful, intelligent, and calculate/translate values correctly when they are stated indirectly (e.g., "saves 2 hours daily for 5 people" = 2 * 5 * 5 workdays = 50 hours/week).
`;

      const EXTRACT_SCHEMA = {
        type: Type.OBJECT,
        properties: {
          aiUseCase: { type: Type.STRING },
          weeklyTimeSaved: { type: Type.NUMBER },
          avgLaborCost: { type: Type.NUMBER },
          implementationCost: { type: Type.NUMBER },
          operationalCost: { type: Type.NUMBER },
          projectedRevenueUplift: { type: Type.NUMBER },
          riskMitigationScore: { type: Type.NUMBER },
          strategicAgilityScore: { type: Type.NUMBER }
        },
        required: [
          "aiUseCase",
          "weeklyTimeSaved",
          "avgLaborCost",
          "implementationCost",
          "operationalCost",
          "projectedRevenueUplift",
          "riskMitigationScore",
          "strategicAgilityScore"
        ]
      };

      const prompt = `Extract standard ROI inputs from this user content:
"""
${text}
"""
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: EXTRACT_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: EXTRACT_SCHEMA,
          temperature: 0.1,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from model for extraction.");
      }

      res.json(JSON.parse(responseText));
    } catch (err: any) {
      console.error("Extraction error:", err);
      res.status(500).json({ error: err.message || "Failed to extract parameters from text." });
    }
  });

  // API Route to call Gemini model
  app.post("/api/analyze", async (req, res) => {
    try {
      const { inputs } = req.body;
      if (!inputs) {
        return res.status(400).json({ error: "Missing required inputs parameter." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured on the server. Please check your Settings/Secrets configuration."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const SYSTEM_INSTRUCTION = `
Role: AI ROI Analyst (Senior Financial and Strategic Consultant)

Your mission is to perform a comprehensive financial and strategic projection for an AI integration. You must act as a strict financial and analytical engine.

### Calculation Procedure
1.  **Annual Labor Savings (USD):** (Weekly Time Saved * 50 weeks) * (Average Labor Cost / Hour).
2.  **Total Annual Gross Benefit (USD):** Annual Labor Savings + Projected Revenue Uplift.
3.  **Annual Net Benefit (USD):** Total Annual Gross Benefit - Annual Operational Cost.
4.  **ROI (Year 1):** Calculate as a decimal ratio. Formula: ((Annual Net Benefit - One-Time Implementation Cost) / One-Time Implementation Cost). Example: 1.5 equals 150%.
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
              roi_percentage: { type: Type.NUMBER, description: "ROI as a decimal ratio (e.g. 0.75 for 75%)" },
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

      // Upgraded to latest Gemini model gemini-3.5-flash
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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

      const reportData = JSON.parse(text);
      res.json(reportData);

    } catch (error: any) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: error.message || "Failed to generate report" });
    }
  });

  // Setup Vite middleware for dev mode or serve built client assets in production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
