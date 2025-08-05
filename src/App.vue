<script>
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import CharacterSelect from './components/CharacterSelect.vue'
import AobaChat from './components/AobaChat.vue'
import { timeSystem } from './utils/timeSystem.js'

export default {
  name: 'App',
  components: {
    CharacterSelect,
    AobaChat
  },
  setup() {
    // 页面状态 - 默认为角色选择页面
    const selectedCharacter = ref(null)
    const currentPage = ref('select') // 'select', 'kuro', 'aoba'
    
    // 开始聊天
    const startChat = async (characterId) => {
      selectedCharacter.value = characterId
      currentCharacter.value = characterId
      
      if (characterId === 'aoba') {
        // Aoba 使用独立页面
        currentPage.value = 'aoba'
        return
      }
      
      // Kuro 使用原有页面
      currentPage.value = 'kuro'
      
      // 加载角色数据
      await loadCharacterData(characterId)
      
      // 确保当前角色ID正确设置
      currentCharacter.value = characterId
      
      // 添加时间问候消息
      const timeGreeting = getTimeGreeting()
      messages.value = [
        {
          id: Date.now(),
          content: timeGreeting,
          sender: 'cat',
          time: currentTime.value
        }
      ]
      
      // 加载聊天记录
      loadMessages()
      
      // 强制重新渲染布局
      await nextTick()
      // 触发窗口resize事件来强制重新计算布局
      window.dispatchEvent(new Event('resize'))
    }
    
    // 返回角色选择（首页）
    const backToCharacterSelect = () => {
      selectedCharacter.value = null
      currentPage.value = 'select'
      // 清除当前聊天记录
      messages.value = []
      localStorage.removeItem('kuro-chat-messages')
    }
    const messages = ref([
      {
        id: 1,
        content: '哼...又是一个想找我聊天的人类吗？我不是什么陪聊机器人，有事说事，没事别浪费我的时间。',
        sender: 'cat',
        time: '刚刚'
      }
    ])
    
    const inputMessage = ref('')
    const isLoading = ref(false)
    const currentEmotion = ref('normal')
    const catStatus = ref('一只独行的Kuro...')
    const isChanging = ref(false)
    const showFloatingAvatar = ref(false)
    const showBackToTop = ref(false)
    const messagesContainer = ref(null)
    
    // 拖拽相关状态
    const floatingAvatarPosition = ref({ x: 30, y: 30 })
    const isDragging = ref(false)
    const dragOffset = ref({ x: 0, y: 0 })
    const floatingAvatar = ref(null)
    
    // 浮动聊天泡泡相关状态
    const showFloatingChatBubble = ref(false)
    const floatingChatMessage = ref('')
    
    // 角色相关状态
    const characters = ref([])
    const currentCharacter = ref('kuro')
    const characterData = ref(null)
    const showCharacterSelector = ref(false)
    
    // 表情图片映射 - 将在 loadCharacterData 中动态设置
    const emotionImages = ref({})
    
    const emotionImage = ref(emotionImages.value.normal)
    
    // API基础URL配置
    const API_BASE_URL = import.meta.env.PROD 
      ? window.location.origin 
              : 'http://localhost:3002'
    
    // 加载角色列表
    const loadCharacters = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/characters`)
        
        // 检查响应状态
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        characters.value = data
        console.log('角色列表加载成功:', data)
      } catch (error) {
        console.warn('后端服务器未启动或连接失败，使用默认角色数据:', error.message)
        // 使用默认角色数据
        characters.value = [
          {
            id: 'kuro',
            name: 'Kuro',
            avatar: '/img/Kuro.PNG'
          },
          {
            id: 'koru',
            name: 'Aoba',
            avatar: '/img/Aoba(normal).png'
          }
        ]
      }
    }
    
    // 加载角色详情
    const loadCharacterData = async (characterId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/characters/${characterId}`)
        
        // 检查响应状态
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        characterData.value = data
        emotionImages.value = data.emotions
        updateEmotionImage()
        updateCatStatus()
        console.log('角色详情加载成功:', data)
      } catch (error) {
        console.warn('后端服务器未启动，使用默认角色数据:', error.message)
        // 根据角色ID使用对应的默认数据
        if (characterId === 'koru') {
          characterData.value = {
            name: 'Aoba',
            avatar: '/img/Aoba(normal).png',
            emotions: {
              normal: '/img/Aoba(normal).png',
              happy: '/img/Aoba(Happy).png',
              angry: '/img/Aoba(Angry).png',
              sad: '/img/Aoba(Sad).png',
              surprise: '/img/Aoba(Surprise).png'
            },
            statusTexts: {
              normal: ['温柔地陪伴着你...', '静静地倾听你的心声...'],
              happy: ['开心地为你欢呼...', '温柔地为你开心...'],
              angry: ['为你感到不平...', '温柔地安慰你...'],
              sad: ['温柔地安慰你...', '轻轻为你擦泪...'],
              surprise: ['惊讶地为你开心...', '温柔地为你惊讶...']
            },
            clickResponses: ['我在这里陪着你呢~', '有什么想和我说的吗？', '温柔地摸摸你的头...']
          }
        } else {
          // 默认 Kuro 数据
          characterData.value = {
            name: 'Kuro',
            avatar: '/img/Kuro.PNG',
            emotions: {
              normal: '/img/Kuro.PNG',
              happy: '/img/Kuro(Happy).PNG',
              angry: '/img/Kuro(Angry).PNG',
              sad: '/img/Kuro(Sad).PNG',
              surprise: '/img/Kuro(Surprise).PNG'
            },
            statusTexts: {
              normal: ['正在思考人生的意义...', '观察着愚蠢的人类...'],
              happy: ['开心地摇着尾巴...', '心情不错的样子...'],
              angry: ['炸毛中，别惹我...', '耳朵向后贴着...'],
              sad: ['心情有点低落...', '耳朵垂了下来...'],
              surprise: ['惊讶地睁大眼睛...', '耳朵竖得很直...']
            },
            clickResponses: ['别戳我...', '哼，幼稚。', '有事说事。', '你很无聊诶。']
          }
        }
        emotionImages.value = characterData.value.emotions
        updateEmotionImage()
        updateCatStatus()
      }
    }
    
    // 切换角色
    const switchCharacter = async (characterId) => {
      currentCharacter.value = characterId
      await loadCharacterData(characterId)
      
      // 清空聊天记录
      messages.value = []
      
      // 清除本地存储的聊天记录
      localStorage.removeItem('kuro-chat-messages')
      
      showCharacterSelector.value = false
    }
    
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
    
    // 更新猫咪状态
    const updateCatStatus = () => {
      if (!characterData.value) return
      
      const statusTexts = characterData.value.statusTexts
      const statusList = statusTexts[currentEmotion.value] || statusTexts.normal
      const randomStatus = statusList[Math.floor(Math.random() * statusList.length)]
      catStatus.value = randomStatus
    }
    
    // 自动滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
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
        // 调用后端 API
        console.log('发送聊天请求，角色ID:', currentCharacter.value)
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            conversationHistory: messages.value.map(msg => ({
              sender: msg.sender,
              content: msg.content
            })),
            characterId: currentCharacter.value
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
        updateCatStatus()
        
      } catch (error) {
        console.error('发送消息失败:', error)
        
        // 添加错误消息
        const errorMessage = {
          id: Date.now() + 1,
          content: '哼...网络出了点问题，我暂时说不了话。稍后再试吧。',
          sender: 'cat',
          time: new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
        messages.value.push(errorMessage)
      } finally {
        isLoading.value = false
        scrollToBottom()
      }
    }
    
    // 头像点击事件
    const handleAvatarClick = () => {
      console.log('头像被点击了！') // 调试信息
      
      // 如果没有角色数据，使用默认回复
      let responses = [
        '别戳我...',
        '哼，幼稚。',
        '有事说事。',
        '你很无聊诶。',
        '...无语。',
        '哇，你干嘛？',
        '唉，又戳我...',
        '哼，幼稚！'
      ]
      
      // 如果有角色数据，使用角色的回复
      if (characterData.value && characterData.value.clickResponses) {
        responses = characterData.value.clickResponses
      }
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      console.log('随机回复:', randomResponse) // 调试信息
      
      // 添加消息并分析情感
      messages.value.push({
        id: Date.now(),
        content: randomResponse,
        sender: 'cat',
        time: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      })
      
      // 分析并切换表情
      const emotion = analyzeEmotion(randomResponse)
      changeEmotion(emotion)
      
      // 更新状态
      updateCatStatus()
      
      scrollToBottom()
    }
    
    // 拖拽消息防抖
    const dragMessageShown = ref(false)
    
    // 拖拽起始位置
    const dragStartPosition = ref({ x: 0, y: 0 })
    
    // 开始拖拽
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
              '别再拉我了！',
              '哎呀，轻点！',
              '我要生气了！',
              '别拽我！',
              '我要掉下去了！',
              '快放开我！',
              '好疼啊！',
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
    const stopDrag = () => {
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
      localStorage.setItem('floating-avatar-position', JSON.stringify(floatingAvatarPosition.value))
      
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
    
    // 重置浮动头像位置到默认位置
    const resetFloatingAvatarPosition = () => {
      floatingAvatarPosition.value = { x: 30, y: 30 }
      localStorage.removeItem('floating-avatar-position')
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
      
      console.log('浮动头像被点击了！') // 调试信息
      
      // 触发点击反应
      setTimeout(() => {
        handleAvatarClick()
      }, 500)
    }
    
    // 滚动到顶部
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    // 滚动检测
    const handleScroll = () => {
      const scrollY = window.scrollY
      const isMobile = window.innerWidth <= 480
      
      // 在手机模式下，只要有滚动就显示浮动头像
      if (isMobile) {
        showFloatingAvatar.value = scrollY > 50
        showBackToTop.value = scrollY > 50
      } else {
        // 桌面模式下，滚动超过200px才显示
        showFloatingAvatar.value = scrollY > 200
        showBackToTop.value = scrollY > 200
      }
    }
    
    // 检查是否应该显示浮动头像（用于手机模式）
    const checkFloatingAvatarVisibility = () => {
      const isMobile = window.innerWidth <= 480
      const hasMessages = messages.value.length > 0
      
      // 在手机模式下，如果有消息就显示浮动头像
      if (isMobile && hasMessages) {
        showFloatingAvatar.value = true
      }
    }
    
    // 保存聊天记录到本地存储
    const saveMessages = () => {
      try {
        localStorage.setItem('kuro-chat-messages', JSON.stringify(messages.value))
        localStorage.setItem('kuro-current-character', currentCharacter.value)
        console.log('聊天记录已保存')
        
        // 显示保存提示（可选）
        // 这里可以添加一个小的提示动画
      } catch (error) {
        console.error('保存聊天记录失败:', error)
      }
    }
    
    // 从本地存储加载聊天记录
    const loadMessages = () => {
      try {
        const savedMessages = localStorage.getItem('kuro-chat-messages')
        const savedCharacter = localStorage.getItem('kuro-current-character')
        
        if (savedMessages) {
          messages.value = JSON.parse(savedMessages)
          console.log('聊天记录已加载')
        }
        
        // 只有当保存的角色与当前选择的角色匹配时，才使用保存的角色
        // 这样可以防止角色切换时的混乱
        if (savedCharacter && savedCharacter === currentCharacter.value) {
          // 角色匹配，可以安全使用保存的角色
          console.log('使用保存的角色:', savedCharacter)
        } else {
          // 角色不匹配，保持当前选择的角色
          console.log('角色不匹配，使用当前选择的角色:', currentCharacter.value)
        }
      } catch (error) {
        console.error('加载聊天记录失败:', error)
      }
    }
    
    // 清除聊天记录
    const clearMessages = () => {
      if (confirm('确定要清除所有聊天记录吗？此操作不可恢复。')) {
        messages.value = []
        localStorage.removeItem('kuro-chat-messages')
        console.log('聊天记录已清除')
      }
    }
    
    // 监听消息变化，自动保存
    watch(messages, () => {
      saveMessages()
      checkFloatingAvatarVisibility()
    }, { deep: true })
    
    // 加载保存的浮动头像位置
    const loadFloatingAvatarPosition = () => {
      try {
        const savedPosition = localStorage.getItem('floating-avatar-position')
        if (savedPosition) {
          floatingAvatarPosition.value = JSON.parse(savedPosition)
        }
      } catch (error) {
        console.error('加载浮动头像位置失败:', error)
      }
    }
    
    // 时间相关的响应式变量
    const currentTime = ref(timeSystem.formatTime())
    const currentDate = ref(timeSystem.formatDate())
    const timePeriod = ref(timeSystem.getTimePeriod())
    const timePeriodName = ref(timeSystem.getTimePeriodName())

    // 时间问候功能
    const getTimeGreeting = () => {
      // 检查特殊时间
      const specialGreeting = timeSystem.getSpecialTimeGreeting(currentCharacter.value)
      if (specialGreeting) {
        return specialGreeting
      }
      
      // 返回普通时间问候
      return timeSystem.getTimeGreeting(currentCharacter.value)
    }
    
    // 初始化
    onMounted(async () => {
      await loadCharacters()
      
      // 加载保存的浮动头像位置
      loadFloatingAvatarPosition()
      
      // 添加滚动监听
      window.addEventListener('scroll', handleScroll)
      
      // 添加窗口大小改变监听
      window.addEventListener('resize', checkFloatingAvatarVisibility)
      
      // 每30秒更新一次状态
      setInterval(updateCatStatus, 30000)
      
      // 确保应用启动时显示角色选择页面
      selectedCharacter.value = null
      
      // 检查浮动头像可见性
      checkFloatingAvatarVisibility()

      // 启动时间更新
      timeSystem.startTimeUpdate((timeInfo) => {
        currentTime.value = timeInfo.time
        currentDate.value = timeInfo.date
        timePeriod.value = timeInfo.period
        timePeriodName.value = timeInfo.periodName
        
        // 如果检测到特殊时间，可以显示特殊消息
        if (timeInfo.specialTime && messages.value.length > 0) {
          const specialGreeting = timeSystem.getSpecialTimeGreeting(currentCharacter.value)
          if (specialGreeting) {
            messages.value.push({
              id: Date.now(),
              content: specialGreeting,
              sender: 'cat',
              time: timeInfo.time
            })
            scrollToBottom()
          }
        }
      })
    })
    
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', checkFloatingAvatarVisibility)
      timeSystem.stopTimeUpdate() // 停止时间更新
    })
    
    return {
      selectedCharacter,
      currentPage,
      messages,
      inputMessage,
      isLoading,
      currentEmotion,
      catStatus,
      isChanging,
      showFloatingAvatar,
      showBackToTop,
      messagesContainer,
      emotionImage,
      characters,
      currentCharacter,
      characterData,
      showCharacterSelector,
      floatingAvatarPosition,
      floatingAvatar,
      isDragging,
      startDrag,
      resetFloatingAvatarPosition,
      checkFloatingAvatarVisibility,
      handleFloatingAvatarClick,
      startChat,
      backToCharacterSelect,
      sendMessage,
      handleAvatarClick,
      scrollToTop,
      switchCharacter,
      clearMessages,
      showFloatingChatBubble,
      floatingChatMessage,
      currentTime,
      currentDate,
      timePeriod,
      timePeriodName,
      getTimeGreeting
    }
  }
}
</script>

<template>
  <div class="app">
    <!-- 角色选择页面（首页） -->
    <CharacterSelect 
      v-if="currentPage === 'select'"
      @select-character="startChat"
    />
    
    <!-- Aoba 独立聊天页面 -->
    <AobaChat 
      v-else-if="currentPage === 'aoba'"
      @back="backToCharacterSelect"
    />
    
    <!-- Kuro 聊天页面 -->
    <div v-else-if="currentPage === 'kuro'" class="chat-app">
      <!-- 动态背景 -->
      <div class="bg-animation">
        <div class="bg-particles"></div>
        <div class="bg-gradient"></div>
      </div>
      
      <!-- 返回首页按钮 -->
      <button 
        @click="backToCharacterSelect"
        class="back-btn"
        title="返回首页"
      >
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
            alt="猫影" 
            class="floating-avatar-img"
            style="cursor: grab;"
            title="拖拽移动我，点击回到顶部"
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
    
    <!-- 回到顶部按钮 -->
    <div class="back-to-top" :class="{ show: showBackToTop }">
      <button @click="scrollToTop" title="回到顶部">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>
    </div>
    
    <!-- 主容器 -->
    <div class="main-container">
        <!-- 头部区域 -->
        <div class="cat-header">
          <div class="avatar-section">
            <div class="avatar-container">
              <div class="avatar-ring"></div>
              <img 
                :src="emotionImage" 
                :alt="characterData?.name || 'Kuro'" 
                class="cat-avatar" 
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
            <div class="cat-info">
              <h2 class="cat-name">{{ characterData?.name || 'Kuro' }}</h2>
              
              <!-- 添加时间显示 -->
              <div class="time-display">
                <div class="current-time">{{ currentTime }}</div>
                <div class="time-period">{{ timePeriodName }}</div>
                <div class="current-date">{{ currentDate }}</div>
              </div>
              
              <div class="cat-status-container">
                <div class="status-indicator"></div>
                <p class="cat-status">{{ catStatus }}</p>
                <p class="chat-count" v-if="messages.length > 0">共 {{ messages.length }} 条消息</p>
              </div>
              
              
              <!-- 清除聊天记录按钮 -->
              <button 
                @click="clearMessages"
                class="clear-chat-btn"
                title="清除聊天记录"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- 角色选择器 -->
          <div v-if="showCharacterSelector" class="character-selector">
            <div class="character-list">
              <div 
                v-for="character in characters" 
                :key="character.id"
                @click="switchCharacter(character.id)"
                class="character-option"
                :class="{ active: currentCharacter === character.id }"
              >
                <img :src="character.avatar" :alt="character.name" class="character-avatar">
                <span class="character-name">{{ character.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 聊天区域 -->
        <div class="chat-section">
          <div class="chat-messages" ref="messagesContainer">
            <div 
              v-for="message in messages" 
              :key="message.id" 
              :class="['message', message.sender]"
            >
              <div class="message-bubble">
                <div 
                  class="message-content"
                  :class="{ 'drag-message': message.isDragMessage }"
                >{{ message.content }}</div>
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
              <p class="loading-text">Kuro...</p>
            </div>
          </div>
          
          <!-- 输入区域 -->
          <div class="chat-input-section">
            <div class="input-container">
              <input 
                type="text" 
                v-model="inputMessage" 
                @keyup.enter="sendMessage"
                placeholder="想对Kuro说些什么..."
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
</div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  background: #0a0a0a;
  min-height: 100vh;
  height: auto;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
}

#app {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

.app {
  width: 100% !important;
  min-height: 100vh !important;
  position: relative !important;
  display: flex !important;
  justify-content: center !important;
  align-items: flex-start !important;
  padding: 20px !important;
  box-sizing: border-box !important;
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

/* 主容器 */
.main-container {
  position: relative !important;
  z-index: 2 !important;
  width: 100% !important;
  max-width: 900px !important;
  margin: 0 auto !important;
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(30px) !important;
  border-radius: 30px !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  padding: 40px !important;
  min-height: 80vh !important;
  height: auto !important;
  display: flex !important;
  flex-direction: column !important;
}



/* 头部区域 */
.cat-header {
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

.cat-avatar {
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

.cat-avatar:hover {
  transform: scale(1.05) rotate(2deg);
  box-shadow: 
    0 20px 40px rgba(102, 126, 234, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

.cat-avatar:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

.cat-avatar.emotion-changing {
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

.cat-info {
  text-align: center;
}

.cat-name {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
  text-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.cat-status-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.cat-status {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: inline-block;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cat-status:hover {
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

/* 角色切换按钮 */
.character-switch-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 35px;
  height: 35px;
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
  z-index: 10;
}

.character-switch-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.character-switch-btn svg {
  width: 16px;
  height: 16px;
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

/* 角色选择器 */
.character-selector {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 15px;
  margin-top: 10px;
  z-index: 1000;
  min-width: 200px;
}

.character-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.character-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.character-option:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.character-option.active {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.4);
}

.character-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.character-name {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
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
  max-height: none;
  overflow: visible;
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  height: auto;
}

/* 移除滚动条样式，因为现在使用页面滚动 */

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

/* 拖拽消息特殊样式 */
.message.cat .message-content.drag-message {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: 2px solid #ff4757;
  animation: dragMessagePulse 0.6s ease-in-out;
  box-shadow: 
    0 4px 15px rgba(255, 107, 107, 0.4),
    0 0 0 1px rgba(255, 71, 87, 0.3);
}

.message.cat .message-content.drag-message::before {
  border-bottom-color: #ff4757;
}

@keyframes dragMessagePulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
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

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.back-to-top.show {
  opacity: 1;
  visibility: visible;
}

.back-to-top button {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.back-to-top button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.back-to-top button:hover::before {
  left: 100%;
}

.back-to-top button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.back-to-top button:active {
  transform: translateY(-1px) scale(1.02);
}

.back-to-top svg {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.back-to-top button:hover svg {
  transform: translateY(-2px);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .app {
    padding: 12px;
    align-items: flex-start;
  }
  
  .main-container {
    max-width: 98vw;
    margin: 0;
    padding: 25px 18px;
    border-radius: 20px;
    min-height: 80vh;
  }
  

  
  .cat-header {
    margin-bottom: 25px;
  }
  
  .avatar-section {
    gap: 18px;
  }
  
  .cat-avatar {
    width: 100px;
    height: 100px;
  }
  
  .cat-name {
    font-size: 24px;
  }
  
  .cat-status {
    font-size: 13px;
  }
  
  .chat-count {
    font-size: 12px;
  }
  
  .character-switch-btn,
  .clear-chat-btn {
    width: 36px;
    height: 36px;
  }
  
  .character-switch-btn svg,
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
  
  .floating-avatar {
    /* 位置由JavaScript控制 */
  }
  
  .floating-avatar-container {
    width: 55px;
    height: 55px;
  }
  
  .back-to-top {
    bottom: 18px;
    right: 18px;
  }
  
  .back-to-top button {
    width: 48px;
    height: 48px;
  }
  
  .back-to-top svg {
    width: 20px;
    height: 20px;
  }
  
  /* 角色选择器优化 */
  .character-selector {
    max-width: 90vw;
    max-height: 70vh;
  }
  
  .character-list {
    gap: 15px;
    padding: 20px;
  }
  
  .character-option {
    padding: 15px;
    border-radius: 15px;
  }
  
  .character-option .character-avatar {
    width: 60px;
    height: 60px;
  }
  
  .character-option .character-name {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .app {
    padding: 4px;
    align-items: flex-start;
    -webkit-overflow-scrolling: touch;
    min-height: 100vh;
    height: auto;
  }
  
  .main-container {
    max-width: 100vw;
    margin: 0;
    height: auto;
    padding: 20px 10px;
    border-radius: 18px;
    min-height: auto;
    /* 确保容器可以自由扩展 */
    overflow: visible;
    position: relative;
  }
  

  
  .cat-header {
    margin-bottom: 20px;
  }
  
  .avatar-section {
    gap: 15px;
  }
  
  .cat-avatar {
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
  
  .cat-name {
    font-size: 20px;
    margin-bottom: 8px;
  }
  
  .cat-status-container {
    gap: 8px;
  }
  
  .cat-status {
    font-size: 12px;
  }
  
  .chat-count {
    font-size: 11px;
  }
  
  .character-switch-btn,
  .clear-chat-btn {
    width: 32px;
    height: 32px;
  }
  
  .character-switch-btn svg,
  .clear-chat-btn svg {
    width: 14px;
    height: 14px;
  }
  
  .chat-section {
    gap: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    /* 确保聊天区域可以自由扩展 */
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
    /* 完全移除滚动条 */
    scrollbar-width: none;
    -ms-overflow-style: none;
    /* 确保内容可以自由扩展 */
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
  
  .floating-avatar {
    /* 位置由JavaScript控制 */
    z-index: 1001 !important;
  }
  
  .floating-avatar-container {
    width: 80px;
    height: 80px;
  }
  
  .floating-avatar-img {
    border-width: 2px;
  }
  
  /* 手机模式浮动聊天泡泡 */
  .floating-chat-bubble {
    top: -70px;
    padding: 6px 10px;
    font-size: 11px;
    border-radius: 10px;
  }
  
  .floating-chat-tail {
    bottom: -5px;
    border-width: 5px;
  }
  
  .back-to-top {
    bottom: max(15px, env(safe-area-inset-bottom));
    right: max(15px, env(safe-area-inset-right));
  }
  
  .back-to-top button {
    width: 45px;
    height: 45px;
  }
  
  .back-to-top svg {
    width: 18px;
    height: 18px;
  }
  
  /* 角色选择器优化 */
  .character-selector {
    max-width: 95vw;
    max-height: 60vh;
  }
  
  .character-list {
    gap: 12px;
    padding: 15px;
  }
  
  .character-option {
    padding: 12px;
    border-radius: 12px;
  }
  
  .character-option .character-avatar {
    width: 50px;
    height: 50px;
  }
  
  .character-option .character-name {
    font-size: 14px;
  }
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

/* 聊天应用容器 */
.chat-app {
  min-height: 100vh !important;
  height: auto !important;
  position: relative !important;
  width: 100% !important;
  max-width: 100% !important;
}

@media (max-width: 768px) {
  .back-btn {
    top: 10px;
    left: 10px;
    padding: 8px 15px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
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
}
</style>