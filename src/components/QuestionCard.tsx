import React from 'react';
import { Tag, Clock, CheckCircle2, XCircle, ChevronRight, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { Question } from '../types';
import { cn } from '../lib/utils';

interface QuestionCardProps {
  question: Question;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (question: Question) => void;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export default function QuestionCard({ question, onClick, onDelete, onEdit, selected, onSelect }: QuestionCardProps) {
  const accuracy = question.stats.totalCount > 0 
    ? Math.round((question.stats.correctCount / question.stats.totalCount) * 100) 
    : 0;

  const getProficiencyStars = () => {
    const { totalCount, correctCount } = question.stats;
    // 没练过默认1颗星
    if (totalCount === 0) return '★☆☆';
    // 练过但全错0颗星
    if (correctCount === 0) return '☆☆☆';
    // 多次练习全对3颗星
    if (totalCount >= 2 && correctCount === totalCount) return '★★★';
    // 正确率80%以上2颗星
    if (accuracy >= 80) return '★★☆';
    // 其余情况（练过且有对有错，或正确率低于80%）1颗星
    return '★☆☆';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden"
    >
      {/* Priority Indicator */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full",
        question.priority >= 4 ? "bg-rose-500" : 
        question.priority >= 3 ? "bg-amber-500" : "bg-emerald-500"
      )} />

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 flex-1">
          {onSelect && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(question.id, !selected);
              }}
              className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                selected 
                  ? "bg-indigo-600 border-indigo-600 text-white" 
                  : "border-slate-200 bg-white hover:border-indigo-300"
              )}
            >
              {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100">
              熟练度: {getProficiencyStars()}
            </span>
            <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full shadow-sm">
              {question.subject || '未分类'}
            </span>
            {question.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-full flex items-center gap-1"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(question); }}
              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(question.id); }}
              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-slate-800 text-sm font-medium line-clamp-3 leading-relaxed">
          {question.text}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium">{question.stats.correctCount}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-xs font-medium">{question.stats.totalCount - question.stats.correctCount}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{question.stats.avgTime.toFixed(1)}s</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                accuracy >= 80 ? "bg-emerald-500" : 
                accuracy >= 50 ? "bg-amber-500" : "bg-rose-500"
              )}
              style={{ width: `${accuracy}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-500">{accuracy}%</span>
        </div>
      </div>
    </div>
  );
}
