import { FinancialInputs, FinancialReport } from "../types";

export const generateProfitabilityReport = async (inputs: FinancialInputs): Promise<FinancialReport> => {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    return await response.json() as FinancialReport;
  } catch (error) {
    console.error("Error generating report via server API:", error);
    throw error;
  }
};

export const extractInputsFromText = async (text: string): Promise<FinancialInputs> => {
  try {
    const response = await fetch("/api/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    return await response.json() as FinancialInputs;
  } catch (error) {
    console.error("Error extracting parameters:", error);
    throw error;
  }
};

