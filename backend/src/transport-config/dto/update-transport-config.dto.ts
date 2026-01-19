import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsBoolean, IsArray, IsOptional, IsString, Min, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransportRuleDto } from './transport-rule.dto';

export class UpdateTransportConfigDto {
  @ApiPropertyOptional({ description: 'Costo base del transporte' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseCost?: number;

  @ApiPropertyOptional({ description: 'Activar o desactivar los descuentos por cantidad' })
  @IsOptional()
  @IsBoolean()
  discountsEnabled?: boolean;

  @ApiPropertyOptional({
    type: [TransportRuleDto],
    description: 'Reglas: a partir de X productos → descuento Y% o monto fijo. Orden ascendente por minProducts.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransportRuleDto)
  rules?: TransportRuleDto[];

  @ApiPropertyOptional({
    description: 'Mensaje cuando no hay descuento. Ej: "Transporte calculado al costo justo"',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  noDiscountMessage?: string;
}
