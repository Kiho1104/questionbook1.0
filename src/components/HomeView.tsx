import React from 'react';
import { Brain, Camera, List, TrendingUp, CheckCircle2, Clock, Zap, Target, Sparkles, ChevronRight, Trophy, Flame } from 'lucide-react';
import { Question, PracticeSession, UserStats } from '../types';
import { cn } from '../lib/utils';

interface HomeViewProps {
  questions: Question[];
  sessions: PracticeSession[];
  userStats: UserStats | null;
  onAction: (action: string) => void;
}

export default function HomeView({ questions, sessions, userStats, onAction }: HomeViewProps) {
  const totalQuestions = questions.length;
  const totalPractices = sessions.reduce((acc, s) => acc + s.questions.length, 0);
  const correctPractices = sessions.reduce((acc, s) => acc + s.questions.filter(q => q.isCorrect).length, 0);
  const avgAccuracy = totalPractices > 0 ? Math.round((correctPractices / totalPractices) * 100) : 0;

  const quickActions = [
    { id: 'scan', icon: Camera, label: '扫题入库', desc: '拍照自动识别题目', color: 'bg-indigo-600', text: 'text-white' },
    { id: 'practice', icon: Brain, label: '开始刷题', desc: '随机排序智能练习', color: 'bg-amber-500', text: 'text-white' },
    { id: 'list', icon: List, label: '查看题库', desc: '管理你的所有错题', color: 'bg-emerald-500', text: 'text-white' },
    { id: 'stats', icon: TrendingUp, label: '学习统计', desc: '查看你的进步曲线', color: 'bg-rose-500', text: 'text-white' },
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Section */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            你好，同学！
            <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400" />
          </h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">今天也要加油学习哦</p>
        </div>
        {userStats && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl shadow-sm animate-in slide-in-from-right-4">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <div className="text-left">
              <p className="text-xs font-black text-amber-600 leading-none">{userStats.streak} 天</p>
              <p className="text-[8px] font-bold text-amber-400 uppercase tracking-tighter mt-1">连续打卡</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary Card */}
      <div className="bg-indigo-600 rounded-[32px] p-6 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full -ml-12 -mb-12 blur-xl" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-md border border-white/10">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-widest">学习进度</span>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black">{totalQuestions}</p>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">已录入题目</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-lg font-black">{userStats?.dailyReviewCount || 0}</p>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">今日复习</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black">{avgAccuracy}%</p>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">平均正确率</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black">{questions.filter(q => q.priority >= 4).length}</p>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">重点关注</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          快捷功能
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onAction(action.id)}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all text-left flex flex-col gap-4 group active:scale-95"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", action.color, action.text)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">{action.label}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">{action.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            最近录入
          </h3>
          <button 
            onClick={() => onAction('list')}
            className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
          >
            查看全部
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {questions.slice(0, 3).map((q, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-indigo-100 transition-all">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">{q.text}</p>
                <div className="flex gap-1 mt-1">
                  {q.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">#{tag}</span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-200" />
            </div>
          ))}
          {questions.length === 0 && (
            <div className="py-12 text-center space-y-3 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Camera className="w-6 h-6 text-slate-200" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">还没有题目，快去扫题吧</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
