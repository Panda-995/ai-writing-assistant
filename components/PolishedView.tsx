import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { DocumentTextIcon, ArrowDownTrayIcon, ClipboardIcon, CheckCircleIcon } from './ui/Icons';
import { exportToWord } from '../services/exportService';

interface Props {
  content: string;
}

export const PolishedView: React.FC<Props> = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
        await exportToWord(content, "AI润色文章");
    } catch (e) {
        console.error(e);
        alert("导出失败，请重试");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
       
       {/* Header Toolbar - Floating feel */}
       <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-start pointer-events-none">
          {/* Badge */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2 pointer-events-auto">
             <DocumentTextIcon className="w-4 h-4 text-emerald-500" />
             <span className="text-sm font-bold text-slate-700 dark:text-slate-200">AI 润色版</span>
          </div>

          {/* Actions */}
          <button 
                onClick={handleCopy}
                className={`pointer-events-auto shadow-sm backdrop-blur text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 font-medium ${
                    copied 
                    ? 'bg-emerald-50/90 text-emerald-600 border-emerald-200 dark:bg-emerald-900/80 dark:text-emerald-300 dark:border-emerald-800' 
                    : 'bg-white/90 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700 dark:hover:border-slate-500'
                }`}
            >
                {copied ? (
                   <>
                     <CheckCircleIcon className="w-3.5 h-3.5" /> 已复制
                   </>
                ) : (
                   <>
                     <ClipboardIcon className="w-3.5 h-3.5" /> 复制
                   </>
                )}
            </button>
       </div>
       
       {/* Main Scrollable "Paper" Area */}
       <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pt-16 sm:px-8 pb-4">
           <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 rounded-lg min-h-full p-8 sm:p-10 transition-colors">
              <article className="prose prose-slate dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed prose-li:marker:text-blue-500 max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </article>
           </div>
       </div>
       
       {/* Footer Action */}
       <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex justify-end items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none z-20">
            <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 text-sm"
            >
                {isExporting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <ArrowDownTrayIcon className="w-5 h-5" />
                )}
                导出为 Word 文档
            </button>
       </div>
    </div>
  );
};