# AI 聊天应用

一个基于 Vue.js + Node.js 的多角色 AI 聊天应用，集成了 Google Gemini API。

## 功能特点

- 🏠 **角色选择首页**: 展示所有可用的 AI 角色供用户选择
- 🤖 **AI 对话**: 集成 Google Gemini API，提供智能对话
- 👥 **多角色系统**: 支持多个不同性格的 AI 角色
- 🎭 **表情系统**: 根据对话内容动态切换角色表情
- 📱 **响应式设计**: 支持桌面和移动设备
- ✨ **现代 UI**: 美观的渐变背景和动画效果
- 🔄 **浮动头像**: 滚动时显示小头像
- ⬆️ **回到顶部**: 一键回到页面顶部
- 🔀 **角色切换**: 实时切换不同角色进行对话
- 💾 **聊天记录保存**: 自动保存聊天记录到本地存储

## 技术栈

- **前端**: Vue.js 3 + Vite
- **后端**: Node.js + Express
- **AI**: Google Gemini API
- **样式**: CSS3 + 动画效果

## 快速开始

### 方法一：一键启动（推荐）

双击运行 `start-app.bat` 文件，会自动启动前后端服务器。

### 方法二：分别启动

1. **启动后端服务器**：
   ```bash
   # 双击运行 start-backend.bat
   # 或者手动执行：
   cd server
   npm install
   npm run dev
   ```

2. **启动前端服务器**：
   ```bash
   npm install
   npm run dev
   ```

### 方法三：仅前端模式

如果只想测试前端界面，可以直接运行：
```bash
npm run dev
```
应用会自动使用默认角色数据，无需后端服务器。

## 故障排除

### 常见问题

1. **控制台显示 404 错误**：
   - 这是正常的，表示后端服务器未启动
   - 应用会自动使用默认角色数据
   - 如需完整功能，请启动后端服务器

2. **角色数据加载失败**：
   - 检查后端服务器是否运行在端口 3001
   - 确保 `server` 文件夹存在且包含必要文件

3. **聊天功能不可用**：
   - 需要启动后端服务器才能使用 AI 聊天功能
   - 仅前端模式下只能查看界面和点击头像

## 项目结构

```
vue-kuro/
├── src/
│   ├── App.vue                    # 主应用组件
│   └── components/
│       └── CharacterSelect.vue    # 角色选择页面组件
├── server/
│   ├── server.js                  # Express 服务器
│   ├── characters.js              # 角色配置文件
│   └── package.json               # 后端依赖
├── public/
│   └── img/                       # 角色表情图片
├── package.json                   # 前端依赖
├── start-app.bat                  # 一键启动脚本
└── README.md                     # 项目说明
```

## 角色系统

### 当前角色

#### 🐱 Kuro（默认角色）
- **性格**: 冷静理性、话少毒舌、外冷内暖的独行猫
- **特点**: 
  - 说话简洁直接，不喜欢废话
  - 对人类保持距离感，但内心温柔
  - 喜欢用"哼"、"无语"、"幼稚"等词汇
  - 偶尔表现出傲娇的一面

#### 🌙 Luna（治愈系角色）
- **性格**: 温柔体贴、善解人意、治愈系
- **特点**:
  - 总是以温柔的语气关心用户
  - 能够理解用户的情感需求
  - 擅长安慰和鼓励用户
  - 耐心倾听，愿意花时间听用户倾诉
  - 积极乐观，总是带着正能量
  - 细心周到，注意细节，体贴入微

## 使用说明

### 首页
1. 打开应用后，首先会看到首页（角色选择页面）
2. 首页展示所有可用的AI角色供用户选择
3. 每个角色卡片包含头像、名称、描述和标签

### 聊天功能
1. 点击任意角色头像进入聊天界面
2. 在聊天界面可以点击左上角的"返回首页"按钮回到首页
3. 在输入框中输入消息，按回车或点击发送按钮
4. 点击角色头像可以获得随机回复
5. 聊天记录会自动保存到本地存储
6. 可以点击垃圾桶按钮清除聊天记录

### 添加新角色

要添加新角色，请编辑 `server/characters.js` 文件：

```javascript
// 在 characters 对象中添加新角色
newCharacter: {
  name: '角色名称',
  avatar: '/img/CharacterName.PNG',
  emotions: {
    normal: '/img/CharacterName.PNG',
    happy: '/img/CharacterName(Happy).PNG',
    angry: '/img/CharacterName(Angry).PNG',
    sad: '/img/CharacterName(Sad).PNG',
    surprise: '/img/CharacterName(Surprise).PNG'
  },
  personality: `角色的性格设定...`,
  statusTexts: {
    normal: ['状态文本1', '状态文本2'],
    happy: ['开心状态1', '开心状态2'],
    // ... 其他情绪状态
  },
  clickResponses: ['点击回复1', '点击回复2', '...']
}
```

### 角色配置说明

每个角色包含以下配置：

- **name**: 角色名称
- **avatar**: 默认头像路径
- **emotions**: 不同情绪对应的图片路径
- **personality**: AI 性格设定（用于 Gemini API）
- **statusTexts**: 不同情绪下的状态文本
- **clickResponses**: 点击头像时的随机回复

## 表情系统

角色会根据对话内容自动切换表情：
- 😺 **正常**: 默认状态
- 😊 **开心**: 检测到积极词汇时
- 😠 **生气**: 检测到负面词汇时
- 😢 **难过**: 检测到悲伤词汇时
- 😲 **惊讶**: 检测到惊讶词汇时

## API 接口

### 获取角色列表
```
GET /api/characters
```

### 获取角色详情
```
GET /api/characters/:characterId
```

### 聊天接口
```
POST /api/chat
{
  "message": "用户消息",
  "conversationHistory": [...],
  "characterId": "角色ID"
}
```

## 开发说明

### 前端开发
- 使用 Vue.js 3 Composition API
- 响应式数据管理
- 组件化开发

### 后端开发
- Express.js 服务器
- RESTful API 设计
- Gemini API 集成
- 角色配置管理

### 环境变量
如需修改 Gemini API Key，请编辑 `server/server.js` 中的 `GEMINI_API_KEY` 变量。

## 许可证

MIT License
