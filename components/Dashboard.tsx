import React from 'react';
import { AnalysisResult } from '../types';
import { ChartBarIcon, FireIcon } from './ui/Icons';
import { StructureTree } from './StructureTree';
import * as d3 from 'd3';

interface Props {
  data: AnalysisResult;
}

const ScoreGauge = ({ score, label, colorClass }: { score: number; label: string; colorClass: string }) => {
  return (
    <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
      <div className="relative size-16">
        <svg className="size-full" viewBox="0 0 36 36">
          <path
            className="text-slate-200 dark:text-slate-700 transition-colors"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeDasharray={`${score}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-200">
          {score}
        </div>
      </div>
      <span className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
};

export const Dashboard: React.FC<Props> = ({ data }) => {
  const { scores, summary, keywords, toneAnalysis, structure } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Scores */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            综合评分
          </h3>
          <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{scores.total}</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ScoreGauge score={scores.readability} label="可读性" colorClass="text-emerald-500" />
          <ScoreGauge score={scores.logic} label="逻辑性" colorClass="text-blue-500" />
          <ScoreGauge score={scores.emotion} label="情感共鸣" colorClass="text-rose-500" />
          <ScoreGauge score={scores.creativity} label="创意度" colorClass="text-purple-500" />
        </div>
      </div>

      {/* Logic Structure Tree - NEW Section */}
      {structure && (
        <div className="w-full">
            <StructureTree data={structure} />
        </div>
      )}

      {/* Tone & Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">文章语调</h4>
          <div className="flex items-center gap-2">
             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
                {toneAnalysis}
             </span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">SEO 关键词</h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded border border-slate-200 dark:border-slate-600">
                #{kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">AI 摘要</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
          {summary}
        </p>
      </div>
    </div>
  );
};
