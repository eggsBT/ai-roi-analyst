import React, { useState } from 'react';
import { FinancialInputs, FetchStatus } from '../types';
import { extractInputsFromText } from '../services/geminiService';

interface InputFormProps {
  onSubmit: (inputs: FinancialInputs) => void;
  status: FetchStatus;
}

interface RangeInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  subLabel: string;
}

const RangeInput: React.FC<RangeInputProps> = ({ label, value, onChange, subLabel }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">
        {label}
        <span className="float-right text-xs font-normal text-slate-400">Score: {value} / 10</span>
      </label>
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        required
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <p className="text-xs text-slate-400 mt-1">{subLabel}</p>
    </div>
  );
};

const USE_CASE_DATA: Record<string, { description: string; techniques: string; financial: string }> = {
  "Customer Service Automation": {
    description: "Deploys AI agents to handle Level 1 support inquiries, routine FAQs, and ticket routing.",
    techniques: "LLMs, RAG (Retrieval Augmented Generation), Sentiment Analysis.",
    financial: "Low Implementation ($10k-$30k). High ROI via 30-50% ticket deflection."
  },
  "Automated Code Generation (Dev)": {
    description: "Assists developers by generating boilerplate code, unit tests, and documentation automatically.",
    techniques: "Code-specialized LLMs (e.g., StarCoder, Codex integration).",
    financial: "Med Implementation ($15k+). ROI via 20-40% developer productivity boost."
  },
  "Automated Invoice Processing": {
    description: "Extracts structured data from invoices (PDFs/images) for AP automation.",
    techniques: "OCR, Named Entity Recognition (NER), Document Layout Analysis.",
    financial: "Low Implementation ($5k-$15k). High ROI reducing manual data entry by 80%."
  },
  "Content Generation & Marketing": {
    description: "Generates blogs, social media posts, ad copy, and personalized emails at scale.",
    techniques: "Text-to-Text & Text-to-Image models, Style Transfer.",
    financial: "Low Implementation. ROI via 5x content output velocity."
  },
  "Customer Churn Prediction": {
    description: "Analyzes user behavior patterns to identify at-risk customers before they leave.",
    techniques: "Predictive Analytics, Random Forest, Logistic Regression.",
    financial: "Med Implementation. High ROI by retaining high-LTV customers."
  },
  "Cybersecurity Threat Detection": {
    description: "Monitors network traffic in real-time to identify anomalies and potential zero-day attacks.",
    techniques: "Anomaly Detection, Unsupervised Learning, Behavioral Analysis.",
    financial: "High Implementation. Critical ROI via breach prevention (millions saved)."
  },
  "Drug Discovery & Research": {
    description: "Simulates molecular interactions to identify promising drug candidates faster.",
    techniques: "Generative Adversarial Networks (GANs), Protein Folding AI.",
    financial: "Very High Implementation. ROI measured in years saved on R&D."
  },
  "Dynamic Pricing Optimization": {
    description: "Adjusts product pricing in real-time based on demand, competition, and inventory.",
    techniques: "Reinforcement Learning, Demand Forecasting Models.",
    financial: "Med Implementation. ROI via 5-15% margin improvement."
  },
  "Financial Fraud Detection": {
    description: "Scans transaction patterns to flag fraudulent activities instantly.",
    techniques: "Supervised Learning, Graph Neural Networks.",
    financial: "High Implementation. ROI via direct loss prevention."
  },
  "Fleet Route Optimization": {
    description: "Calculates optimal delivery routes to save fuel and time.",
    techniques: "Graph Search Algorithms, Genetic Algorithms, Predictive Traffic Modeling.",
    financial: "Med Implementation. ROI via 10-20% fuel & time savings."
  },
  "HR Resume Screening & Recruiting": {
    description: "Filters applicant resumes to match skills with job descriptions automatically.",
    techniques: "NLP, Semantic Search, Keyword Matching.",
    financial: "Low Implementation. ROI via 60% reduction in time-to-hire."
  },
  "Inventory Demand Forecasting": {
    description: "Predicts future stock requirements to prevent stockouts or overstocking.",
    techniques: "Time Series Analysis (ARIMA, LSTM), Regression Models.",
    financial: "Med Implementation. ROI via 20% inventory cost reduction."
  },
  "Knowledge Base Search & Retrieval": {
    description: "Allows employees to query internal documents using natural language.",
    techniques: "Semantic Search, Vector Databases, RAG.",
    financial: "Low Implementation. ROI via 25% reduction in information search time."
  },
  "Legal Contract Analysis": {
    description: "Reviews contracts to highlight risks, non-standard clauses, and obligations.",
    techniques: "NLP, Clause Extraction, Risk Classification.",
    financial: "Med Implementation. ROI via 50% faster legal reviews."
  },
  "Medical Image Analysis": {
    description: "Assists radiologists in detecting anomalies in X-rays, MRIs, and CT scans.",
    techniques: "Computer Vision (CNNs), Image Segmentation.",
    financial: "High Implementation. ROI via diagnostic accuracy and throughput."
  },
  "Personalized Recommendations": {
    description: "Suggests products or content tailored to individual user preferences.",
    techniques: "Collaborative Filtering, Matrix Factorization, Deep Learning.",
    financial: "Med Implementation. ROI via 10-30% sales uplift."
  },
  "Predictive Maintenance (IoT)": {
    description: "Predicts equipment failure before it happens using sensor data.",
    techniques: "IoT Sensor Fusion, Time Series Anomaly Detection.",
    financial: "High Implementation. ROI via elimination of unplanned downtime."
  },
  "Quality Control Visual Inspection": {
    description: "Automates visual inspection of manufacturing lines to detect defects.",
    techniques: "Computer Vision, Object Detection.",
    financial: "Med Implementation. ROI via 90% defect detection rate."
  },
  "Regulatory Compliance Monitoring": {
    description: "Monitors communications and transactions for adherence to regulations.",
    techniques: "NLP, Speech-to-Text, Pattern Recognition.",
    financial: "Med Implementation. ROI via avoidance of regulatory fines."
  },
  "Sales Forecasting & Lead Scoring": {
    description: "Ranks leads by conversion probability to prioritize sales efforts.",
    techniques: "Classification Models, Historical Data Analysis.",
    financial: "Low Implementation. ROI via 15-20% conversion rate increase."
  },
  "Supply Chain Optimization": {
    description: "Optimizes logistics network flow and supplier selection.",
    techniques: "Linear Programming, Simulation, Network Optimization.",
    financial: "High Implementation. ROI via 10% logistics cost reduction."
  },
  "Other": {
    description: "Custom AI implementation tailored to unique business requirements not listed above.",
    techniques: "Varies (Custom ML Models, Hybrid Approaches).",
    financial: "Variable Costs. ROI depends on specific strategic value created."
  }
};

const PRESETS = [
  {
    title: "💬 Support Bot Draft",
    text: "We want to roll out an AI support agent for our Customer Service team. We expect it will save about 30 hours of support labor every week. Our average loaded labor cost for support specialists is $45 per hour. The development is a one-time fee of $12,000, and ongoing API subscription/operational costs are about $2,400 per year. We also anticipate it will improve fast customer loyalty, creating an extra $15,000 in revenue annually. Compliance and security risk is reduced well (7 out of 10) and service responsiveness agility boosts to 9 out of 10."
  },
  {
    title: "💻 Dev Codegen Notes",
    text: "We are integrating a secure AI programming assistant for our engineering group of 12 programmers. On average, we anticipate each engineer will save about 5 hours a week in boilerplate and test generation. Average salary and overhead is $85 an hour. Implementation is a one-time custom setup of $18,000. Yearly license cost is $4,800. Expected faster delivery of products will drive an extra $65,000 in customer sales. Security and risk are scored as 6/10; development agility and innovation speed-up is 9/10."
  }
];

const InputForm: React.FC<InputFormProps> = ({ onSubmit, status }) => {
  const [aiUseCase, setAiUseCase] = useState<string>('Customer Service Automation');
  const [weeklyTimeSaved, setWeeklyTimeSaved] = useState<string>('');
  const [avgLaborCost, setAvgLaborCost] = useState<string>('');
  const [implementationCost, setImplementationCost] = useState<string>('');
  const [operationalCost, setOperationalCost] = useState<string>('');
  const [revenueUplift, setRevenueUplift] = useState<string>('');
  const [riskScore, setRiskScore] = useState<string>('5');
  const [agilityScore, setAgilityScore] = useState<string>('5');

  // New Gemini Smart parameter extraction state
  const [proposalNotes, setProposalNotes] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionFeedback, setExtractionFeedback] = useState<{ success?: string; error?: string } | null>(null);

  const handleSmartExtract = async () => {
    if (!proposalNotes.trim()) {
      setExtractionFeedback({ error: "Please enter or paste some proposal notes first." });
      return;
    }

    setIsExtracting(true);
    setExtractionFeedback(null);

    try {
      const extracted = await extractInputsFromText(proposalNotes);

      // Update form values with animation-friendly reactive states
      if (extracted.aiUseCase) setAiUseCase(extracted.aiUseCase);
      if (extracted.weeklyTimeSaved !== undefined) setWeeklyTimeSaved(String(extracted.weeklyTimeSaved));
      if (extracted.avgLaborCost !== undefined) setAvgLaborCost(String(extracted.avgLaborCost));
      if (extracted.implementationCost !== undefined) setImplementationCost(String(extracted.implementationCost));
      if (extracted.operationalCost !== undefined) setOperationalCost(String(extracted.operationalCost));
      if (extracted.projectedRevenueUplift !== undefined) setRevenueUplift(String(extracted.projectedRevenueUplift));
      if (extracted.riskMitigationScore !== undefined) setRiskScore(String(extracted.riskMitigationScore));
      if (extracted.strategicAgilityScore !== undefined) setAgilityScore(String(extracted.strategicAgilityScore));

      setExtractionFeedback({ success: "✨ Gemini extracted 8 parameters from your proposal notes! Review them below." });
    } catch (err: any) {
      console.error(err);
      setExtractionFeedback({ error: err.message || "An error occurred while calling the extractor." });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === FetchStatus.LOADING) return;

    onSubmit({
      aiUseCase,
      weeklyTimeSaved: Number(weeklyTimeSaved),
      avgLaborCost: Number(avgLaborCost),
      implementationCost: Number(implementationCost),
      operationalCost: Number(operationalCost),
      projectedRevenueUplift: Number(revenueUplift),
      riskMitigationScore: Number(riskScore),
      strategicAgilityScore: Number(agilityScore),
    });
  };

  const isLoading = status === FetchStatus.LOADING;
  const useCaseKeys = Object.keys(USE_CASE_DATA).sort();
  const selectedDetails = USE_CASE_DATA[aiUseCase] || USE_CASE_DATA["Other"];

  return (
    <div className="bg-[#FAF8F5] p-6 rounded-2xl shadow-sm border border-[#EAE6DF]" id="ebt_input_form">
      
      {/* 🚀 Segment A: Gemini 3 Smart Extraction */}
      <div className="mb-8 bg-[#FFFDFB] p-5 rounded-xl border border-[#F5EFE6]">
        <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FEF3C7] text-[#D97706] text-xs">✨</span>
          AI Note Smart-Fill (Optional)
        </h3>
        <p className="text-xs text-[#7A7165] mb-3">
          Paste unstructured emails, proposal drafts, or meeting briefs. Gemini 3 will automatically parse operational costs, hours, and strategic parameters.
        </p>

        {/* Preset quick pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-[10px] uppercase font-bold text-[#A0968D] self-center">Try Draft Presets:</span>
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setProposalNotes(preset.text);
                setExtractionFeedback(null);
              }}
              className="text-xs px-2.5 py-1 bg-[#F5EFE6] hover:bg-[#EAE1D4] text-amber-950 rounded-full border border-[#DFD8CE] transition-all font-medium"
            >
              {preset.title}
            </button>
          ))}
        </div>

        <div className="relative">
          <textarea
            value={proposalNotes}
            onChange={(e) => setProposalNotes(e.target.value)}
            rows={4}
            className="w-full text-sm p-3 rounded-lg border border-[#D5CFC9] bg-[#FCFAF7] text-amber-950 placeholder-[#A0968D] outline-none focus:ring-1 focus:ring-[#D97706] focus:border-[#D97706] transition-all resize-none"
            placeholder="Type or paste outline here. E.g. 'We save 10 hours a week on QA testing. Average cost is $50/hr...'"
          />
        </div>

        <button
          type="button"
          disabled={isExtracting}
          onClick={handleSmartExtract}
          className={`mt-2 w-full text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all border ${
            isExtracting
              ? "bg-[#F5EFE6] text-[#A0968D] border-[#DFD8CE]"
              : "bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border-[#FDE68A] active:scale-[0.98]"
          }`}
        >
          {isExtracting ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-[#92400E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI Extractor scanning notes...
            </>
          ) : (
            <>
              <span>✨</span> Extract parameters with Gemini 3
            </>
          )}
        </button>

        {/* Feedback message */}
        {extractionFeedback && (
          <div className="mt-3 text-xs leading-relaxed">
            {extractionFeedback.success && (
              <p className="text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg animate-fade-in font-medium">
                {extractionFeedback.success}
              </p>
            )}
            {extractionFeedback.error && (
              <p className="text-[#BE185D] bg-[#FFF1F2] border border-[#FCE7F3] p-2.5 rounded-lg animate-fade-in font-medium">
                {extractionFeedback.error}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-[#DFD8CE] pt-6 mb-6">
        <h2 className="text-base font-bold text-amber-950 uppercase tracking-wide flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Structured Parameters
        </h2>
        <p className="text-xs text-[#7A7165]">Review and fine-tune your parameters below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* AI Use Case Selection */}
        <div>
          <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1.5">Select AI Use Case</label>
          <div className="relative">
             <select 
               value={aiUseCase}
               onChange={(e) => setAiUseCase(e.target.value)}
               className="w-full px-4 py-3 rounded-lg border border-[#D5CFC9] bg-[#FCFAF7] text-amber-950 focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all outline-none appearance-none cursor-pointer text-sm font-medium"
             >
               {useCaseKeys.map(uc => (
                 <option key={uc} value={uc}>{uc}</option>
               ))}
             </select>
             <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-amber-950">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
             </div>
          </div>
          
          {/* New Use Case Scenario Info Box */}
          <div className="mt-4 p-4 bg-[#FDFCF9] border border-[#EAE6DF] rounded-xl animate-fade-in text-xs">
             <div className="flex items-center gap-2 mb-2">
               <span className="h-2 w-2 rounded-full bg-[#D97706]" />
               <h4 className="font-bold text-amber-950 uppercase tracking-widest text-[10px]">Use Case Insight</h4>
             </div>
             
             <p className="text-[#645C51] leading-relaxed mb-3">
               {selectedDetails.description}
             </p>
             
             <div className="grid grid-cols-1 gap-2.5 pt-2.5 border-t border-[#F1EFEA]">
                <div>
                   <span className="block font-bold text-amber-950 uppercase tracking-wider text-[9px] mb-0.5">Applied Techniques</span>
                   <span className="text-[#7A7165] font-mono text-[11px]">{selectedDetails.techniques}</span>
                </div>
                <div>
                   <span className="block font-bold text-[#D97706] uppercase tracking-wider text-[9px] mb-0.5">Typical Impact</span>
                   <span className="font-medium text-emerald-800">{selectedDetails.financial}</span>
                </div>
             </div>
          </div>
        </div>

        <h3 className="text-xs font-bold text-[#A0968D] uppercase tracking-widest pt-3 border-t border-[#F1EFEA]">Quantitative (Hard ROI)</h3>
        
        {/* Weekly Time Saved */}
        <div>
          <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">Weekly Time Saved</label>
          <div className="relative">
            <input
              type="number" min="0" step="0.1" required
              value={weeklyTimeSaved}
              onChange={(e) => setWeeklyTimeSaved(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#D5CFC9] bg-[#FCFAF7] text-amber-950 placeholder-[#A0968D] focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all outline-none text-sm"
              placeholder="e.g. 15"
            />
            <span className="absolute right-4 top-2.5 text-[#7A7165] text-xs">hrs/wk</span>
          </div>
        </div>

        {/* Labor Cost */}
        <div>
          <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">
            Avg. Labor Cost (Hourly)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-[#7A7165] text-sm font-medium">$</span>
            <input
              type="number" min="0" step="0.5" required
              value={avgLaborCost}
              onChange={(e) => setAvgLaborCost(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-[#D5CFC9] bg-[#FCFAF7] text-amber-950 placeholder-[#A0968D] focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all outline-none text-sm"
              placeholder="e.g. 65.00"
            />
          </div>
        </div>

        {/* Projected Annual Revenue Uplift */}
        <div>
          <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">
            Annual Revenue Uplift
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-[#7A7165] text-sm font-medium">$</span>
            <input
              type="number" min="0" step="100" required
              value={revenueUplift}
              onChange={(e) => setRevenueUplift(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-[#D5CFC9] bg-[#FCFAF7] text-amber-950 placeholder-[#A0968D] focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all outline-none text-sm"
              placeholder="e.g. 25000"
            />
          </div>
        </div>

        {/* Cost Section */}
        <div className="border-t border-[#F1EFEA] pt-4">
            <h4 className="text-xs font-bold text-[#A0968D] uppercase tracking-widest mb-3">Investment Costs</h4>
            <div className="grid grid-cols-2 gap-3">
                {/* Implementation Cost */}
                <div>
                  <label className="block text-[11px] font-bold text-amber-950 uppercase tracking-wider mb-1">
                      Upfront Fees
                  </label>
                  <div className="relative">
                      <span className="absolute left-3 top-2 text-[#7A7165] text-xs font-medium">$</span>
                      <input
                        type="number" min="0" step="100" required
                        value={implementationCost}
                        onChange={(e) => setImplementationCost(e.target.value)}
                        className="w-full pl-6 pr-3 py-2 rounded-lg border border-[#D5CFC9] bg-[#FCFAF7] text-amber-950 placeholder-[#A0968D] focus:ring-1 focus:ring-[#D97706] focus:border-[#D97706] transition-all outline-none text-sm"
                        placeholder="e.g. 5000"
                      />
                  </div>
                </div>

                {/* Operational Cost */}
                <div>
                  <label className="block text-[11px] font-bold text-amber-950 uppercase tracking-wider mb-1">
                      Annual OpEx
                  </label>
                  <div className="relative">
                      <span className="absolute left-3 top-2 text-[#7A7165] text-xs font-medium">$</span>
                      <input
                        type="number" min="0" step="100" required
                        value={operationalCost}
                        onChange={(e) => setOperationalCost(e.target.value)}
                        className="w-full pl-6 pr-3 py-2 rounded-lg border border-[#D5CFC9] bg-[#FCFAF7] text-amber-950 placeholder-[#A0968D] focus:ring-1 focus:ring-[#D97706] focus:border-[#D97706] transition-all outline-none text-sm"
                        placeholder="e.g. 1200"
                      />
                  </div>
                </div>
            </div>
        </div>

        <h3 className="text-xs font-bold text-[#A0968D] uppercase tracking-widest pt-3 border-t border-[#F1EFEA]">Qualitative (Soft ROI index)</h3>
        
        {/* Risk Mitigation Score */}
        <RangeInput
          label="Risk Mitigation Index"
          value={riskScore}
          onChange={(e) => setRiskScore(e.target.value)}
          subLabel="Assesses compliance, redundancy, & breach security."
        />

        {/* Strategic Agility Score */}
        <RangeInput
          label="Strategic Agility Index"
          value={agilityScore}
          onChange={(e) => setAgilityScore(e.target.value)}
          subLabel="Assesses flexibility, product launch, speed-to-market."
        />

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-white transition-all shadow-md transform active:scale-95 ${
            isLoading
              ? 'bg-[#DFD8CE] text-amber-950 cursor-not-allowed'
              : 'bg-[#D97706] hover:bg-[#C26500] hover:shadow-lg text-white'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-[#FAF8F5]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI Consultant modeling...
            </span>
          ) : (
            'Generate Comprehensive ROI Report'
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;