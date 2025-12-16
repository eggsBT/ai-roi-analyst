import React, { useState } from 'react';
import { FinancialInputs, FetchStatus } from '../types';

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

const InputForm: React.FC<InputFormProps> = ({ onSubmit, status }) => {
  const [aiUseCase, setAiUseCase] = useState<string>('Customer Service Automation');
  const [weeklyTimeSaved, setWeeklyTimeSaved] = useState<string>('');
  const [avgLaborCost, setAvgLaborCost] = useState<string>('');
  const [implementationCost, setImplementationCost] = useState<string>('');
  const [operationalCost, setOperationalCost] = useState<string>('');
  const [revenueUplift, setRevenueUplift] = useState<string>('');
  const [riskScore, setRiskScore] = useState<string>('5');
  const [agilityScore, setAgilityScore] = useState<string>('5');

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
  // Ensure the current selection is valid, otherwise default
  const selectedDetails = USE_CASE_DATA[aiUseCase] || USE_CASE_DATA["Other"];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Input Parameters
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* AI Use Case Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Select AI Use Case</label>
          <div className="relative">
             <select 
               value={aiUseCase}
               onChange={(e) => setAiUseCase(e.target.value)}
               className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none appearance-none cursor-pointer"
             >
               {useCaseKeys.map(uc => (
                 <option key={uc} value={uc}>{uc}</option>
               ))}
             </select>
             <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
             </div>
          </div>
          
          {/* New Use Case Scenario Info Box */}
          <div className="mt-4 p-4 bg-blue-50/60 border border-blue-100 rounded-lg animate-fade-in">
             <div className="flex items-center gap-2 mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
               </svg>
               <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide">Use Case Scenario</h4>
             </div>
             
             <p className="text-sm text-slate-700 mb-3 leading-relaxed">
               {selectedDetails.description}
             </p>
             
             <div className="grid grid-cols-1 gap-3 pt-3 border-t border-blue-100/50">
               <div>
                  <span className="block text-xs font-semibold text-blue-900 mb-0.5">Application Techniques</span>
                  <span className="text-xs text-slate-600 leading-tight">{selectedDetails.techniques}</span>
               </div>
               <div>
                  <span className="block text-xs font-semibold text-blue-900 mb-0.5">Typical Cost & ROI</span>
                  <span className="text-xs text-emerald-700 font-medium leading-tight">{selectedDetails.financial}</span>
               </div>
             </div>
          </div>
        </div>

        <h3 className="text-lg font-medium text-slate-700 mt-6 pt-4 border-t border-slate-100">Quantitative Metrics (Hard ROI)</h3>
        
        {/* Weekly Time Saved (Existing) */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Weekly Time Saved (Hours)</label>
          <div className="relative">
            <input
              type="number" min="0" step="0.1" required
              value={weeklyTimeSaved}
              onChange={(e) => setWeeklyTimeSaved(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              placeholder="e.g. 15"
            />
            <span className="absolute right-4 top-3 text-slate-300 text-sm">hrs/wk</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Estimate hours saved per week by automation.</p>
        </div>

        {/* Labor Cost (Existing) */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Avg. Labor Cost (Hourly)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-slate-300">$</span>
            <input
              type="number" min="0" step="0.01" required
              value={avgLaborCost}
              onChange={(e) => setAvgLaborCost(e.target.value)}
              className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              placeholder="e.g. 65.00"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Fully loaded hourly cost of employee(s).</p>
        </div>

        {/* Projected Annual Revenue Uplift (NEW) */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Projected Annual Revenue Uplift
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-slate-300">$</span>
            <input
              type="number" min="0" step="1000" required
              value={revenueUplift}
              onChange={(e) => setRevenueUplift(e.target.value)}
              className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              placeholder="e.g. 25000"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Expected annual increase in sales or CLV due to AI.</p>
        </div>

        {/* Cost Section */}
        <div className="border-t border-slate-100 pt-4 mt-6">
            <h4 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">Costs</h4>
            <div className="space-y-4">
                {/* Implementation Cost */}
                <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                    Implementation (One-time)
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-300">$</span>
                    <input
                    type="number" min="0" step="100" required
                    value={implementationCost}
                    onChange={(e) => setImplementationCost(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                    placeholder="e.g. 5000"
                    />
                </div>
                </div>

                {/* Operational Cost */}
                <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                    Operational (Annual)
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-300">$</span>
                    <input
                    type="number" min="0" step="100" required
                    value={operationalCost}
                    onChange={(e) => setOperationalCost(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                    placeholder="e.g. 1200"
                    />
                </div>
                <p className="text-xs text-slate-400 mt-1">Subscription fees, maintenance, API costs, etc.</p>
                </div>
            </div>
        </div>

        <h3 className="text-lg font-medium text-slate-700 mt-6 pt-4 border-t border-slate-100">Qualitative Metrics (Soft ROI)</h3>
        
        {/* Risk Mitigation Score (NEW) */}
        <RangeInput
          label="Risk Mitigation Score (1-10)"
          value={riskScore}
          onChange={(e) => setRiskScore(e.target.value)}
          subLabel="Estimate impact on compliance, security, and fraud reduction."
        />

        {/* Strategic Agility Score (NEW) */}
        <RangeInput
          label="Strategic Agility Score (1-10)"
          value={agilityScore}
          onChange={(e) => setAgilityScore(e.target.value)}
          subLabel="Estimate impact on innovation, competitive advantage, and faster decision-making."
        />


        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
            isLoading
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Consulting Analyst...
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