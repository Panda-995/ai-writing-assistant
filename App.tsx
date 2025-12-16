import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult, AnalysisStatus, AISettings } from './types';
import { analyzeArticle } from './services/geminiService';
import { exportToWord } from './services/exportService';
import { SparklesIcon, ArrowDownTrayIcon, ClipboardIcon, CheckCircleIcon, EyeIcon, PencilSquareIcon, Cog6ToothIcon } from './components/ui/Icons';
import { Dashboard } from './components/Dashboard';
import { CorrectionsList } from './components/CorrectionsList';
import { TitleOptimizer } from './components/TitleOptimizer';
import { PolishedView } from './components/PolishedView';
import { LoadingView } from './components/LoadingView';
import { ThemeToggle } from './components/ThemeToggle';
import { SettingsModal } from './components/SettingsModal';

const TABS = [
  { id: 'dashboard', label: '分析总览' },
  { id: 'corrections', label: '纠错与建议' },
  { id: 'title', label: '标题优化' },
  { id: 'polished', label: '全文润色' },
];

const DEFAULT_SETTINGS: AISettings = {
  provider: 'gemini',
  apiKey: process.env.API_KEY || '',
  model: 'gemini-2.5-flash',
  baseUrl: ''
};

function App() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState<string | null>(null);
  const [isExportingInput, setIsExportingInput] = useState(false);
  const [isCopiedInput, setIsCopiedInput] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse settings", e);
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  const handleSaveSettings = (newSettings: AISettings) => {
    setAiSettings(newSettings);
    localStorage.setItem('ai_settings', JSON.stringify(newSettings));
  };
  
  // Theme state initialization
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  // Apply theme class to html element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    
    try {
      const data = await analyzeArticle(title, content, aiSettings);
      setResult(data);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "分析过程中出现错误，请稍后重试。");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleExportInput = async () => {
      if (!content.trim()) return;
      setIsExportingInput(true);
      try {
          await exportToWord(content, title || "我的文章");
      } catch (e) {
          console.error(e);
      } finally {
          setIsExportingInput(false);
      }
  };

  const handleCopyInput = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setIsCopiedInput(true);
    setTimeout(() => setIsCopiedInput(false), 2000);
  };

  // Highlight logic
  const handleHighlight = (text: string | null) => {
    if (!textareaRef.current || showPreview) return;
    
    const textarea = textareaRef.current;
    
    if (text) {
      const index = content.indexOf(text);
      if (index !== -1) {
        textarea.focus();
        textarea.setSelectionRange(index, index + text.length);
      }
    } else {
        const currentPos = textarea.selectionStart;
        textarea.setSelectionRange(currentPos, currentPos);
    }
  };

  const wordCount = content.trim().length;

  return (
    <div className="min-h-screen flex flex-col">
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        settings={aiSettings}
        onSave={handleSaveSettings}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
               <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300">
              妙笔生花
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:block text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
               {aiSettings.provider === 'gemini' ? 'Gemini Mode' : 'OpenAI Mode'}
             </div>
             <button 
               onClick={() => setShowSettings(true)}
               className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
               title="AI 设置"
             >
               <Cog6ToothIcon className="w-5 h-5" />
             </button>
             <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Editor */}
        <div className="flex flex-col gap-4 h-[calc(100vh-6rem)]">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden transition-colors">
             <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center gap-2">
                <input
                  type="text"
                  placeholder="请输入文章标题（可选）..."
                  className="flex-1 text-lg font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none bg-transparent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title={showPreview ? "切换至编辑模式" : "切换至预览模式"}
                >
                  {showPreview ? (
                     <PencilSquareIcon className="w-5 h-5" />
                  ) : (
                     <EyeIcon className="w-5 h-5" />
                  )}
                </button>
             </div>
             <div className="flex-1 p-4 relative overflow-y-auto">
                {showPreview ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed break-words">
                    {content ? (
                      <ReactMarkdown>{content}</ReactMarkdown>
                    ) : (
                      <p className="text-slate-400 italic">暂无内容预览...</p>
                    )}
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    className="w-full h-full resize-none focus:outline-none text-slate-600 dark:text-slate-300 leading-relaxed text-base bg-transparent placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    placeholder="请输入或粘贴您的文章内容（支持 Markdown 格式图片），AI 将为您进行全方位体检..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                )}
                {!showPreview && (
                  <div className="absolute bottom-4 right-6 text-xs text-slate-400 dark:text-slate-500 pointer-events-none bg-white/80 dark:bg-slate-800/80 px-2 rounded">
                    {wordCount} 字
                  </div>
                )}
             </div>
             
             {/* Editor Footer */}
             <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center transition-colors">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                   <div className="flex items-center gap-1">
                      <span className="bg-slate-200 dark:bg-slate-700 px-1.5 rounded text-[10px] min-w-[2rem] text-center">{wordCount}</span>
                      <span>字数</span>
                   </div>
                   {wordCount > 0 && (
                     <>
                       <button 
                           onClick={handleCopyInput}
                           className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                           title="复制原始内容"
                       >
                           {isCopiedInput ? (
                               <span className="text-emerald-500 flex items-center gap-1">
                                 <CheckCircleIcon className="w-3.5 h-3.5" /> 已复制
                               </span>
                           ) : (
                               <>
                                 <ClipboardIcon className="w-3.5 h-3.5" /> 复制
                               </>
                           )}
                       </button>
                       <button 
                           onClick={handleExportInput}
                           disabled={isExportingInput}
                           className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                           title="导出原始内容"
                       >
                           {isExportingInput ? (
                               <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                           ) : (
                               <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                           )}
                           导出
                       </button>
                     </>
                   )}
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!content.trim() || status === AnalysisStatus.ANALYZING}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm text-white shadow-md transition-all
                    ${!content.trim() || status === AnalysisStatus.ANALYZING 
                      ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 dark:hover:shadow-blue-900/40 hover:-translate-y-0.5'
                    }`}
                >
                  {status === AnalysisStatus.ANALYZING ? (
                    <>
                       <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       分析中...
                    </>
                  ) : (
                    <>
                       <SparklesIcon className="w-4 h-4" />
                       一键检测 & 优化
                    </>
                  )}
                </button>
             </div>
          </div>
        </div>

        {/* Right Column: Analysis Results */}
        <div className="flex flex-col h-[calc(100vh-6rem)]">
          {status === AnalysisStatus.IDLE && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors">
               <div className="w-16 h-16 mb-4 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center">
                 <SparklesIcon className="w-8 h-8 text-slate-300 dark:text-slate-500" />
               </div>
               <p>在左侧输入内容开始分析</p>
               <p className="text-xs text-slate-400 mt-2">使用 {aiSettings.provider} - {aiSettings.model}</p>
            </div>
          )}

          {status === AnalysisStatus.ERROR && (
             <div className="h-full flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800 p-8 text-center">
                <p>{error || "发生未知错误"}</p>
             </div>
          )}

          {status === AnalysisStatus.ANALYZING && (
             <LoadingView />
          )}

          {status === AnalysisStatus.COMPLETED && result && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col overflow-hidden transition-colors">
               {/* Tabs */}
               <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto no-scrollbar">
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors relative
                        ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
                      `}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />
                      )}
                    </button>
                  ))}
               </div>

               {/* Tab Content */}
               <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/30">
                  {activeTab === 'dashboard' && <Dashboard data={result} />}
                  {activeTab === 'corrections' && (
                    <CorrectionsList 
                      corrections={result.corrections} 
                      onHighlight={handleHighlight}
                    />
                  )}
                  {activeTab === 'title' && <TitleOptimizer data={result.titleAnalysis} currentTitle={title} />}
                  {activeTab === 'polished' && <PolishedView content={result.polishedContent} />}
               </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default App;
