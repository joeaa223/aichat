@echo off
echo Starting Vue.js + Node.js Application...
echo.

echo Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd server && npm run dev"

echo.
echo Starting Frontend Server (Port 5173)...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this launcher...
pause > nul 