FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache git

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código da aplicação
COPY . .

# Expor porta do Vite (padrão 5173)
EXPOSE 5173

# Comando padrão (pode ser sobrescrito no docker-compose)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
