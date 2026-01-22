import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BulkStockUpdateItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  variantId?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  stock: number;
}

export class BulkStockUpdateDto {
  @ApiProperty({ type: [BulkStockUpdateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkStockUpdateItemDto)
  items: BulkStockUpdateItemDto[];
}
