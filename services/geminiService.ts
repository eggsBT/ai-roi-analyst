import { FinancialInputs, FinancialReport } from "../types";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export const generateProfitabilityReport = (inputs: FinancialInputs): Promise<FinancialReport> =>
  postJson<FinancialReport>("/api/analyze", { inputs });

export const extractInputsFromText = (text: string): Promise<FinancialInputs> =>
  postJson<FinancialInputs>("/api/extract", { text });
