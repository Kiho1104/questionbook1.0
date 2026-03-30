import Taro from '@tarojs/taro'

const db = Taro.cloud.database()
const _ = db.command

/**
 * 错题库数据库操作
 */
export const dbService = {
  /**
   * 获取所有错题
   */
  async getQuestions() {
    try {
      const res = await db.collection('questions')
        .orderBy('createdAt', 'desc')
        .get()
      return res.data
    } catch (error) {
      console.error('获取错题失败:', error)
      return []
    }
  },

  /**
   * 添加新错题
   */
  async addQuestion(question: any) {
    try {
      const res = await db.collection('questions').add({
        data: {
          ...question,
          createdAt: db.serverDate(), // 使用服务端时间
          stats: {
            totalCount: 0,
            correctCount: 0,
            lastPracticed: null
          }
        }
      })
      return res._id
    } catch (error) {
      console.error('添加错题失败:', error)
      throw error
    }
  },

  /**
   * 更新错题 (例如练习结果)
   */
  async updateQuestion(id: string, data: any) {
    try {
      await db.collection('questions').doc(id).update({
        data: {
          ...data,
          updatedAt: db.serverDate()
        }
      })
    } catch (error) {
      console.error('更新错题失败:', error)
      throw error
    }
  },

  /**
   * 删除错题
   */
  async deleteQuestion(id: string) {
    try {
      await db.collection('questions').doc(id).remove({})
    } catch (error) {
      console.error('删除错题失败:', error)
      throw error
    }
  }
}
