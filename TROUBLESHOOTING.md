# 故障排除指南

## 端口占用问题 (EADDRINUSE)

### 问题描述
启动服务器时出现错误：`Error: listen EADDRINUSE: address already in use :::3001`

### 解决方案

#### 方案 1：使用新端口（推荐）
我们已经将默认端口从 3001 更改为 3002。

**启动服务器：**
```bash
cd vue-kuro/server
node server.js
```

**访问地址：**
- 后端 API: http://localhost:3002
- 前端应用: http://localhost:5173 (默认 Vite 端口)

#### 方案 2：查找并关闭占用端口的进程

**Windows PowerShell:**
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3001

# 根据 PID 关闭进程
taskkill /PID <进程ID> /F
```

**Windows 命令提示符:**
```cmd
# 查找占用端口的进程
netstat -ano | findstr :3001

# 根据 PID 关闭进程
taskkill /PID <进程ID> /F
```

#### 方案 3：修改端口配置

如果需要使用其他端口，可以：

1. 修改 `vue-kuro/server/server.js` 中的端口号
2. 修改前端代码中的 API 地址
3. 更新启动脚本中的端口信息

### 启动脚本

我们提供了多个启动脚本：

- `start-backend.bat` - 启动后端服务器
- `start-app.bat` - 启动前端应用
- `start-kuro.bat` - 启动完整应用
- `start-server.bat` - 新的服务器启动脚本（包含错误处理）

### 常见问题

1. **端口仍然被占用**
   - 重启计算机
   - 使用不同的端口号
   - 检查防火墙设置

2. **依赖问题**
   ```bash
   cd vue-kuro/server
   npm install
   ```

3. **Node.js 版本问题**
   - 确保使用 Node.js 16+ 版本
   - 运行 `node --version` 检查版本

### 健康检查

启动服务器后，可以访问以下地址进行健康检查：
- http://localhost:3002/health
- http://localhost:3002/api/test

### 联系支持

如果问题仍然存在，请检查：
1. Node.js 版本
2. 网络连接
3. 防火墙设置
4. 系统权限 