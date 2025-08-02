@echo off
echo 🚀 启动 AI 聊天应用...
echo.

echo 📦 检查依赖...
cd server
if not exist node_modules (
    echo 安装后端依赖...
    npm install
)
cd ..

if not exist node_modules (
    echo 安装前端依赖...
    npm install
)

echo.
echo 🔧 启动后端服务器...
start "Backend Server" cmd /k "cd server && npm run dev"

echo ⏳ 等待后端启动...
timeout /t 3 /nobreak > nul

echo.
echo 🌐 启动前端服务器...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ 应用启动完成！
echo 📱 前端地址: http://localhost:5173
echo 🔧 后端地址: http://localhost:3001
echo.
echo 💡 提示：关闭此窗口不会停止服务器
pause 