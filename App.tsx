import React, { useState } from 'react';
import { FetchStatus, FinancialInputs, FinancialReport } from './types';
import { generateProfitabilityReport } from './services/geminiService';
import InputForm from './components/InputForm';
import ResultsDashboard from './components/ResultsDashboard';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [status, setStatus] = useState<FetchStatus>(FetchStatus.IDLE);
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (inputs: FinancialInputs) => {
    setStatus(FetchStatus.LOADING);
    setError(null);
    setReport(null);

    try {
      const data = await generateProfitabilityReport(inputs);
      setReport(data);
      setStatus(FetchStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("Failed to generate profitability report. Please check your inputs and try again.");
      setStatus(FetchStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Navbar/Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Logo className="w-10 h-10 shadow-sm rounded-xl" />
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
               AI ROI Analyst
             </h1>
          </div>
          <div className="text-xs font-medium px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
            Powered by Gemini
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Artifact A: Instruction Box */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 mb-8 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg hidden sm:block shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">🎯 AI INVESTMENT ANALYSIS & JUSTIFICATION</h2>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Welcome to the AiROI Analyst, your executive tool for quantifying the business case for AI adoption. This analyst uses the Gemini model, acting as a Senior Financial Consultant, to generate a comprehensive ROI report, factoring in both hard financial metrics (Time Savings, Revenue Uplift) and qualitative strategic impact (Agility, Risk Mitigation).
              </p>
              <div className="bg-indigo-50/50 rounded-lg p-4 text-sm border border-indigo-100">
                 <h3 className="font-semibold text-indigo-900 mb-2">Guidance:</h3>
                 <ul className="list-disc list-inside space-y-1 text-slate-700 ml-1">
                   <li><strong className="text-indigo-800">Select an AI Use Case:</strong> Choose the specific business operation your AI solution is targeting.</li>
                   <li><strong className="text-indigo-800">Input Metrics:</strong> Provide realistic estimates for the 6 core parameters. Use the 1-10 slider scores to quantify the Soft ROI.</li>
                   <li><strong className="text-indigo-800">Generate & Present:</strong> Use the resulting Executive Summary and Slide Deck Recommendations to build a compelling justification.</li>
                 </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
               <InputForm onSubmit={handleCalculate} status={status} />
               
               {/* Executive Summary (Priority Display) */}
               {status === FetchStatus.SUCCESS && report && (
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 shadow-sm animate-fade-in">
                  <h4 className="text-emerald-800 font-bold text-lg mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Executive Summary
                  </h4>
                  <p className="text-slate-800 text-base leading-relaxed italic">
                    "{report.executive_summary}"
                  </p>
                </div>
               )}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            {status === FetchStatus.IDLE && (
              <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-600">No Data Calculated</h3>
                <p className="text-slate-400 max-w-sm mt-2">Enter your project parameters on the left to generate a detailed financial profitability report.</p>
              </div>
            )}

            {status === FetchStatus.LOADING && (
              <div className="h-full flex flex-col items-center justify-center min-h-[400px] space-y-4">
                 <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                 <p className="text-emerald-700 font-medium animate-pulse">Consulting the AI Financial Analyst...</p>
              </div>
            )}

            {status === FetchStatus.ERROR && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-800">
                <p className="font-semibold">Error</p>
                <p className="text-sm mt-1">{error}</p>
                <button 
                  onClick={() => setStatus(FetchStatus.IDLE)}
                  className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm rounded hover:bg-red-50 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {status === FetchStatus.SUCCESS && report && (
              <ResultsDashboard report={report} />
            )}
          </div>
        </div>
        
        {/* Footer / How this works */}
        <div className="mt-16 border-t border-slate-200 pt-8">
           <div className="max-w-3xl mx-auto bg-blue-50/50 p-6 rounded-xl border border-blue-100 text-center">
              <h4 className="text-blue-900 font-semibold text-sm mb-2 uppercase tracking-wide">How this works</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                This tool uses the Gemini 2.5 Flash model acting as a financial analyst. 
                It takes your raw inputs and calculates the annual impact, ROI, and break-even point 
                to justify AI automation investments.
              </p>
           </div>
           <p className="text-center text-xs text-slate-400 mt-6">
             © {new Date().getFullYear()} AI ROI Analyst. All calculations are estimates based on provided inputs.
           </p>
        </div>
      </main>
    </div>
  );
};

export default App;