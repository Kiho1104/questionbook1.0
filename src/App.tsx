/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, signIn } from './firebase';
import { Question, PracticeSession, UserStats } from './types';
import Layout from './components/Layout';
import HomeView from './components/HomeView';
import QuestionList from './components/QuestionList';
import QuestionScanner from './components/QuestionScanner';
import QuestionEditor from './components/QuestionEditor';
import PracticeMode from './components/PracticeMode';
import StatsView from './components/StatsView';
import { Loader2, Brain, Sparkles, LogIn, AlertCircle, Trophy, Star, X } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [reward, setReward] = useState<{ title: string; message: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAddingManually, setIsAddingManually] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    setLoginError(null);
    try {
      await signIn();
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.log('Login popup request was cancelled by a newer request.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setLoginError('登录窗口已关闭，请重试。');
      } else {
        setLoginError('登录失败，请稍后重试。');
        console.error("Login Error:", error);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Data Listeners
  useEffect(() => {
    if (!user) return;

    const qQuestions = query(
      collection(db, 'questions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeQuestions = onSnapshot(qQuestions, (snapshot) => {
      const qs: Question[] = [];
      snapshot.forEach((doc) => {
        qs.push({ id: doc.id, ...doc.data() } as Question);
      });
      setQuestions(qs);
    }, (error) => {
      console.error("Firestore Error (Questions):", error);
    });

    const qSessions = query(
      collection(db, 'practice_sessions'),
      where('userId', '==', user.uid),
      orderBy('startTime', 'desc')
    );

    const unsubscribeSessions = onSnapshot(qSessions, (snapshot) => {
      const ss: PracticeSession[] = [];
      snapshot.forEach((doc) => {
        ss.push({ id: doc.id, ...doc.data() } as PracticeSession);
      });
      setSessions(ss);
    }, (error) => {
      console.error("Firestore Error (Sessions):", error);
    });

    const unsubscribeStats = onSnapshot(doc(db, 'user_stats', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setUserStats({ id: snapshot.id, ...snapshot.data() } as any as UserStats);
      } else {
        const initialStats: Omit<UserStats, 'id'> = {
          userId: user.uid,
          lastCheckInDate: '',
          streak: 0,
          totalCorrect: 0,
          dailyReviewCount: 0,
          lastReviewDate: '',
          totalQuestions: 0,
        };
        setDoc(doc(db, 'user_stats', user.uid), initialStats);
      }
    }, (error) => {
      console.error("Firestore Error (Stats):", error);
    });

    return () => {
      unsubscribeQuestions();
      unsubscribeSessions();
      unsubscribeStats();
    };
  }, [user]);

  // Check-in Logic
  useEffect(() => {
    if (!user || !userStats) return;

    const today = new Date().toISOString().split('T')[0];
    if (userStats.lastCheckInDate !== today) {
      const lastDate = userStats.lastCheckInDate;
      let newStreak = 1;
      
      if (lastDate) {
        const last = new Date(lastDate);
        const current = new Date(today);
        const diff = Math.floor((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          newStreak = userStats.streak + 1;
        } else if (diff === 0) {
          return; // Already checked in today
        }
      }

      const updates: Partial<UserStats> = {
        lastCheckInDate: today,
        streak: newStreak,
        dailyReviewCount: 0,
      };

      updateDoc(doc(db, 'user_stats', user.uid), updates);

      if (newStreak > 1) {
        setReward({
          title: "连续打卡奖励！",
          message: `恭喜你已连续打卡 ${newStreak} 天！继续保持哦！`
        });
      } else {
        setReward({
          title: "今日打卡成功！",
          message: "新的一天，也要加油学习哦！"
        });
      }
    }
  }, [user, userStats]);

  // Sync total questions
  useEffect(() => {
    if (!user || !userStats) return;
    if (userStats.totalQuestions !== questions.length) {
      updateDoc(doc(db, 'user_stats', user.uid), { totalQuestions: questions.length });
    }
  }, [questions.length, user, userStats]);

  const handleAddQuestions = async (dataList: any[]) => {
    if (!user) return;
    try {
      for (const data of dataList) {
        const newQuestion = {
          userId: user.uid,
          text: data.text,
          type: data.type,
          options: data.options || [],
          answer: data.answer,
          explanation: data.explanation || '',
          tags: data.tags || [],
          priority: 3,
          stats: {
            correctCount: 0,
            totalCount: 0,
            avgTime: 0,
          },
          createdAt: Date.now(),
        };
        await addDoc(collection(db, 'questions'), newQuestion);
      }
      setIsScanning(false);
      setIsAddingManually(false);
      setActiveTab('list');
    } catch (error) {
      console.error("Error adding questions:", error);
    }
  };

  const handleManualAdd = async (data: Partial<Question>) => {
    await handleAddQuestions([data]);
  };

  const handleEditQuestion = async (data: Partial<Question>) => {
    if (!editingQuestion) return;
    try {
      await updateDoc(doc(db, 'questions', editingQuestion.id), data);
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error editing question:", error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'questions', id));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleFinishPractice = async (sessionData: any) => {
    if (!user || !userStats) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      let sessionCorrect = 0;

      // Save session
      await addDoc(collection(db, 'practice_sessions'), {
        ...sessionData,
        userId: user.uid,
      });

      // Update question stats
      for (const qResult of sessionData.questions) {
        if (qResult.isCorrect) sessionCorrect++;
        const question = questions.find(q => q.id === qResult.questionId);
        if (question) {
          const currentTotal = question.stats?.totalCount || 0;
          const currentCorrect = question.stats?.correctCount || 0;
          const currentAvgTime = question.stats?.avgTime || 0;

          const newTotal = currentTotal + 1;
          const newCorrect = currentCorrect + (qResult.isCorrect ? 1 : 0);
          const newAvgTime = (currentAvgTime * currentTotal + qResult.timeSpent) / newTotal;
          
          // Adjust priority based on performance
          let newPriority = question.priority || 3;
          if (qResult.isCorrect) {
            newPriority = Math.max(1, newPriority - 0.5);
          } else {
            newPriority = Math.min(5, newPriority + 1);
          }

          await updateDoc(doc(db, 'questions', qResult.questionId), {
            'stats.totalCount': newTotal,
            'stats.correctCount': newCorrect,
            'stats.avgTime': newAvgTime,
            'stats.lastPracticedAt': Date.now(),
            'priority': newPriority
          });
        }
      }

      // Update user stats
      const newTotalCorrect = userStats.totalCorrect + sessionCorrect;
      const newDailyReviewCount = userStats.dailyReviewCount + sessionData.questions.length;
      
      await updateDoc(doc(db, 'user_stats', user.uid), {
        totalCorrect: newTotalCorrect,
        dailyReviewCount: newDailyReviewCount,
        lastReviewDate: today
      });

      // Check for correct answer rewards
      if (sessionCorrect >= 5) {
        setReward({
          title: "超神表现！",
          message: `本次练习你答对了 ${sessionCorrect} 道题，太厉害了！`
        });
      }

      setIsPracticing(false);
      setActiveTab('stats');
    } catch (error) {
      console.error("Error finishing practice:", error);
    }
  };

  const startPractice = (qs: Question[], isCustom: boolean = false) => {
    if (isCustom) {
      setPracticeQuestions(qs);
    } else {
      // Randomize and limit to 10 questions or all if less for general practice
      const shuffled = [...qs].sort(() => Math.random() - 0.5).slice(0, 10);
      setPracticeQuestions(shuffled);
    }
    setIsPracticing(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">正在加载...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-24 -mb-24 blur-2xl" />
        
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-12 text-center">
          <div className="space-y-4">
            <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl flex items-center justify-center mx-auto transform rotate-12 hover:rotate-0 transition-transform duration-500">
              <Brain className="w-12 h-12 text-indigo-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight">错题本</h1>
              <p className="text-indigo-100 font-medium opacity-80">AI 智能扫题 · 错题高效整理</p>
            </div>
          </div>

          <div className="w-full space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-500/20 border border-white/20 rounded-xl text-xs font-bold text-rose-100 animate-in fade-in slide-in-from-top-2">
                {loginError}
              </div>
            )}
            <button 
              onClick={handleSignIn}
              disabled={loginLoading}
              className={cn(
                "w-full py-4 px-6 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95",
                loginLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loginLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loginLoading ? '正在连接...' : '使用 Google 账号登录'}
            </button>
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest opacity-60">
              登录即代表您同意我们的服务条款
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10 w-full">
            <div className="space-y-1">
              <Sparkles className="w-5 h-5 text-amber-300 mx-auto" />
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">AI 智能识别</p>
            </div>
            <div className="space-y-1">
              <Brain className="w-5 h-5 text-indigo-200 mx-auto" />
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">智能复习</p>
            </div>
            <div className="space-y-1">
              <AlertCircle className="w-5 h-5 text-rose-300 mx-auto" />
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">错题分析</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      activeTab={activeTab} 
      onTabChange={(tab) => {
        if (tab === 'scan') setIsScanning(true);
        else setActiveTab(tab);
      }}
    >
      {activeTab === 'home' && (
        <HomeView 
          questions={questions} 
          sessions={sessions} 
          userStats={userStats}
          onAction={(action) => {
            if (action === 'scan') setIsScanning(true);
            else if (action === 'practice') startPractice(questions);
            else setActiveTab(action);
          }} 
        />
      )}
      {activeTab === 'list' && (
        <QuestionList 
          questions={questions} 
          onDelete={handleDeleteQuestion}
          onEdit={(q) => setEditingQuestion(q)}
          onAdd={() => setIsScanning(true)}
          onAddManual={() => setIsAddingManually(true)}
          onPractice={startPractice}
        />
      )}
      {activeTab === 'stats' && (
        <StatsView 
          questions={questions} 
          sessions={sessions} 
          userStats={userStats}
        />
      )}

      {/* Modals */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <QuestionScanner 
              onSave={handleAddQuestions} 
              onCancel={() => setIsScanning(false)} 
            />
          </div>
        </div>
      )}

      {isAddingManually && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <QuestionEditor 
              question={{}} 
              onSave={handleManualAdd} 
              onCancel={() => setIsAddingManually(false)} 
            />
          </div>
        </div>
      )}

      {editingQuestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <QuestionEditor 
              question={editingQuestion} 
              onSave={handleEditQuestion} 
              onCancel={() => setEditingQuestion(null)} 
            />
          </div>
        </div>
      )}

      {isPracticing && (
        <PracticeMode 
          questions={practiceQuestions} 
          onFinish={handleFinishPractice} 
          onCancel={() => setIsPracticing(false)} 
        />
      )}

      {/* Reward Pop-up */}
      {reward && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center relative">
              <Trophy className="w-12 h-12 text-amber-500 animate-bounce" />
              <Star className="absolute top-0 right-0 w-6 h-6 text-amber-400 animate-pulse" />
              <Star className="absolute bottom-2 left-0 w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{reward.title}</h3>
              <p className="text-slate-500 font-medium">{reward.message}</p>
            </div>
            <button 
              onClick={() => setReward(null)}
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              太棒了！
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
