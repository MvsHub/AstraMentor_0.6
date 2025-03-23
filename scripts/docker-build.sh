#!/bin/bash

# Script para construir e executar o Docker da aplicação AstraMentor
# Uso: ./scripts/docker-build.sh [dev|prod]

# Verifica se o modo foi especificado
if [ -z "$1" ]; then
  echo "Por favor, especifique o modo (dev ou prod)"
  exit 1
fi

MODE=$1

# Configurações específicas para cada modo
case $MODE in
  dev)
    echo "Construindo e executando em modo de desenvolvimento..."
    docker-compose up --build
    ;;
  prod)
    echo "Construindo imagem de produção..."
    docker build -t astramentor:latest .
    
    echo "Executando container de produção..."
    docker run -p 3000:3000 \
      -e NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
      -e NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
      astramentor:latest
    ;;
  *)
    echo "Modo inválido. Use dev ou prod."
    exit 1
    ;;
esac

