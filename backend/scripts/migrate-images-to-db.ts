import axios from 'axios';
import { PrismaClient } from '@prisma/client';

/**
 * Migra imágenes externas (ej: Cloudinary) a la tabla Media (bytea) y reemplaza
 * las URLs por rutas /api/media/:id en Product.images[] y Banner.image.
 *
 * Requisitos:
 * - DATABASE_URL apuntando a tu Postgres.
 * - El backend debe estar desplegado con el endpoint GET /api/media/:id (este repo lo incluye).
 *
 * Uso:
 *   npx ts-node scripts/migrate-images-to-db.ts
 */

const prisma = new PrismaClient();

const CONCURRENCY = Number(process.env.MIGRATE_MEDIA_CONCURRENCY || 3);
const TIMEOUT_MS = Number(process.env.MIGRATE_MEDIA_TIMEOUT_MS || 30000);

function isAlreadyDbMedia(url: string) {
  return url.startsWith('/api/media/');
}

function isHttpUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

async function fetchBinary(url: string) {
  const res = await axios.get<ArrayBuffer>(url, {
    responseType: 'arraybuffer',
    timeout: TIMEOUT_MS,
    maxRedirects: 5,
    validateStatus: (s) => s >= 200 && s < 300,
  });
  const mimeType = String(res.headers['content-type'] || 'application/octet-stream');
  const buffer = Buffer.from(res.data);
  return { buffer, mimeType, sizeBytes: buffer.length };
}

async function storeMedia(filename: string | null, mimeType: string, sizeBytes: number, data: Buffer) {
  const created = await prisma.media.create({
    data: { filename, mimeType, sizeBytes, data },
  });
  return `/api/media/${created.id}`;
}

async function mapWithConcurrency<T, R>(items: T[], worker: (item: T) => Promise<R>) {
  const results: R[] = [];
  let idx = 0;
  const runners = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (idx < items.length) {
      const current = items[idx++];
      results.push(await worker(current));
    }
  });
  await Promise.all(runners);
  return results;
}

async function migrateBannerImage(bannerId: string, image: string) {
  if (!image || isAlreadyDbMedia(image) || !isHttpUrl(image)) return null;
  const { buffer, mimeType, sizeBytes } = await fetchBinary(image);
  const newPath = await storeMedia(null, mimeType, sizeBytes, buffer);
  await prisma.banner.update({ where: { id: bannerId }, data: { image: newPath } });
  return { from: image, to: newPath };
}

async function migrateProductImages(productId: string, images: string[]) {
  if (!images?.length) return null;
  const next: string[] = [];
  let changed = false;

  for (const img of images) {
    if (!img) continue;
    if (isAlreadyDbMedia(img)) {
      next.push(img);
      continue;
    }
    if (!isHttpUrl(img)) {
      // No tocamos rutas relativas (/products/...) porque no hay de dónde descargarlas.
      next.push(img);
      continue;
    }
    const { buffer, mimeType, sizeBytes } = await fetchBinary(img);
    const newPath = await storeMedia(null, mimeType, sizeBytes, buffer);
    next.push(newPath);
    changed = true;
  }

  if (changed) {
    await prisma.product.update({ where: { id: productId }, data: { images: next } });
    return { changed: true };
  }
  return null;
}

async function main() {
  console.log('🔁 Migrando imágenes a BD (Media bytea)...');

  const banners = await prisma.banner.findMany();
  const products = await prisma.product.findMany({ select: { id: true, images: true } });

  console.log(`🖼️  Banners: ${banners.length}`);
  await mapWithConcurrency(banners, async (b) => {
    try {
      const r = await migrateBannerImage(b.id, b.image);
      if (r) console.log(`✅ Banner ${b.id}: ${r.from} -> ${r.to}`);
    } catch (e: any) {
      console.warn(`⚠️  Banner ${b.id}: ${e?.message || e}`);
    }
  });

  console.log(`🛍️  Productos: ${products.length}`);
  await mapWithConcurrency(products, async (p) => {
    try {
      const r = await migrateProductImages(p.id, (p.images as any) || []);
      if (r?.changed) console.log(`✅ Product ${p.id}: images -> /api/media/*`);
    } catch (e: any) {
      console.warn(`⚠️  Product ${p.id}: ${e?.message || e}`);
    }
  });

  console.log('✅ Migración completada.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

