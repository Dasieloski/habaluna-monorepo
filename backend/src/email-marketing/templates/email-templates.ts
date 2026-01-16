/**
 * Plantillas de email predefinidas para Email Marketing
 * Todas las plantillas son responsivas y compatibles con clientes de correo modernos
 */

export interface EmailTemplate {
  id: string;
  name: string;
  category: 'welcome' | 'password-reset' | 'campaign' | 'promotion' | 'newsletter';
  description: string;
  html: string;
  previewImage?: string;
}

// ==================== PLANTILLAS DE BIENVENIDA ====================

export const welcomeTemplates: EmailTemplate[] = [
  {
    id: 'welcome-1',
    name: 'Bienvenida Clásica',
    category: 'welcome',
    description: 'Diseño limpio y profesional con logo y mensaje de bienvenida',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">¡Bienvenido a Habanaluna!</h1>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Hola <strong>{{firstName}}</strong>,
          </p>
          <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Estamos emocionados de tenerte con nosotros. Tu cuenta está lista y puedes comenzar a explorar nuestros productos premium.
          </p>
          <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0;">
            <p style="color: #333333; font-size: 15px; margin: 0; font-weight: 600;">¿Qué puedes hacer ahora?</p>
            <ul style="color: #666666; font-size: 14px; line-height: 1.8; margin: 10px 0 0; padding-left: 20px;">
              <li>Explorar productos premium y combos exclusivos</li>
              <li>Guardar tus favoritos para comprar después</li>
              <li>Hacer tu primer pedido en minutos</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{frontendUrl}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Explorar Productos</a>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'welcome-2',
    name: 'Bienvenida Moderna',
    category: 'welcome',
    description: 'Diseño moderno con iconos y colores vibrantes',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 50px 20px; text-align: center;">
          <div style="background-color: #ffffff; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">🎉</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">¡Bienvenido!</h1>
          <p style="color: #ffffff; margin: 10px 0 0; font-size: 18px; opacity: 0.9;">Tu cuenta está lista</p>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #333333; font-size: 18px; line-height: 1.6; margin: 0 0 15px; font-weight: 600;">
            Hola {{firstName}}, 👋
          </p>
          <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
            Gracias por unirte a Habanaluna. Estamos aquí para hacer tu experiencia de compra única y especial.
          </p>
          <div style="display: flex; gap: 15px; margin: 30px 0; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 150px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 10px;">🛍️</div>
              <p style="color: #333333; font-size: 14px; margin: 0; font-weight: 600;">Productos Premium</p>
            </div>
            <div style="flex: 1; min-width: 150px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 10px;">⚡</div>
              <p style="color: #333333; font-size: 14px; margin: 0; font-weight: 600;">Entrega Rápida</p>
            </div>
            <div style="flex: 1; min-width: 150px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 10px;">❤️</div>
              <p style="color: #333333; font-size: 14px; margin: 0; font-weight: 600;">Hecho con Cariño</p>
            </div>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{frontendUrl}}" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; padding: 16px 45px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);">Comenzar a Comprar</a>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'welcome-3',
    name: 'Bienvenida Minimalista',
    category: 'welcome',
    description: 'Diseño minimalista y elegante con mucho espacio en blanco',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
        <div style="padding: 60px 40px 40px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <h1 style="color: #111827; margin: 0 0 15px; font-size: 36px; font-weight: 300; letter-spacing: -1px;">Bienvenido</h1>
          <p style="color: #6b7280; margin: 0; font-size: 16px;">a Habanaluna</p>
        </div>
        <div style="padding: 50px 40px;">
          <p style="color: #111827; font-size: 18px; line-height: 1.8; margin: 0 0 25px;">
            Hola {{firstName}},
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 25px;">
            Gracias por registrarte. Estamos aquí para ofrecerte productos de la más alta calidad.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 40px;">
            Tu cuenta está lista. Comienza a explorar.
          </p>
          <div style="text-align: center; margin: 50px 0;">
            <a href="{{frontendUrl}}" style="display: inline-block; color: #111827; padding: 14px 35px; text-decoration: none; border: 2px solid #111827; border-radius: 4px; font-weight: 500; font-size: 15px; letter-spacing: 0.5px;">Ver Catálogo</a>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'welcome-4',
    name: 'Bienvenida con Oferta',
    category: 'welcome',
    description: 'Bienvenida con código de descuento para nuevos usuarios',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: bold;">¡Bienvenido a Habanaluna!</h1>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #333333; font-size: 18px; line-height: 1.6; margin: 0 0 20px; font-weight: 600;">
            Hola {{firstName}}, 🎁
          </p>
          <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
            Como agradecimiento por unirte a nosotros, tenemos un regalo especial para ti.
          </p>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
            <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">Tu Código de Descuento</p>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="color: #667eea; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 3px;">BIENVENIDO10</p>
            </div>
            <p style="color: #ffffff; font-size: 14px; margin: 15px 0 0;">10% de descuento en tu primera compra</p>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{frontendUrl}}" style="display: inline-block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #ffffff; padding: 16px 45px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">Usar Descuento</a>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'welcome-5',
    name: 'Bienvenida Corporativa',
    category: 'welcome',
    description: 'Diseño profesional y corporativo ideal para B2B',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Georgia', serif; background-color: #ffffff; border: 1px solid #e5e7eb;">
        <div style="background-color: #1f2937; padding: 35px 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 2px;">HABANALUNA</h1>
        </div>
        <div style="padding: 50px 40px;">
          <p style="color: #111827; font-size: 17px; line-height: 1.8; margin: 0 0 20px;">
            Estimado/a {{firstName}},
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
            Nos complace darle la bienvenida a Habanaluna. Su cuenta ha sido creada exitosamente y está lista para utilizar.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 30px;">
            En Habanaluna, nos comprometemos a ofrecer productos de la más alta calidad y un servicio excepcional.
          </p>
          <div style="border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 25px 0; margin: 30px 0;">
            <p style="color: #111827; font-size: 15px; margin: 0; font-weight: 600;">Información de su cuenta:</p>
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0;">Email: {{email}}</p>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{frontendUrl}}" style="display: inline-block; background-color: #1f2937; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 15px;">Acceder a Mi Cuenta</a>
          </div>
        </div>
        <div style="background-color: #f9fafb; padding: 25px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">Si tiene alguna pregunta, no dude en contactarnos.</p>
        </div>
      </div>
    `,
  },
];

// ==================== PLANTILLAS DE RECUPERACIÓN DE CONTRASEÑA ====================

export const passwordResetTemplates: EmailTemplate[] = [
  {
    id: 'password-reset-1',
    name: 'Recuperación Clásica',
    category: 'password-reset',
    description: 'Diseño simple y directo con botón de acción destacado',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff;">
        <div style="background-color: #3b82f6; padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Recuperar Contraseña</h1>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Hemos recibido una solicitud para restablecer tu contraseña.
          </p>
          <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
            Haz clic en el botón de abajo para crear una nueva contraseña. Este enlace es válido por 1 hora.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{resetUrl}}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Restablecer Contraseña</a>
          </div>
          <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 30px 0 0; text-align: center;">
            Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
          </p>
        </div>
      </div>
    `,
  },
  {
    id: 'password-reset-2',
    name: 'Recuperación Segura',
    category: 'password-reset',
    description: 'Diseño con énfasis en seguridad y confianza',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <div style="background-color: #ffffff; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 30px;">🔒</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold;">Recuperación de Contraseña</h1>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #333333; font-size: 17px; line-height: 1.6; margin: 0 0 15px; font-weight: 600;">
            Hola,
          </p>
          <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en Habanaluna.
          </p>
          <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <p style="color: #333333; font-size: 14px; margin: 0; font-weight: 600;">⏰ Este enlace expira en 1 hora</p>
          </div>
          <div style="text-align: center; margin: 35px 0;">
            <a href="{{resetUrl}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 45px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">Restablecer Mi Contraseña</a>
          </div>
          <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 30px 0 0; text-align: center;">
            Si no realizaste esta solicitud, ignora este correo. Tu contraseña permanecerá sin cambios.
          </p>
        </div>
      </div>
    `,
  },
  {
    id: 'password-reset-3',
    name: 'Recuperación Minimalista',
    category: 'password-reset',
    description: 'Diseño limpio y minimalista',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
        <div style="padding: 50px 40px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <h1 style="color: #111827; margin: 0; font-size: 32px; font-weight: 300;">Restablecer Contraseña</h1>
        </div>
        <div style="padding: 50px 40px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 25px;">
            Has solicitado restablecer tu contraseña.
          </p>
          <p style="color: #6b7280; font-size: 15px; line-height: 1.8; margin: 0 0 40px;">
            Haz clic en el enlace de abajo para continuar. Este enlace es válido por 1 hora.
          </p>
          <div style="text-align: center; margin: 50px 0;">
            <a href="{{resetUrl}}" style="display: inline-block; color: #111827; padding: 14px 35px; text-decoration: none; border: 2px solid #111827; border-radius: 4px; font-weight: 500; font-size: 15px; letter-spacing: 0.5px;">Restablecer Contraseña</a>
          </div>
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 40px 0 0; text-align: center;">
            Si no solicitaste este cambio, ignora este correo.
          </p>
        </div>
      </div>
    `,
  },
  {
    id: 'password-reset-4',
    name: 'Recuperación con Instrucciones',
    category: 'password-reset',
    description: 'Diseño con pasos claros e instrucciones detalladas',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 35px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">¿Olvidaste tu contraseña?</h1>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            No te preocupes, te ayudamos a recuperarla.
          </p>
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="color: #333333; font-size: 15px; margin: 0 0 15px; font-weight: 600;">📋 Pasos a seguir:</p>
            <ol style="color: #666666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Haz clic en el botón "Restablecer Contraseña"</li>
              <li>Ingresa tu nueva contraseña (mínimo 8 caracteres)</li>
              <li>Confirma tu nueva contraseña</li>
              <li>¡Listo! Ya puedes iniciar sesión</li>
            </ol>
          </div>
          <div style="text-align: center; margin: 35px 0;">
            <a href="{{resetUrl}}" style="display: inline-block; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #ffffff; padding: 16px 45px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(250, 112, 154, 0.3);">Restablecer Contraseña</a>
          </div>
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 25px 0;">
            <p style="color: #856404; font-size: 13px; margin: 0;">⏰ Este enlace expira en 1 hora por seguridad.</p>
          </div>
          <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 25px 0 0; text-align: center;">
            Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
          </p>
        </div>
      </div>
    `,
  },
  {
    id: 'password-reset-5',
    name: 'Recuperación Urgente',
    category: 'password-reset',
    description: 'Diseño con sensación de urgencia y acción inmediata',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; border: 2px solid #ef4444; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #ef4444; padding: 30px 20px; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 10px;">🔐</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold;">Solicitud de Restablecimiento</h1>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #333333; font-size: 17px; line-height: 1.6; margin: 0 0 20px; font-weight: 600;">
            Se solicitó un restablecimiento de contraseña
          </p>
          <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
            Para completar el proceso, haz clic en el botón de abajo. Si no realizaste esta solicitud, ignora este correo.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{resetUrl}}" style="display: inline-block; background-color: #ef4444; color: #ffffff; padding: 18px 50px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 17px; text-transform: uppercase; letter-spacing: 1px;">Restablecer Ahora</a>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 30px;">
            <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
              ⚠️ Este enlace es válido por 1 hora. Después de ese tiempo, deberás solicitar un nuevo enlace.
            </p>
          </div>
        </div>
      </div>
    `,
  },
];

// ==================== PLANTILLAS DE CAMPAÑAS ====================

export const campaignTemplates: EmailTemplate[] = [
  {
    id: 'campaign-1',
    name: 'Campaña Producto Destacado',
    category: 'campaign',
    description: 'Ideal para destacar un producto específico con imagen y CTA',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">{{subject}}</h1>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #333333; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
            Hola {{firstName}}, 👋
          </p>
          <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
            {{content}}
          </p>
          <div style="background-color: #f8f9fa; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
            <h2 style="color: #333333; font-size: 24px; margin: 0 0 15px; font-weight: bold;">Producto Destacado</h2>
            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
              Descubre nuestra selección especial para ti
            </p>
            <a href="{{frontendUrl}}/products" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Ver Producto</a>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'campaign-2',
    name: 'Campaña Oferta Especial',
    category: 'campaign',
    description: 'Perfecta para promociones y descuentos con código',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 50px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🎉 Oferta Especial</h1>
          <p style="color: #ffffff; margin: 15px 0 0; font-size: 20px; opacity: 0.9;">Solo para ti, {{firstName}}</p>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #333333; font-size: 18px; line-height: 1.6; margin: 0 0 25px;">
            {{content}}
          </p>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 35px; border-radius: 12px; text-align: center; margin: 30px 0;">
            <p style="color: #ffffff; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Usa este código al finalizar tu compra:</p>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #667eea; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 3px;">OFERTA20</p>
            </div>
            <p style="color: #ffffff; font-size: 16px; margin: 15px 0 0;">20% de descuento en toda la tienda</p>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{frontendUrl}}" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; padding: 16px 45px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);">Aprovechar Oferta</a>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'campaign-3',
    name: 'Campaña Newsletter',
    category: 'campaign',
    description: 'Ideal para newsletters con múltiples secciones',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff;">
        <div style="background-color: #1f2937; padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold;">Newsletter Habanaluna</h1>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #333333; font-size: 18px; line-height: 1.6; margin: 0 0 20px; font-weight: 600;">
            Hola {{firstName}},
          </p>
          <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
            {{content}}
          </p>
          <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 30px 0; margin: 30px 0;">
            <h2 style="color: #333333; font-size: 22px; margin: 0 0 20px; font-weight: bold;">Lo más destacado esta semana</h2>
            <ul style="color: #666666; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Nuevos productos premium</li>
              <li>Ofertas exclusivas para suscriptores</li>
              <li>Consejos y recetas especiales</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{frontendUrl}}" style="display: inline-block; background-color: #1f2937; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Ver Todo</a>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'campaign-4',
    name: 'Campaña Lanzamiento',
    category: 'campaign',
    description: 'Perfecta para anunciar nuevos productos o servicios',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 50px 20px; text-align: center;">
          <div style="font-size: 50px; margin-bottom: 15px;">🚀</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: bold;">¡Gran Lanzamiento!</h1>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #333333; font-size: 20px; line-height: 1.6; margin: 0 0 15px; font-weight: 600;">
            {{firstName}}, tenemos algo increíble para ti
          </p>
          <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
            {{content}}
          </p>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 15px; font-weight: bold;">Nuevo Producto Disponible</h2>
            <p style="color: #ffffff; font-size: 16px; margin: 0 0 25px; opacity: 0.9;">Sé el primero en descubrirlo</p>
            <a href="{{frontendUrl}}/products" style="display: inline-block; background-color: #ffffff; color: #667eea; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Explorar Ahora</a>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'campaign-5',
    name: 'Campaña Minimalista',
    category: 'campaign',
    description: 'Diseño limpio y elegante para comunicaciones profesionales',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
        <div style="padding: 50px 40px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <h1 style="color: #111827; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: -1px;">{{subject}}</h1>
        </div>
        <div style="padding: 50px 40px;">
          <p style="color: #111827; font-size: 18px; line-height: 1.8; margin: 0 0 25px;">
            Hola {{firstName}},
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 25px;">
            {{content}}
          </p>
          <div style="text-align: center; margin: 50px 0;">
            <a href="{{frontendUrl}}" style="display: inline-block; color: #111827; padding: 14px 35px; text-decoration: none; border: 2px solid #111827; border-radius: 4px; font-weight: 500; font-size: 15px; letter-spacing: 0.5px;">Continuar</a>
          </div>
        </div>
      </div>
    `,
  },
];

// ==================== TODAS LAS PLANTILLAS ====================

export const allTemplates: EmailTemplate[] = [
  ...welcomeTemplates,
  ...passwordResetTemplates,
  ...campaignTemplates,
];

export function getTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[] {
  return allTemplates.filter((t) => t.category === category);
}

export function getTemplateById(id: string): EmailTemplate | undefined {
  return allTemplates.find((t) => t.id === id);
}
