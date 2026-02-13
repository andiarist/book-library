#!/bin/bash

# 🚀 Script de Inicio Rápido para Book Library
# Este script automatiza la configuración inicial del proyecto

set -e  # Exit on error

echo "📚 Bienvenido a Book Library Setup"
echo "=================================="
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "   Descárgalo desde: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Node.js versión 18 o superior requerida"
    echo "   Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Verificar/Instalar pnpm
if ! command -v pnpm &> /dev/null; then
    echo ""
    echo "📦 pnpm no está instalado. ¿Deseas instalarlo? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Instalando pnpm..."
        npm install -g pnpm
        echo "✅ pnpm instalado correctamente"
    else
        echo "❌ pnpm es requerido. Saliendo..."
        exit 1
    fi
else
    echo "✅ pnpm $(pnpm -v) detectado"
fi

echo ""
echo "📥 Instalando dependencias..."
pnpm install

echo ""
echo "🔧 Configuración de variables de entorno..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Archivo .env creado desde .env.example"
        echo ""
        echo "⚠️  IMPORTANTE: Edita el archivo .env y añade tu Google Books API Key"
        echo "   Obtén tu key en: https://console.cloud.google.com/apis/credentials"
        echo ""
    fi
else
    echo "✅ Archivo .env ya existe"
fi

echo ""
echo "🧪 Ejecutando verificaciones..."
pnpm type-check
pnpm lint
echo "✅ Verificaciones completadas"

echo ""
echo "======================================"
echo "✅ ¡Configuración completada!"
echo "======================================"
echo ""
echo "🚀 Comandos disponibles:"
echo ""
echo "   pnpm dev          - Iniciar servidor de desarrollo"
echo "   pnpm test         - Ejecutar tests"
echo "   pnpm test:ui      - Tests con interfaz visual"
echo "   pnpm build        - Build de producción"
echo ""
echo "📖 Documentación:"
echo ""
echo "   README.md         - Documentación general"
echo "   PNPM_GUIDE.md     - Guía de pnpm"
echo "   DEVELOPMENT.md    - Guía de desarrollo"
echo ""
echo "Para empezar, ejecuta: pnpm dev"
echo ""
