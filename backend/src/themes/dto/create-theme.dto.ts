import { IsEnum, IsOptional, IsString, IsDateString, IsBoolean, IsNumber, IsObject } from 'class-validator';
import { ThemeType, ThemeStatus } from '@prisma/client';

export class CreateThemeDto {
  @IsEnum(ThemeType)
  type: ThemeType;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ThemeStatus)
  status?: ThemeStatus;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsNumber()
  priority?: number;
}