import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, X, Sparkles, ChevronRight, ChevronLeft, Edit3, Trash2 } from 'lucide-react';
import { parseQuestionsFromImage } from '../services/gemini';
import { cn } from '../lib/utils';
import QuestionEditor from './QuestionEditor';

interface QuestionScannerProps {
  onSave: (questions: any[]) => void;
  onCancel: () => void;
}

export default function QuestionScanner({ onSave, onCancel }: QuestionScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setIsScanning(true);
    setError(null);
    try {
      const data = await parseQuestionsFromImage(image);
      setParsedQuestions(data);
      setCurrentIndex(0);
    } catch (err) {
      setError('扫描失败，请重试或手动输入。');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = () => {
    if (parsedQuestions.length > 0) {
      onSave(parsedQuestions);
    }
  };

  const handleDelete = () => {
    const newQuestions = parsedQuestions.filter((_, i) => i !== currentIndex);
    setParsedQuestions(newQuestions);
    if (currentIndex >= newQuestions.length && newQuestions.length > 0) {
      setCurrentIndex(newQuestions.length - 1);
    }
  };

  const handleUpdateQuestion = (updatedData: any) => {
    const newQuestions = [...parsedQuestions];
    newQuestions[currentIndex] = { ...newQuestions[currentIndex], ...updatedData };
    setParsedQuestions(newQuestions);
    setEditingIndex(null);
  };

  const currentParsed = parsedQuestions[currentIndex];

  return (
    <div className="p-6 bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI 智能扫题
        </h2>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-video border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-7 h-7 text-indigo-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-700">拍照或上传图片</p>
            <p className="text-xs text-slate-400 mt-1">支持多题同时识别</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden aspect-video shadow-inner bg-slate-100">
            <img src={image} alt="Preview" className="w-full h-full object-contain" />
            {parsedQuestions.length === 0 && !isScanning && (
              <button 
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isScanning ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700">正在智能解析题目...</p>
                <p className="text-xs text-slate-400 mt-1">AI 正在提取所有题目、选项和答案</p>
              </div>
            </div>
          ) : parsedQuestions.length > 0 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  预览题目 {currentIndex + 1} / {parsedQuestions.length}
                </span>
                <div className="flex gap-2">
                  <button 
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="p-1.5 bg-slate-100 rounded-lg disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={currentIndex === parsedQuestions.length - 1}
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="p-1.5 bg-slate-100 rounded-lg disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">解析成功</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingIndex(currentIndex)}
                      className="p-1.5 bg-white text-indigo-600 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-colors shadow-sm"
                      title="编辑题目"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="p-1.5 bg-white text-rose-500 rounded-lg border border-rose-100 hover:bg-rose-50 transition-colors shadow-sm"
                      title="删除题目"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">{currentParsed.text}</p>
                {currentParsed.options && currentParsed.options.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {currentParsed.options.map((opt: string, i: number) => (
                      <div key={i} className="px-3 py-1.5 bg-white rounded-lg text-xs text-slate-600 border border-indigo-100 shadow-sm">
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-indigo-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">正确答案:</span>
                    <span className="text-sm font-bold text-indigo-600">{currentParsed.answer}</span>
                  </div>
                  <div className="flex gap-1">
                    {currentParsed.tags?.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {currentParsed.explanation && (
                  <div className="mt-3 p-3 bg-white/50 rounded-xl border border-indigo-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">解析预览</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{currentParsed.explanation}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setParsedQuestions([]); setImage(null); }}
                  className="flex-1 py-3.5 px-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm"
                >
                  重新扫描
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] py-3.5 px-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all text-sm"
                >
                  确认入库 ({parsedQuestions.length} 题)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-600 text-xs font-medium rounded-xl flex items-center gap-2 border border-rose-100">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <button 
                onClick={handleScan}
                className="w-full py-4 px-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                开始 AI 解析
              </button>
            </div>
          )}
        </div>
      )}

      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <QuestionEditor 
              question={parsedQuestions[editingIndex]} 
              onSave={handleUpdateQuestion} 
              onCancel={() => setEditingIndex(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
