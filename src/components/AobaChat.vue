<template>
  <div class="aoba-chat">
    <!-- 动态背景 -->
    <div class="bg-animation">
      <div class="bg-particles"></div>
      <div class="bg-gradient"></div>
    </div>
    
    <!-- 返回首页按钮 -->
    <button @click="$emit('back')" class="back-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5"/>
        <path d="M12 19l-7-7 7-7"/>
      </svg>
      返回首页
    </button>
    
    <!-- 可拖拽小头像 -->
    <div 
      class="floating-avatar" 
      :class="{ 
        show: showFloatingAvatar,
        dragging: isDragging 
      }"
      :style="{ 
        top: floatingAvatarPosition.y + 'px', 
        left: floatingAvatarPosition.x + 'px' 
      }"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @click="handleFloatingAvatarClick"
      ref="floatingAvatar"
    >
      <div class="floating-avatar-container">
        <img 
          :src="emotionImage" 
          alt="Aoba" 
          class="floating-avatar-img"
          style="cursor: grab;"
          title="拖拽移动我，点击和我互动"
        >
        <div class="floating-avatar-glow"></div>
        <div class="floating-avatar-pulse"></div>
      </div>
      
      <!-- 浮动小聊天泡泡 -->
      <div 
        v-if="showFloatingChatBubble && floatingChatMessage"
        class="floating-chat-bubble"
        :class="{ show: showFloatingChatBubble }"
      >
        <div class="floating-chat-content">
          {{ floatingChatMessage }}
        </div>
        <div class="floating-chat-tail"></div>
      </div>
    </div>


    
    <!-- 主容器 -->
    <div class="main-container">
      <!-- 头部区域 -->
      <div class="aoba-header">
        <div class="avatar-section">
          <div class="avatar-container">
            <div class="avatar-ring"></div>
            <img 
              :src="emotionImage" 
              alt="Aoba" 
              class="aoba-avatar" 
              :class="{ 'emotion-changing': isChanging }"
              @click="handleAvatarClick"
              style="cursor: pointer;"
              title="点击我试试看~"
            >
            <div class="avatar-glow"></div>
            <div class="avatar-sparkles">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="aoba-info">
            <h2 class="aoba-name">Aoba</h2>
            
            <!-- 时间显示 -->
            <div class="time-display">
              <div class="current-time">{{ currentTime }}</div>
              <div class="time-period">{{ timePeriodName }}</div>
              <div class="current-date">{{ currentDate }}</div>
            </div>
            
            <div class="aoba-status-container">
              <div class="status-indicator"></div>
              <p class="aoba-status">{{ aobaStatus }}</p>
              <p class="chat-count" v-if="messages.length > 0">共 {{ messages.length }} 条消息</p>
            </div>
            
            <!-- 清除聊天记录按钮 -->
            <button @click="clearMessages" class="clear-chat-btn" title="清除聊天记录">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 聊天区域 -->
      <div class="chat-section">
        <div class="chat-messages" ref="messagesContainer">
          <div v-for="message in messages" :key="message.id" :class="['message', message.sender]">
            <div class="message-bubble">
              <div class="message-content">{{ message.content }}</div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="isLoading" class="loading">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p class="loading-text">Aoba正在思考...</p>
          </div>
        </div>
        
        <!-- 输入区域 -->
        <div class="chat-input-section">
          <div class="input-container">
            <input 
              v-model="inputMessage" 
              @keyup.enter="sendMessage"
              placeholder="想对Aoba说些什么..."
              :disabled="isLoading"
              class="chat-input"
            >
            <button 
              @click="sendMessage" 
              :disabled="isLoading || !inputMessage.trim()"
              class="send-btn"
              :class="{ 'btn-active': inputMessage.trim() }"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { timeSystem } from '../utils/timeSystem.js'

export default {
  name: 'AobaChat',
  emits: ['back'],
  setup() {
    const messages = ref([])
    const inputMessage = ref('')
    const isLoading = ref(false)
    const currentEmotion = ref('normal')
    const aobaStatus = ref('温柔地陪伴着你...')
    const isChanging = ref(false)
    const messagesContainer = ref(null)
    
    // 浮动头像相关状态
    const showFloatingAvatar = ref(false)
  
    const floatingAvatar = ref(null)
    const isDragging = ref(false)
    const floatingAvatarPosition = ref({ x: 30, y: 30 })
    const showFloatingChatBubble = ref(false)
    const floatingChatMessage = ref('')
    
    // 拖拽相关状态
    const dragOffset = ref({ x: 0, y: 0 })
    const dragMessageShown = ref(false)
    const dragStartPosition = ref({ x: 0, y: 0 })
    
    // Aoba 专用配置
    const emotionImages = ref({
      'normal': '/img/Aoba(normal).png',
      'happy': '/img/Aoba(Happy).png',
      'angry': '/img/Aoba(Angry).png',
      'sad': '/img/Aoba(Sad).png',
      'surprise': '/img/Aoba(Surprise).png'
    })
    
    const emotionImage = ref(emotionImages.value.normal)
    
    // 时间相关的响应式变量
    const currentTime = ref(timeSystem.formatTime())
    const currentDate = ref(timeSystem.formatDate())
    const timePeriod = ref(timeSystem.getTimePeriod())
    const timePeriodName = ref(timeSystem.getTimePeriodName())
    
    // API基础URL配置
    const API_BASE_URL = import.meta.env.PROD 
      ? window.location.origin 
      : 'http://localhost:3002'
    
    // 更新表情图片
    const updateEmotionImage = () => {
      emotionImage.value = emotionImages.value[currentEmotion.value] || emotionImages.value.normal
    }
    
    // 情感分析
    const analyzeEmotion = (text) => {
      const happyWords = ['开心', '哈哈', '好', '棒', '喜欢', '不错', '有趣', '好玩', '可爱', '聪明', '厉害', '优秀', '完美', '赞']
      const angryWords = ['哼', '无语', '讨厌', '生气', '烦', '无聊', '幼稚', '愚蠢', '笨蛋', '炸毛']
      const sadWords = ['唉', '难过', '伤心', '哭', '悲伤', '痛苦', '绝望', '失望', '沮丧', '郁闷']
      const surpriseWords = ['哇', '什么', '真的吗', '真的假的', '不会吧', '不可能', '难以置信', '太意外了', '太惊讶了']
      
      for (let word of happyWords) {
        if (text.includes(word)) return 'happy'
      }
      for (let word of angryWords) {
        if (text.includes(word)) return 'angry'
      }
      for (let word of sadWords) {
        if (text.includes(word)) return 'sad'
      }
      for (let word of surpriseWords) {
        if (text.includes(word)) return 'surprise'
      }
      
      return 'normal'
    }
    
    // 切换表情
    const changeEmotion = (emotion) => {
      if (emotion && emotion !== currentEmotion.value) {
        isChanging.value = true
        currentEmotion.value = emotion
        updateEmotionImage()
        
        setTimeout(() => {
          isChanging.value = false
        }, 500)
      }
    }
    
    // 更新Aoba状态
    const updateAobaStatus = () => {
      const statusTexts = {
        normal: [
          '温柔地陪伴着你...',
          '静静地倾听你的心声...',
          '为你带来温暖...',
          '守护着你的心情...',
          '轻轻为你加油...',
          '温柔地关心着你...',
          '为你送上祝福...',
          '静静地守护着你...'
        ],
        happy: [
          '开心地为你欢呼...',
          '温柔地为你开心...',
          '为你感到喜悦...',
          '轻轻为你鼓掌...',
          '温柔地祝福你...'
        ],
        angry: [
          '为你感到不平...',
          '温柔地安慰你...',
          '轻轻为你打气...',
          '为你感到心疼...',
          '温柔地支持你...'
        ],
        sad: [
          '温柔地安慰你...',
          '轻轻为你擦泪...',
          '为你感到心疼...',
          '温柔地拥抱你...',
          '静静地陪着你...'
        ],
        surprise: [
          '惊讶地为你开心...',
          '温柔地为你惊讶...',
          '为你感到惊喜...',
          '轻轻为你欢呼...',
          '温柔地祝福你...'
        ]
      }
      
      const statusList = statusTexts[currentEmotion.value] || statusTexts.normal
      const randomStatus = statusList[Math.floor(Math.random() * statusList.length)]
      aobaStatus.value = randomStatus
    }
    
    // 获取时间问候语
    const getTimeGreeting = () => {
              return timeSystem.getSpecialTimeGreeting('aoba') || timeSystem.getTimeGreeting('aoba')
    }
    
    // 自动滚动到底部（已移除，因为不再有滚动条）
    const scrollToBottom = () => {
      // 由于移除了滚动条，此功能不再需要
      // 页面会自动根据内容长度扩展
    }
    
    // 滚动检测
    const handleScroll = () => {
      const scrollY = window.scrollY
      const isMobile = window.innerWidth <= 480
      
      // 在手机模式下，滚动超过50px才显示浮动头像
      if (isMobile) {
        showFloatingAvatar.value = scrollY > 50
      } else {
        // 桌面模式下，滚动超过200px才显示
        showFloatingAvatar.value = scrollY > 200
      }
    }
    
    // 检查浮动头像可见性
    const checkFloatingAvatarVisibility = () => {
      const isMobile = window.innerWidth <= 480
      const hasMessages = messages.value.length > 0
      
      // 如果有消息，根据滚动位置决定是否显示浮动头像
      if (hasMessages) {
        const scrollY = window.scrollY
        if (isMobile) {
          showFloatingAvatar.value = scrollY > 50
        } else {
          showFloatingAvatar.value = scrollY > 200
        }
      } else {
        showFloatingAvatar.value = false
      }
    }
    
    // 回到顶部（已移除，因为不再有滚动条）
    const scrollToTop = () => {
      // 由于移除了滚动条，此功能不再需要
    }
    
    // 拖拽功能
    const startDrag = (event) => {
      event.preventDefault()
      isDragging.value = true
      dragMessageShown.value = false
      
      // 记录拖拽起始位置
      const clientX = event.clientX || (event.touches && event.touches[0].clientX)
      const clientY = event.clientY || (event.touches && event.touches[0].clientY)
      dragStartPosition.value = { x: clientX, y: clientY }
      
      const rect = floatingAvatar.value.getBoundingClientRect()
      
      dragOffset.value = {
        x: clientX - rect.left,
        y: clientY - rect.top
      }
      
      // 添加拖拽时的样式
      if (floatingAvatar.value) {
        floatingAvatar.value.style.cursor = 'grabbing'
      }
      
      // 显示拖拽对话（只在开始拖拽时显示一次）
      if (!dragMessageShown.value) {
        // 延迟显示拖拽消息，确保是真正的拖拽
        setTimeout(() => {
          if (isDragging.value) {
            const dragMessages = [
              '温柔地请求你轻点...',
              '哎呀，轻点好吗？',
              '我要生气了哦...',
              '别拽我啦~',
              '我要掉下去了！',
              '快放开我~',
              '好疼啊...',
              '我要咬你了！'
            ]
            const randomMessage = dragMessages[Math.floor(Math.random() * dragMessages.length)]
            
            // 显示浮动聊天泡泡
            floatingChatMessage.value = randomMessage
            showFloatingChatBubble.value = true
            dragMessageShown.value = true
            
            // 3秒后隐藏聊天泡泡
            setTimeout(() => {
              showFloatingChatBubble.value = false
            }, 5000)
          }
        }, 100) // 延迟100ms，确保是真正的拖拽
      }
      
      // 添加事件监听器
      document.addEventListener('mousemove', onDrag)
      document.addEventListener('touchmove', onDrag, { passive: false })
      document.addEventListener('mouseup', stopDrag)
      document.addEventListener('touchend', stopDrag)
    }
    
    // 拖拽中
    const onDrag = (event) => {
      if (!isDragging.value) return
      
      event.preventDefault()
      const clientX = event.clientX || (event.touches && event.touches[0].clientX)
      const clientY = event.clientY || (event.touches && event.touches[0].clientY)
      
      const newX = clientX - dragOffset.value.x
      const newY = clientY - dragOffset.value.y
      
      // 限制在屏幕范围内
      const maxX = window.innerWidth - 80
      const maxY = window.innerHeight - 80
      
      floatingAvatarPosition.value = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      }
    }
    
    // 停止拖拽
    const stopDrag = (event) => {
      // 计算拖拽距离
      const currentPosition = {
        x: event.clientX || (event.touches && event.touches[0].clientX),
        y: event.clientY || (event.touches && event.touches[0].clientY)
      }
      
      const dragDistance = Math.sqrt(
        Math.pow(currentPosition.x - dragStartPosition.value.x, 2) +
        Math.pow(currentPosition.y - dragStartPosition.value.y, 2)
      )
      
      // 如果拖拽距离大于10px，则认为是拖拽而不是点击
      const isActuallyDragging = dragDistance > 10
      
      isDragging.value = false
      dragMessageShown.value = false // 重置防抖状态
      
      // 恢复样式
      if (floatingAvatar.value) {
        floatingAvatar.value.style.cursor = 'grab'
      }
      
      // 保存位置到本地存储
      localStorage.setItem('aoba-floating-avatar-position', JSON.stringify(floatingAvatarPosition.value))
      
      // 只有在真正拖拽时才显示拖拽结束消息
      if (isActuallyDragging) {
        setTimeout(() => {
          const endDragMessages = [
            '终于得救了！',
            '呼...累死我了',
            '下次轻点好吗？',
            '谢谢放过我！',
            '我要休息一下...',
            '好险啊！'
          ]
          const randomEndMessage = endDragMessages[Math.floor(Math.random() * endDragMessages.length)]
          
          // 显示浮动聊天泡泡
          floatingChatMessage.value = randomEndMessage
          showFloatingChatBubble.value = true
          
          // 3秒后隐藏聊天泡泡
          setTimeout(() => {
            showFloatingChatBubble.value = false
          }, 3000)
        }, 500) // 延迟500ms显示
      }
      
      // 移除事件监听器
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('touchmove', onDrag)
      document.removeEventListener('mouseup', stopDrag)
      document.removeEventListener('touchend', stopDrag)
    }
    
    // 浮动头像点击事件（只有在非拖拽状态下才触发）
    const handleFloatingAvatarClick = (event) => {
      if (isDragging.value) return
      
      // 计算拖拽距离
      const currentPosition = {
        x: event.clientX || (event.touches && event.touches[0].clientX),
        y: event.clientY || (event.touches && event.touches[0].clientY)
      }
      
      const dragDistance = Math.sqrt(
        Math.pow(currentPosition.x - dragStartPosition.value.x, 2) +
        Math.pow(currentPosition.y - dragStartPosition.value.y, 2)
      )
      
      // 如果拖拽距离大于10px，则认为是拖拽而不是点击
      if (dragDistance > 10) return
      
      // console.log('Aoba浮动头像被点击了！') // 调试信息
      
      // 由于移除了滚动条，不再需要回到顶部功能
      
      // 显示浮动聊天泡泡
      const responses = [
        '点击我啦~',
        '我在你身边哦~',
        '有什么想和我说的吗？',
        '我在这里陪着你~',
        '轻轻点我一下~'
      ]
      
      floatingChatMessage.value = responses[Math.floor(Math.random() * responses.length)]
      showFloatingChatBubble.value = true
      
      setTimeout(() => {
        showFloatingChatBubble.value = false
      }, 2000)
    }
    
    // 重置浮动头像位置
    const resetFloatingAvatarPosition = () => {
      floatingAvatarPosition.value = { x: 30, y: 30 }
      localStorage.removeItem('aoba-floating-avatar-position')
    }
    
    // 加载保存的浮动头像位置
    const loadFloatingAvatarPosition = () => {
      try {
        const savedPosition = localStorage.getItem('aoba-floating-avatar-position')
        if (savedPosition) {
          floatingAvatarPosition.value = JSON.parse(savedPosition)
        }
      } catch (error) {
        console.error('加载Aoba浮动头像位置失败:', error)
      }
    }
    
    // 发送消息
    const sendMessage = async () => {
      if (!inputMessage.value.trim() || isLoading.value) return
      
      const messageText = inputMessage.value.trim()
      
      // 添加用户消息
      const userMessage = {
        id: Date.now(),
        content: messageText,
        sender: 'user',
        time: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      messages.value.push(userMessage)
      
      // 清空输入框
      inputMessage.value = ''
      
      isLoading.value = true
      
      try {
        // 调用后端 API，明确指定 Aoba 角色
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            conversationHistory: messages.value.slice(-20).map(msg => ({
              sender: msg.sender,
              content: msg.content
            })),
            characterId: 'aoba' // 明确指定 Aoba 的角色ID
          })
        })
        
        if (!response.ok) {
          throw new Error('API 请求失败')
        }
        
        const data = await response.json()
        const aiResponse = data.response
        
        // 添加AI回复
        const aiMessage = {
          id: Date.now() + 1,
          content: aiResponse,
          sender: 'cat',
          time: new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
        messages.value.push(aiMessage)
        
        // 分析情感并切换表情
        const emotion = analyzeEmotion(aiResponse)
        changeEmotion(emotion)
        
        // 更新状态
        updateAobaStatus()
        
        // 保存消息到本地存储
        saveMessages()
        
      } catch (error) {
        console.error('发送消息失败:', error)
        
        // 添加错误消息
        const errorMessage = {
          id: Date.now() + 1,
          content: '抱歉...网络出了点问题，我暂时说不了话。稍后再试吧~',
          sender: 'cat',
          time: new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
        messages.value.push(errorMessage)
        saveMessages()
      } finally {
        isLoading.value = false
        scrollToBottom()
      }
    }
    
    // 头像点击事件
    const handleAvatarClick = () => {
      const responses = [
        '我在这里陪着你呢~',
        '有什么想和我说的吗？',
        '温柔地摸摸你的头...',
        '轻轻为你加油...',
        '我一直在你身边...',
        '有什么需要帮助的吗？',
        '温柔地关心着你...',
        '为你送上温暖的拥抱~',
        '今天过得怎么样呀？',
        '需要我陪你聊聊天吗？'
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      // 添加消息并分析情感
      const clickMessage = {
        id: Date.now(),
        content: randomResponse,
        sender: 'cat',
        time: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      messages.value.push(clickMessage)
      
      // 分析并切换表情
      const emotion = analyzeEmotion(randomResponse)
      changeEmotion(emotion)
      
      // 更新状态
      updateAobaStatus()
      
      // 保存消息
      saveMessages()
      
      scrollToBottom()
    }
    
    // 清除聊天记录
    const clearMessages = () => {
      if (confirm('确定要清除所有聊天记录吗？此操作不可恢复。')) {
        messages.value = []
        localStorage.removeItem('aoba-chat-messages')
        
        // 添加时间问候消息
        const timeGreeting = getTimeGreeting()
        const greetingMessage = {
          id: Date.now(),
          content: timeGreeting,
          sender: 'cat',
          time: new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
        messages.value.push(greetingMessage)
        saveMessages()
        
        console.log('Aoba聊天记录已清除')
      }
    }
    
    // 保存消息到本地存储
    const saveMessages = () => {
      try {
        localStorage.setItem('aoba-chat-messages', JSON.stringify(messages.value))
      } catch (error) {
        console.error('保存消息失败:', error)
      }
    }
    
    // 从本地存储加载消息
    const loadMessages = () => {
      try {
        const savedMessages = localStorage.getItem('aoba-chat-messages')
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages)
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            messages.value = parsedMessages
            return
          }
        }
      } catch (error) {
        console.error('加载消息失败:', error)
      }
      
      // 如果没有保存的消息，添加时间问候消息
      const timeGreeting = getTimeGreeting()
      messages.value = [
        {
          id: Date.now(),
          content: timeGreeting,
          sender: 'cat',
          time: new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      ]
      saveMessages()
    }
    
    // 初始化
    onMounted(() => {
      // 加载保存的浮动头像位置
      loadFloatingAvatarPosition()
      
      // 启动时间更新
      timeSystem.startTimeUpdate((timeInfo) => {
        currentTime.value = timeInfo.time
        currentDate.value = timeInfo.date
        timePeriod.value = timeInfo.period
        timePeriodName.value = timeInfo.periodName
      })
      
      // 加载聊天记录
      loadMessages()
      
      // 每30秒更新一次状态
      setInterval(updateAobaStatus, 30000)
      
      // 监听窗口大小变化
      window.addEventListener('resize', resetFloatingAvatarPosition)
      
      // 添加滚动监听器
      window.addEventListener('scroll', handleScroll)
      
      // 等待 DOM 更新后检查浮动头像可见性
      nextTick(() => {
        // 强制检查一次浮动头像可见性
        setTimeout(() => {
          checkFloatingAvatarVisibility()
        }, 100)
      })
    })
    
    onUnmounted(() => {
      timeSystem.stopTimeUpdate()
      
      // 移除滚动监听器
      window.removeEventListener('scroll', handleScroll)
      
      window.removeEventListener('resize', resetFloatingAvatarPosition)
    })
    
    // 监听消息变化，自动保存
    watch(messages, () => {
      saveMessages()
      checkFloatingAvatarVisibility()
    }, { deep: true })
    
    return {
      messages,
      inputMessage,
      isLoading,
      currentEmotion,
      aobaStatus,
      isChanging,
      messagesContainer,
      emotionImage,
      showFloatingAvatar,

      floatingAvatar,
      isDragging,
      floatingAvatarPosition,
      showFloatingChatBubble,
      floatingChatMessage,
      currentTime,
      currentDate,
      timePeriod,
      timePeriodName,
      sendMessage,
      handleAvatarClick,
      clearMessages,
      scrollToTop,
      startDrag,
      handleFloatingAvatarClick,
      resetFloatingAvatarPosition,
      checkFloatingAvatarVisibility,
      loadFloatingAvatarPosition,
      handleScroll
    }
  }
}
</script>

<style scoped>
.aoba-chat {
  min-height: 100vh;
  position: relative;
  width: 100%;
  max-width: 100%;
}

/* 动态背景 */
.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

.bg-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
  animation: particleFloat 20s ease-in-out infinite;
}

/* 返回按钮 */
.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-5px);
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

/* 浮动头像 */
.floating-avatar {
  position: fixed;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.floating-avatar.show {
  opacity: 1;
  visibility: visible;
}

.floating-avatar.dragging {
  cursor: grabbing !important;
  transition: none !important;
}

.floating-avatar.dragging .floating-avatar-img {
  transform: scale(1.1);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.5);
}

.floating-avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
}

.floating-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb) border-box;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  z-index: 2;
  position: relative;
}

.floating-avatar:hover .floating-avatar-img {
  transform: scale(1.1);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.floating-avatar-img:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

.floating-avatar-glow {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
  animation: floatingGlow 3s ease-in-out infinite alternate;
}

.floating-avatar-pulse {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  z-index: 0;
}

/* 浮动聊天泡泡 */
.floating-chat-bubble {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 
    0 4px 15px rgba(255, 107, 107, 0.4),
    0 0 0 1px rgba(255, 71, 87, 0.3);
  z-index: 1002;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  animation: floatingChatBubbleIn 0.3s ease forwards;
}

.floating-chat-bubble.show {
  opacity: 1;
  visibility: visible;
}

.floating-chat-content {
  position: relative;
  z-index: 2;
}

.floating-chat-tail {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-top-color: #ee5a24;
  border-bottom: none;
}



/* 主容器 */
.main-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  padding: 40px;
  min-height: 80vh;
  height: auto;
  display: flex;
  flex-direction: column;
}

/* 头部区域 */
.aoba-header {
  text-align: center;
  margin-bottom: 30px;
  flex-shrink: 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid transparent;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c) border-box;
  animation: rotate 4s linear infinite;
}

.aoba-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.3);
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb) border-box;
  display: block;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 
    0 15px 35px rgba(102, 126, 234, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
  cursor: pointer;
  z-index: 2;
}

.aoba-avatar:hover {
  transform: scale(1.05) rotate(2deg);
  box-shadow: 
    0 20px 40px rgba(102, 126, 234, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

.aoba-avatar:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

.aoba-avatar.emotion-changing {
  animation: emotionChange 0.6s ease;
}

.avatar-glow {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
  animation: glow 3s ease-in-out infinite alternate;
}

.avatar-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.avatar-sparkles span {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  animation: sparkle 2s ease-in-out infinite;
}

.avatar-sparkles span:nth-child(1) {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.avatar-sparkles span:nth-child(2) {
  top: 60%;
  right: 20%;
  animation-delay: 0.5s;
}

.avatar-sparkles span:nth-child(3) {
  bottom: 20%;
  left: 50%;
  animation-delay: 1s;
}

.aoba-info {
  text-align: center;
}

.aoba-name {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
  text-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

/* 时间显示样式 */
.time-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.current-time {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
  text-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
}

.time-period {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(102, 126, 234, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.current-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.aoba-status-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.aoba-status {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: inline-block;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.aoba-status:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.15);
}

.chat-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
  margin: 2px 0 0 0;
  font-style: normal;
  text-align: center;
}

.clear-chat-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #ff6b6b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.clear-chat-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  transform: scale(1.05);
  color: #ff5252;
}

.clear-chat-btn svg {
  width: 18px;
  height: 18px;
}

/* 聊天区域 */
.chat-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  min-height: 0;
  height: auto;
}

.chat-messages {
  flex: 1;
  padding: 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  box-shadow: 
    inset 0 2px 10px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
  min-height: 400px;
  height: auto;
  overflow-y: visible;
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chat-messages::-webkit-scrollbar {
  display: none;
}

.message {
  animation: fadeInUp 0.4s ease;
}

.message.user {
  text-align: right;
}

.message.cat {
  text-align: left;
}

.message-bubble {
  display: inline-block;
  max-width: 90%;
  position: relative;
}

.message-content {
  padding: 15px 20px;
  border-radius: 20px;
  line-height: 1.6;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-bottom-right-radius: 8px;
  box-shadow: 
    0 4px 15px rgba(102, 126, 234, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.message.user .message-content::before {
  content: '';
  position: absolute;
  bottom: 0;
  right: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-bottom-color: #764ba2;
  border-right: none;
  border-bottom-right-radius: 4px;
}

.message.cat .message-content {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border-bottom-left-radius: 8px;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.message.cat .message-content::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-bottom-color: rgba(255, 255, 255, 0.1);
  border-left: none;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 5px;
  font-weight: 400;
  text-align: center;
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.loading-dots {
  display: flex;
  gap: 8px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: loadingDot 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
.loading-dots span:nth-child(3) { animation-delay: 0s; }

.loading-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-style: italic;
}

/* 输入区域 */
.chat-input-section {
  position: relative;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 25px;
  padding: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  width: 100%;
}

.chat-input {
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 20px;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  resize: none;
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.chat-input:focus {
  background: rgba(255, 255, 255, 0.1);
}

.chat-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.send-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.send-btn:hover::before {
  left: 100%;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.send-btn.btn-active {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  box-shadow: 0 4px 15px rgba(74, 222, 128, 0.3);
}

.send-btn svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.send-btn:hover svg {
  transform: rotate(45deg);
}

/* 动画 */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes emotionChange {
  0% { 
    transform: scale(1); 
    opacity: 1;
  }
  50% { 
    transform: scale(1.1); 
    opacity: 0.8;
  }
  100% { 
    transform: scale(1); 
    opacity: 1;
  }
}

@keyframes glow {
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  100% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes floatingGlow {
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  100% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes floatingChatBubbleIn {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loadingDot {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-container {
    max-width: 98vw;
    margin: 0;
    padding: 25px 18px;
    border-radius: 20px;
    min-height: 80vh;
  }
  
  .aoba-header {
    margin-bottom: 25px;
  }
  
  .avatar-section {
    gap: 18px;
  }
  
  .aoba-avatar {
    width: 100px;
    height: 100px;
  }
  
  .aoba-name {
    font-size: 24px;
  }
  
  .aoba-status {
    font-size: 13px;
  }
  
  .chat-count {
    font-size: 12px;
  }
  
  .clear-chat-btn {
    width: 36px;
    height: 36px;
  }
  
  .clear-chat-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .chat-section {
    gap: 18px;
    overflow: visible;
    height: auto;
  }
  
  .chat-messages {
    padding: 18px;
    min-height: 250px;
    max-height: none;
    border-radius: 18px;
    gap: 15px;
    overflow: visible;
    height: auto;
  }
  
  .message-bubble {
    max-width: 92%;
  }
  
  .message-content {
    max-width: 92%;
    padding: 12px 16px;
    font-size: 14px;
    border-radius: 18px;
  }
  
  .message-time {
    font-size: 11px;
  }
  
  .chat-input-section {
    margin-top: 15px;
  }
  
  .input-container {
    display: flex;
    gap: 10px;
    align-items: center;
    border-radius: 22px;
    padding: 5px;
  }
  
  .chat-input {
    flex: 1;
    padding: 14px 18px;
    font-size: 15px;
    border-radius: 18px;
  }
  
  .send-btn {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .send-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .back-btn {
    top: 10px;
    left: 10px;
    padding: 8px 15px;
    font-size: 12px;
  }
  
  .floating-avatar {
    width: 50px;
    height: 50px;
  }
  
  .back-to-top {
    bottom: 20px;
    right: 20px;
  }
  
  .back-to-top button {
    width: 45px;
    height: 45px;
  }
  
  .back-to-top svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .main-container {
    max-width: 100vw;
    margin: 0;
    height: auto;
    padding: 20px 10px;
    border-radius: 18px;
    min-height: auto;
    overflow: visible;
    position: relative;
  }
  
  .aoba-header {
    margin-bottom: 20px;
  }
  
  .avatar-section {
    gap: 15px;
  }
  
  .aoba-avatar {
    width: 80px;
    height: 80px;
    border-width: 3px;
  }
  
  .avatar-ring {
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
  }
  
  .aoba-name {
    font-size: 20px;
    margin-bottom: 8px;
  }
  
  .aoba-status-container {
    gap: 8px;
  }
  
  .aoba-status {
    font-size: 12px;
  }
  
  .chat-count {
    font-size: 11px;
  }
  
  .clear-chat-btn {
    width: 32px;
    height: 32px;
  }
  
  .clear-chat-btn svg {
    width: 14px;
    height: 14px;
  }
  
  .chat-section {
    gap: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: visible;
    height: auto;
    min-height: auto;
  }
  
  .chat-messages {
    padding: 15px;
    min-height: 250px;
    height: auto;
    max-height: none;
    border-radius: 20px;
    gap: 16px;
    overflow: visible;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    flex: 1;
    display: flex;
    flex-direction: column;
    scrollbar-width: none;
    -ms-overflow-style: none;
    position: relative;
    overflow-y: visible;
    overflow-x: visible;
  }
  
  .chat-messages::-webkit-scrollbar {
    display: none;
  }
  
  .message-bubble {
    max-width: 98%;
  }
  
  .message-content {
    padding: 12px 16px;
    font-size: 15px;
    line-height: 1.5;
    border-radius: 18px;
  }
  
  .message-time {
    font-size: 11px;
    margin-top: 6px;
  }
  
  .chat-input-section {
    margin-top: 15px;
    flex-shrink: 0;
  }
  
  .input-container {
    display: flex;
    gap: 2px;
    align-items: center;
    border-radius: 20px;
    padding: 4px;
  }
  
  .chat-input {
    flex: 1;
    padding: 12px 16px;
    font-size: 14px;
    border-radius: 16px;
  }
  
  .send-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .send-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .back-btn {
    top: max(8px, env(safe-area-inset-top));
    left: max(8px, env(safe-area-inset-left));
    padding: 6px 12px;
    font-size: 11px;
    border-radius: 20px;
  }
  
  .back-btn svg {
    width: 14px;
    height: 14px;
  }
  
  .floating-avatar {
    width: 45px;
    height: 45px;
  }
  
  .back-to-top {
    bottom: 15px;
    right: 15px;
  }
  
  .back-to-top button {
    width: 40px;
    height: 40px;
  }
  
  .back-to-top svg {
    width: 16px;
    height: 16px;
  }
}
</style>