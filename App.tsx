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
    <div className="min-h-screen bg-[#FDFCF9] text-amber-950 pb-12 font-sans animate-fade-in">
      {/* Navbar/Header with EBT LLC branding colors */}
      <header className="bg-[#FAF8F5] border-b border-[#EAE6DF] sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Logo className="w-10 h-10 shadow-sm rounded-xl" />
             <h1 className="text-base sm:text-lg font-extrabold text-amber-950 uppercase tracking-wider">
               AI ROI Analyst <span className="text-[#D97706] text-xs font-bold font-mono ml-1">EBT LLC Edition</span>
             </h1>
          </div>
          <div className="text-xs font-bold px-3 py-1 bg-[#FEF3C7] text-[#92400E] rounded-full border border-[#FDE68A]">
            ✨ Gemini 3.5 Enhanced
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Instruction Box themed for EBT */}
        <div className="bg-[#FAF8F5] p-6 rounded-2xl shadow-sm border border-[#EAE6DF] mb-8 animate-fade-in animate-duration-500" id="ebt_guidance">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#FEF3C7] rounded-xl hidden sm:block shrink-0 animate-pulse">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
            </div>
            <div>
              <h2 className="text-xs font-bold text-amber-950 uppercase tracking-widest mb-1">🎯 AI Investment Justification Deck</h2>
              <p className="text-[#645C51] text-xs mb-3.5 leading-relaxed">
                Quantify the technical, labor-saving, and operational efficiency gains for your upcoming AI initiatives. The Gemini 3 model family acts as an Executive Controller to compile detailed financial spreadsheets and layout-ready structured slides.
              </p>
              <div className="bg-[#FCFAF7] rounded-xl p-4 text-xs border border-[#F1EFEA]">
                 <h3 className="font-bold text-[#D97706] mb-2 uppercase tracking-wide">Optimization Steps:</h3>
                 <ul className="list-disc list-inside space-y-1.5 text-[#7A7165] ml-1">
                   <li><strong className="text-amber-950">Option A: Smart-Fill Notes:</strong> Use Gemini 3 power inside the input form to parse conversational messages on the fly and auto-fill metrics.</li>
                   <li><strong className="text-amber-950">Option B: Structured Entry:</strong> Select the targeted operational profile, adjusting weekly savings and OpEx indicators manually.</li>
                   <li><strong className="text-amber-950">Compile Brief:</strong> Validate the interactive Waterfall graphs and export slide decks instantly to local PowerPoint (`.pptx`).</li>
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
                    "{report.narrative.executive_summary}"
                  </p>
                </div>
               )}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            {status === FetchStatus.IDLE && (
              <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-center p-8 border border-dashed border-[#DFD8CE] rounded-2xl bg-[#FCFAF7]">
                <div className="w-16 h-16 bg-[#FAF8F5] rounded-full border border-[#EAE6DF] flex items-center justify-center mb-4 text-[#A0968D]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-sm font-bold text-amber-950 uppercase tracking-widest">No Model Rendered</h3>
                <p className="text-[#7A7165] text-xs max-w-xs mt-2 leading-relaxed">Enter unstructured notes or key in your custom parameters on the left to activate the EBT ROI analyzer.</p>
              </div>
            )}

            {status === FetchStatus.LOADING && (
              <div className="h-full flex flex-col items-center justify-center min-h-[400px] space-y-4">
                 <div className="w-10 h-10 border-4 border-[#FEF3C7] border-t-[#D97706] rounded-full animate-spin"></div>
                 <p className="text-[#D97706] font-bold text-xs uppercase tracking-widest animate-pulse">EBT AI model executing calculations...</p>
              </div>
            )}

            {status === FetchStatus.ERROR && (
              <div className="bg-[#FFF1F2] border border-[#FCE7F3] rounded-2xl p-6 text-center text-[#BE185D]">
                <p className="font-bold text-sm uppercase tracking-wider">Analysis Denied</p>
                <p className="text-xs mt-1.5 leading-relaxed">{error}</p>
                <button 
                  onClick={() => setStatus(FetchStatus.IDLE)}
                  className="mt-4 px-4 py-2 bg-white border border-[#FCE7F3] text-[#BE185D] text-xs font-semibold rounded-lg hover:bg-[#FFF1F2] transition-colors"
                >
                  Adjust Parameters
                </button>
              </div>
            )}

            {status === FetchStatus.SUCCESS && report && (
              <ResultsDashboard report={report} />
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-16 border-t border-[#DFD8CE] pt-8">
           <div className="max-w-3xl mx-auto bg-[#FAF8F5] p-6 rounded-2xl border border-[#EAE6DF] text-center">
              <h4 className="text-amber-950 font-bold text-xs uppercase tracking-widest mb-1.5">Model Engine Architecture</h4>
              <p className="text-[#645C51] text-xs leading-relaxed">
                This full-stack engine runs on the Gemini 3 model family (with Gemini 3.5 Flash and Gemini 3.5 Pro), serving client-side inputs alongside secure backend telemetry. Live results utilize exact mathematical formula validation to prevent financial hallucinations.
              </p>
           </div>
           <div className="text-center text-[10px] text-[#A0968D] mt-6 space-y-1">
             <p>© {new Date().getFullYear()} Eggs Benedict Tech - EBT LLC. All rights reserved.</p>
             <p>Eggs Benedict branding and styling inspired by eggsbenedict.tech</p>
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;