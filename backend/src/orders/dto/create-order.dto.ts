import { IsObject, IsOptional, IsString, IsNotEmpty, MinLength, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  address: string;

  @ApiProperty({ description: 'Municipio o distrito' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  municipality: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({ required: false, description: 'Código postal (opcional, no siempre usado en Cuba)' })
  @IsOptional()
  @IsString()
  @MinLength(0)
  @MaxLength(10)
  zipCode?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  country: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone?: string;
}

export class CreateOrderDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress?: AddressDto;
  /**
   * Campo legado. La confirmación real del pago debe hacerse vía webhooks
   * de la pasarela, no desde el frontend.
   */
  @ApiProperty({ required: false, description: 'Solo para compatibilidad; no usar para confirmar pagos' })
  @IsOptional()
  @IsString()
  paymentIntentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, description: 'ID del cupón/offer aplicado' })
  @IsOptional()
  @IsString()
  offerId?: string;

  @ApiProperty({
    required: false,
    description: 'Código de cupón usado por el cliente. Se valida siempre en backend.',
  })
  @IsOptional()
  @IsString()
  offerCode?: string;
}
