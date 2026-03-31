@echo off
echo Staging all uncommitted changes...
git add .
echo Committing changes...
git commit -m "Save uncommitted changes before worktree move"
echo.
echo All set! Your workspace is now clean. You can retry your worktree move.
pause
