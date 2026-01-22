import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitiza HTML para prevenir XSS attacks
 * @param html - HTML a sanitizar
 * @param options - Opciones de sanitización personalizadas
 * @returns HTML sanitizado
 */
export function sanitizeHtml(
  html: string,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: string[];
    allowedUriRegex?: RegExp;
  }
): string {
  const defaultOptions = {
    ALLOWED_TAGS: options?.allowedTags || [
      'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'div', 'span'
    ],
    ALLOWED_ATTR: options?.allowedAttributes || [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style',
      'width', 'height', 'colspan', 'rowspan'
    ],
    ALLOWED_URI_REGEXP: options?.allowedUriRegex || /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };

  return DOMPurify.sanitize(html, defaultOptions);
}

/**
 * Sanitiza HTML para estilos CSS inline (más restrictivo)
 * @param html - CSS/HTML a sanitizar
 * @returns HTML sanitizado
 */
export function sanitizeCss(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['style'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}
