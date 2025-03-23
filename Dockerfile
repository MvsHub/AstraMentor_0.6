# Estágio de build
FROM node:18-alpine AS builder

# Configuração do ambiente de trabalho
WORKDIR /app

# Instalação de dependências necessárias
RUN apk add --no-cache libc6-compat

# Copia os arquivos de configuração
COPY package.json package-lock.json* ./
COPY .npmrc ./

# Instala as dependências
RUN npm ci

# Copia o código fonte
COPY . .

# Constrói a aplicação
RUN npm run build

# Estágio de produção
FROM node:18-alpine AS runner
WORKDIR /app

# Define variáveis de ambiente para produção
ENV NODE_ENV production

# Adiciona um usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia os arquivos necessários do estágio de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Define o usuário para execução
USER nextjs

# Expõe a porta que a aplicação usará
EXPOSE 3000

# Define variável de ambiente para a porta
ENV PORT 3000

# Comando para iniciar a aplicação
CMD ["node", "server.js"]

