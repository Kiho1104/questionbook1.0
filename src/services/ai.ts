import Taro from '@tarojs/taro'

/**
 * 调用 DeepSeek API 进行题目解析
 * 建议在微信开发者工具中将域名 api.deepseek.com 添加到 request 合法域名列表中
 * 或者通过云函数中转调用
 */
export async function analyzeQuestion(imageBase64: string) {
  // 提示：DeepSeek 目前主要提供文本模型。
  // 如果是图片识别，通常需要先通过 OCR (如微信自带的 OCR) 提取文字，再传给 DeepSeek。
  
  // 1. 先调用微信云开发 OCR 提取文字 (示例)
  try {
    const ocrResult = await Taro.cloud.callFunction({
      name: 'ocr-extract', // 您需要创建这个云函数
      data: { image: imageBase64 }
    })
    const text = ocrResult.result.text;

    // 2. 将文字发送给 DeepSeek 进行解析
    const response = await Taro.request({
      url: 'https://api.deepseek.com/v1/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_DEEPSEEK_API_KEY' // 替换为您的 API Key
      },
      data: {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个专业的错题解析助手。请将输入的题目文本解析为 JSON 格式，包含：text (题目内容), type (choice/blank), options (如果是选择题), answer (正确答案), explanation (详细解析), subject (学科)。"
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: 'json_object' }
      }
    })

    return JSON.parse(response.data.choices[0].message.content)
  } catch (error) {
    console.error('AI 解析失败:', error)
    throw error
  }
}
