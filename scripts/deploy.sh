#!/bin/bash

# Script para deploy da aplicação AstraMentor
# Uso: ./scripts/deploy.sh [ambiente]
# Exemplo: ./scripts/deploy.sh production

# Verifica se o ambiente foi especificado
if [ -z "$1" ]; then
  echo "Por favor, especifique o ambiente (development, staging, production)"
  exit 1
fi

ENVIRONMENT=$1

# Configurações específicas para cada ambiente
case $ENVIRONMENT in
  development)
    VERCEL_FLAGS="--dev"
    ;;
  staging)
    VERCEL_FLAGS="--staging"
    ;;
  production)
    VERCEL_FLAGS="--prod"
    ;;
  *)
    echo "Ambiente inválido. Use development, staging ou production."
    exit 1
    ;;
esac

# Executa o build
echo "Construindo a aplicação para o ambiente $ENVIRONMENT..."
npm run build

# Deploy para Vercel
echo "Realizando deploy para o ambiente $ENVIRONMENT..."
npx vercel deploy $VERCEL_FLAGS

echo "Deploy concluído com sucesso!"

