import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import { Home, List, Camera, Brain, BarChart3, Search, Plus, Tag } from 'lucide-react'
import { cn } from '../../lib/utils'
import { dbService } from '../../services/db'

export default function Index() {
  const [activeTab, setActiveTab] = useState('home')
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // 模拟加载数据
  const loadData = async () => {
    setLoading(true)
    const data = await dbService.getQuestions()
    setQuestions(data)
    setLoading(false)
    Taro.stopPullDownRefresh()
  }

  useEffect(() => {
    loadData()
  }, [])

  // 下拉刷新
  usePullDownRefresh(() => {
    loadData()
  })

  // 拍照扫题
  const handleScan = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })
      
      const tempFilePath = res.tempFilePaths[0]
      Taro.showLoading({ title: 'AI 识别中...' })
      
      // 这里调用 AI 解析逻辑 (示例)
      // const result = await analyzeQuestion(tempFilePath)
      
      Taro.hideLoading()
      Taro.showToast({ title: '识别成功', icon: 'success' })
    } catch (error) {
      console.error('扫题失败:', error)
    }
  }

  const tabs = [
    { id: 'home', icon: Home, label: '首页' },
    { id: 'list', icon: List, label: '错题库' },
    { id: 'scan', icon: Camera, label: '扫题', special: true },
    { id: 'stats', icon: BarChart3, label: '统计' },
  ]

  return (
    <View className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* 顶部搜索栏 */}
      <View className="bg-white px-4 py-3 sticky top-0 z-10 border-b border-slate-100">
        <View className="relative">
          <View className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="w-4 h-4 text-slate-400" />
          </View>
          <Input 
            className="w-full bg-slate-50 rounded-xl py-2 pl-10 pr-4 text-sm"
            placeholder="搜索错题..."
            value={search}
            onInput={(e) => setSearch(e.detail.value)}
          />
        </View>
      </View>

      {/* 主内容区域 */}
      <ScrollView scrollY className="flex-1 px-4 py-4">
        {activeTab === 'home' && (
          <View className="space-y-6">
            {/* 欢迎卡片 */}
            <View className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
              <View className="relative z-10">
                <Text className="text-2xl font-bold block">你好，同学！</Text>
                <Text className="text-indigo-100 text-sm mt-1 block">今天也要攻克薄弱环节哦</Text>
                <View className="mt-6 flex gap-4">
                  <View className="bg-white/20 rounded-2xl p-3 flex-1 text-center backdrop-blur-sm">
                    <Text className="text-lg font-bold block">{questions.length}</Text>
                    <Text className="text-[10px] opacity-80 block">待复习</Text>
                  </View>
                  <View className="bg-white/20 rounded-2xl p-3 flex-1 text-center backdrop-blur-sm">
                    <Text className="text-lg font-bold block">12</Text>
                    <Text className="text-[10px] opacity-80 block">已掌握</Text>
                  </View>
                </View>
              </View>
              <View className="absolute -right-4 -bottom-4 opacity-10">
                <Brain className="w-32 h-32" />
              </View>
            </View>

            {/* 最近错题列表 */}
            <View className="space-y-4">
              <View className="flex justify-between items-center">
                <Text className="text-lg font-bold text-slate-800">最近录入</Text>
                <Text className="text-xs text-indigo-600 font-bold">查看全部</Text>
              </View>
              
              {questions.slice(0, 3).map((q, i) => (
                <View key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex flex-col gap-2">
                  <View className="flex justify-between items-start">
                    <Text className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg">
                      {q.subject || '未分类'}
                    </Text>
                    <Text className="text-[10px] text-slate-400">2026-03-30</Text>
                  </View>
                  <Text className="text-sm text-slate-700 font-medium line-clamp-2">{q.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部导航栏 */}
      <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center py-2 px-4 safe-area-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          if (tab.special) {
            return (
              <View 
                key={tab.id}
                onClick={handleScan}
                className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 -mt-10 border-4 border-white"
              >
                <Icon className="w-6 h-6 text-white" />
              </View>
            )
          }

          return (
            <View 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all",
                isActive ? "text-indigo-600 bg-indigo-50" : "text-slate-400"
              )}
            >
              <Icon className="w-5 h-5" />
              <Text className="text-[10px] font-bold">{tab.label}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
