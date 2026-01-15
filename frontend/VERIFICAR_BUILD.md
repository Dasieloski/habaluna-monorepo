# Verificar que la ruta está en el build

## Comando para verificar

```bash
cd frontend
npm run build
```

## Buscar en la salida:

Debe aparecer:
```
Route (app)                              Size     First Load JS
├ ○ /auth/reset-password/[token]         XXX kB   XXX kB
```

O al menos:
```
├ ƒ /auth/reset-password/[token]
```

## Si NO aparece:

1. La ruta no está siendo reconocida por Next.js
2. Verificar que el archivo existe en: `app/(main)/auth/reset-password/[token]/page.tsx`
3. Verificar que no hay errores de TypeScript que impidan el build
4. Verificar que el route group `(main)` no está causando problemas

## Si aparece pero sigue dando 404:

1. Railway está usando un build viejo - hacer redeploy
2. El servidor de Railway no está configurado correctamente
3. Hay un problema con `output: 'standalone'` en Railway
