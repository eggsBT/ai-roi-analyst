// ResultsDashboard.tsx

import React from 'react';
import { FinancialReport } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, formatRoiPercent, formatBreakEven, THEME_COLORS } from '../services/financials';

interface ResultsDashboardProps {
  report: FinancialReport;
}

/**
 * A metric card whose breakdown overlay is reachable by hover, keyboard
 * (focus / Enter / Space), and touch (tap). The hover-only version was
 * invisible to keyboard and touch users.
 */
const MetricCard: React.FC<{
  className?: string;
  front: React.ReactNode;
  overlayTitle: string;
  overlay: React.ReactNode;
}> = ({ className = '', front, overlayTitle, overlay }) => {
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen((o) => !o);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`${overlayTitle} — show details`}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
        if (e.key === 'Escape') setOpen(false);
      }}
      onBlur={() => setOpen(false)}
      className={`group relative p-6 rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-md transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] ${className}`}
    >
      <div className="relative z-0">{front}</div>
      <div
        className={`absolute inset-0 bg-[#2E2A27]/95 backdrop-blur-sm p-5 flex flex-col justify-center transition-opacity duration-300 z-10 text-white group-hover:opacity-100 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <p className="text-[10px] font-bold uppercase text-[#A0968D] mb-3 tracking-wider border-b border-[#47403B] pb-2">{overlayTitle}</p>
        {overlay}
      </div>
    </div>
  );
};

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ report }) => {
  const { inputs, metrics, narrative } = report;
  const [exportStatus, setExportStatus] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [exporting, setExporting] = React.useState(false);

  const roiPositive = (metrics.roi ?? 0) >= 0;

  // Cost vs. value comparison (authoritative numbers only).
  const chartData = [
    { name: 'Year 1 Costs', implementation: metrics.implementationCost, operational: metrics.operationalCost, savings: 0, revenue: 0 },
    { name: 'Year 1 Value', implementation: 0, operational: 0, savings: metrics.annualLaborSavings, revenue: metrics.revenueUplift },
  ];

  const handleExportSlide = async () => {
    if (exporting) return;
    setExporting(true);
    setExportStatus(null);
    try {
      // Lazy-load pptxgenjs (~heavy) only when the user actually exports,
      // keeping it out of the initial bundle.
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pres = new PptxGenJS();
      const slide = pres.addSlide();

      // Key metrics are built from the authoritative numbers — never from model text.
      const keyMetrics = [
        { label: 'Year 1 ROI', value: formatRoiPercent(metrics.roi), color: roiPositive ? THEME_COLORS.green : '#E11D48' },
        { label: 'Break-Even', value: metrics.breakEvenMonths === null ? 'Never' : `${formatBreakEven(metrics.breakEvenMonths)} mo`, color: THEME_COLORS.blue },
        { label: 'Gross Annual Benefit', value: formatCurrency(metrics.grossBenefit), color: THEME_COLORS.gold },
      ];

      // Title strip
      slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.0, fill: { color: 'F1F5F9' } });
      slide.addText(narrative.slide_title, {
        x: 0.3, y: 0.2, w: '90%', fontSize: 28, fontFace: 'Arial', color: THEME_COLORS.green.replace('#', ''), bold: true,
      });
      slide.addText(`Strategic ROI Analysis for ${inputs.aiUseCase}`, {
        x: 0.3, y: 0.65, w: '90%', fontSize: 14, fontFace: 'Arial', color: '64748B',
      });

      // Key metric cards
      const startX = 0.5, totalW = 9.0, gap = 0.2;
      const boxW = (totalW - gap * (keyMetrics.length - 1)) / keyMetrics.length;
      keyMetrics.forEach((metric, index) => {
        const xPos = startX + index * (boxW + gap);
        slide.addShape(pres.ShapeType.rect, { x: xPos, y: 1.5, w: boxW, h: 1.5, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 } });
        slide.addText(metric.label, { x: xPos + 0.1, y: 1.6, w: boxW - 0.2, h: 0.3, fontSize: 12, color: '64748B', align: 'center' });
        slide.addText(metric.value, { x: xPos + 0.1, y: 2.0, w: boxW - 0.2, h: 0.5, fontSize: 24, bold: true, color: metric.color.replace('#', ''), align: 'center' });
      });

      // Bullets
      slide.addText('Strategic Recommendations & Impact:', { x: 0.5, y: 3.5, fontSize: 16, color: '1E293B', bold: true });
      slide.addText(
        narrative.summary_bullet_points.map((point) => ({
          text: point,
          options: { fontSize: 12, color: '334155', bullet: true, breakLine: true, paraSpaceBefore: 10 },
        })),
        { x: 0.5, y: 3.8, w: 9.0, h: 2.5, valign: 'top' }
      );
      slide.addText(`Generated on ${new Date().toLocaleDateString()} | AI ROI Analyst`, {
        x: 0.5, y: 5.2, fontSize: 10, color: '94A3B8', align: 'center',
      });

      await pres.writeFile({ fileName: `Executive_ROI_Brief_${new Date().toISOString().split('T')[0]}.pptx` });
      setExportStatus({ type: 'success', text: '🎉 PowerPoint file successfully generated and downloaded.' });
    } catch (e: any) {
      console.error('PPTX Generation Error', e);
      setExportStatus({ type: 'error', text: e.message || 'Failed to compile PowerPoint deck.' });
    } finally {
      setExporting(false);
    }
  };

  const row = (label: string, value: string, valueClass: string) => (
    <div className="flex justify-between items-center text-xs">
      <span className="text-[#D5CFC9]">{label}</span>
      <span className={`font-mono ${valueClass}`}>{value}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-[#FAF8F5] p-6 rounded-2xl shadow-sm border-l-4 border-[#D97706] border-y border-r border-y-[#EAE6DF] border-r-[#EAE6DF]">
        <h2 className="text-xl font-bold text-amber-950">{narrative.project_title || 'AI ROI Analyst Report'}</h2>
        <p className="text-[#7A7165] text-xs mt-1">Strategic financial validation powered by Gemini AI and EBT LLC</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* ROI Card */}
        <MetricCard
          className="bg-[#FFFDF5] border border-[#FDE68A]"
          overlayTitle="ROI Breakdown"
          front={
            <>
              <p className="text-xs font-bold text-[#A0968D] uppercase tracking-wider">Total ROI</p>
              <h3 className={`text-4xl font-black mt-2 ${roiPositive ? 'text-[#D97706]' : 'text-[#E11D48]'}`}>{formatRoiPercent(metrics.roi, 2)}</h3>
              <p className="text-[11px] text-[#7A7165] mt-4">{metrics.roi === null ? 'No implementation cost provided' : 'Year 1 Return on Investment'}</p>
            </>
          }
          overlay={
            <div className="space-y-2 text-sm">
              {row('Annual Net Benefit', formatCurrency(metrics.netBenefit), metrics.netBenefit >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium')}
              {row('Implement. Cost', `-${formatCurrency(metrics.implementationCost)}`, 'text-red-400')}
              <div className="h-px bg-[#47403B] my-1 opacity-50"></div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#FCFAF7]">Net Profit (Yr 1)</span>
                <span className={`font-mono ${metrics.netProfitYear1 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(metrics.netProfitYear1)}</span>
              </div>
            </div>
          }
        />

        {/* Break Even Card */}
        <MetricCard
          className="bg-[#FCFAF7] border border-[#EAE6DF]"
          overlayTitle="Time to Value"
          front={
            <>
              <p className="text-xs font-bold text-[#A0968D] uppercase tracking-wider">Break-Even Point</p>
              <h3 className="text-4xl font-black text-blue-600 mt-2">
                {formatBreakEven(metrics.breakEvenMonths)}
                {metrics.breakEvenMonths !== null && <span className="text-lg text-[#7A7165] font-normal ml-1">months</span>}
              </h3>
              <p className="text-[11px] text-[#7A7165] mt-4">{metrics.breakEvenMonths === null ? 'Net benefit does not recover the investment' : 'Time to recover implementation costs'}</p>
            </>
          }
          overlay={
            <div className="space-y-2 text-xs">
              {row('Investment', formatCurrency(metrics.implementationCost), 'text-white')}
              <div className="flex justify-center my-1 text-[#8C8479] text-[10px] italic">divided by</div>
              {row('Monthly Net Benefit', formatCurrency(metrics.monthlyNetBenefit), metrics.monthlyNetBenefit >= 0 ? 'text-emerald-400' : 'text-red-400')}
            </div>
          }
        />

        {/* Gross Annual Benefit Card */}
        <MetricCard
          className="bg-[#FCFAF7] border border-[#EAE6DF]"
          overlayTitle="Benefit Components"
          front={
            <>
              <p className="text-xs font-bold text-[#A0968D] uppercase tracking-wider">Gross Annual Benefit</p>
              <h3 className="text-4xl font-black text-emerald-600 mt-2">{formatCurrency(metrics.grossBenefit)}</h3>
              <p className="text-[11px] text-[#7A7165] mt-4">Labor Savings + Revenue Uplift</p>
            </>
          }
          overlay={
            <div className="space-y-2 text-xs">
              {row('Labor Savings', formatCurrency(metrics.annualLaborSavings), 'text-emerald-400')}
              {row('Revenue Uplift', formatCurrency(metrics.revenueUplift), 'text-emerald-400')}
              <div className="h-px bg-[#47403B] my-1 opacity-50"></div>
              <div className="flex justify-between items-center font-bold">
                <span className="text-[#FCFAF7]">Total Gross</span>
                <span className="font-mono text-emerald-400">{formatCurrency(metrics.grossBenefit)}</span>
              </div>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost vs Value Chart */}
        <div className="bg-[#FCFAF7] p-6 rounded-2xl shadow-sm border border-[#EAE6DF] h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider mb-6">Investment Cost vs. Value Yield</h3>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE6DF" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7A7165', fontSize: 13 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7A7165', fontSize: 11 }} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip cursor={{ fill: '#FAF8F5' }} formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: '#FCFAF7', borderRadius: '12px', border: '1px solid #EAE6DF', boxShadow: 'none' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="implementation" name="Implementation" stackId="a" fill="#E11D48" radius={[0, 0, 4, 4]} barSize={60} />
                <Bar dataKey="operational" name="Operational Cost" stackId="a" fill="#FDA4AF" radius={[4, 4, 0, 0]} barSize={60} />
                <Bar dataKey="savings" name="Labor Savings" stackId="a" fill="#F59E0B" radius={[0, 0, 4, 4]} barSize={60} />
                <Bar dataKey="revenue" name="Revenue Uplift" stackId="a" fill="#FCD34D" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Soft ROI & Presentation Synthesis */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#FCFAF7] p-6 rounded-2xl shadow-sm border border-[#EAE6DF] flex-1">
            <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-[#D97706]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 6a1 1 0 011-1h10a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V6zM3 10a1 1 0 001 1h12a1 1 0 100-2H4a1 1 0 00-1 1z" />
                <path fillRule="evenodd" d="M3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM4 17a1 1 0 00-1 1v1a1 1 0 001 1h12a1 1 0 001-1v-1a1 1 0 00-1-1H4z" clipRule="evenodd" />
              </svg>
              EBT Strategic Value Synthesis
            </h3>
            <div className="bg-[#FEFBF2] p-4 rounded-xl border border-[#F5EFE6]">
              <p className="text-amber-950 text-xs leading-relaxed">{narrative.soft_roi_summary}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-[#FCFAF7] border border-[#EAE6DF] rounded-xl">
                <span className="block text-[10px] font-bold text-[#A0968D] uppercase tracking-wider">Risk Mitigation</span>
                <span className="font-extrabold text-[#D97706] text-xl">{inputs.riskMitigationScore}<span className="text-xs text-[#7A7165] font-normal">/10</span></span>
              </div>
              <div className="text-center p-3 bg-[#FCFAF7] border border-[#EAE6DF] rounded-xl">
                <span className="block text-[10px] font-bold text-[#A0968D] uppercase tracking-wider">Strategic Agility</span>
                <span className="font-extrabold text-[#D97706] text-xl">{inputs.strategicAgilityScore}<span className="text-xs text-[#7A7165] font-normal">/10</span></span>
              </div>
            </div>
          </div>

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
                disabled={exporting}
                className="text-xs bg-[#D97706] hover:bg-[#C26500] disabled:opacity-60 disabled:cursor-not-allowed text-white px-3.5 py-1.5 rounded-xl transition-all shadow-sm font-bold active:scale-95 flex items-center gap-1.5"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Building deck…
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export PPTX
                  </>
                )}
              </button>
            </div>
            <ul className="space-y-2.5">
              {narrative.slide_visual_recommendation.map((rec, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-[#FCFAF7]">
                  <span className="flex-shrink-0 w-5 h-5 bg-[#47403B] rounded-full flex items-center justify-center text-[10px] font-black text-[#FEF3C7] mt-0.5">{index + 1}</span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>

            {exportStatus && (
              <div className={`mt-4 p-2.5 rounded-xl text-xs font-semibold border leading-relaxed animate-fade-in ${
                exportStatus.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' : 'bg-rose-950/80 text-rose-300 border-rose-500/30'
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
