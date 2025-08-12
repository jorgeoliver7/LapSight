# Dockerfile simplificado para desarrollo
FROM node:16-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias con configuración legacy
RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Variables de entorno para deshabilitar ESLint
ENV DISABLE_ESLINT_PLUGIN=true
ENV TSC_COMPILE_ON_ERROR=true
ENV GENERATE_SOURCEMAP=false

# Comando de desarrollo
CMD ["npm", "start"]