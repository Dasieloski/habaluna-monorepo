import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum NewsletterSubscriberStatusDto {
  SUBSCRIBED = 'SUBSCRIBED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
}

export class UpdateSubscriberDto {
  @ApiPropertyOptional({ enum: NewsletterSubscriberStatusDto })
  @IsOptional()
  @IsEnum(NewsletterSubscriberStatusDto)
  status?: NewsletterSubscriberStatusDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  lastName?: string;
}
