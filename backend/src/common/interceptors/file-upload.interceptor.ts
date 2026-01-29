import * as multer from 'multer';

/**
 * Magic bytes (file signatures) para validar tipos de archivo reales.
 * Previene que un atacante suba un .exe renombrado como .jpg.
 */
const IMAGE_MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xff, 0xd8, 0xff], // JPEG
  ],
  'image/png': [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF (WebP starts with RIFF)
  ],
};

/**
 * Valida que el contenido del archivo coincida con su extensión/mimetype.
 */
function validateMagicBytes(buffer: Buffer, mimetype: string): boolean {
  const signatures = IMAGE_MAGIC_BYTES[mimetype];
  if (!signatures || buffer.length < 8) return false;

  // Para WebP, verificar que después de RIFF viene WEBP
  if (mimetype === 'image/webp') {
    if (buffer.length < 12) return false;
    const riff = buffer.slice(0, 4).toString('ascii');
    const webp = buffer.slice(8, 12).toString('ascii');
    return riff === 'RIFF' && webp === 'WEBP';
  }

  // Para otros formatos, verificar magic bytes
  for (const signature of signatures) {
    if (buffer.length < signature.length) continue;
    const matches = signature.every((byte, idx) => buffer[idx] === byte);
    if (matches) return true;
  }

  return false;
}

/**
 * Valida extensión del archivo (no confiar solo en mimetype).
 */
function validateExtension(filename: string, mimetype: string): boolean {
  const ext = filename.toLowerCase().split('.').pop() || '';
  const extMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
  };
  const allowedExts = extMap[mimetype] || [];
  return allowedExts.includes(ext);
}

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Validar mimetype
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new Error('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)'));
  }

  // Validar extensión
  if (!validateExtension(file.originalname, file.mimetype)) {
    return cb(new Error('La extensión del archivo no coincide con su tipo MIME'));
  }

  // La validación de magic bytes se hace después de que multer carga el archivo
  // (en el controller/interceptor), porque aquí no tenemos acceso al buffer completo.
  cb(null, true);
};

export const multerOptions = {
  // En Railway (y en general producción) no usamos disco local: subimos a Cloudinary desde memoria.
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB (aumentado para banners grandes)
  },
  fileFilter,
};

/**
 * Valida magic bytes después de que multer carga el archivo.
 * Debe llamarse en el controller/interceptor después de @UploadedFile().
 */
export function validateFileMagicBytes(file: Express.Multer.File): boolean {
  if (!file.buffer) return false;
  return validateMagicBytes(file.buffer, file.mimetype);
}
