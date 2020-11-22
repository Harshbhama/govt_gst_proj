@echo off
cd /d ../
echo "Data Migration Service Started. Please wait for few seconds!" & echo.
(cmd.exe /C .\nodejs\node.exe .\service\upgradeService.js) 

