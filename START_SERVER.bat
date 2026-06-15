@echo off
cd /d "%~dp0server"
npm install
node server.js
pause