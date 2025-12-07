import React from 'react';
import { Loader2, Wand2 } from 'lucide-react';

const ProcessingState: React.FC = () => {
  return (
    <div className="w-full h-80 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-sm">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-white p-4 rounded-full border-2 border-red-100 shadow-sm">
          <Wand2 className="w-8 h-8 text-red-600 animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        正在施展魔法...
      </h3>
      <p className="text-slate-500 max-w-xs mx-auto mb-6">
        AI 正在识别人物并精心为您调整圣诞帽的角度和光影。
      </p>
      <div className="flex items-center gap-2 text-sm text-red-600 font-medium bg-red-50 px-4 py-2 rounded-full">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>处理中，请稍候</span>
      </div>
    </div>
  );
};

export default ProcessingState;