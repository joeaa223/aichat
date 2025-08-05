# 角色名称修改日志

## 修改内容
将角色 `Koru` 的名称修改为 `Aoba`

## 已修改的文件

### 1. vue-kuro/server/characters.js
- ✅ 修改角色名称：`Koru` → `Aoba`
- ✅ 修改角色描述中的英文名：`Koru` → `Aoba`
- ✅ 修改背景故事中的角色名：`Koru` → `Aoba`
- ✅ 修改 Kuro 背景中的弟弟名：`Koru` → `Aoba`
- ✅ 修改角色头像路径：`/img/Koru.PNG` → `/img/Aoba(normal).png`
- ✅ 修改所有情感图片路径：
  - `normal`: `/img/Koru.PNG` → `/img/Aoba(normal).png`
  - `happy`: `/img/Koru(Happy).PNG` → `/img/Aoba(Happy).png`
  - `angry`: `/img/Koru(Angry).PNG` → `/img/Aoba(Angry).png`
  - `sad`: `/img/Koru(Sad).PNG` → `/img/Aoba(Sad).png`
  - `surprise`: `/img/Koru(Surprise).PNG` → `/img/Aoba(Surprise).png`

### 2. vue-kuro/src/components/CharacterSelect.vue
- ✅ 修改角色选择界面显示名称：`Koru` → `Aoba`
- ✅ 修改角色头像路径：`/img/Koru.PNG` → `/img/Aoba(normal).png`

### 3. vue-kuro/src/App.vue
- ✅ 修复角色数据加载逻辑，根据 characterId 设置正确的角色数据
- ✅ 添加 Aoba 的默认角色数据（当服务器连接失败时使用）
- ✅ 修复表情图片映射，使其根据角色动态设置
- ✅ 在默认角色列表中添加 Aoba
- ✅ 添加页面路由逻辑，为 Aoba 创建独立聊天页面
- ✅ 修改 startChat 函数，根据角色ID跳转到不同页面
- ✅ 添加 currentPage 状态管理

### 4. vue-kuro/src/components/AobaChat.vue (新建)
- ✅ 创建 Aoba 的独立聊天组件
- ✅ 使用 Aoba 专用的头像和配置
- ✅ 明确指定 characterId: 'koru' 确保使用正确的角色配置
- ✅ 添加返回首页功能
- ✅ **完整复制 Kuro 页面的所有功能**：
  - ✅ 头像点击交互（随机回复）
  - ✅ 浮动小头像（可拖拽移动）
  - ✅ 回到顶部按钮
  - ✅ 情感分析和表情切换
  - ✅ 浮动聊天泡泡
  - ✅ 时间系统和问候语
  - ✅ 完整的动画效果和样式
  - ✅ 聊天记录本地存储（独立于 Kuro）
  - ✅ 响应式设计
  - ✅ 滚动检测和自动滚动

## 注意事项

### 未修改的内容（保持兼容性）
1. **角色 ID**：保持 `koru` 不变，确保 API 兼容性
2. **图片文件名**：保持 `/img/Koru.PNG` 等文件名不变
3. **代码中的引用**：保持 `koru` 作为角色 ID 不变

### 需要手动检查的内容
1. ✅ Aoba 图片文件已添加到 `/img/` 目录
2. ✅ 所有情感状态的图片都已更新路径

## 修改效果
- 用户界面中显示的角色名称：`Aoba`
- 角色对话中的自称：`Aoba`
- 背景故事中的角色名：`Aoba`
- 角色头像和情感图片：使用新的 Aoba 图片
- **Aoba 现在有独立的聊天页面**，完全避免与 Kuro 的配置冲突
- API 和代码兼容性：保持 `koru` ID 不变

## 测试建议
1. 启动应用，检查角色选择界面
2. 选择 Aoba 角色进行对话
3. 确认角色名称显示正确
4. 确认对话中角色自称正确 