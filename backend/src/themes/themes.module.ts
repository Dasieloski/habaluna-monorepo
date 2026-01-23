import { Module } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { ThemesController } from './themes.controller';
import { ThemesPublicController } from './themes-public.controller';

@Module({
  controllers: [ThemesController, ThemesPublicController],
  providers: [ThemesService],
  exports: [ThemesService],
})
export class ThemesModule {}