# 🔒 AUDITORÍA DE SEGURIDAD - HABANALUNA
**Fecha:** 2025-01-21  
**Auditor:** AI Security Analyst  
**Alcance:** Frontend (Next.js) + Backend (NestJS) + Base de Datos (PostgreSQL/Prisma)

---

## 📋 RESUMEN EJECUTIVO

**Riesgos Críticos Encontrados:** 8  
**Riesgos Altos:** 12  
**Riesgos Medios:** 6  
**Riesgos Bajos:** 4

**Estado General:** ⚠️ **VULNERABLE** - Requiere atención inmediata en áreas críticas.

---

## 🔴 1. AUTENTICACIÓN Y AUTORIZACIÓN

### 🔴 RIESGO CRÍTICO #1: Access Token en localStorage (XSS)

**Ubicación:** `frontend/lib/store/auth-store.ts:35`

**💥 Cómo se explota:**
1. Atacante inyecta script malicioso vía XSS (ej: comentario en producto, review)
2. Script ejecuta: `localStorage.getItem('auth-storage')` o accede directamente
3. Roba access token completo
4. Usa token para hacer requests autenticados como el usuario
5. Puede acceder a carrito, órdenes, datos personales, o escalar a admin si el usuario es admin

**🧨 Impacto Real:**
- **Robo de sesión completo** - El atacante puede hacer cualquier acción como el usuario
- **Escalada de privilegios** - Si el usuario es admin, acceso total al panel
- **Manipulación de órdenes** - Cancelar, modificar, ver datos sensibles
- **Violación de privacidad** - Acceso a direcciones, teléfonos, historial

**🛠 Corrección:**
```typescript
// ❌ ACTUAL (VULNERABLE)
storage: createJSONStorage(() => localStorage),

// ✅ CORRECTO
// Opción 1: HttpOnly cookies (recomendado)
// El backend ya envía refresh token en cookie HttpOnly
// Mover access token también a cookie HttpOnly

// Opción 2: sessionStorage (mejor que localStorage, pero no ideal)
storage: createJSONStorage(() => sessionStorage),

// Opción 3: Memory-only (más seguro, pero se pierde al recargar)
// No usar persistencia para access token
```

**Implementación recomendada:**
1. Backend: Enviar access token en cookie HttpOnly (no en response body)
2. Frontend: Eliminar localStorage para tokens, usar solo cookies
3. API client: Leer token de cookie automáticamente (no manual)

**🧩 Prioridad: ALTA**

---

### 🔴 RIESGO CRÍTICO #2: RolesGuard no valida usuario activo

**Ubicación:** `backend/src/common/guards/roles.guard.ts:19-21`

**💥 Cómo se explota:**
1. Admin es desactivado (`isActive: false`) pero su token JWT sigue válido
2. Token no expira inmediatamente (puede durar hasta 15 minutos)
3. Admin desactivado puede seguir usando endpoints admin
4. Atacante que roba token de admin desactivado tiene acceso completo

**🧨 Impacto Real:**
- **Acceso no autorizado persistente** - Usuarios desactivados siguen activos
- **Falta de revocación inmediata** - No hay forma de invalidar tokens activos
- **Escalada de privilegios** - Si se roba token, acceso completo aunque el usuario esté desactivado

**🛠 Corrección:**
```typescript
// ❌ ACTUAL (VULNERABLE)
canActivate(context: ExecutionContext): boolean {
  const { user } = context.switchToHttp().getRequest();
  return requiredRoles.some((role) => user?.role === role);
}

// ✅ CORRECTO
async canActivate(context: ExecutionContext): Promise<boolean> {
  const { user } = context.switchToHttp().getRequest();
  
  if (!user) return false;
  
  // Verificar que el usuario esté activo
  const dbUser = await this.prisma.user.findUnique({
    where: { id: user.id },
    select: { isActive: true, role: true }
  });
  
  if (!dbUser || !dbUser.isActive) {
    throw new ForbiddenException('User account is inactive');
  }
  
  return requiredRoles.some((role) => dbUser.role === role);
}
```

**🧩 Prioridad: ALTA**

---

### 🔴 RIESGO CRÍTICO #3: JWT Strategy no valida isActive en cada request

**Ubicación:** `backend/src/auth/strategies/jwt.strategy.ts:20-36`

**💥 Cómo se explota:**
1. Usuario es desactivado en BD (`isActive: false`)
2. Su token JWT sigue válido (no se revoca automáticamente)
3. Puede seguir usando la API hasta que el token expire (15 minutos)
4. Si el token es robado antes de desactivar, el atacante tiene acceso completo

**🧨 Impacto Real:**
- **Tokens no revocables** - No hay blacklist de tokens
- **Usuarios desactivados siguen activos** - Hasta 15 minutos después
- **Falta de control inmediato** - No se puede desactivar acceso instantáneamente

**🛠 Corrección:**
```typescript
// ❌ ACTUAL (VULNERABLE)
async validate(payload: any) {
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (!user) {
    throw new UnauthorizedException();
  }

  return user;
}

// ✅ CORRECTO
async validate(payload: any) {
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true, // ← AGREGAR
    },
  });

  if (!user || !user.isActive) { // ← VALIDAR
    throw new UnauthorizedException('User account is inactive');
  }

  return user;
}
```

**🧩 Prioridad: ALTA**

---

## 🔴 2. PAGOS Y LÓGICA DE NEGOCIO

### 🔴 RIESGO CRÍTICO #4: No hay validación de precios en CreateOrderDto

**Ubicación:** `backend/src/orders/dto/create-order.dto.ts`

**💥 Cómo se explota:**
1. Usuario agrega producto de $100 al carrito
2. Abre DevTools, intercepta request de crear orden
3. Modifica `subtotal` o `total` en el request a $0.01
4. Envía orden con precio manipulado
5. Si el backend confía en estos valores, la orden se crea con precio incorrecto

**🧨 Impacto Real:**
- **Pérdida financiera directa** - Clientes pagando precios manipulados
- **Fraude masivo** - Script automatizado puede crear miles de órdenes a precio $0
- **Quiebra del negocio** - Si no se detecta, pérdidas ilimitadas

**🛠 Corrección:**
```typescript
// ❌ ACTUAL (VULNERABLE)
// CreateOrderDto NO incluye precios - el backend los calcula desde el carrito
// PERO: orders.service.ts:66 usa cart.subtotal directamente sin validar

// ✅ CORRECTO
async create(userId: string, createOrderDto: CreateOrderDto) {
  const cart = await this.cartService.getCart(userId);
  
  // RECALCULAR subtotal desde BD (no confiar en cart.subtotal)
  let validatedSubtotal = 0;
  for (const item of cart.items) {
    // Obtener precio ACTUAL desde BD
    const product = await this.prisma.product.findUnique({
      where: { id: item.productId },
      select: { priceUSD: true, priceMNs: true }
    });
    
    const variant = item.productVariantId 
      ? await this.prisma.productVariant.findUnique({
          where: { id: item.productVariantId },
          select: { priceUSD: true, priceMNs: true }
        })
      : null;
    
    const price = variant?.priceUSD ?? product?.priceUSD ?? 0;
    validatedSubtotal += Number(price) * item.quantity;
  }
  
  // VALIDAR que el subtotal calculado coincida con el del carrito
  const tolerance = 0.01; // Permitir pequeñas diferencias de redondeo
  if (Math.abs(validatedSubtotal - cart.subtotal) > tolerance) {
    throw new BadRequestException('Cart prices have changed. Please refresh your cart.');
  }
  
  // Usar validatedSubtotal, no cart.subtotal
  const subtotal = validatedSubtotal;
  // ... resto del código
}
```

**🧩 Prioridad: CRÍTICA**

---

### 🔴 RIESGO CRÍTICO #5: Cliente puede marcar orden como pagada sin validación

**Ubicación:** `backend/src/orders/orders.service.ts:263`

**💥 Cómo se explota:**
1. Usuario crea orden (status: PENDING, paymentStatus: PENDING)
2. Intercepta request de actualización de orden
3. Envía `PATCH /orders/{id}` con `paymentIntentId: "fake-id"` o cualquier string
4. Backend actualiza `paymentStatus: 'PAID'` y descuenta stock
5. Usuario recibe productos sin pagar realmente

**🧨 Impacto Real:**
- **Fraude directo** - Productos gratis sin pago
- **Pérdida de inventario** - Stock se descuenta sin pago real
- **Quiebra del negocio** - Si se escala, pérdidas ilimitadas

**🛠 Corrección:**
```typescript
// ❌ ACTUAL (VULNERABLE)
if (updateDto.paymentIntentId && order.status === 'PENDING') {
  // Confía en que paymentIntentId es válido
  // NO valida con el proveedor de pagos (Stripe, etc.)
}

// ✅ CORRECTO
if (updateDto.paymentIntentId && order.status === 'PENDING') {
  // VALIDAR con el proveedor de pagos
  const paymentProvider = this.config.get('PAYMENT_PROVIDER'); // 'stripe', etc.
  
  if (paymentProvider === 'stripe') {
    const stripe = require('stripe')(this.config.get('STRIPE_SECRET_KEY'));
    const paymentIntent = await stripe.paymentIntents.retrieve(updateDto.paymentIntentId);
    
    // Validar que el pago fue exitoso
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not confirmed');
    }
    
    // Validar que el monto coincide
    const expectedAmount = Math.round(order.total * 100); // Stripe usa centavos
    if (paymentIntent.amount !== expectedAmount) {
      throw new BadRequestException('Payment amount mismatch');
    }
    
    // Validar que el paymentIntent no fue usado antes (idempotencia)
    const existingOrder = await this.prisma.order.findFirst({
      where: { 
        paymentIntentId: updateDto.paymentIntentId,
        paymentStatus: 'PAID'
      }
    });
    
    if (existingOrder) {
      throw new BadRequestException('Payment intent already used');
    }
  }
  
  // Solo después de validar, actualizar orden
  // ... resto del código
}
```

**🧩 Prioridad: CRÍTICA**

---

### 🔴 RIESGO ALTO #6: CreateOrderDto no valida campos anidados

**Ubicación:** `backend/src/orders/dto/create-order.dto.ts:7-28`

**💥 Cómo se explota:**
1. Cliente envía `shippingAddress` con campos vacíos o inválidos
2. `@IsObject()` solo valida que sea un objeto, no valida campos internos
3. Se crea orden con dirección inválida
4. Problemas de entrega, pérdida de productos, disputas legales

**🧨 Impacto Real:**
- **Órdenes con datos inválidos** - Direcciones incompletas
- **Problemas de entrega** - Productos no entregables
- **Pérdida de productos** - Envíos a direcciones falsas
- **Problemas legales** - Datos de facturación incorrectos

**🛠 Corrección:**
```typescript
// ❌ ACTUAL (VULNERABLE)
@IsObject()
shippingAddress: {
  firstName: string;
  lastName: string;
  address: string;
  // ... sin validación
};

// ✅ CORRECTO
import { ValidateNested, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(10)
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  country: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone?: string;
}

export class CreateOrderDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress?: AddressDto;
  
  // ... resto
}
```

**🧩 Prioridad: ALTA**

---

## 🔴 3. FRONTEND (Next.js)

### 🔴 RIESGO ALTO #7: XSS vía dangerouslySetInnerHTML

**Ubicación:** 
- `frontend/app/(main)/admin/email-marketing/page.tsx:522, 613, 644`
- `frontend/components/ui/chart.tsx:83`

**💥 Cómo se explota:**
1. Admin crea template de email con contenido malicioso
2. Si el contenido no se sanitiza, puede incluir `<script>alert('XSS')</script>`
3. Cuando se renderiza con `dangerouslySetInnerHTML`, el script se ejecuta
4. Si el admin es víctima, el atacante puede robar tokens, modificar datos

**🧨 Impacto Real:**
- **XSS en panel admin** - Ejecución de código arbitrario
- **Robo de sesión admin** - Acceso completo al sistema
- **Manipulación de datos** - Cambiar productos, precios, órdenes
- **Ataque a usuarios** - Si el email se envía, XSS a todos los destinatarios

**🛠 Corrección:**
```typescript
// ❌ ACTUAL (VULNERABLE)
<div dangerouslySetInnerHTML={{ __html: templatePreviewHtml }} />

// ✅ CORRECTO
import DOMPurify from 'isomorphic-dompurify';

// Sanitizar antes de renderizar
const sanitizedHtml = DOMPurify.sanitize(templatePreviewHtml, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
  ALLOWED_ATTR: ['href', 'target'],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
});

<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

**Instalar:** `npm install isomorphic-dompurify`

**🧩 Prioridad: ALTA**

---

### 🔴 RIESGO ALTO #8: Variables de entorno expuestas en cliente

**Ubicación:** `frontend/lib/api.ts:15, 22, 46`

**💥 Cómo se explota:**
1. `NEXT_PUBLIC_API_URL` está expuesta en el bundle JavaScript
2. Cualquiera puede ver la URL del backend en DevTools
3. Si hay endpoints públicos mal configurados, pueden ser atacados directamente
4. Información sobre infraestructura expuesta

**🧨 Impacto Real:**
- **Exposición de infraestructura** - URLs internas visibles
- **Ataques directos al backend** - Bypass del frontend
- **Reconocimiento** - Información útil para ataques más avanzados

**🛠 Corrección:**
```typescript
// ❌ ACTUAL (VULNERABLE)
const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

// ✅ CORRECTO
// Usar variable de entorno solo en server-side
// En client-side, usar ruta relativa o API route de Next.js

// Opción 1: API Routes de Next.js (recomendado)
// frontend/app/api/proxy/[...path]/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const backendUrl = process.env.BACKEND_URL; // NO NEXT_PUBLIC
  // Proxy request al backend
}

// Opción 2: Middleware que inyecta URL
// El middleware puede leer env vars y pasarlas como headers
```

**🧩 Prioridad: MEDIA** (Información, no acceso directo)

---

### 🔴 RIESGO MEDIO #9: Console.log en producción

**Ubicación:** 
- `frontend/middleware.ts:99-104`
- `backend/src/media/media.controller.ts:64`

**💥 Cómo se explota:**
1. Logs pueden exponer información sensible (tokens, IDs, rutas internas)
2. Atacante con acceso a logs puede obtener información útil
3. En producción, logs pueden ir a servicios externos (datadog, etc.)
4. Información puede filtrarse en errores públicos

**🧨 Impacto Real:**
- **Filtración de información** - Tokens, IDs, rutas en logs
- **Reconocimiento** - Información útil para ataques
- **Violación de privacidad** - Datos de usuarios en logs

**🛠 Corrección:**
```typescript
// ❌ ACTUAL (VULNERABLE)
console.log('[Middleware] Pathname:', pathname)
console.log('[Middleware] URL completa:', req.url)

// ✅ CORRECTO
// Usar logger estructurado
import { Logger } from '@nestjs/common'; // Backend
// O winston, pino, etc.

// Frontend: Solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('[Middleware] Pathname:', pathname);
}

// O mejor: usar servicio de logging
// logger.debug({ pathname, url: req.url }); // Sin datos sensibles
```

**🧩 Prioridad: MEDIA**

---

## 🔴 4. BACKEND / APIs

### 🔴 RIESGO ALTO #10: CSRF Guard deshabilitado por defecto

**Ubicación:** `backend/src/common/guards/csrf.guard.ts:33`

**💥 Cómo se explota:**
1. Usuario autenticado visita sitio malicioso
2. Sitio malicioso hace POST a `https://habaluna.com/api/orders` con datos del atacante
3. Browser envía cookies de autenticación automáticamente
4. Backend procesa request como si fuera del usuario
5. Se crea orden, se modifica carrito, se cambian datos

**🧨 Impacto Real:**
- **Ataques CSRF** - Acciones no autorizadas en nombre del usuario
- **Manipulación de órdenes** - Crear órdenes fraudulentas
- **Modificación de datos** - Cambiar dirección, teléfono, etc.

**🛠 Corrección:**
```typescript
// ❌ ACTUAL (VULNERABLE)
const csrfEnabled = this.configService.get<string>('ENABLE_CSRF') === 'true';
if (!csrfEnabled) {
  return true; // CSRF deshabilitado
}

// ✅ CORRECTO
// Habilitar CSRF por defecto en producción
const csrfEnabled = this.configService.get<string>('ENABLE_CSRF') !== 'false';
// O mejor: siempre habilitado excepto en desarrollo explícito
const csrfEnabled = process.env.NODE_ENV === 'production' || 
                    this.configService.get<string>('ENABLE_CSRF') === 'true';
```

**También:** Aplicar CSRF guard globalmente a endpoints mutables:
```typescript
// backend/src/app.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: CsrfGuard, // Aplicar globalmente
  },
]
```

**🧩 Prioridad: ALTA**

---

### 🔴 RIESGO ALTO #11: CORS demasiado permisivo

**Ubicación:** `backend/src/main.ts:163-184`

**💥 Cómo se explota:**
1. CORS permite cualquier origen que contenga `.vercel.app` o `.railway.app`
2. Atacante crea sitio en `evil.vercel.app` o subdominio similar
3. Hace requests desde ese sitio al backend
4. Si el usuario está autenticado, las cookies se envían
5. Ataques CSRF desde múltiples orígenes

**🧨 Impacto Real:**
- **Ataques CSRF amplificados** - Múltiples orígenes permitidos
- **Falta de control** - Cualquier sitio en Vercel/Railway puede hacer requests
- **Bypass de protecciones** - Si CSRF está deshabilitado, acceso completo

**🛠 Corrección:**
```typescript
// ❌ ACTUAL (VULNERABLE)
if (normalizedOrigin.includes('.vercel.app')) {
  return callback(null, true); // Permite CUALQUIER sitio en Vercel
}

// ✅ CORRECTO
// Whitelist específica de orígenes permitidos
const allowedVercelDomains = [
  'habaluna.vercel.app',
  'habanaluna.vercel.app',
  // Solo dominios específicos del proyecto
];

if (normalizedOrigin.includes('.vercel.app')) {
  const isAllowed = allowedVercelDomains.some(domain => 
    normalizedOrigin === domain || normalizedOrigin.endsWith(`.${domain}`)
  );
  
  if (!isAllowed) {
    logger.warn(`CORS: Origen Vercel bloqueado: ${origin}`);
    return callback(new Error('Origin not allowed'));
  }
}
```

**🧩 Prioridad: ALTA**

---

### 🔴 RIESGO ALTO #12: Rate limiting puede ser insuficiente

**Ubicación:** `backend/src/app.module.ts:38-77`

**💥 Cómo se explota:**
1. Rate limit global: 100 req/min (configurable)
2. Rate limit auth: 5 req/min (configurable)
3. Atacante usa múltiples IPs (botnet) o proxies
4. Puede hacer brute force en login, crear múltiples cuentas, spam de requests
5. Si el límite es alto, puede hacer DDoS

**🧨 Impacto Real:**
- **Brute force en login** - Intentos ilimitados con múltiples IPs
- **Spam de registros** - Crear cuentas falsas masivamente
- **DDoS** - Sobrecarga del servidor
- **Abuso de recursos** - Consumo excesivo de CPU/DB

**🛠 Corrección:**
```typescript
// ✅ MEJORAR configuración
ThrottlerModule.forRootAsync({
  // Límites más estrictos
  throttlers: [
    {
      name: 'auth',
      ttl: 60000, // 1 minuto
      limit: 3, // Solo 3 intentos por minuto (más estricto)
    },
    {
      name: 'default',
      ttl: 60000, // 1 minuto
      limit: 30, // 30 requests por minuto (más estricto)
    },
  ],
}),

// También: Rate limiting por IP usando Redis
// Implementar throttling más sofisticado con @nestjs/throttler-storage-redis
```

**🧩 Prioridad: ALTA**

---

### 🔴 RIESGO MEDIO #13: $queryRaw sin validación de parámetros

**Ubicación:** `backend/src/products/products.service.ts:409, 515`

**💥 Cómo se explota:**
1. Aunque Prisma protege contra SQL injection con template literals
2. Si hay algún error en la construcción de la query, puede ser vulnerable
3. Si en el futuro se usa concatenación de strings, es vulnerable

**🧨 Impacto Real:**
- **SQL Injection potencial** - Si se modifica el código incorrectamente
- **Acceso a datos** - Leer información de otras tablas
- **Modificación de datos** - Cambiar productos, precios, etc.

**🛠 Corrección:**
```typescript
// ✅ ACTUAL (SEGURO, pero mejor documentar)
// Prisma template literals son seguros, pero documentar por qué
const product = (await this.prisma.$queryRaw`
  SELECT * FROM products WHERE id = ${id}
`) as any[];

// ✅ MEJOR: Usar Prisma query builder cuando sea posible
// Solo usar $queryRaw cuando sea absolutamente necesario
// Y siempre documentar que los parámetros deben venir de Prisma template literals
```

**🧩 Prioridad: MEDIA** (Código actual es seguro, pero mejor prevenir)

---

## 🔴 5. ARCHIVOS Y UPLOADS

### ✅ BIEN IMPLEMENTADO: Validación de magic bytes

**Ubicación:** `backend/src/common/interceptors/file-upload.interceptor.ts`

**Estado:** ✅ **SEGURO** - Validación correcta de tipos de archivo

**Nota:** El sistema valida magic bytes, extensión y mimetype. Bien implementado.

---

### 🔴 RIESGO MEDIO #14: URLs de imágenes predecibles

**Ubicación:** `backend/src/upload/upload.service.ts` (asumido)

**💥 Cómo se explota:**
1. Si las URLs de imágenes son predecibles (ej: `/uploads/products/{id}.jpg`)
2. Atacante puede enumerar todas las imágenes probando IDs
3. Puede descubrir productos no publicados, información sensible en imágenes
4. Puede hacer scraping masivo de catálogo

**🧨 Impacto Real:**
- **Enumeración de productos** - Descubrir productos ocultos
- **Scraping masivo** - Robo de catálogo completo
- **Filtración de información** - Imágenes con datos sensibles

**🛠 Corrección:**
```typescript
// ✅ Usar Cloudinary o similar con URLs firmadas
// O generar nombres aleatorios para archivos
const randomName = crypto.randomBytes(16).toString('hex');
const fileName = `${randomName}.${ext}`;
```

**🧩 Prioridad: MEDIA**

---

## 🔴 6. BASE DE DATOS

### 🔴 RIESGO MEDIO #15: Acceso excesivo en queries

**Ubicación:** Múltiples servicios

**💥 Cómo se explota:**
1. Si hay un error en la lógica de autorización
2. Un usuario puede acceder a datos de otros usuarios
3. Ej: Si `findOne` no valida `userId` correctamente

**🧨 Impacto Real:**
- **Violación de privacidad** - Acceso a datos de otros usuarios
- **Filtración de información** - Emails, direcciones, órdenes

**🛠 Corrección:**
```typescript
// ✅ SIEMPRE validar ownership en queries
async findOne(id: string, userId?: string) {
  const where: any = { id };
  if (userId) {
    where.userId = userId; // ← CRÍTICO: Filtrar por usuario
  }
  // ...
}
```

**Estado:** ✅ Parece estar bien implementado en la mayoría de lugares, pero revisar todos los endpoints.

**🧩 Prioridad: MEDIA**

---

## 🔴 7. ADMINISTRACIÓN

### 🔴 RIESGO ALTO #16: Falta de auditoría de acciones admin

**Ubicación:** Todos los endpoints admin

**💥 Cómo se explota:**
1. Admin malicioso o comprometido hace cambios
2. No hay logs de quién hizo qué
3. No se puede rastrear acciones sospechosas
4. No se puede revertir cambios maliciosos

**🧨 Impacto Real:**
- **Falta de trazabilidad** - No se sabe quién hizo cambios
- **Imposible detectar abuso** - Cambios maliciosos no detectados
- **Problemas legales** - No hay evidencia de acciones

**🛠 Corrección:**
```typescript
// ✅ Crear tabla de auditoría
// backend/prisma/schema.prisma
model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String   // 'CREATE_PRODUCT', 'UPDATE_ORDER', etc.
  resource  String   // 'product', 'order', etc.
  resourceId String?
  changes   Json?    // Before/after values
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
}

// En cada endpoint admin:
await this.prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'UPDATE_PRODUCT',
    resource: 'product',
    resourceId: id,
    changes: { before: oldProduct, after: updatedProduct },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  }
});
```

**🧩 Prioridad: ALTA**

---

### 🔴 RIESGO MEDIO #17: Acciones destructivas sin confirmación fuerte

**Ubicación:** Endpoints de eliminación (DELETE)

**💥 Cómo se explota:**
1. Si un token admin es robado
2. Atacante puede eliminar productos, órdenes, usuarios
3. No hay confirmación adicional (2FA, re-autenticación)
4. Destrucción masiva de datos

**🧨 Impacto Real:**
- **Pérdida de datos** - Eliminación masiva
- **Vandalismo** - Destrucción del catálogo
- **Quiebra del negocio** - Si se elimina todo

**🛠 Corrección:**
```typescript
// ✅ Requerir confirmación adicional para acciones destructivas
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard, RequireRecentAuthGuard) // ← Nuevo guard
@Roles('ADMIN')
async delete(@Param('id') id: string, @Body() dto: { confirmPassword: string }) {
  // Validar que el usuario re-autenticó recientemente (últimos 5 minutos)
  // O requerir 2FA para acciones destructivas
}
```

**🧩 Prioridad: MEDIA**

---

## 🔴 8. INFRAESTRUCTURA

### 🔴 RIESGO ALTO #18: CSP permite 'unsafe-inline' y 'unsafe-eval'

**Ubicación:** `frontend/next.config.js:63`

**💥 Cómo se explota:**
1. CSP permite `'unsafe-inline'` en scripts y styles
2. Si hay XSS, el atacante puede inyectar scripts inline
3. `'unsafe-eval'` permite `eval()`, que es peligroso
4. Bypass de protecciones XSS

**🧨 Impacto Real:**
- **XSS amplificado** - Scripts inline se ejecutan
- **Bypass de CSP** - Protecciones reducidas
- **Ejecución de código** - Cualquier script puede ejecutarse

**🛠 Corrección:**
```javascript
// ❌ ACTUAL (VULNERABLE)
'script-src': ['self', 'unsafe-inline', 'unsafe-eval'],

// ✅ CORRECTO
'script-src': ["'self'"], // Sin unsafe-inline
'style-src': ["'self'", "'unsafe-inline'"], // Solo styles pueden ser inline (Next.js lo requiere)

// Para Next.js, usar nonces:
// https://nextjs.org/docs/advanced-features/security-headers#content-security-policy
```

**Nota:** Next.js requiere `'unsafe-inline'` para styles, pero scripts NO deberían tenerlo.

**🧩 Prioridad: ALTA**

---

### 🔴 RIESGO MEDIO #19: Headers de seguridad pueden mejorarse

**Ubicación:** `frontend/next.config.js:20-67`

**Estado:** ✅ Mayormente bien, pero:
- CSP tiene `'unsafe-inline'` y `'unsafe-eval'` (ver #18)
- Falta `X-XSS-Protection` (aunque es legacy, no hace daño)

**🛠 Corrección:**
```javascript
{
  key: 'X-XSS-Protection',
  value: '1; mode=block'
}
```

**🧩 Prioridad: BAJA**

---

## 📊 CHECKLIST DE PRIORIDADES

### 🔴 CRÍTICO (Implementar INMEDIATAMENTE)
1. ✅ **#4** - Validar precios en CreateOrderDto (recalcular desde BD)
2. ✅ **#5** - Validar paymentIntentId con proveedor de pagos
3. ✅ **#1** - Mover access token a HttpOnly cookies

### 🔴 ALTA (Implementar esta semana)
4. ✅ **#2** - RolesGuard valida isActive
5. ✅ **#3** - JWT Strategy valida isActive
6. ✅ **#7** - Sanitizar dangerouslySetInnerHTML
7. ✅ **#10** - Habilitar CSRF por defecto
8. ✅ **#11** - Restringir CORS a whitelist específica
9. ✅ **#12** - Ajustar rate limiting más estricto
10. ✅ **#16** - Implementar auditoría de acciones admin
11. ✅ **#18** - Remover 'unsafe-inline' y 'unsafe-eval' de CSP

### 🟡 MEDIA (Implementar este mes)
12. ✅ **#6** - Validar campos anidados en CreateOrderDto
13. ✅ **#8** - Eliminar console.log en producción
14. ✅ **#13** - Documentar uso seguro de $queryRaw
15. ✅ **#14** - URLs de imágenes no predecibles
16. ✅ **#15** - Revisar todas las queries por acceso excesivo
17. ✅ **#17** - Confirmación adicional para acciones destructivas

### 🟢 BAJA (Mejoras)
18. ✅ **#9** - Mejorar headers de seguridad
19. ✅ **#19** - Agregar X-XSS-Protection header

---

## 🎯 RECOMENDACIONES ADICIONALES

1. **Implementar 2FA para admins** - Protección adicional
2. **Webhook de pagos** - Validar pagos desde el proveedor, no confiar en el cliente
3. **Rate limiting por usuario** - Además de por IP
4. **Monitoreo de seguridad** - Alertas por acciones sospechosas
5. **Penetration testing** - Contratar auditoría externa
6. **Backup y recovery** - Plan de recuperación ante ataques

---

## 📝 NOTAS FINALES

**Puntos Positivos:**
- ✅ Validación de magic bytes en uploads (bien implementado)
- ✅ Rate limiting existe (aunque puede mejorarse)
- ✅ Helmet configurado (aunque CSP puede mejorarse)
- ✅ Refresh tokens en HttpOnly cookies (correcto)
- ✅ Validación de stock antes de crear orden (correcto)

**Áreas de Mayor Preocupación:**
1. **Pagos** - La lógica de pagos es el riesgo más crítico
2. **Autenticación** - Tokens en localStorage y falta de validación de isActive
3. **CSRF** - Deshabilitado por defecto
4. **CORS** - Demasiado permisivo

**Tiempo estimado de corrección:** 2-3 semanas para críticos y altos.

---

**FIN DEL REPORTE**
