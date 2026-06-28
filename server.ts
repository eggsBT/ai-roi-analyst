import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialInputs, FinancialReport, NarrativeContent } from "./types";
import { computeFinancials, formatCurrency, formatRoiPercent, formatBreakEven } from "./services/financials";

/**
 * Load .env.local / .env into process.env WITHOUT overriding values already
 * present (so real shell / hosting env vars always win). Node's built-in
 * parser; missing files are ignored. tsx does not auto-load env files.
 */
function loadLocalEnv() {
  for (const file of [".env", ".env.local"]) {
    const full = path.resolve(process.cwd(), file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (!m || line.trim().startsWith("#")) continue;
      const key = m[1];
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  }
}

const MODEL = "gemini-3.5-flash";

// Reuse one client across requests rather than constructing per call.
let aiClient: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error("GEMINI_API_KEY is not configured on the server."), { statusCode: 500 });
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return aiClient;
}

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
    strategicAgilityScore: { type: Type.NUMBER },
  },
  required: [
    "aiUseCase", "weeklyTimeSaved", "avgLaborCost", "implementationCost",
    "operationalCost", "projectedRevenueUplift", "riskMitigationScore", "strategicAgilityScore",
  ],
};

// The model receives the already-computed numbers and writes ONLY narrative.
const NARRATIVE_SYSTEM_INSTRUCTION = `
Role: AI ROI Analyst (Senior Financial and Strategic Consultant).

You are given a set of ALREADY-CALCULATED, authoritative financial metrics for an AI integration. Do NOT recalculate or alter any number. Your job is to write the strategic narrative around these exact figures.

Produce:
1. project_title: A concise, executive title for this analysis.
2. executive_summary: A decisive 3-5 sentence conclusion that cites the provided ROI, break-even, and net benefit figures EXACTLY as given, weighing both hard financials and the soft (risk mitigation / strategic agility) scores.
3. soft_roi_summary: A cohesive paragraph on the non-financial, strategic value, grounded in the risk and agility scores.
4. slide_visual_recommendation: 3-5 talking points / visual ideas for a presentation slide.
5. slide_title: A title for a single executive summary slide.
6. summary_bullet_points: 3-5 punchy bullet points for that slide, consistent with the provided numbers.

Constraints:
- Never contradict or restate the numbers with different values. If break-even is "Never", frame the investment honestly as not recovering within the modeled horizon.
- Output ONLY a single JSON object adhering to the provided schema.
`;

const NARRATIVE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    project_title: { type: Type.STRING },
    executive_summary: { type: Type.STRING },
    soft_roi_summary: { type: Type.STRING },
    slide_visual_recommendation: { type: Type.ARRAY, items: { type: Type.STRING } },
    slide_title: { type: Type.STRING },
    summary_bullet_points: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "project_title", "executive_summary", "soft_roi_summary",
    "slide_visual_recommendation", "slide_title", "summary_bullet_points",
  ],
};

async function startServer() {
  loadLocalEnv();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Cap body size to limit abuse of the LLM-backed endpoints.
  app.use(express.json({ limit: "32kb" }));

  // Extract structured inputs from unstructured text.
  app.post("/api/extract", async (req, res) => {
    try {
      const { text } = req.body ?? {};
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Missing required text parameter." });
      }
      if (text.length > 12000) {
        return res.status(413).json({ error: "Input text is too long (max 12,000 characters)." });
      }

      const ai = getClient();
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `Extract standard ROI inputs from this user content:\n"""\n${text}\n"""\n`,
        config: {
          systemInstruction: EXTRACT_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: EXTRACT_SCHEMA,
          temperature: 0.1,
        },
      });

      if (!response.text) throw new Error("No response received from model for extraction.");
      res.json(JSON.parse(response.text));
    } catch (err: any) {
      console.error("Extraction error:", err);
      res.status(err.statusCode || 500).json({ error: clientError(err) });
    }
  });

  // Analyze: compute metrics in code, then have the model write narrative.
  app.post("/api/analyze", async (req, res) => {
    try {
      const inputs = req.body?.inputs as FinancialInputs | undefined;
      if (!inputs || typeof inputs !== "object") {
        return res.status(400).json({ error: "Missing required inputs parameter." });
      }

      // 1. Authoritative, deterministic math (never touched by the model).
      const metrics = computeFinancials(inputs);

      // 2. Model writes narrative around the exact figures.
      const prompt = `
Write the strategic narrative for the following AI integration. These numbers are FINAL and authoritative — cite them exactly, do not recompute.

AI Use Case: ${inputs.aiUseCase}
Risk Mitigation Score: ${inputs.riskMitigationScore}/10
Strategic Agility Score: ${inputs.strategicAgilityScore}/10

Authoritative financial results:
- Annual labor savings: ${formatCurrency(metrics.annualLaborSavings)}
- Projected annual revenue uplift: ${formatCurrency(metrics.revenueUplift)}
- Gross annual benefit: ${formatCurrency(metrics.grossBenefit)}
- Annual operational cost: ${formatCurrency(metrics.operationalCost)}
- Annual net benefit: ${formatCurrency(metrics.netBenefit)}
- One-time implementation cost: ${formatCurrency(metrics.implementationCost)}
- Year-1 net profit: ${formatCurrency(metrics.netProfitYear1)}
- Year-1 ROI: ${formatRoiPercent(metrics.roi)}
- Break-even: ${formatBreakEven(metrics.breakEvenMonths)}${metrics.breakEvenMonths === null ? "" : " months"}
`;

      const ai = getClient();
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          systemInstruction: NARRATIVE_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: NARRATIVE_SCHEMA,
          temperature: 0.4,
        },
      });

      if (!response.text) throw new Error("No response text received from Gemini.");
      const narrative = JSON.parse(response.text) as NarrativeContent;

      const report: FinancialReport = { inputs, metrics, narrative };
      res.json(report);
    } catch (error: any) {
      console.error("Error generating report:", error);
      res.status(error.statusCode || 500).json({ error: clientError(error) });
    }
  });

  // Vite middleware in dev; static dist in production.
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Avoid leaking server internals; surface the configuration error explicitly.
function clientError(err: any): string {
  if (err?.message?.includes("GEMINI_API_KEY")) {
    return "GEMINI_API_KEY is not configured on the server. Please check your Settings/Secrets configuration.";
  }
  return "The AI service failed to process this request. Please try again.";
}

startServer();
