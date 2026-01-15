import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCampaignDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  subject!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  preheader?: string;

  @ApiProperty()
  @IsString()
  html!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  text?: string;
}

