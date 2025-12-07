
import React, { useState, useEffect } from 'react';
import { ArrowRight, Download, RefreshCcw, Sparkles, Trash2, Camera, CircleUser, Check, AlertTriangle } from 'lucide-react';
import { AppStatus, ImageFile } from './types';
import { addSantaHatToImage } from './services/geminiService';
import { prepareImageForAvatar } from './services/imageUtils';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ProcessingState from './components/ProcessingState';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [optimizeForAvatar, setOptimizeForAvatar] = useState<boolean>(true);
  
  // API Key State Management
  const [apiKey, setApiKey] = useState<string>('');

  // Load API Key from local storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Save API Key to local storage whenever it changes
  const handleSetApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const handleImageSelected = (image: ImageFile) => {
    setOriginalImage(image);
    setResultImage(null);
    setErrorMessage(null);
    setStatus(AppStatus.IDLE);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setStatus(AppStatus.IDLE);
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    // Validate API Key existence (either in state or env)
    // Note: We check this simply here for UI feedback, but the service also checks.
    const hasEnvKey = typeof process !== 'undefined' && process.env && process.env.API_KEY;
    if (!apiKey && !hasEnvKey) {
      setErrorMessage("请先在右上角设置中配置您的 API Key");
      setStatus(AppStatus.ERROR);
      return;
    }

    setStatus(AppStatus.PROCESSING);
    setErrorMessage(null);

    try {
      let imageToSend = originalImage.base64Data;
      
      // If optimization is enabled, process the image first
      if (optimizeForAvatar) {
        try {
          imageToSend = await prepareImageForAvatar(originalImage.base64Data, originalImage.mimeType);
        } catch (e) {
          console.warn("Avatar optimization failed, falling back to original image", e);
          // Fallback to original if processing fails
          imageToSend = originalImage.base64Data;
        }
      }

      // Pass the apiKey from state to the service
      const generatedImageBase64 = await addSantaHatToImage(
        imageToSend,
        originalImage.mimeType,
        apiKey
      );
      setResultImage(generatedImageBase64);
      setStatus(AppStatus.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      setErrorMessage(error.message || "抱歉，处理您的图片时出现了问题。请重试。");
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `santa-hat-avatar-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header apiKey={apiKey} setApiKey={handleSetApiKey} />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Intro Hero Section (Only visible when IDLE and no image selected) */}
        {!originalImage && (
          <div className="text-center mb-12 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              给你的头像加点 <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">节日魔法</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              无需复杂的 PS 技巧。只需上传一张带有人物的照片，AI 自动为你戴上圣诞帽，适配圆形头像剪裁。
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Upload & Original Preview */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-slate-500" />
                  原图
                </h3>
                {originalImage && status !== AppStatus.PROCESSING && (
                  <button 
                    onClick={handleReset}
                    className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    移除
                  </button>
                )}
              </div>

              {!originalImage ? (
                <ImageUploader 
                  onImageSelected={handleImageSelected} 
                  disabled={status === AppStatus.PROCESSING} 
                />
              ) : (
                <div className="relative group rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-[4/3] flex items-center justify-center">
                   <img 
                    src={originalImage.previewUrl} 
                    alt="Original Upload" 
                    className="max-w-full max-h-full object-contain shadow-sm"
                  />
                  {status === AppStatus.IDLE && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={handleReset}
                        className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium text-sm hover:scale-105 transition-transform"
                      >
                        更换图片
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Controls & Action Button */}
            {originalImage && status === AppStatus.IDLE && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
                
                {/* Optimization Toggle */}
                <div 
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${optimizeForAvatar ? 'border-red-100 bg-red-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                  onClick={() => setOptimizeForAvatar(!optimizeForAvatar)}
                >
                  <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${optimizeForAvatar ? 'bg-red-500 border-red-500' : 'bg-white border-slate-300'}`}>
                    {optimizeForAvatar && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <CircleUser className="w-4 h-4 text-slate-500" />
                      适合圆形头像 (推荐)
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      自动缩小人物并添加模糊背景，防止圣诞帽被头像框裁剪。
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                  生成圣诞帽
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Result or Placeholder */}
          <div className="flex flex-col gap-6">
            <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full min-h-[400px] flex flex-col ${!resultImage && status !== AppStatus.PROCESSING ? 'justify-center items-center text-center' : ''}`}>
              
              <div className="flex items-center justify-between mb-4 w-full">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  效果预览
                </h3>
              </div>

              {status === AppStatus.PROCESSING && (
                <ProcessingState />
              )}

              {status === AppStatus.ERROR && (
                <div className="w-full h-80 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">生成中断</h4>
                  <p className="text-slate-600 mb-6 text-sm max-w-xs mx-auto">{errorMessage}</p>
                  <button 
                    onClick={handleGenerate}
                    className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  >
                    重试
                  </button>
                </div>
              )}

              {status === AppStatus.SUCCESS && resultImage && (
                <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square flex items-center justify-center">
                    <img 
                      src={resultImage} 
                      alt="Generated Result" 
                      className="max-w-full max-h-full object-contain shadow-md"
                    />
                    
                    {/* Circle crop preview overlay (optional visual aid) */}
                    {optimizeForAvatar && (
                      <div className="absolute inset-0 border-[1px] border-white/50 rounded-full pointer-events-none mx-auto my-auto aspect-square w-full h-full opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                        <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">圆形裁剪预览</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-center text-slate-400 -mt-2">
                    {optimizeForAvatar ? "已为您扩展背景，裁剪为头像时圣诞帽将完整可见。" : "普通模式生成"}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                    >
                      <Download className="w-4 h-4" />
                      下载图片
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="sm:flex-none px-4 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                      title="重新生成"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      <span className="sm:hidden">重试</span>
                    </button>
                  </div>
                </div>
              )}

              {status === AppStatus.IDLE && !resultImage && (
                <div className="text-slate-400 flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-200">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="font-medium">预览将显示在这里</p>
                  <p className="text-sm mt-1">上传图片并点击生成即可开始</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="py-8 bg-white border-t border-slate-100 mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} 圣诞帽生成器. 基于 Google Gemini 构建.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;