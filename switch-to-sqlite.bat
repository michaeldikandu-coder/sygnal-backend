@echo off
echo 🔄 Switching to SQLite for development...

:: Backup current schema
copy prisma\schema.prisma prisma\schema-mongodb-backup.prisma

:: Switch to SQLite schema
copy prisma\schema-sqlite.prisma prisma\schema.prisma

:: Update environment
echo DATABASE_URL="file:./prisma/dev.db" > .env.local

echo ✅ Switched to SQLite!
echo.
echo Next steps:
echo 1. npm run prisma:generate
echo 2. npm run prisma:migrate
echo 3. npm run prisma:seed
echo 4. npm run start:dev
echo.
pause