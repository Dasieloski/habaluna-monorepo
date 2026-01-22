import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RefundMethod {
  BALANCE = 'balance',
  ORIGINAL_PAYMENT = 'original_payment',
  CASH = 'cash',
}

export class ProcessRefundDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: RefundMethod })
  @IsEnum(RefundMethod)
  method: RefundMethod;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
