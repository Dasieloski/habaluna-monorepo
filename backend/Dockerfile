FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para sharp
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar solo archivos de dependencias primero (mejor cacheo)
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (sharp se compilará aquí, puede tardar 5-10 min)
# Usar npm ci si package-lock.json existe y está sincronizado, sino npm install
# --prefer-offline para usar cache si está disponible
RUN if [ -f package-lock.json ]; then \
      npm ci --prefer-offline --no-audit || npm install --prefer-offline --no-audit; \
    else \
      npm install --prefer-offline --no-audit; \
    fi

# Copiar código fuente después (para mejor cacheo de dependencias)
COPY . .

# Build y generar Prisma Client
RUN npm run build && npx prisma generate

FROM node:18-bullseye-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

# Copiar scripts de inicio
COPY start.sh start-dev.sh ./
RUN chmod +x start.sh start-dev.sh

CMD ["./start.sh"]

