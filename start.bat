@echo off
for /f "delims== tokens=1,2" %%a in (.env) do (
  if not "%%a"=="" if not "%%b"=="" set "%%a=%%b"
)
if not exist uploads mkdir uploads
echo Starting Ghumo Global server...
node server\index.mjs
