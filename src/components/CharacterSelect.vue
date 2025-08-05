<template>
  <div class="character-select-page">
    <!-- 动态背景 -->
    <div class="bg-animation">
      <div class="bg-particles"></div>
      <div class="bg-gradient"></div>
    </div>
    
    <!-- 标题区域 -->
    <div class="header-section">
      <h1 class="main-title">Kuro和Aoba的聊天室</h1>
      <p class="subtitle">选择你的AI伙伴开始聊天</p>
    </div>
    
    <!-- 角色网格 -->
    <div class="characters-grid">
      <div 
        v-for="character in characters" 
        :key="character.id"
        class="character-card"
        @click="selectCharacter(character.id)"
      >
        <div class="character-avatar-container">
          <img 
            :src="character.avatar" 
            :alt="character.name" 
            class="character-avatar"
          >
          <div class="avatar-glow"></div>
          <div class="avatar-sparkles">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <div class="character-info">
          <h3 class="character-name">{{ character.name }}</h3>
          <p class="character-description">{{ getCharacterDescription(character) }}</p>
          <div class="character-tags">
            <span 
              v-for="tag in getCharacterTags(character)" 
              :key="tag"
              class="character-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
                 <div class="select-indicator">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M9 18l6-6-6-6"/>
           </svg>
           <span class="select-text">开始聊天</span>
         </div>
      </div>
    </div>
    
    <!-- 底部信息 -->
    <div class="footer-section">
      <p class="footer-text">© 2025 AI 聊天应用 - 更多角色正在开发中</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'CharacterSelect',
  emits: ['select-character'],
  setup(props, { emit }) {
    const characters = ref([])
    
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
        // 如果API失败，使用默认角色
        characters.value = [
          {
            id: 'kuro',
            name: 'Kuro',
            avatar: '/img/Kuro.PNG',
            description: '外冷内暖的Kuro'
          },
          {
                    id: 'koru',
        name: 'Aoba',
        avatar: '/img/Aoba(normal).png',
            description: '温暖治愈的Aora'
          }
        ]
      }
    }
    
    // 选择角色
    const selectCharacter = (characterId) => {
      emit('select-character', characterId)
    }
    
    // 获取角色描述
    const getCharacterDescription = (character) => {
      const descriptions = {
        kuro: '冷静理性, 话少毒舌, Aoba的双胞胎弟弟',
        aoba: '温暖治愈, 开朗阳光, Kuro的双胞胎哥哥',
        shadow: '神秘莫测、智慧深邃的暗影AI'
      }
      return descriptions[character.id] || character.description || '神秘的AI伙伴'
    }
    
    // 获取角色标签
    const getCharacterTags = (character) => {
      const tags = {
        kuro: ['冷静', '毒舌','独行', '智慧'],
        aoba: ['温暖', '治愈', '阳光', '开朗'],
        shadow: ['神秘', '智慧', '深邃', '暗影']
      }
      return tags[character.id] || ['温暖', '治愈', '开朗', '阳光']
    }
    
    onMounted(() => {
      loadCharacters()
    })
    
    return {
      characters,
      selectCharacter,
      getCharacterDescription,
      getCharacterTags
    }
  }
}
</script>

<style scoped>
.character-select-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  position: relative;
  overflow-x: hidden;
}

/* 动态背景 */
.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.bg-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(255, 107, 107, 0.05) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

.bg-gradient {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* 标题区域 */
.header-section {
  text-align: center;
  margin-bottom: 60px;
  animation: fadeInDown 1s ease-out;
}

.main-title {
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
  text-shadow: 0 0 30px rgba(102, 126, 234, 0.3);
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 300;
}

/* 角色网格 */
.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  width: 100%;
  margin-bottom: 60px;
}

.character-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out;
}

.character-card:hover {
  transform: translateY(-10px) scale(1.02);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(102, 126, 234, 0.2);
}

.character-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.character-card:hover::before {
  left: 100%;
}

/* 头像容器 */
.character-avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}

.character-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  z-index: 2;
  position: relative;
}

.character-card:hover .character-avatar {
  border-color: rgba(102, 126, 234, 0.5);
  transform: scale(1.05);
}

.avatar-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
  animation: pulse 2s ease-in-out infinite;
  z-index: 1;
}

.avatar-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
}

.avatar-sparkles span {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  animation: sparkle 3s ease-in-out infinite;
}

.avatar-sparkles span:nth-child(1) {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.avatar-sparkles span:nth-child(2) {
  top: 60%;
  right: 20%;
  animation-delay: 1s;
}

.avatar-sparkles span:nth-child(3) {
  bottom: 20%;
  left: 50%;
  animation-delay: 2s;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

/* 角色信息 */
.character-info {
  text-align: center;
  margin-bottom: 20px;
}

.character-name {
  font-size: 1.8rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.character-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.character-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.character-tag {
  background: rgba(102, 126, 234, 0.2);
  color: rgba(255, 255, 255, 0.9);
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  border: 1px solid rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.character-tag:hover {
  background: rgba(102, 126, 234, 0.3);
  transform: scale(1.05);
}

/* 选择指示器 */
.select-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 20px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0.8);
}

.character-card:hover .select-indicator {
  opacity: 1;
  transform: scale(1);
  background: rgba(102, 126, 234, 0.4);
  color: #fff;
}

.select-indicator svg {
  width: 14px;
  height: 14px;
}

.select-text {
  font-size: 12px;
  font-weight: 500;
}

/* 底部信息 */
.footer-section {
  text-align: center;
  margin-top: auto;
  padding-top: 40px;
}

.footer-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  margin: 0;
}

/* 动画 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }
  
  .characters-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .character-card {
    padding: 20px;
  }
  
  .character-avatar-container {
    width: 100px;
    height: 100px;
  }
}
</style> 