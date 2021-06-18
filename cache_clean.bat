@echo off
call git clean -f
cd client
call npm cache clean --force
rmdir /s /q node_modules
rmdir /s /q out
del package-lock.json
cd ..
cd server
call npm cache clean --force
rmdir /s /q node_modules
rmdir /s /q out
del package-lock.json
cd ..

call npm cache clean --force
rmdir /s /q node_modules
del package-lock.json

call npm install
