@echo off
FOR /F "tokens=5 delims= " %%P IN ('netstat -a -n -o ^| findstr :2010.*LISTENING') DO TaskKill.exe /PID %%P /F
FOR /F "tokens=4 delims= " %%P IN ('netstat -a -n -o ^| findstr :2010.*LISTENING') DO TaskKill.exe /PID %%P /F
