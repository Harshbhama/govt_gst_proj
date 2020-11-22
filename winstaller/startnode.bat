@echo off
cmd /c stopnode.bat
cd /d ../ 
.\nodejs\node.exe app.js
exit