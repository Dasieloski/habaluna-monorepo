import { Module } from '@nestjs/common';
import { EmailMarketingController } from './email-marketing.controller';
import { EmailMarketingService } from './email-marketing.service';
import { EmailModule } from '../common/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [EmailMarketingController],
  providers: [EmailMarketingService],
})
export class EmailMarketingModule {}
