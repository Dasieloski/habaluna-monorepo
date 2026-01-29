import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [PrismaModule, ContentModule],
  controllers: [AdminController],
})
export class AdminModule {}
