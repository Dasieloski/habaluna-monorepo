import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariantsController } from './product-variants.controller';
import { SearchModule } from '../search/search.module';
import { ProductsSchedulerService } from './products-scheduler.service';
import { EmailModule } from '../common/email/email.module';
import { CacheModule } from '../common/cache/cache.module';

@Module({
  imports: [SearchModule, CacheModule, EmailModule],
  controllers: [ProductsController, ProductVariantsController],
  providers: [ProductsService, ProductVariantsService, ProductsSchedulerService],
  exports: [ProductsService, ProductVariantsService],
})
export class ProductsModule {}
