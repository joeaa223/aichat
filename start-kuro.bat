@echo off
echo ========================================
echo    Kuro AI Cat Chat Application
echo ========================================
echo.
echo 正在启动 Kuro 聊天应用...
echo.

echo 1. 启动后端服务器 (端口 3001)...
start "Kuro Backend" cmd /k "cd server && npm run dev"

echo.
echo 2. 等待后端启动...
timeout /t 3 /nobreak > nul

echo.
echo 3. 启动前端服务器 (端口 5173)...
start "Kuro Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo 应用启动完成！
echo.
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:3001
echo.
echo 按任意键关闭此窗口...
echo ========================================
pause > nul 