import React, { useState, useEffect, useRef } from 'react';
import { Brain, CheckCircle2, XCircle, Clock, ChevronRight, Sparkles, AlertCircle, Trophy, RotateCcw, X } from 'lucide-react';
import { Question } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface PracticeModeProps {
  questions: Question[];
  onFinish: (results: any) => void;
  onCancel: () => void;
}

export default function PracticeMode({ questions, onFinish, onCancel }: PracticeModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [results, setResults] = useState<any[]>([]);
  const [sessionStartTime] = useState(Date.now());

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const checkIsCorrect = (uAnswer: string, cAnswer: string) => {
    if (!uAnswer || !cAnswer) return false;
    const normalizedU = uAnswer.trim().toLowerCase();
    const normalizedC = cAnswer.trim().toLowerCase();
    
    // Direct match
    if (normalizedU === normalizedC) return true;
    
    // Label match for choice questions
    if (currentQuestion.type === 'choice' && currentQuestion.options) {
      const selectedIndex = currentQuestion.options.indexOf(uAnswer);
      if (selectedIndex !== -1) {
        const label = String.fromCharCode(65 + selectedIndex).toLowerCase();
        if (label === normalizedC) return true;
      }
      
      // Also check if the correct answer is one of the options and matches the label
      const correctIndex = currentQuestion.options.findIndex(opt => opt.trim().toLowerCase() === normalizedC);
      if (correctIndex !== -1) {
        const correctLabel = String.fromCharCode(65 + correctIndex).toLowerCase();
        if (normalizedU === correctLabel) return true;
      }
    }
    
    return false;
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setUserAnswer(answer);
    setIsAnswered(true);
    
    const timeSpent = (Date.now() - startTime) / 1000;
    const isCorrect = checkIsCorrect(answer, currentQuestion.answer);

    setResults(prev => [...prev, {
      questionId: currentQuestion.id,
      userAnswer: answer,
      isCorrect,
      timeSpent
    }]);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setIsAnswered(false);
      setStartTime(Date.now());
    } else {
      onFinish({
        startTime: sessionStartTime,
        endTime: Date.now(),
        questions: results
      });
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col max-w-md mx-auto shadow-2xl">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-bold text-slate-800">刷题模式</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-indigo-600 font-mono text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.round((Date.now() - sessionStartTime) / 1000)}s</span>
          </div>
          <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-100 w-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-indigo-600 transition-all duration-300"
        />
      </div>

      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Question Header */}
        <div className="flex justify-between items-center">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
            第 {currentIndex + 1} 题 / 共 {questions.length} 题
          </span>
          <div className="flex gap-1">
            {currentQuestion.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[160px] flex items-center justify-center text-center">
          <div className="text-lg font-bold text-slate-800 leading-relaxed prose prose-slate prose-sm max-w-none">
            <ReactMarkdown>{currentQuestion.text}</ReactMarkdown>
          </div>
        </div>

        {/* Answer Area */}
        <div className="flex-1 flex flex-col gap-4">
          {currentQuestion.type === 'choice' ? (
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options?.map((opt, i) => {
                const isSelected = userAnswer === opt;
                const isCorrect = checkIsCorrect(opt, currentQuestion.answer);
                const showCorrect = isAnswered && isCorrect;
                const showWrong = isAnswered && isSelected && !isCorrect;

                return (
                  <button
                    key={i}
                    disabled={isAnswered}
                    onClick={() => handleAnswer(opt)}
                    className={cn(
                      "p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between group",
                      !isAnswered && "border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30",
                      showCorrect && "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100",
                      showWrong && "border-rose-500 bg-rose-50 text-rose-700 shadow-sm shadow-rose-100",
                      isAnswered && !isSelected && !isCorrect && "border-slate-50 bg-slate-50 text-slate-400 opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-colors",
                        !isAnswered && "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600",
                        showCorrect && "bg-emerald-500 text-white",
                        showWrong && "bg-rose-500 text-white",
                        isAnswered && !isSelected && !isCorrect && "bg-slate-200 text-slate-400"
                      )}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm font-bold">{opt}</span>
                    </div>
                    {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {showWrong && <XCircle className="w-5 h-5 text-rose-500" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={isAnswered}
                  placeholder="请输入答案..."
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 bg-white text-lg font-bold transition-all outline-none",
                    !isAnswered && "border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10",
                    isAnswered && checkIsCorrect(userAnswer, currentQuestion.answer) 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                      : isAnswered ? "border-rose-500 bg-rose-50 text-rose-700" : ""
                  )}
                  onKeyDown={(e) => e.key === 'Enter' && userAnswer && handleAnswer(userAnswer)}
                />
                {!isAnswered && (
                  <button 
                    onClick={() => userAnswer && handleAnswer(userAnswer)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Feedback & Explanation */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Status Banner */}
              <div className={cn(
                "p-4 rounded-2xl flex items-center gap-3 border",
                checkIsCorrect(userAnswer, currentQuestion.answer)
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                  : "bg-rose-50 border-rose-100 text-rose-700"
              )}>
                {checkIsCorrect(userAnswer, currentQuestion.answer) ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    <div>
                      <p className="text-sm font-black">回答正确！</p>
                      <p className="text-[10px] opacity-80 font-bold uppercase tracking-wider">Excellent work</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6" />
                    <div>
                      <p className="text-sm font-black">回答错误</p>
                      <p className="text-[10px] opacity-80 font-bold uppercase tracking-wider">Keep practicing</p>
                    </div>
                  </>
                )}
              </div>

              {/* Correct Answer (for fill-in-the-blank or if wrong) */}
              {(currentQuestion.type === 'blank' || !checkIsCorrect(userAnswer, currentQuestion.answer)) && (
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">正确答案</span>
                  </div>
                  <p className="text-lg font-black text-indigo-600">{currentQuestion.answer}</p>
                </div>
              )}

              {/* Explanation */}
              {currentQuestion.explanation && (
                <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">题目解析</span>
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed font-medium prose prose-indigo prose-sm max-w-none">
                    <ReactMarkdown>{currentQuestion.explanation}</ReactMarkdown>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white p-4 border-t border-slate-100">
        {isAnswered ? (
          <button 
            onClick={nextQuestion}
            className="w-full py-4 px-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            {currentIndex === questions.length - 1 ? '查看结果' : '下一题'}
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <p className="text-center text-xs text-slate-400 font-medium">
            思考时间越短，掌握程度越高哦
          </p>
        )}
      </footer>
    </div>
  );
}
