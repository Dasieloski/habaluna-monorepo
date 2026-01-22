import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ORDER_STUCK = 'ORDER_STUCK',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

export class CreateAlertDto {
  @ApiProperty({ enum: AlertType })
  @IsEnum(AlertType)
  type: AlertType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  details?: any;
}
