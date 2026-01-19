import { Module } from '@nestjs/common';
import { TransportConfigController } from './transport-config.controller';
import { TransportConfigService } from './transport-config.service';

@Module({
  controllers: [TransportConfigController],
  providers: [TransportConfigService],
  exports: [TransportConfigService],
})
export class TransportConfigModule {}
