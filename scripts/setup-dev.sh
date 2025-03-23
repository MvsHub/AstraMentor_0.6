#!/bin/bash

# Script para configurar o ambiente de desenvolvimento do AstraMentor
# Uso: ./scripts/setup-dev.sh

echo "Configurando ambiente de desenvolvimento para AstraMentor..."

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Node.js não encontrado. Por favor, instale o Node.js v18 ou superior."
    exit 1
fi

# Verifica a versão do Node.js
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Versão do Node.js muito antiga. Por favor, atualize para v18 ou superior."
    exit 1
fi

# Instala as dependências
echo "Instalando dependências..."
npm install

# Verifica se o arquivo .env.local existe
if [ ! -f .env.local ]; then
    echo "Criando arquivo .env.local..."
    cp .env.example .env.local
    echo "Por favor, edite o arquivo .env.local com suas credenciais do Supabase."
fi

# Executa o setup do Supabase (se necessário)
if command -v supabase &> /dev/null; then
    echo "Configurando Supabase local..."
    supabase init
    echo "Para iniciar o Supabase local, execute: supabase start"
else
    echo "CLI do Supabase não encontrado. Para desenvolvimento local com Supabase, instale a CLI:"
    echo "npm install -g supabase"
fi

echo "Ambiente de desenvolvimento configurado com sucesso!"
echo "Para iniciar o servidor de desenvolvimento, execute: npm run dev"

