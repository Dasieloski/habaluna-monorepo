import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { createHmac } from 'crypto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  getFromAddress(): string {
    return this.config.get<string>('EMAIL_FROM') ?? 'no-reply@habanaluna.local';
  }

  private createTransport() {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const secure = String(this.config.get<string>('SMTP_SECURE') ?? 'false') === 'true';

    if (!host || !user || !pass) return null;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  async sendPasswordResetEmail(params: { to: string; resetUrl: string }) {
    const from = this.config.get<string>('EMAIL_FROM') ?? 'no-reply@habanaluna.local';
    const subject = 'Recuperación de contraseña';
    const text = `Has solicitado recuperar tu contraseña.\n\nUsa este enlace (válido por 1 hora):\n${params.resetUrl}\n\nSi no lo solicitaste, ignora este correo.`;
    const html = `
      <p>Has solicitado recuperar tu contraseña.</p>
      <p><strong>Este enlace es válido por 1 hora:</strong></p>
      <p><a href="${params.resetUrl}">Restablecer contraseña</a></p>
      <p>Si no lo solicitaste, ignora este correo.</p>
    `;

    // Usar sendEmail para tener manejo de errores consistente
    return this.sendEmail({ from, to: params.to, subject, text, html });
  }

  async sendWelcomeEmail(params: { to: string; firstName?: string }) {
    const from = this.getFromAddress();
    const subject = '¡Bienvenido a Habanaluna!';
    const name = params.firstName || 'Usuario';
    const text = `¡Hola ${name}!\n\nGracias por registrarte en Habanaluna. Estamos emocionados de tenerte con nosotros.\n\nExplora nuestros productos premium y disfruta de una experiencia de compra única.\n\n¡Bienvenido!`;
    const html = this.getEmailTemplate({
      title: '¡Bienvenido a Habanaluna!',
      preheader: 'Tu cuenta ya está lista. Descubre productos premium y ofertas.',
      greeting: `¡Hola ${name}!`,
      content: `
        <p style="margin:0 0 10px;">Gracias por registrarte en <strong>Habanaluna</strong>. Tu cuenta ya está lista.</p>
        <p style="margin:0 0 10px;">Aquí tienes un par de cosas que puedes hacer ahora mismo:</p>
        <ul style="margin:0; padding-left:18px;">
          <li>Explorar productos premium y combos</li>
          <li>Guardar tus favoritos</li>
          <li>Hacer tu primer pedido en minutos</li>
        </ul>
        <div style="margin-top:14px; padding:12px; border-radius:10px; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.18);">
          <p style="margin:0; font-size: 13px; color:#334155;">
            Tip: si necesitas ayuda, responde este correo y te orientamos.
          </p>
        </div>
      `,
      buttonText: 'Explorar Productos',
      buttonUrl: this.getFrontendUrl(),
      toEmail: params.to,
    });

    return this.sendEmail({ from, to: params.to, subject, text, html });
  }

  async sendOrderConfirmationEmail(params: {
    to: string;
    orderNumber: string;
    total: number;
    firstName?: string;
  }) {
    const from = this.config.get<string>('EMAIL_FROM') ?? 'no-reply@habanaluna.local';
    const subject = `Confirmación de Pedido #${params.orderNumber}`;
    const name = params.firstName || 'Cliente';
    const text = `¡Hola ${name}!\n\nTu pedido #${params.orderNumber} ha sido confirmado.\n\nTotal: $${params.total.toFixed(2)}\n\nTe notificaremos cuando tu pedido sea enviado.`;
    const html = this.getEmailTemplate({
      title: 'Pedido Confirmado',
      greeting: `¡Hola ${name}!`,
      content: `
        <p>Tu pedido <strong>#${params.orderNumber}</strong> ha sido confirmado exitosamente.</p>
        <p><strong>Total:</strong> $${params.total.toFixed(2)}</p>
        <p>Te notificaremos cuando tu pedido sea enviado. Puedes ver el estado de tu pedido en tu cuenta.</p>
      `,
      buttonText: 'Ver Mi Pedido',
      buttonUrl: `${this.getFrontendUrl()}/orders`,
    });

    return this.sendEmail({ from, to: params.to, subject, text, html });
  }

  async sendOrderStatusUpdateEmail(params: {
    to: string;
    orderNumber: string;
    status: string;
    firstName?: string;
  }) {
    const from = this.config.get<string>('EMAIL_FROM') ?? 'no-reply@habanaluna.local';
    const statusMessages: Record<string, string> = {
      PROCESSING: 'está siendo procesado',
      SHIPPED: 'ha sido enviado',
      DELIVERED: 'ha sido entregado',
      CANCELLED: 'ha sido cancelado',
    };
    const statusMessage = statusMessages[params.status] || 'ha sido actualizado';
    const subject = `Actualización de Pedido #${params.orderNumber}`;
    const name = params.firstName || 'Cliente';
    const text = `¡Hola ${name}!\n\nTu pedido #${params.orderNumber} ${statusMessage}.\n\nPuedes ver más detalles en tu cuenta.`;
    const html = this.getEmailTemplate({
      title: 'Actualización de Pedido',
      greeting: `¡Hola ${name}!`,
      content: `
        <p>Tu pedido <strong>#${params.orderNumber}</strong> ${statusMessage}.</p>
        <p>Puedes ver más detalles y seguir el estado de tu pedido en tu cuenta.</p>
      `,
      buttonText: 'Ver Mi Pedido',
      buttonUrl: `${this.getFrontendUrl()}/orders`,
    });

    return this.sendEmail({ from, to: params.to, subject, text, html });
  }

  async sendLowStockAlert(params: {
    to: string;
    products: Array<{ name: string; stock: number; category: string; sku: string }>;
    threshold: number;
    totalProducts: number;
  }) {
    const from = this.config.get<string>('EMAIL_FROM') ?? 'no-reply@habanaluna.local';
    const subject = `⚠️ Alerta de Stock Bajo - ${params.totalProducts} productos`;
    const productsList = params.products
      .map((p) => `• ${p.name} (${p.category}) - Stock: ${p.stock} unidades - SKU: ${p.sku}`)
      .join('\n');
    const text = `Alerta de Stock Bajo\n\nSe encontraron ${params.totalProducts} productos con stock por debajo del umbral de ${params.threshold} unidades:\n\n${productsList}\n\nPor favor, revisa el inventario y reabastece estos productos.`;
    const html = this.getEmailTemplate({
      title: '⚠️ Alerta de Stock Bajo',
      greeting: 'Hola,',
      content: `
        <p>Se encontraron <strong>${params.totalProducts} productos</strong> con stock por debajo del umbral de <strong>${params.threshold} unidades</strong>.</p>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0; color: #856404;">Productos con Stock Bajo:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${params.products.map((p) => `<li><strong>${p.name}</strong> (${p.category})<br>Stock: ${p.stock} unidades | SKU: ${p.sku}</li>`).join('')}
          </ul>
        </div>
        <p>Por favor, revisa el inventario y reabastece estos productos lo antes posible.</p>
      `,
      buttonText: 'Ver Inventario',
      buttonUrl: `${this.getFrontendUrl()}/admin/products?lowStock=true`,
    });

    return this.sendEmail({ from, to: params.to, subject, text, html });
  }

  private async sendEmail(params: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  }) {
    const transport = this.createTransport();
    if (!transport) {
      this.logger.warn(`SMTP no configurado. No se envió email a ${params.to}`);
      return { sent: false };
    }

    try {
      await transport.sendMail(params);
      return { sent: true };
    } catch (error) {
      this.logger.error(
        `Error enviando email a ${params.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      return { sent: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * API pública para enviar un email arbitrario.
   * Útil para campañas/newsletter desde el panel admin.
   */
  async sendRaw(params: { to: string; subject: string; html: string; text?: string; from?: string }) {
    const from = params.from || this.getFromAddress();
    return this.sendEmail({
      from,
      to: params.to,
      subject: params.subject,
      text: params.text ?? '',
      html: params.html,
    });
  }

  /**
   * Envolver contenido HTML dentro del template de marca (logo/colores/CTA/footer).
   * Nota: `content` debe ser HTML (fragmento).
   */
  wrapTemplate(params: {
    title: string;
    greeting: string;
    preheader?: string;
    content: string;
    buttonText?: string;
    buttonUrl?: string;
    footerExtraHtml?: string;
    toEmail?: string;
  }) {
    return this.getEmailTemplate(params);
  }

  private getFrontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  private getBackendUrl(): string {
    // URL pública del backend para links en emails (unsubscribe, etc).
    // En Railway: setear BACKEND_PUBLIC_URL=https://tu-backend.up.railway.app
    return this.config.get<string>('BACKEND_PUBLIC_URL') || 'http://localhost:4000';
  }

  /**
   * Token simple para links (unsubscribe) sin tener que guardar nada en BD.
   * No es "JWT", solo HMAC(email) con un secret.
   */
  signEmailToken(email: string): string {
    const secret =
      this.config.get<string>('EMAIL_MARKETING_SECRET') ||
      this.config.get<string>('JWT_SECRET') ||
      'dev-secret';
    return createHmac('sha256', secret).update(email.trim().toLowerCase()).digest('hex');
  }

  buildUnsubscribeUrl(email: string): string {
    const e = encodeURIComponent(email.trim().toLowerCase());
    const t = encodeURIComponent(this.signEmailToken(email));
    const base = this.getBackendUrl().replace(/\/$/, '');
    return `${base}/api/email-marketing/unsubscribe?e=${e}&t=${t}`;
  }

  private getEmailTemplate(params: {
    title: string;
    greeting: string;
    preheader?: string;
    content: string;
    buttonText?: string;
    buttonUrl?: string;
    footerExtraHtml?: string;
    toEmail?: string;
  }): string {
    const frontend = this.getFrontendUrl().replace(/\/$/, '');
    const logoUrl = `${frontend}/logo.png`;
    const preheader = (params.preheader || '').trim();
    const safePreheader = preheader
      ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>`
      : '';

    const unsubscribe =
      params.toEmail && params.toEmail.trim()
        ? `<p style="margin: 10px 0 0; font-size: 12px; color: #64748b; text-align:center;">
             Si no quieres recibir estos correos, puedes <a href="${this.buildUnsubscribeUrl(params.toEmail)}" style="color:#2563eb;text-decoration:underline;">darte de baja aquí</a>.
           </p>`
        : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${params.title}</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f1f5f9;font-family: Arial, sans-serif;line-height:1.6;color:#0f172a;">
          ${safePreheader}
          <div style="max-width: 640px; margin: 0 auto; padding: 24px 16px;">
            <div style="background: linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #dcfce7 100%); border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 40px -24px rgba(15, 23, 42, 0.25);">
              <div style="padding: 18px 18px 12px; border-bottom: 1px solid rgba(226,232,240,0.8); background: rgba(255,255,255,0.75);">
                <div style="display:flex; align-items:center; gap:12px;">
                  <div style="width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); display:flex; align-items:center; justify-content:center; box-shadow: 0 10px 20px -12px rgba(29,78,216,0.8);">
                    <span style="font-size:20px; color:#ffffff;">☾</span>
                  </div>
                  <div style="min-width:0;">
                    <div style="font-size: 18px; font-weight: 800; letter-spacing: 0.2px;">
                      <img src="${logoUrl}" alt="Habaluna" width="132" style="display:block; max-width: 132px; height:auto;" />
                    </div>
                    <div style="font-size: 12px; color:#334155;">Premium • Entrega rápida • Hecho con cariño</div>
                  </div>
                </div>
              </div>

              <div style="padding: 22px 18px 6px;">
                <h1 style="margin: 0 0 10px; font-size: 22px; line-height: 1.2; color:#0f172a;">${params.title}</h1>
                <p style="margin: 0 0 16px; font-size: 15px; color:#334155;">${params.greeting}</p>
              </div>

              <div style="padding: 0 18px 18px;">
                <div style="background-color: rgba(255,255,255,0.85); border: 1px solid rgba(226,232,240,0.9); padding: 18px; border-radius: 12px;">
                  ${params.content}
                </div>
              </div>
            ${
              params.buttonText && params.buttonUrl
                ? `
              <div style="text-align:center; padding: 0 18px 22px;">
                <a href="${params.buttonUrl}" style="background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%); color:#ffffff; padding: 12px 18px; text-decoration:none; border-radius: 12px; display:inline-block; font-weight: 700; box-shadow: 0 12px 26px -18px rgba(29,78,216,0.9);">
                  ${params.buttonText}
                </a>
              </div>
            `
                : ''
            }
              <div style="padding: 0 18px 20px;">
                ${params.footerExtraHtml || ''}
                ${unsubscribe}
                <hr style="border:none;border-top:1px solid rgba(226,232,240,0.9); margin: 18px 0;">
                <p style="margin:0;font-size: 12px; color: #64748b; text-align: center;">
                  © ${new Date().getFullYear()} Habanaluna. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
