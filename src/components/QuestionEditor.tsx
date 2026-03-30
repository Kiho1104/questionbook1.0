import React, { useState } from 'react';
import { X, Save, Tag as TagIcon, Plus, Trash2 } from 'lucide-react';
import { Question, QuestionType } from '../types';
import { cn } from '../lib/utils';

interface QuestionEditorProps {
  question: Partial<Question>;
  onSave: (data: Partial<Question>) => void;
  onCancel: () => void;
}

export default function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
  const [text, setText] = useState(question.text || '');
  const [type, setType] = useState<QuestionType>(question.type || 'choice');
  const [options, setOptions] = useState<string[]>(question.options || []);
  const [answer, setAnswer] = useState(question.answer || '');
  const [explanation, setExplanation] = useState(question.explanation || '');
  const [subject, setSubject] = useState(question.subject || '未分类');
  const [tags, setTags] = useState<string[]>(question.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleAddOption = () => setOptions([...options, '']);
  const handleRemoveOption = (index: number) => setOptions(options.filter((_, i) => i !== index));
  const handleOptionChange = (index: number, val: string) => {
    const newOpts = [...options];
    newOpts[index] = val;
    setOptions(newOpts);
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleSave = () => {
    onSave({
      ...question,
      text,
      type,
      options: type === 'choice' ? options : [],
      answer,
      explanation,
      subject,
      tags,
    });
  };

  return (
    <div className="p-6 bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-h-[90vh] overflow-y-auto w-full max-w-md">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">编辑题目</h2>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Subject Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">学科</label>
          <div className="flex flex-wrap gap-2">
            {['语文', '数学', '英语', '物理', '化学', '生物', '地理', '历史', '政治'].map(s => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                  subject === s 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" 
                    : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                )}
              >
                {s}
              </button>
            ))}
            <div className="flex gap-2 w-full mt-1">
              <input 
                type="text"
                value={!['语文', '数学', '英语', '物理', '化学', '生物', '地理', '历史', '政治'].includes(subject) ? subject : ''}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:border-indigo-500 outline-none"
                placeholder="自定义学科..."
              />
            </div>
          </div>
        </div>

        {/* Type Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button 
            onClick={() => setType('choice')}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
              type === 'choice' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
            )}
          >
            选择题
          </button>
          <button 
            onClick={() => setType('blank')}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
              type === 'blank' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
            )}
          >
            填空题
          </button>
        </div>

        {/* Question Text */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">题目内容</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none h-32"
            placeholder="输入题目内容..."
          />
        </div>

        {/* Options (for Choice) */}
        {type === 'choice' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">选项</label>
              <button onClick={handleAddOption} className="text-indigo-600 text-[10px] font-bold flex items-center gap-1">
                <Plus className="w-3 h-3" /> 添加选项
              </button>
            </div>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-8 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <input 
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none"
                    placeholder={`选项 ${String.fromCharCode(65 + i)}`}
                  />
                  <button onClick={() => handleRemoveOption(i)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answer */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">正确答案</label>
          <input 
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-indigo-600 focus:border-indigo-500 outline-none"
            placeholder="输入正确答案..."
          />
        </div>

        {/* Explanation */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">解析</label>
          <textarea 
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:border-indigo-500 outline-none resize-none h-24"
            placeholder="输入题目解析..."
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">标签</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full flex items-center gap-1">
                {tag}
                <button onClick={() => handleRemoveTag(tag)}><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:border-indigo-500 outline-none"
              placeholder="添加标签..."
            />
            <button onClick={handleAddTag} className="p-2 bg-indigo-600 text-white rounded-xl">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-50">
        <button 
          onClick={onCancel}
          className="flex-1 py-3.5 px-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm"
        >
          取消
        </button>
        <button 
          onClick={handleSave}
          className="flex-[2] py-3.5 px-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all text-sm flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          保存修改
        </button>
      </div>
    </div>
  );
}
