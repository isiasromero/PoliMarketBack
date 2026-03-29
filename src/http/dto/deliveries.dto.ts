import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for a single item within a delivery.
 *
 * Represents one product entry including its identifier
 * and the quantity to be delivered.
 */
export class DeliveryItemDto {
  /** Product ID for this delivery item. */
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNumber()
  productId!: number;

  /** Quantity to deliver. Must be at least 1. */
  @ApiProperty({ description: 'Quantity to deliver', example: 3 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

/**
 * DTO for generating a new delivery.
 *
 * Contains the originating sale ID, the destination address,
 * and an array of items to be delivered.
 */
export class GenerateDeliveryDto {
  /** ID of the sale this delivery originates from. */
  @ApiProperty({ description: 'Sale ID this delivery originates from', example: 1 })
  @IsNumber()
  saleId!: number;

  /** Destination address for the delivery. */
  @ApiProperty({ description: 'Destination address', example: 'Calle 100 #15-20, Bogota' })
  @IsString()
  @IsNotEmpty()
  destinationAddress!: string;

  /** Items to be delivered. Must contain at least one item. */
  @ApiProperty({ description: 'Items to deliver', type: [DeliveryItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryItemDto)
  items!: DeliveryItemDto[];
}
