import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsIn, Min } from 'class-validator';

export class TransportRuleDto {
  @ApiProperty({ description: 'Cantidad mínima de productos (unidades) para aplicar la regla' })
  @IsInt()
  @Min(1)
  minProducts: number;

  @ApiProperty({ enum: ['percent', 'fixed'], description: 'percent = descuento en %, fixed = monto fijo a restar' })
  @IsIn(['percent', 'fixed'])
  discountType: 'percent' | 'fixed';

  @ApiProperty({ description: 'Si percent: 0-100. Si fixed: monto en la misma moneda que baseCost' })
  @IsNumber()
  @Min(0)
  discountValue: number;
}
