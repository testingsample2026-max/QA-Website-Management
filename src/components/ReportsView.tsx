/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { EmptyState } from './EmptyState';
import {
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bug,
  Activity,
  FileBarChart,
  Target,
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Printer,
  ChevronDown,
  Presentation
} from 'lucide-react';
import { exportToWord, exportToPDF, exportToPPTX } from '../utils/officeExportUtils';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export const ReportsView: React.FC = () => {
  const {
    testCases,
    executions,
    bugs,
    projects,
    modules,
    settings,
    addNotification
  } = useApp();

  const [isExportOpen, setIsExportOpen] = React.useState(false);

  // Guard against complete empty state to avoid breaking recharts
  const hasData = testCases.length > 0 || executions.length > 0 || bugs.length > 0;

  // 1. Calc Pass Rate
  const totalExecs = executions.length;
  const passedExecs = executions.filter(e => e.status === 'passed').length;
  const passRate = totalExecs > 0 ? Math.round((passedExecs / totalExecs) * 100) : 0;

  // 2. Calc Automation Rate
  const totalCases = testCases.length;
  const automatedCases = testCases.filter(c => c.type === 'automated').length;
  const automationRate = totalCases > 0 ? Math.round((automatedCases / totalCases) * 100) : 0;

  // 3. Automated vs Manual Pie Data
  const typeDistributionData = [
    { name: 'Manual Cases', value: totalCases - automatedCases },
    { name: 'Automated', value: automatedCases }
  ].filter(d => d.value > 0);

  const TYPE_COLORS = ['#6366f1', '#10b981']; // indigo, emerald

  // 4. Execution Outcomes Breakdown Data
  const passed = executions.filter(e => e.status === 'passed').length;
  const failed = executions.filter(e => e.status === 'failed').length;
  const blocked = executions.filter(e => e.status === 'blocked').length;
  const retest = executions.filter(e => e.status === 'retest').length;

  const executionBreakdownData = [
    { name: 'Passed', count: passed, color: '#10b981' },
    { name: 'Failed', count: failed, color: '#f43f5e' },
    { name: 'Blocked', count: blocked, color: '#f59e0b' },
    { name: 'Retest', count: retest, color: '#06b6d4' }
  ].filter(d => d.count > 0);

  // 5. Defect Severity Breakdown Data
  const critBugs = bugs.filter(b => b.severity === 'critical').length;
  const highBugs = bugs.filter(b => b.severity === 'high').length;
  const medBugs = bugs.filter(b => b.severity === 'medium').length;
  const lowBugs = bugs.filter(b => b.severity === 'low').length;

  const defectSeverityData = [
    { name: 'Critical', count: critBugs },
    { name: 'High', count: highBugs },
    { name: 'Medium', count: medBugs },
    { name: 'Low', count: lowBugs }
  ];

  // 6. Test execution trend over time (last 7 logs)
  const sortedExecTimeline = [...executions]
    .sort((a, b) => new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime())
    .slice(-7);

  const executionTrendData = sortedExecTimeline.map((exec, idx) => ({
    name: `Run #${idx + 1}`,
    duration: exec.runTimeMs || 0
  }));

  const exportAsJSON = () => {
    const summary = {
      exportedAt: new Date().toISOString(),
      summaryMetrics: {
        totalTestCases: totalCases,
        automatedTestCases: automatedCases,
        automationCoveragePercent: automationRate,
        totalExecutions: totalExecs,
        passedExecutions: passedExecs,
        overallPassRatePercent: passRate,
        executionBreakdown: { passed, failed, blocked, retest },
        defectMetrics: {
          totalBugs: bugs.length,
          activeBugs: bugs.filter(b => b.status !== 'closed' && b.status !== 'rejected').length,
          criticalSeverity: critBugs,
          highSeverity: highBugs,
          mediumSeverity: medBugs,
          lowSeverity: lowBugs
        }
      }
    };
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QA-Executive-Summary-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  const exportAsCSV = () => {
    const csvRows = [
      ['Execution ID', 'Test Case ID', 'Project ID', 'Module ID', 'Status', 'Executed By', 'Date', 'Notes', 'Run Time (ms)'],
      ...executions.map(e => [
        e.id,
        e.testCaseId,
        e.projectId,
        e.moduleId,
        e.status,
        e.executedById,
        e.executionDate,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
        e.runTimeMs || ''
      ])
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QA-Executions-Log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  const exportAsMarkdown = () => {
    const activeBugsCount = bugs.filter(b => b.status !== 'closed' && b.status !== 'rejected').length;
    const md = `# Quality Assurance Status & Analytics Report
Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

## 1. Executive Summary Metrics
- **Overall Quality Pass Rate:** ${passRate}%
- **Total Test Cases:** ${totalCases}
- **Automated Test Cases:** ${automatedCases} (${automationRate}% Automation Coverage)
- **Active Defects Count:** ${activeBugsCount}

## 2. Test Execution Breakdown
Total Executions Logged: ${totalExecs}
- **Passed:** ${passed}
- **Failed:** ${failed}
- **Blocked:** ${blocked}
- **Retest Required:** ${retest}

## 3. Defect Severity Density
Total Logged Defects: ${bugs.length}
- **Critical Severity:** ${critBugs}
- **High Severity:** ${highBugs}
- **Medium Severity:** ${medBugs}
- **Low Severity:** ${lowBugs}

## 4. Environment & Projects Context
- **Total Projects Enrolled:** ${projects.length}
- **Total Modules Registered:** ${modules.length}

---
*Report exported from QA Workspace Ledger.*
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QA-Quality-Report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  const exportAsWordReport = () => {
    try {
      const activeBugsCount = bugs.filter(b => b.status !== 'closed' && b.status !== 'rejected').length;
      const title = 'Executive Quality Status & Analytics Report';
      
      const sections = [
        {
          heading: '1. Executive Summary Metrics',
          content: `Overall Quality Pass Rate: ${passRate}%\nTotal Test Cases Registered: ${totalCases}\nAutomated Test Cases: ${automatedCases} (${automationRate}% Automation Coverage)\nActive Defects Registered: ${activeBugsCount}`
        },
        {
          heading: '2. Test Execution Breakdown',
          content: [
            ['Passed Runs', String(passed), `${totalExecs > 0 ? Math.round((passed / totalExecs) * 100) : 0}%`],
            ['Failed Runs', String(failed), `${totalExecs > 0 ? Math.round((failed / totalExecs) * 100) : 0}%`],
            ['Blocked Runs', String(blocked), `${totalExecs > 0 ? Math.round((blocked / totalExecs) * 100) : 0}%`],
            ['Retest Required', String(retest), `${totalExecs > 0 ? Math.round((retest / totalExecs) * 100) : 0}%`]
          ],
          isTable: true,
          headers: ['Status Flag', 'Total Count', 'Percentage Coverage']
        },
        {
          heading: '3. Defect Severity Density',
          content: [
            ['Critical Severity', String(critBugs)],
            ['High Severity', String(highBugs)],
            ['Medium Severity', String(medBugs)],
            ['Low Severity', String(lowBugs)]
          ],
          isTable: true,
          headers: ['Severity Tier', 'Total Registered Defects']
        },
        {
          heading: '4. System Context & Inventory',
          content: `Active Projects Enrolled: ${projects.length}\nActive Modules Registered: ${modules.length}\nTotal Defect Reports logged: ${bugs.length}`
        }
      ];

      exportToWord(title, sections, `QA-Quality-Report-${new Date().toISOString().split('T')[0]}`, settings?.websiteName || 'TestEngine');
      addNotification('Export Success', 'Successfully exported quality status report to Word (DOCX).', 'success');
    } catch (err: any) {
      console.error(err);
      addNotification('Export Failed', err.message || 'An error occurred during Word export.', 'error');
    }
    setIsExportOpen(false);
  };

  const exportAsPDFReport = () => {
    try {
      const activeBugsCount = bugs.filter(b => b.status !== 'closed' && b.status !== 'rejected').length;
      const title = 'Executive Quality Status Report';
      
      const sections = [
        {
          heading: '1. Executive Summary Metrics',
          content: `Overall Quality Pass Rate: ${passRate}%\nTotal Test Cases: ${totalCases}\nAutomated Test Cases: ${automatedCases} (${automationRate}% Automation Coverage)\nActive Defects Count: ${activeBugsCount}`
        },
        {
          heading: '2. Test Execution Breakdown',
          content: [
            ['Passed Runs', String(passed), `${totalExecs > 0 ? Math.round((passed / totalExecs) * 100) : 0}%`],
            ['Failed Runs', String(failed), `${totalExecs > 0 ? Math.round((failed / totalExecs) * 100) : 0}%`],
            ['Blocked Runs', String(blocked), `${totalExecs > 0 ? Math.round((blocked / totalExecs) * 100) : 0}%`],
            ['Retest Required', String(retest), `${totalExecs > 0 ? Math.round((retest / totalExecs) * 100) : 0}%`]
          ],
          isTable: true,
          headers: ['Execution Status', 'Total Counts', 'Percentage Coverage']
        },
        {
          heading: '3. Defect Severity Density',
          content: [
            ['Critical Severity', String(critBugs)],
            ['High Severity', String(highBugs)],
            ['Medium Severity', String(medBugs)],
            ['Low Severity', String(lowBugs)]
          ],
          isTable: true,
          headers: ['Severity Level', 'Defects Count']
        },
        {
          heading: '4. System Context & Inventory',
          content: `Projects Enrolled: ${projects.length}\nModules Registered: ${modules.length}\nTotal Defects Logged: ${bugs.length}`
        }
      ];

      exportToPDF(title, sections, `QA-Quality-Report-${new Date().toISOString().split('T')[0]}`, settings?.websiteName || 'TestEngine');
      addNotification('Export Success', 'Successfully exported quality status report to PDF.', 'success');
    } catch (err: any) {
      console.error(err);
      addNotification('Export Failed', err.message || 'An error occurred during PDF export.', 'error');
    }
    setIsExportOpen(false);
  };

  const exportAsPPTXReport = () => {
    try {
      const activeBugsCount = bugs.filter(b => b.status !== 'closed' && b.status !== 'rejected').length;
      const title = 'Executive QA Status & Analytics Report';
      const subtitle = `Comprehensive Quality Assurance Audit | Run Rate: ${passRate}%`;

      const slides = [
        {
          title: 'Executive Metrics Highlights',
          bullets: [
            `Quality Pass Rate: Over ${passRate}% of test execution steps successfully verified.`,
            `Test Inventory: Total ${totalCases} test cases defined inside the workspace.`,
            `Automation Ratio: ${automationRate}% of cases automated (${automatedCases} automated vs. ${totalCases - automatedCases} manual).`,
            `Defect Footprint: ${activeBugsCount} active defects requiring validation.`
          ]
        },
        {
          title: 'Test Execution Breakdown',
          tableHeaders: ['Execution Status Flag', 'Total Counts', 'Percentage Coverage'],
          tableRows: [
            ['Passed Runs', String(passed), `${totalExecs > 0 ? Math.round((passed / totalExecs) * 100) : 0}%`],
            ['Failed Runs', String(failed), `${totalExecs > 0 ? Math.round((failed / totalExecs) * 100) : 0}%`],
            ['Blocked Runs', String(blocked), `${totalExecs > 0 ? Math.round((blocked / totalExecs) * 100) : 0}%`],
            ['Retest Required', String(retest), `${totalExecs > 0 ? Math.round((retest / totalExecs) * 100) : 0}%`]
          ]
        },
        {
          title: 'Defect Severity Profile',
          tableHeaders: ['Severity Classification Tier', 'Total Defect Count'],
          tableRows: [
            ['Critical Severity Defects', String(critBugs)],
            ['High Severity Defects', String(highBugs)],
            ['Medium Severity Defects', String(medBugs)],
            ['Low Severity Defects', String(lowBugs)]
          ]
        },
        {
          title: 'System Scope & Assets',
          bullets: [
            `Corporate Workspace Infrastructure is active and tracking live projects.`,
            `Registered Projects: ${projects.length} independent initiatives enrolled.`,
            `System Modules: ${modules.length} business components mapped under test suites.`,
            `Cumulative Audit History: ${totalExecs} total individual trial steps logs logged.`
          ]
        }
      ];

      exportToPPTX(title, subtitle, slides, `QA-Executive-Summary-${new Date().toISOString().split('T')[0]}`, settings?.websiteName || 'TestEngine');
      addNotification('Export Success', 'Successfully exported quality status report presentation.', 'success');
    } catch (err: any) {
      console.error(err);
      addNotification('Export Failed', err.message || 'An error occurred during PPTX export.', 'error');
    }
    setIsExportOpen(false);
  };

  const printReport = () => {
    setIsExportOpen(false);
    window.print();
  };

  // Render pristine Empty State if no records exist
  if (!hasData) {
    return (
      <EmptyState
        icon={<FileBarChart className="w-10 h-10" />}
        title="Analytics Ledger is Empty"
        description="Dynamic charts, pass rates, automation ratios, and error distribution metrics will render here once you author test cases and log execution runs."
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section with title and Export button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/55">
        <div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Quality Assurance Reports
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Analyze key quality metrics, defect densities, automation rates, and test coverage stats.
          </p>
        </div>

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
          </button>

          {isExportOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsExportOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-20">
                <button
                  onClick={exportAsWordReport}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Executive Report (Word / DOCX)</span>
                </button>
                <button
                  onClick={exportAsPDFReport}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>Executive Report (PDF / jsPDF)</span>
                </button>
                <button
                  onClick={exportAsPPTXReport}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center gap-2 cursor-pointer"
                >
                  <Presentation className="w-4 h-4 text-indigo-500" />
                  <span>Presentation Slide Deck (PPTX)</span>
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button
                  onClick={exportAsJSON}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center gap-2 cursor-pointer"
                >
                  <FileJson className="w-4 h-4 text-amber-500" />
                  <span>Executive Summary (JSON)</span>
                </button>
                <button
                  onClick={exportAsCSV}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Executions Dataset (CSV)</span>
                </button>
                <button
                  onClick={exportAsMarkdown}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Quality Document (Markdown)</span>
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button
                  onClick={printReport}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print / PDF Document</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dynamic metric summaries widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pass Rate Metric */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quality Pass Rate</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-sans">{passRate}%</h3>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Based on {totalExecs} runs</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Automation Coverage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Automation Ratio</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-sans">{automationRate}%</h3>
            <span className="text-[10px] text-indigo-600 font-semibold">
              {automatedCases} of {totalCases} cases automated
            </span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
        </div>

        {/* Active Bugs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Defects</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-sans">
              {bugs.filter(b => b.status !== 'closed' && b.status !== 'rejected').length}
            </h3>
            <span className="text-[10px] text-rose-600 font-semibold">
              {bugs.filter(b => b.severity === 'critical').length} Critical severity
            </span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-xl">
            <Bug className="w-5 h-5" />
          </div>
        </div>

        {/* Total Test Catalog */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Test Cases</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-sans">{totalCases}</h3>
            <span className="text-[10px] text-slate-500">
              Mapped across {modules.length} modules
            </span>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Test Cases Distribution (Manual vs Automated) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" />
            <span>Test Case Distribution Ratio</span>
          </h4>

          {typeDistributionData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs py-20">
              No test cases registered yet.
            </div>
          ) : (
            <div className="h-64 flex flex-col justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={typeDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {typeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Cases`, 'Volume']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center text-[11px] font-medium text-slate-500 mt-2">
                Automated tests compose <strong>{automationRate}%</strong> of your entire catalog.
              </div>
            </div>
          )}
        </div>

        {/* CHART 2: Execution Run Results Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Execution Run Result Volumes</span>
          </h4>

          {executionBreakdownData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs py-20">
              No test executions recorded.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={executionBreakdownData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} formatter={(value) => [`${value} runs`]} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {executionBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* CHART 3: Bug Severity Density */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Bug className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Defect Severity Density</span>
          </h4>

          {bugs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs py-20">
              No defect tickets registered.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defectSeverityData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(244, 63, 94, 0.04)' }} formatter={(value) => [`${value} Bugs`]} />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* CHART 4: Execution Runtime Speed (ms) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            <span>Execution Speed Trend (ms)</span>
          </h4>

          {executionTrendData.length < 2 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs py-20 px-6 text-center">
              Log at least 2 executions with duration speeds to render speed analytics.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={executionTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                  <defs>
                    <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value} ms`, 'Runtime']} />
                  <Area type="monotone" dataKey="duration" stroke="#06b6d4" fillOpacity={1} fill="url(#durationGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
