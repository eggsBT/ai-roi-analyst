// ResultsDashboard.tsx

import React from 'react';
import { FinancialReport } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PptxGenJS from 'pptxgenjs';

interface ResultsDashboardProps {
  report: FinancialReport;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ report }) => {
  const { inputs_used, metrics, executive_summary } = report;

  // --- HARD CALCULATION VALIDATION ---
  // We perform the math here to ensure 100% accuracy, overriding potential AI estimation errors.
  
  // 1. Annual Labor Savings = Weekly Hours * 50 Weeks * Hourly Rate
  const calculatedLaborSavings = inputs_used.weekly_time_saved_hours * 50 * inputs_used.avg_labor_cost_per_hour_usd;
  
  // 2. Gross Annual Benefit = Labor Savings + Revenue Uplift
  const calculatedGrossBenefit = calculatedLaborSavings + inputs_used.projected_revenue_uplift_usd;
  
  // 3. Annual Net Benefit = Gross Benefit - Annual Operational Cost
  const calculatedNetBenefit = calculatedGrossBenefit - inputs_used.operational_cost_per_year_usd;
  
  // 4. ROI = (Annual Net Benefit - Implementation Cost) / Implementation Cost
  const implementationCost = inputs_used.one_time_implementation_cost_usd;
  const calculatedROI = implementationCost > 0 
    ? (calculatedNetBenefit - implementationCost) / implementationCost 
    : 0;
  
  const netProfitYear1 = calculatedNetBenefit - implementationCost;

  // 5. Break Even (Months) = Implementation Cost / (Annual Net Benefit / 12)
  const monthlyNetBenefit = calculatedNetBenefit / 12;
  const calculatedBreakEven = monthlyNetBenefit > 0 
    ? implementationCost / monthlyNetBenefit 
    : 0;

  // Waterfall Comparison:
  // Stack 1 (Costs): Implementation (One-time) + Operational (Annual)
  // Stack 2 (Value): Labor Savings + Revenue Uplift
  const chartData = [
    {
      name: 'Year 1 Costs',
      implementation: implementationCost,
      operational: inputs_used.operational_cost_per_year_usd,
      savings: 0,
      revenue: 0,
    },
    {
      name: 'Year 1 Value',
      implementation: 0,
      operational: 0,
      savings: calculatedLaborSavings,
      revenue: inputs_used.projected_revenue_uplift_usd,
    }
  ];

  const handleExportSlide = () => {
    try {
        if (!report.metrics.pptx_data_structure) {
            alert("PPTX data not available in this report version.");
            return;
        }

        const pres = new PptxGenJS();
        const pptxData = report.metrics.pptx_data_structure;
        
        // --- Single Executive Slide Generation ---
        const slide = pres.addSlide();
        
        // 1. Title Section (Top)
        // Background strip for title
        slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.0, fill: { color: 'F1F5F9' } });
        
        // Main Title
        slide.addText(pptxData.slide_title, { 
            x: 0.3, y: 0.2, w: '90%', fontSize: 28, fontFace: 'Arial', color: pptxData.theme_colors.green.replace('#', ''), bold: true 
        });
        
        // Subtitle
        slide.addText(`Strategic ROI Analysis for ${report.inputs_used.ai_use_case}`, { 
            x: 0.3, y: 0.65, w: '90%', fontSize: 14, fontFace: 'Arial', color: '64748B'
        });

        // 2. Key Metrics Row (Middle)
        // Iterate through the key metrics provided by Gemini but Override values with calculated ones where applicable
        const metricCount = pptxData.key_metrics.length;
        const startX = 0.5;
        const totalW = 9.0;
        const gap = 0.2;
        const boxW = (totalW - (gap * (metricCount - 1))) / metricCount;

        pptxData.key_metrics.forEach((metric, index) => {
             const xPos = startX + (index * (boxW + gap));
             
             // Box background
             slide.addShape(pres.ShapeType.rect, { 
                 x: xPos, y: 1.5, w: boxW, h: 1.5, 
                 fill: { color: 'FFFFFF' }, 
                 line: { color: 'E2E8F0', width: 1 } 
             });

             // Label
             slide.addText(metric.label, {
                 x: xPos + 0.1, y: 1.6, w: boxW - 0.2, h: 0.3,
                 fontSize: 12, color: '64748B', align: 'center'
             });

             // Value
             // We use the passed string from PPTX data structure, but for ROI specifically we might want to ensure format.
             // For now, we trust the structure generated which acts as a label, or we could replace if label contains "ROI"
             let valueText = metric.value;
             if (metric.label.includes("ROI")) {
                 valueText = `${(calculatedROI * 100).toFixed(0)}%`;
             }

             slide.addText(valueText, {
                 x: xPos + 0.1, y: 2.0, w: boxW - 0.2, h: 0.5,
                 fontSize: 24, bold: true, color: metric.color.replace('#', ''), align: 'center'
             });
        });

        // 3. Executive Summary / Bullet Points (Bottom)
        slide.addText('Strategic Recommendations & Impact:', {
            x: 0.5, y: 3.5, fontSize: 16, color: '1E293B', bold: true
        });

        const bulletPoints = pptxData.summary_bullet_points.map(point => ({
            text: point,
            options: { fontSize: 12, color: '334155', bullet: true, breakLine: true, paraSpaceBefore: 10 }
        }));

        slide.addText(bulletPoints, {
            x: 0.5, y: 3.8, w: 9.0, h: 2.5, valign: 'top'
        });

        // Footer
        slide.addText(`Generated on ${new Date().toLocaleDateString()} | AI ROI Analyst`, {
            x: 0.5, y: 5.2, fontSize: 10, color: '94A3B8', align: 'center'
        });

        pres.writeFile({ fileName: `Executive_ROI_Brief_${new Date().toISOString().split('T')[0]}.pptx` });
        setExportStatus({ type: 'success', text: "🎉 PowerPoint file successfully generated and downloaded." });
    } catch (e: any) {
        console.error("PPTX Generation Error", e);
        setExportStatus({ type: 'error', text: e.message || "Failed to compile PowerPoint deck." });
    }
  };

  const [exportStatus, setExportStatus] = React.useState<{type: 'success' | 'error', text: string} | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-[#FAF8F5] p-6 rounded-2xl shadow-sm border-l-4 border-[#D97706] border-y border-r border-y-[#EAE6DF] border-r-[#EAE6DF]">
        <h2 className="text-xl font-bold text-amber-950">AI ROI Analyst Report</h2>
        <p className="text-[#7A7165] text-xs mt-1">Strategic financial validation powered by Gemini AI and EBT LLC</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* ROI Card */}
        <div className="group relative bg-[#FFFDF5] p-6 rounded-2xl shadow-sm border border-[#FDE68A] flex flex-col justify-between overflow-hidden cursor-help hover:shadow-md transition-shadow">
            <div className="relative z-0">
                <p className="text-xs font-bold text-[#A0968D] uppercase tracking-wider">Total ROI</p>
                <h3 className={`text-4xl font-black mt-2 ${calculatedROI >= 0 ? 'text-[#D97706]' : 'text-[#E11D48]'}`}>
                {(calculatedROI * 100).toFixed(2)}%
                </h3>
            </div>
            <p className="text-[11px] text-[#7A7165] mt-4 relative z-0">Year 1 Return on Investment</p>
            
            {/* ROI Hover Overlay */}
            <div className="absolute inset-0 bg-[#2E2A27]/95 backdrop-blur-sm p-5 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-white">
                <p className="text-[10px] font-bold uppercase text-[#A0968D] mb-3 tracking-wider border-b border-[#47403B] pb-2">ROI Breakdown</p>
                <div className="space-y-2 text-sm">
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-[#D5CFC9]">Annual Net Benefit</span>
                        <span className={`font-mono font-medium ${calculatedNetBenefit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(calculatedNetBenefit)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-[#D5CFC9]">Implement. Cost</span>
                        <span className="font-mono text-red-400">-{formatCurrency(implementationCost)}</span>
                    </div>
                    <div className="h-px bg-[#47403B] my-1 opacity-50"></div>
                     <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-[#FCFAF7]">Net Profit (Yr 1)</span>
                        <span className={`font-mono ${netProfitYear1 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(netProfitYear1)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Break Even Card */}
        <div className="group relative bg-[#FCFAF7] p-6 rounded-2xl shadow-sm border border-[#EAE6DF] flex flex-col justify-between overflow-hidden cursor-help hover:shadow-md transition-shadow">
           <div className="relative z-0">
               <p className="text-xs font-bold text-[#A0968D] uppercase tracking-wider">Break-Even Point</p>
               <h3 className="text-4xl font-black text-blue-600 mt-2">
                 {formatNumber(calculatedBreakEven)}
                 <span className="text-lg text-[#7A7165] font-normal ml-1">months</span>
               </h3>
           </div>
           <p className="text-[11px] text-[#7A7165] mt-4 relative z-0">Time to recover implementation costs</p>
 
           {/* Break Even Hover Overlay */}
            <div className="absolute inset-0 bg-[#2E2A27]/95 backdrop-blur-sm p-5 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-white">
                <p className="text-[10px] font-bold uppercase text-[#A0968D] mb-3 tracking-wider border-b border-[#47403B] pb-2">Time to Value</p>
                <div className="space-y-2 text-xs">
                     <div className="flex justify-between items-center">
                        <span className="text-[#D5CFC9]">Investment</span>
                        <span className="font-mono text-white">{formatCurrency(implementationCost)}</span>
                    </div>
                     <div className="flex justify-center my-1 text-[#8C8479] text-[10px] italic">
                        divided by
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[#D5CFC9]">Monthly Net Benefit</span>
                        <span className="font-mono text-emerald-400">{formatCurrency(monthlyNetBenefit)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Total Annual Hard Savings Card */}
        <div className="group relative bg-[#FCFAF7] p-6 rounded-2xl shadow-sm border border-[#EAE6DF] flex flex-col justify-between overflow-hidden cursor-help hover:shadow-md transition-shadow">
            <div className="relative z-0">
                <p className="text-xs font-bold text-[#A0968D] uppercase tracking-wider">Gross Annual Benefit</p>
                <h3 className="text-4xl font-black text-emerald-600 mt-2">
                 {formatCurrency(calculatedGrossBenefit)}
                </h3>
            </div>
            <p className="text-[11px] text-[#7A7165] mt-4 relative z-0">Labor Savings + Revenue Uplift</p>
 
            {/* Gross Benefit Hover Overlay */}
            <div className="absolute inset-0 bg-[#2E2A27]/95 backdrop-blur-sm p-5 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-white">
                <p className="text-[10px] font-bold uppercase text-[#A0968D] mb-3 tracking-wider border-b border-[#47403B] pb-2">Benefit Components</p>
                <div className="space-y-2 text-xs">
                     <div className="flex justify-between items-center">
                        <span className="text-[#D5CFC9]">Labor Savings</span>
                        <span className="font-mono text-emerald-400">{formatCurrency(calculatedLaborSavings)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[#D5CFC9]">Revenue Uplift</span>
                        <span className="font-mono text-emerald-400">{formatCurrency(inputs_used.projected_revenue_uplift_usd)}</span>
                    </div>
                    <div className="h-px bg-[#47403B] my-1 opacity-50"></div>
                     <div className="flex justify-between items-center font-bold">
                        <span className="text-[#FCFAF7]">Total Gross</span>
                        <span className="font-mono text-emerald-400">{formatCurrency(calculatedGrossBenefit)}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waterfall Chart */}
        <div className="bg-[#FCFAF7] p-6 rounded-2xl shadow-sm border border-[#EAE6DF] h-[400px] flex flex-col">
            <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider mb-6">Investment Cost vs. Value Yield</h3>
            <div className="flex-1 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE6DF" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#7A7165', fontSize: 13 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#7A7165', fontSize: 11 }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip
                        cursor={{ fill: '#FAF8F5' }}
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: '#FCFAF7', borderRadius: '12px', border: '1px solid #EAE6DF', boxShadow: 'none' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    {/* Stack 1: Costs (Canadian bacon pink family) */}
                    <Bar dataKey="implementation" name="Implementation" stackId="a" fill="#E11D48" radius={[0, 0, 4, 4]} barSize={60} />
                    <Bar dataKey="operational" name="Operational Cost" stackId="a" fill="#FDA4AF" radius={[4, 4, 0, 0]} barSize={60} />
                    
                    {/* Stack 2: Value (Hollandaise egg gold family) */}
                    <Bar dataKey="savings" name="Labor Savings" stackId="a" fill="#F59E0B" radius={[0, 0, 4, 4]} barSize={60} />
                    <Bar dataKey="revenue" name="Revenue Uplift" stackId="a" fill="#FCD34D" radius={[4, 4, 0, 0]} barSize={60} />
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Soft ROI & Presentation Synthesis */}
        <div className="flex flex-col gap-6">
            {/* Soft ROI */}
            <div className="bg-[#FCFAF7] p-6 rounded-2xl shadow-sm border border-[#EAE6DF] flex-1">
                <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-[#D97706]" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 6a1 1 0 011-1h10a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V6zM3 10a1 1 0 001 1h12a1 1 0 100-2H4a1 1 0 00-1 1z" />
                        <path fillRule="evenodd" d="M3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM4 17a1 1 0 00-1 1v1a1 1 0 001 1h12a1 1 0 001-1v-1a1 1 0 00-1-1H4z" clipRule="evenodd" />
                    </svg>
                    EBT Strategic Value Synthesis
                </h3>
                <div className="bg-[#FEFBF2] p-4 rounded-xl border border-[#F5EFE6]">
                    <p className="text-amber-950 text-xs leading-relaxed">
                    {metrics.soft_roi_summary}
                    </p>
                </div>
                 <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-[#FCFAF7] border border-[#EAE6DF] rounded-xl">
                        <span className="block text-[10px] font-bold text-[#A0968D] uppercase tracking-wider">Risk Mitigation</span>
                        <span className="font-extrabold text-[#D97706] text-xl">{report.inputs_used.risk_mitigation_score_1_to_10}<span className="text-xs text-[#7A7165] font-normal">/10</span></span>
                    </div>
                    <div className="text-center p-3 bg-[#FCFAF7] border border-[#EAE6DF] rounded-xl">
                        <span className="block text-[10px] font-bold text-[#A0968D] uppercase tracking-wider">Strategic Agility</span>
                        <span className="font-extrabold text-[#D97706] text-xl">{report.inputs_used.strategic_agility_score_1_to_10}<span className="text-xs text-[#7A7165] font-normal">/10</span></span>
                    </div>
                </div>
            </div>

            {/* Presentation Recommendations */}
            <div className="bg-gradient-to-br from-[#2E2A27] to-[#1F1D1B] p-6 rounded-2xl shadow-sm text-white">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#FCD34D] flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        Slide Recommendation Plan
                    </h3>
                    <button 
                        onClick={handleExportSlide}
                        className="text-xs bg-[#D97706] hover:bg-[#C26500] text-white px-3.5 py-1.5 rounded-xl transition-all shadow-sm font-bold active:scale-95 flex items-center gap-1.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export PPTX
                    </button>
                 </div>
                <ul className="space-y-2.5">
                    {metrics.slide_visual_recommendation.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-xs text-[#FCFAF7]">
                            <span className="flex-shrink-0 w-5 h-5 bg-[#47403B] rounded-full flex items-center justify-center text-[10px] font-black text-[#FEF3C7] mt-0.5">{index + 1}</span>
                            <span className="leading-relaxed">{rec}</span>
                        </li>
                    ))}
                </ul>

                {/* Inline Export Notification toast */}
                {exportStatus && (
                  <div className={`mt-4 p-2.5 rounded-xl text-xs font-semibold border leading-relaxed animate-fade-in ${
                    exportStatus.type === 'success' 
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' 
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                  }`}>
                     {exportStatus.text}
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;