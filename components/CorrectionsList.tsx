import React from 'react';
import { Correction } from '../types';
import { CheckCircleIcon } from './ui/Icons';

interface Props {
  corrections: Correction[];
  onHighlight?: (text: string | null) => void;
}

const TypeBadge = ({ type }: { type: Correction['type'] }) => {
  const styles = {
    grammar: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    typo: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    style: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    punctuation: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  };
  
  const labels = {
    grammar: '语法',
    typo: '错别字',
    style: '润色',
    punctuation: '标点',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[type]}`}>
      {labels[type] || type}
    </span>
  );
};

export const CorrectionsList: React.FC<Props> = ({ corrections, onHighlight }) => {
  if (corrections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
        <CheckCircleIcon className="w-12 h-12 mb-2 text-emerald-400" />
        <p>太棒了！没有发现明显的错误。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-slate-100">优化建议 ({corrections.length})</h3>
      </div>
      
      <div className="space-y-3">
        {corrections.map((item, index) => (
          <div 
            key={index} 
            className="group bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
            onMouseEnter={() => onHighlight?.(item.original)}
            onMouseLeave={() => onHighlight?.(null)}
          >
            <div className="flex justify-between items-start mb-2">
              <TypeBadge type={item.type} />
            </div>
            
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center text-sm mb-2">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2 rounded line-through decoration-red-400 decoration-2 break-all">
                {item.original}
              </div>
              <span className="text-slate-400">→</span>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 p-2 rounded font-medium break-all">
                {item.suggestion}
              </div>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
              <span className="font-semibold text-slate-600 dark:text-slate-300">原因:</span> {item.reason}
            </p>
            {item.location_snippet && (
                 <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                    位置: ...{item.location_snippet}...
                 </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};