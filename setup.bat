@echo off
echo 🚀 Setting up Sygnal Backend...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected

:: Install dependencies
echo 📦 Installing dependencies...
npm install

:: Copy environment file
if not exist .env (
    echo 📋 Creating .env file...
    copy .env.example .env
    echo ⚠️  Please update .env with your database and Redis credentials
)

:: Generate Prisma client
echo 🔧 Generating Prisma client...
npm run prisma:generate

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Update .env with your database credentials
echo 2. Run: npm run prisma:migrate
echo 3. Run: npm run prisma:seed
echo 4. Run: npm run start:dev
echo.
echo 🎉 Happy coding!
pause