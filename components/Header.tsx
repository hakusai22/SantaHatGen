import React, { useState, useEffect } from 'react';
import { Snowflake, Settings, Key, Check, X } from 'lucide-react';

interface HeaderProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const Header: React.FC<HeaderProps> = ({ apiKey, setApiKey }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  
  // Update temp key if prop changes externally (e.g. from local storage load)
  useEffect(() => {
    setTempKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(tempKey);
    setShowSettings(false);
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Area */}
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Snowflake className="text-white w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
              圣诞帽<span className="text-red-600">生成器</span>
            </h1>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight sm:hidden">
              圣诞帽<span className="text-red-600">AI</span>
            </h1>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${showSettings ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              title="设置 API Key"
             >
               <Settings className="w-5 h-5" />
               <span className="hidden sm:inline">{apiKey ? '已配置 Key' : '设置 Key'}</span>
             </button>
          </div>
        </div>

        {/* Expandable Settings Panel */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in">
            <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Google Gemini API Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="输入您的 API Key (AIStudio)..."
                    className="pl-10 block w-full rounded-lg border-slate-200 border bg-slate-50 text-slate-900 focus:border-red-500 focus:ring-red-500 sm:text-sm py-2"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  您的 Key 仅存储在本地浏览器中，用于调用 Gemini API。
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                 <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  保存设置
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;