import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/email/email.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { NewsletterSubscriberStatusDto, UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class EmailMarketingService {
  private readonly logger = new Logger(EmailMarketingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  private normalizeEmail(raw: string) {
    return (raw || '').trim().toLowerCase();
  }

  private renderWithVars(html: string, vars: Record<string, string>) {
    let out = html || '';
    for (const [k, v] of Object.entries(vars)) {
      // soporta {{firstName}} y {{ firstName }}
      const r = new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g');
      out = out.replace(r, v);
    }
    return out;
  }

  async listSubscribers(params: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit || 20)));
    const skip = (page - 1) * limit;
    const search = (params.search || '').trim();

    const where: any = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.newsletterSubscriber.count({ where }),
      this.prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async upsertSubscriber(dto: CreateSubscriberDto, source: string = 'ADMIN') {
    const email = this.normalizeEmail(dto.email);
    if (!email) throw new BadRequestException('Email requerido');

    return this.prisma.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
        firstName: dto.firstName?.trim() || null,
        lastName: dto.lastName?.trim() || null,
        status: 'SUBSCRIBED',
        source,
        subscribedAt: new Date(),
      },
      update: {
        firstName: dto.firstName?.trim() || undefined,
        lastName: dto.lastName?.trim() || undefined,
        status: 'SUBSCRIBED',
        unsubscribedAt: null,
      },
    });
  }

  async updateSubscriber(id: string, dto: UpdateSubscriberDto) {
    const status =
      dto.status === NewsletterSubscriberStatusDto.SUBSCRIBED
        ? 'SUBSCRIBED'
        : dto.status === NewsletterSubscriberStatusDto.UNSUBSCRIBED
          ? 'UNSUBSCRIBED'
          : undefined;

    return this.prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined ? { firstName: dto.firstName?.trim() || null } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName?.trim() || null } : {}),
        ...(status
          ? {
              status,
              unsubscribedAt: status === 'UNSUBSCRIBED' ? new Date() : null,
            }
          : {}),
      },
    });
  }

  async unsubscribe(email: string, token: string) {
    const normalized = this.normalizeEmail(email);
    if (!normalized) throw new BadRequestException('Email inválido');
    const expected = this.email.signEmailToken(normalized);
    if (!token || token !== expected) {
      throw new BadRequestException('Token inválido');
    }

    await this.prisma.newsletterSubscriber.updateMany({
      where: { email: normalized },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      },
    });

    return { ok: true };
  }

  async listCampaigns(params: { page?: number; limit?: number }) {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit || 20)));
    const skip = (page - 1) * limit;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.emailCampaign.count(),
      this.prisma.emailCampaign.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async createCampaign(dto: CreateCampaignDto) {
    const subject = (dto.subject || '').trim();
    if (!subject) throw new BadRequestException('Subject requerido');
    const html = (dto.html || '').trim();
    if (!html) throw new BadRequestException('HTML requerido');

    return this.prisma.emailCampaign.create({
      data: {
        name: dto.name?.trim() || null,
        subject,
        preheader: dto.preheader?.trim() || null,
        html,
        text: dto.text?.trim() || null,
        status: 'DRAFT',
      },
    });
  }

  async getCampaign(id: string) {
    return this.prisma.emailCampaign.findUniqueOrThrow({ where: { id } });
  }

  async updateCampaign(id: string, dto: UpdateCampaignDto) {
    return this.prisma.emailCampaign.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name?.trim() || null } : {}),
        ...(dto.subject !== undefined ? { subject: dto.subject?.trim() || '' } : {}),
        ...(dto.preheader !== undefined ? { preheader: dto.preheader?.trim() || null } : {}),
        ...(dto.html !== undefined ? { html: dto.html } : {}),
        ...(dto.text !== undefined ? { text: dto.text?.trim() || null } : {}),
      },
    });
  }

  renderCampaignHtmlForRecipient(params: {
    campaign: { subject: string; preheader?: string | null; html: string };
    recipient: { email: string; firstName?: string | null; lastName?: string | null };
  }) {
    const firstName = params.recipient.firstName?.trim() || 'Hola';
    const vars = {
      firstName,
      email: params.recipient.email,
    };

    const body = this.renderWithVars(params.campaign.html, vars);
    const wrapped = this.email.wrapTemplate({
      title: params.campaign.subject,
      preheader: params.campaign.preheader || undefined,
      greeting: `¡Hola ${firstName}!`,
      content: body,
      buttonText: undefined,
      buttonUrl: undefined,
      toEmail: params.recipient.email,
    });

    return wrapped as string;
  }

  async sendTest(campaignId: string, to: string) {
    const campaign = await this.getCampaign(campaignId);
    const email = this.normalizeEmail(to);
    if (!email) throw new BadRequestException('Email inválido');

    const html = this.renderCampaignHtmlForRecipient({
      campaign,
      recipient: { email, firstName: 'Test' },
    });

    const subject = `[TEST] ${campaign.subject}`;
    const text = campaign.text || 'Email de prueba';
    await this.email.sendRaw({ to: email, subject, text, html });
    return { ok: true };
  }

  /**
   * Envía campaña a todos los suscriptores SUBSCRIBED.
   * Se dispara en background y retorna rápido (ideal para no bloquear el panel).
   */
  async startSendCampaign(campaignId: string) {
    const campaign = await this.getCampaign(campaignId);
    if (campaign.status === 'SENT') {
      throw new BadRequestException('La campaña ya fue enviada.');
    }

    await this.prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING' },
    });

    // Background (best-effort)
    setTimeout(() => {
      void this.sendCampaignJob(campaignId).catch((e) => {
        this.logger.error('sendCampaignJob failed', e instanceof Error ? e.stack : String(e));
      });
    }, 0);

    return { started: true };
  }

  private async sendCampaignJob(campaignId: string) {
    const campaign = await this.getCampaign(campaignId);
    const subscribers = await this.prisma.newsletterSubscriber.findMany({
      where: { status: 'SUBSCRIBED' },
      orderBy: { subscribedAt: 'desc' },
    });

    let sent = 0;
    let failed = 0;

    for (const s of subscribers) {
      const html = this.renderCampaignHtmlForRecipient({
        campaign,
        recipient: { email: s.email, firstName: s.firstName, lastName: s.lastName },
      });

      try {
        await this.email.sendRaw({
          to: s.email,
          subject: campaign.subject,
          text: campaign.text || undefined,
          html,
        });

        await this.prisma.emailCampaignSend.create({
          data: {
            campaignId,
            subscriberId: s.id,
            email: s.email,
            status: 'SENT',
          },
        });
        sent++;
      } catch (e: any) {
        failed++;
        await this.prisma.emailCampaignSend.create({
          data: {
            campaignId,
            subscriberId: s.id,
            email: s.email,
            status: 'FAILED',
            error: e?.message ? String(e.message) : String(e),
          },
        });
      }
    }

    await this.prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    this.logger.log(`Campaign ${campaignId} done. sent=${sent} failed=${failed}`);
  }
}

