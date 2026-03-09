import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ContentModule } from '../content/content.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PrismaModule, ContentModule, PaymentsModule],
  controllers: [AdminController],
})
export class AdminModule {}
