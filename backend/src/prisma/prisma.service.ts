import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Temporary extension for missing models
declare module '@prisma/client' {
  interface PrismaClient {
    returnRequest: any
    refund: any
    systemAlert: any
    contentBlock: any
    media: any
    auditLog: any
    wishlistItem: any
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
