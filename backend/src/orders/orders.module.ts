import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartModule } from '../cart/cart.module';
import { EmailModule } from '../common/email/email.module';
import { OffersModule } from '../offers/offers.module';

@Module({
  imports: [CartModule, OffersModule, EmailModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
