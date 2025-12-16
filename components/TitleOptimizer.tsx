import React from 'react';
import { TitleAnalysis } from '../types';
import { FireIcon, SparklesIcon } from './ui/Icons';

interface Props {
  data: TitleAnalysis;
  currentTitle: string;
}

export const TitleOptimizer: React.FC<Props> = ({ data, currentTitle }) => {
  const potentialColor = {
    'High': 'text-red-500',
    'Medium': 'text-orange-500',
    'Low': 'text-slate-500 dark:text-slate-400'
  };

  const potentialLabel = {
    'High': '🔥 极高',
    'Medium': '⚡ 一般',
    'Low': '💤 较低'
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">标题诊断</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{currentTitle}"</p>
          </div>
          <div className="text-right">
             <div className="text-4xl font-black text-slate-800 dark:text-slate-100">{data.score}</div>
             <div className={`text-sm font-bold ${potentialColor[data.viralPotential]}`}>
               爆文指数: {potentialLabel[data.viralPotential]}
             </div>
          </div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-600">
           {data.critique}
        </div>
      </div>

      {/* Examples */}
      <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-800 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
         <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-indigo-500"/>
            推荐爆款标题
         </h3>
         <div className="space-y-3">
            {data.examples.map((title, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-indigo-50 dark:border-indigo-900/50 shadow-sm hover:shadow hover:border-indigo-200 dark:hover:border-indigo-600 transition-all cursor-pointer group"
                     onClick={() => navigator.clipboard.writeText(title)}
                     title="点击复制"
                >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-xs font-bold shrink-0">
                        {idx + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-200 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</span>
                </div>
            ))}
         </div>
      </div>

      {/* Suggestions */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">优化建议</h3>
        <ul className="space-y-2">
            {data.suggestions.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="text-blue-500 mt-1">•</span>
                    {sug}
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};