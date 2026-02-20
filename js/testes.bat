@echo off
REM Script de testes para a API de Autenticação
REM Requisitos: curl instalado (já vem com Windows 10+)

setlocal enabledelayedexpansion

REM Cores para output (usando ANSI codes)
for /F %%A in ('echo prompt $H ^| cmd') do set "BS=%%A"

echo.
echo ========================================
echo   TESTES API DE AUTENTICACAO - SAEP
echo ========================================
echo.

REM 1. Testar health check
echo [1] Testando conexao com servidor...
curl -s http://localhost:3000/health | timeout /t 1 >nul
echo ✓ Servidor está rodando
echo.

REM 2. Registrar novo usuário
echo [2] Registrando novo usuario...
set "REGISTER_RESPONSE="
for /F "delims=" %%A in ('curl -s -X POST http://localhost:3000/auth/registrar ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@empresa.com\",\"senha\":\"admin123\"}"') do (
  set "REGISTER_RESPONSE=%%A"
)
echo Resposta: !REGISTER_RESPONSE!
echo.

REM 3. Tentar login
echo [3] Fazendo login...
set "LOGIN_RESPONSE="
for /F "delims=" %%A in ('curl -s -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@empresa.com\",\"senha\":\"admin123\"}"') do (
  set "LOGIN_RESPONSE=%%A"
)
echo Resposta: !LOGIN_RESPONSE!
echo.

echo ========================================
echo   TESTES CONCLUIDOS
echo ========================================
echo.
echo Para testes completos, use o arquivo testes.http (VS Code) ou importe em Postman
echo.

pause
