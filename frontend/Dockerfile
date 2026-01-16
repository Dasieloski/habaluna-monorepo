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

# CRÍTICO: Verificar que la ruta catch-all se generó en el build
# Buscar en routes-manifest.json o en la estructura de archivos
RUN echo "🔍 Verificando rutas generadas..." && \
    (cat /app/.next/routes-manifest.json 2>/dev/null | grep -i "reset-password" || echo "⚠️  Ruta no encontrada en routes-manifest") && \
    (ls -la /app/.next/server/app/auth/reset-password 2>/dev/null || echo "⚠️  Directorio de ruta no encontrado en server") && \
    (find /app/.next -name "*reset-password*" -type f 2>/dev/null | head -5 || echo "⚠️  No se encontraron archivos relacionados") && \
    echo "✅ Verificación completada"

# CRÍTICO: Verificar que la ruta catch-all se generó en el build
# Buscar en los logs del build si la ruta aparece
RUN echo "🔍 Verificando rutas generadas..." && \
    (grep -r "reset-password" /app/.next/routes-manifest.json 2>/dev/null || echo "⚠️  Ruta no encontrada en routes-manifest") && \
    (ls -la /app/.next/server/app/auth/reset-password 2>/dev/null || echo "⚠️  Directorio de ruta no encontrado") && \
    echo "✅ Verificación completada"

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# CRÍTICO: Copiar el directorio standalone completo manteniendo la estructura .next/standalone
# Esto permite que tanto CMD directo como npm start funcionen
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./.next/standalone
# CRÍTICO: Copiar .next/static al lugar correcto (dentro de standalone)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/standalone/.next/static
# CRÍTICO: Copiar public al lugar correcto (dentro de standalone)
COPY --from=builder --chown=nextjs:nodejs /app/public ./.next/standalone/public
# CRÍTICO: Copiar package.json para que npm start funcione
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
# CRÍTICO: Copiar node_modules del standalone (puede estar faltando)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/node_modules ./.next/standalone/node_modules

# Verificar que server.js existe después de copiar (falla el build si no existe)
RUN test -f /app/.next/standalone/server.js || (echo "❌ ERROR: server.js no existe después de copiar. Verifica que el build generó .next/standalone/server.js" && ls -la /app/.next/standalone/ 2>/dev/null || echo "Directorio .next/standalone no existe" && exit 1)

USER nextjs

EXPOSE 3000

ENV PORT 3000

# CRÍTICO: Cambiar al directorio standalone antes de ejecutar
# El servidor standalone de Next.js espera ejecutarse desde su propio directorio
# para que las rutas relativas funcionen correctamente
WORKDIR /app/.next/standalone

# Ejecutar el servidor standalone directamente
CMD ["node", "server.js"]

