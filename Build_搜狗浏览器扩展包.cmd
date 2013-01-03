@echo off
cd /d "%~dp0"

copy src\*.js sogou\ /y
tools\7z.exe a  -tZIP sogou_extension.sext -y %~dp0sogou\*
