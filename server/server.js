const express = require('express')
const cors = require('cors')
const axios = require('axios')
const characters = require('./characters')

const app = express()

// 环境变量配置
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBcE2yvieTL-P1u2zjsuvGxf8k0m044NEE'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

// CORS配置 - 支持Vercel部署
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://vue-kuro.vercel.app', 'https://your-custom-domain.com']
    : 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

// 获取所有角色列表
app.get('/api/characters', (req, res) => {
  const characterList = Object.keys(characters).map(key => ({
    id: characters[key].id || key,
    name: characters[key].name,
    avatar: characters[key].avatar,
    description: getCharacterDescription(key)
  }))
  
  res.json(characterList)
})

// 获取角色描述
function getCharacterDescription(characterId) {
  const descriptions = {
    kuro: '冷静理性、话少毒舌、外冷内暖的独行猫系AI',
    luna: '温柔体贴、善解人意的治愈系AI'
  }
  return descriptions[characterId] || '神秘的AI伙伴'
}

// 获取角色详情
app.get('/api/characters/:characterId', (req, res) => {
  const { characterId } = req.params
  const character = characters[characterId]
  
  if (!character) {
    return res.status(404).json({
      error: '角色不存在'
    })
  }
  
  res.json({
    id: characterId,
    name: character.name,
    avatar: character.avatar,
    emotions: character.emotions,
    statusTexts: character.statusTexts,
    clickResponses: character.clickResponses
  })
})

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Node.js 后端服务器运行正常！',
    timestamp: new Date().toISOString()
  })
})

// 聊天路由
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory, characterId = 'kuro' } = req.body
    
    if (!message) {
      return res.status(400).json({
        error: '消息不能为空'
      })
    }

    // 获取角色配置
    const character = characters[characterId]
    if (!character) {
      return res.status(400).json({
        error: '角色不存在'
      })
    }

    // 构建对话历史
    const messages = [
      {
        role: 'user',
        parts: [{ text: character.personality }]
      },
      {
        role: 'model',
        parts: [{ text: `明白了，我会以${character.name}的身份与你对话。` }]
      }
    ]

    // 添加历史对话
    if (conversationHistory && conversationHistory.length > 0) {
      // 只保留最近的10条对话以避免token超限
      const recentHistory = conversationHistory.slice(-10)
      
      for (const msg of recentHistory) {
        if (msg.sender === 'user') {
          messages.push({
            role: 'user',
            parts: [{ text: msg.content }]
          })
        } else if (msg.sender === 'cat') {
          messages.push({
            role: 'model',
            parts: [{ text: msg.content }]
          })
        }
      }
    }

    // 添加当前用户消息
    messages.push({
      role: 'user',
      parts: [{ text: message }]
    })

    // 调用 Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: messages,
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const aiResponse = response.data.candidates[0].content.parts[0].text

    res.json({
      response: aiResponse,
      characterId: characterId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('聊天API错误:', error.response?.data || error.message)
    
    res.status(500).json({
      error: 'AI服务暂时不可用，请稍后再试',
      details: error.response?.data || error.message
    })
  }
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// 只在开发环境启动服务器
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`🚀 Node.js 服务器运行在端口 ${PORT}`)
    console.log(`📡 健康检查: http://localhost:${PORT}/health`)
    console.log(`🔗 测试接口: http://localhost:${PORT}/api/test`)
    console.log(`💬 聊天接口: http://localhost:${PORT}/api/chat`)
    console.log(`👥 角色接口: http://localhost:${PORT}/api/characters`)
  })
}

// 导出app实例供Vercel使用
module.exports = app 