import React from 'react';
import { Snowflake } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 p-2 rounded-lg">
            <Snowflake className="text-white w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            圣诞帽<span className="text-red-600">生成器</span>
          </h1>
        </div>
        <div className="text-sm font-medium text-slate-500 hidden sm:block">
          Powered by Gemini 2.5
        </div>
      </div>
    </header>
  );
};

export default Header;