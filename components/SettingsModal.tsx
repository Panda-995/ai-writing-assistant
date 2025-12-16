import React, { useState, useEffect } from 'react';
import { AISettings, AIProvider } from '../types';
import { XMarkIcon, Cog6ToothIcon, CheckCircleIcon } from './ui/Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleProviderChange = (provider: AIProvider) => {
    // Set default models when switching
    const defaultModel = provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini';
    const defaultUrl = provider === 'gemini' ? '' : 'https://api.openai.com';
    
    setLocalSettings({
      ...localSettings,
      provider,
      model: defaultModel,
      baseUrl: defaultUrl
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
               <Cog6ToothIcon className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">AI 设置</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">配置模型与接口参数</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              AI 提供商
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleProviderChange('gemini')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                  localSettings.provider === 'gemini'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                }`}
              >
                Google Gemini
              </button>
              <button
                onClick={() => handleProviderChange('openai')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                  localSettings.provider === 'openai'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                }`}
              >
                OpenAI / Compatible
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  API URL (Base URL)
                </label>
                <input
                  type="text"
                  value={localSettings.baseUrl}
                  onChange={(e) => setLocalSettings({...localSettings, baseUrl: e.target.value})}
                  placeholder={localSettings.provider === 'openai' ? 'https://api.openai.com' : '留空使用默认 Google API'}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm"
                />
                <p className="text-xs text-slate-400 mt-1">
                   {localSettings.provider === 'gemini' 
                     ? '可选。仅在使用反向代理时填写。' 
                     : 'OpenAI 兼容接口地址 (不包含 /v1/chat/completions)'}
                </p>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={localSettings.apiKey}
                  onChange={(e) => setLocalSettings({...localSettings, apiKey: e.target.value})}
                  placeholder="sk-..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm"
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  模型名称
                </label>
                <input
                  type="text"
                  value={localSettings.model}
                  onChange={(e) => setLocalSettings({...localSettings, model: e.target.value})}
                  placeholder={localSettings.provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm"
                />
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-all shadow-md ${
                  saved 
                  ? 'bg-emerald-500' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {saved ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    已保存
                  </>
              ) : (
                  '保存设置'
              )}
            </button>
        </div>
      </div>
    </div>
  );
};
