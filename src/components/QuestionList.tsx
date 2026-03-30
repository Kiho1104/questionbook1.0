import React, { useState, useMemo } from 'react';
import { Search, Filter, Tag, Plus, Brain, AlertCircle, Trash2, Edit2, ChevronRight, Download, CheckSquare, Square, Camera } from 'lucide-react';
import { Question } from '../types';
import QuestionCard from './QuestionCard';
import { cn } from '../lib/utils';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from 'docx';
import { saveAs } from 'file-saver';

interface QuestionListProps {
  questions: Question[];
  onDelete: (id: string) => void;
  onEdit: (question: Question) => void;
  onAdd: () => void;
  onAddManual: () => void;
  onPractice: (questions: Question[], isCustom?: boolean) => void;
}

export default function QuestionList({ questions, onDelete, onEdit, onAdd, onAddManual, onPractice }: QuestionListProps) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'time' | 'proficiency'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const toggleSelect = (id: string, selected: boolean) => {
    const next = new Set(selectedIds);
    if (selected) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const exportToWord = async () => {
    const selectedQuestions = questions.filter(q => selectedIds.has(q.id));
    if (selectedQuestions.length === 0) return;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "错题集 - 题目部分",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            ...selectedQuestions.flatMap((q, i) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${i + 1}. [${q.subject}] `,
                    bold: true,
                  }),
                  new TextRun({
                    text: q.text,
                  }),
                ],
                spacing: { before: 200, after: 100 },
              }),
              ...(q.type === 'choice' && q.options ? q.options.map((opt, j) => {
                const cleanOpt = opt.replace(/^[A-Z]\.\s*/i, '');
                return new Paragraph({
                  text: `${String.fromCharCode(65 + j)}. ${cleanOpt}`,
                  indent: { left: 720 },
                  spacing: { after: 50 },
                });
              }) : []),
            ]),
            new Paragraph({ children: [new PageBreak()] }),
            new Paragraph({
              text: "错题集 - 答案与解析",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 400 },
            }),
            ...selectedQuestions.flatMap((q, i) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${i + 1}. 正确答案: `,
                    bold: true,
                  }),
                  new TextRun({
                    text: q.answer,
                    color: "4F46E5",
                    bold: true,
                  }),
                ],
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "解析: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: q.explanation || "无解析",
                  }),
                ],
                spacing: { after: 200 },
              }),
            ]),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `错题集_${new Date().toLocaleDateString()}.docx`);
  };

  const handlePracticeSelected = () => {
    const selectedQuestions = questions.filter(q => selectedIds.has(q.id));
    if (selectedQuestions.length > 0) {
      onPractice(selectedQuestions, true);
    }
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    questions.forEach(q => q.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [questions]);

  const allSubjects = useMemo(() => {
    const subjects = new Set<string>();
    questions.forEach(q => {
      if (q.subject) subjects.add(q.subject);
    });
    return Array.from(subjects);
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const filtered = questions.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase()) || 
                           q.answer.toLowerCase().includes(search.toLowerCase());
      const matchesTag = !selectedTag || q.tags.includes(selectedTag);
      const matchesSubject = !selectedSubject || q.subject === selectedSubject;
      return matchesSearch && matchesTag && matchesSubject;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'time') {
        comparison = a.createdAt - b.createdAt;
      } else if (sortBy === 'proficiency') {
        const getProfValue = (q: Question) => {
          const { totalCount, correctCount } = q.stats;
          if (totalCount === 0) return 1;
          if (correctCount === 0) return 0;
          if (totalCount >= 2 && correctCount === totalCount) return 3;
          const accuracy = correctCount / totalCount;
          if (accuracy >= 0.8) return 2;
          return 1;
        };
        comparison = getProfValue(a) - getProfValue(b);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [questions, search, selectedTag, selectedSubject, sortBy, sortOrder]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Brain className="w-6 h-6 text-indigo-600" />
          错题库
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={onAddManual}
            className="px-4 py-2 bg-white text-indigo-600 border border-indigo-100 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-indigo-50 transition-all active:scale-95 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            手动录入
          </button>
          <button 
            onClick={onAdd}
            className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            title="扫题入库"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索题目、答案..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          {/* Subject Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button 
              onClick={() => setSelectedSubject(null)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                !selectedSubject 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" 
                  : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
              )}
            >
              全学科
            </button>
            {allSubjects.map(subject => (
              <button 
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5",
                  selectedSubject === subject 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" 
                    : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                )}
              >
                {subject}
              </button>
            ))}
          </div>

          {/* Tag Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setSelectedTag(null)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                !selectedTag 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" 
                  : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
              )}
            >
              全部标签
            </button>
            {allTags.map(tag => (
              <button 
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5",
                  selectedTag === tag 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" 
                    : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                )}
              >
                <Tag className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-slate-100 rounded-xl flex-1">
              <button 
                onClick={() => setSortBy('time')}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  sortBy === 'time' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                )}
              >
                按时间
              </button>
              <button 
                onClick={() => setSortBy('proficiency')}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  sortBy === 'proficiency' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                )}
              >
                按熟练度
              </button>
            </div>
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              {sortOrder === 'asc' ? '正序 ↑' : '倒序 ↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Practice & Export CTA */}
      {filteredQuestions.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <button 
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {selectedIds.size === filteredQuestions.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              {selectedIds.size === filteredQuestions.length ? '取消全选' : '全选当前'}
            </button>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              已选中 {selectedIds.size} 题
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => onPractice(filteredQuestions)}
              className="py-3 px-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-all flex flex-col items-center justify-center gap-1 border border-indigo-100 shadow-sm shadow-indigo-50"
            >
              <Brain className="w-4 h-4" />
              练习全部
            </button>
            <button 
              disabled={selectedIds.size === 0}
              onClick={handlePracticeSelected}
              className={cn(
                "py-3 px-2 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 border shadow-sm",
                selectedIds.size > 0 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-100 hover:bg-indigo-700" 
                  : "bg-slate-50 text-slate-400 border-slate-100 opacity-50 cursor-not-allowed"
              )}
            >
              <CheckSquare className="w-4 h-4" />
              练习选中
            </button>
            <button 
              disabled={selectedIds.size === 0}
              onClick={exportToWord}
              className={cn(
                "py-3 px-2 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 border shadow-sm",
                selectedIds.size > 0 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50 hover:bg-emerald-100" 
                  : "bg-slate-50 text-slate-400 border-slate-100 opacity-50 cursor-not-allowed"
              )}
            >
              <Download className="w-4 h-4" />
              导出 Word
            </button>
          </div>
        </div>
      )}

      {/* Question Grid */}
      <div className="space-y-4">
        {filteredQuestions.map(q => (
          <QuestionCard 
            key={q.id} 
            question={q} 
            onDelete={onDelete}
            onEdit={onEdit}
            onClick={() => onEdit(q)}
            selected={selectedIds.has(q.id)}
            onSelect={toggleSelect}
          />
        ))}

        {filteredQuestions.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-slate-200" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-400">没有找到相关题目</p>
              <p className="text-xs text-slate-300">尝试更换搜索词或标签</p>
            </div>
            <button 
              onClick={onAdd}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all text-sm"
            >
              去添加新题目
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
