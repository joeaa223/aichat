@echo off
echo 🔧 启动后端服务器...
echo.

cd server

echo 📦 检查依赖...
if not exist node_modules (
    echo 安装后端依赖...
    npm install
)

echo.
echo 🚀 启动后端服务器...
echo 📡 服务器地址: http://localhost:3001
echo.

npm run dev

pause 