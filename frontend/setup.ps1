# 🚀 Script de Inicio Rápido para Book Library (Windows)
# Este script automatiza la configuración inicial del proyecto

$ErrorActionPreference = "Stop"

Write-Host "📚 Bienvenido a Book Library Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = (node -v) -replace 'v', '' -split '\.' | Select-Object -First 1
    if ([int]$nodeVersion -lt 18) {
        Write-Host "⚠️  Node.js versión 18 o superior requerida" -ForegroundColor Yellow
        Write-Host "   Versión actual: $(node -v)" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Node.js $(node -v) detectado" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "   Descárgalo desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar/Instalar pnpm
try {
    $pnpmVersion = pnpm -v
    Write-Host "✅ pnpm $pnpmVersion detectado" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "📦 pnpm no está instalado. ¿Deseas instalarlo? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'S' -or $response -eq 's') {
        Write-Host "Instalando pnpm..." -ForegroundColor Cyan
        npm install -g pnpm
        Write-Host "✅ pnpm instalado correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ pnpm es requerido. Saliendo..." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📥 Instalando dependencias..." -ForegroundColor Cyan
pnpm install

Write-Host ""
Write-Host "🔧 Configuración de variables de entorno..." -ForegroundColor Cyan
if (-not (Test-Path .env)) {
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✅ Archivo .env creado desde .env.example" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANTE: Edita el archivo .env y añade tu Google Books API Key" -ForegroundColor Yellow
        Write-Host "   Obtén tu key en: https://console.cloud.google.com/apis/credentials" -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "✅ Archivo .env ya existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "🧪 Ejecutando verificaciones..." -ForegroundColor Cyan
pnpm type-check
pnpm lint
Write-Host "✅ Verificaciones completadas" -ForegroundColor Green

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ ¡Configuración completada!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Comandos disponibles:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   pnpm dev          - Iniciar servidor de desarrollo" -ForegroundColor White
Write-Host "   pnpm test         - Ejecutar tests" -ForegroundColor White
Write-Host "   pnpm test:ui      - Tests con interfaz visual" -ForegroundColor White
Write-Host "   pnpm build        - Build de producción" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentación:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   README.md         - Documentación general" -ForegroundColor White
Write-Host "   PNPM_GUIDE.md     - Guía de pnpm" -ForegroundColor White
Write-Host "   DEVELOPMENT.md    - Guía de desarrollo" -ForegroundColor White
Write-Host ""
Write-Host "Para empezar, ejecuta: pnpm dev" -ForegroundColor Yellow
Write-Host ""
