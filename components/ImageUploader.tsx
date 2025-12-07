import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  onImageSelected: (image: ImageFile) => void;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件 (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('图片大小不能超过 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract raw base64 and mime type
      const [prefix, base64Data] = result.split(',');
      const mimeType = prefix.match(/:(.*?);/)?.[1] || 'image/jpeg';

      onImageSelected({
        file,
        previewUrl: result,
        base64Data,
        mimeType
      });
    };
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && !disabled) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile, disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0] && !disabled) {
      processFile(e.target.files[0]);
    }
  }, [processFile, disabled]);

  return (
    <div className="w-full">
      <div
        className={`relative group cursor-pointer transition-all duration-300 ease-in-out border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center h-80
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200' : 
            dragActive 
              ? 'border-red-500 bg-red-50 scale-[1.02]' 
              : 'border-slate-300 hover:border-red-400 hover:bg-slate-50 bg-white'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className={`absolute inset-0 w-full h-full opacity-0 z-10 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          onChange={handleChange}
          accept="image/*"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center gap-4 transition-transform duration-300 group-hover:scale-105">
          <div className={`p-4 rounded-full ${dragActive ? 'bg-red-100' : 'bg-slate-100 group-hover:bg-red-50'}`}>
            {dragActive ? (
              <UploadCloud className="w-10 h-10 text-red-500" />
            ) : (
              <ImageIcon className="w-10 h-10 text-slate-400 group-hover:text-red-500" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-700">
              {dragActive ? '松开以上传' : '点击或拖拽图片到这里'}
            </h3>
            <p className="text-sm text-slate-500">
              支持 JPG, PNG, WEBP (最大 10MB)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;