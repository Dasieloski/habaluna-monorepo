FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json ./
# En workspaces, puede no haber package-lock.json en el subdirectorio
# Usar npm install en lugar de npm ci si no existe
RUN npm install --production=false

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# Build the application (esto ejecuta build + postbuild automáticamente)
RUN npm run build

# Verificar que el standalone se generó correctamente
RUN ls -la /app/.next/standalone/server.js || (echo "❌ ERROR: standalone/server.js no se generó" && exit 1)

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# CRÍTICO: Copiar el directorio standalone completo (incluye server.js y los assets copiados por postbuild)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# CRÍTICO: Copiar .next/static al lugar correcto dentro de standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# CRÍTICO: Copiar public al lugar correcto dentro de standalone  
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Verificar que server.js existe después de copiar (falla el build si no existe)
RUN test -f /app/server.js || (echo "❌ ERROR: server.js no existe después de copiar. Verifica que el build generó .next/standalone/server.js" && ls -la /app/ && exit 1)

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Ejecutar el servidor standalone directamente
CMD ["node", "server.js"]

