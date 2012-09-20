@echo off
cd /d "%~dp0"

if not exist mxaddon\icons md mxaddon\icons
xcopy src\icons mxaddon\icons /y
copy def.json mxaddon\ /y
copy src\12306* mxaddon\ /y
tools\mxpacker %~dp0mxaddon

