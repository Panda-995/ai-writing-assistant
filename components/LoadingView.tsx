import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './ui/Icons';

const LOADING_MESSAGES = [
  "正在通读全文...",
  "正在检测错别字与语法...",
  "正在分析文章情感与语调...",
  "正在评估标题爆文指数...",
  "正在生成润色建议...",
  "正在整理最终报告..."
];

export const LoadingView = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Change message every 1.5 seconds to keep user engaged
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 animate-fade-in transition-colors">
      <div className="relative mb-8">
        {/* Animated rings */}
        <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/40 rounded-full animate-ping opacity-75 duration-1000"></div>
        <div className="absolute inset-[-4px] bg-indigo-50 dark:bg-indigo-900/30 rounded-full animate-pulse opacity-50 delay-75"></div>
        
        {/* Central Icon */}
        <div className="relative w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-200/50 dark:shadow-blue-900/30">
           <SparklesIcon className="w-10 h-10 text-white/90 animate-[pulse_2s_ease-in-out_infinite]" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">
        AI 智能分析中
      </h3>
      
      {/* Animated Text Container */}
      <div className="h-8 flex items-center justify-center w-full max-w-md">
        <p 
          key={currentStep} 
          className="text-slate-500 dark:text-slate-400 font-medium text-sm animate-fade-in-up text-center"
        >
          {LOADING_MESSAGES[currentStep]}
        </p>
      </div>
      
      {/* Progress Dots */}
      <div className="flex gap-2 mt-8">
        {LOADING_MESSAGES.map((_, idx) => {
          // Highlight current, previous are solid, next are faint
          const isActive = idx === currentStep;
          const isPast = idx < currentStep;
          
          return (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${
                  isActive 
                    ? 'w-6 bg-blue-500' 
                    : isPast 
                        ? 'w-1.5 bg-blue-200 dark:bg-blue-800' 
                        : 'w-1.5 bg-slate-100 dark:bg-slate-700'
              }`} 
            />
          );
        })}
      </div>
    </div>
  );
};