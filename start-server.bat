@echo off
echo 正在启动 Kuro 服务器...
echo.

cd /d "%~dp0server"

echo 检查端口 3002 是否可用...
netstat -ano | findstr ":3002" >nul
if %errorlevel% equ 0 (
    echo 警告: 端口 3002 可能被占用
    echo 正在尝试启动服务器...
    echo.
) else (
    echo 端口 3002 可用
    echo.
)

echo 启动 Node.js 服务器...
node server.js

if %errorlevel% neq 0 (
    echo.
    echo 服务器启动失败！
    echo 可能的解决方案：
    echo 1. 确保已安装 Node.js
    echo 2. 运行 npm install 安装依赖
    echo 3. 检查端口是否被占用
    echo 4. 尝试修改端口号
    echo.
    pause
) else (
    echo.
    echo 服务器已成功启动！
    echo 访问地址: http://localhost:3002
    echo.
) 