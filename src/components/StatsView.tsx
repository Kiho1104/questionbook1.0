import React from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Clock, Target, Calendar, Brain, Flame, Trophy } from 'lucide-react';
import { Question, PracticeSession, UserStats } from '../types';
import { cn } from '../lib/utils';

interface StatsViewProps {
  questions: Question[];
  sessions: PracticeSession[];
  userStats: UserStats | null;
}

export default function StatsView({ questions, sessions, userStats }: StatsViewProps) {
  const totalQuestions = questions.length;
  const totalPractices = sessions.reduce((acc, s) => acc + s.questions.length, 0);
  const correctPractices = sessions.reduce((acc, s) => acc + s.questions.filter(q => q.isCorrect).length, 0);
  const avgAccuracy = totalPractices > 0 ? Math.round((correctPractices / totalPractices) * 100) : 0;
  
  const totalTime = sessions.reduce((acc, s) => acc + s.questions.reduce((qAcc, q) => qAcc + q.timeSpent, 0), 0);
  const avgTimePerQuestion = totalPractices > 0 ? (totalTime / totalPractices).toFixed(1) : '0';

  const stats = [
    { label: '总题目数', value: totalQuestions, icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: '累计正确', value: userStats?.totalCorrect || 0, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '连续打卡', value: `${userStats?.streak || 0}天`, icon: Flame, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: '平均正确率', value: `${avgAccuracy}%`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          学习统计
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-100 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">最近 7 天</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", stat.bg)}>
                <Icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Chart Placeholder */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            最近练习趋势
          </h3>
        </div>
        <div className="h-40 flex items-end justify-between gap-2 px-2">
          {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-indigo-100 rounded-t-lg relative group"
                style={{ height: `${height}%` }}
              >
                <div className="absolute inset-x-0 bottom-0 bg-indigo-500 rounded-t-lg transition-all duration-500 h-0 group-hover:h-full opacity-20" />
                <div 
                  className="absolute inset-x-0 bottom-0 bg-indigo-600 rounded-t-lg transition-all duration-1000"
                  style={{ height: `${height * 0.7}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          最近练习记录
        </h3>
        <div className="space-y-3">
          {sessions.slice(0, 5).map((session, i) => {
            const correctCount = session.questions.filter(q => q.isCorrect).length;
            const accuracy = Math.round((correctCount / session.questions.length) * 100);
            return (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">练习会话 #{session.id.slice(-4)}</p>
                    <p className="text-[10px] font-medium text-slate-400">
                      {new Date(session.startTime).toLocaleDateString()} · {session.questions.length} 题
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-black",
                    accuracy >= 80 ? "text-emerald-600" : 
                    accuracy >= 50 ? "text-amber-600" : "text-rose-600"
                  )}>
                    {accuracy}%
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">正确率</p>
                </div>
              </div>
            );
          })}
          {sessions.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-sm font-bold text-slate-400">暂无练习记录，快去刷题吧！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
