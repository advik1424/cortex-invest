@echo off
echo ========================================================
echo   Starting Cortex Invest - Spring Boot Backend (Port 8080)
echo ========================================================
cd /d "%~dp0backend"
java -jar target\cortex-invest-0.0.1-SNAPSHOT.jar
pause
