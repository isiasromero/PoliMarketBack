import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, ValidateNested, Min, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for a single line item within a purchase order.
 *
 * Represents one product entry including its identifier,
 * quantity to order, and the agreed unit price.
 */
export class PurchaseOrderDetailItemDto {
  /** Product ID for this line item. */
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNumber()
  productId!: number;

  /** Quantity to order. Must be at least 1. */
  @ApiProperty({ description: 'Quantity to order', example: 50 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  /** Unit price for the product. Must be non-negative. */
  @ApiProperty({ description: 'Unit price', example: 25000 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

/**
 * DTO for creating a new purchase order.
 *
 * Contains the supplier identifier along with an array of
 * detail line items describing the products being ordered.
 */
export class CreatePurchaseOrderDto {
  /** ID of the supplier for this purchase order. */
  @ApiProperty({ description: 'Supplier ID', example: 1 })
  @IsNumber()
  supplierId!: number;

  /** Purchase order detail line items. Must contain at least one item. */
  @ApiProperty({
    description: 'Purchase order detail line items',
    type: [PurchaseOrderDetailItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderDetailItemDto)
  details!: PurchaseOrderDetailItemDto[];
}

/**
 * DTO for creating a new supplier.
 *
 * Contains basic identification and contact information for a supplier.
 */
export class CreateSupplierDto {
  /** Supplier name or business name. */
  @ApiProperty({ description: 'Supplier name', example: 'Tech Electronics Inc.' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  /** Contact person or email address. */
  @ApiProperty({ description: 'Contact person', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  contact!: string;

  /** Contact phone number. */
  @ApiProperty({ description: 'Phone number', example: '+57 320 1234567' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  /** Optional email address. */
  @ApiProperty({ description: 'Email address', example: 'contact@techelectronics.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  /** Optional physical address. */
  @ApiProperty({ description: 'Physical address', example: 'Calle 10 #5-50', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}

/**
 * DTO for updating an existing supplier.
 *
 * All fields are optional, allowing partial updates of supplier information.
 */
export class UpdateSupplierDto {
  /** Supplier name or business name. Optional for partial updates. */
  @ApiProperty({ description: 'Supplier name', example: 'Tech Electronics Inc.', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  /** Contact person or email address. Optional for partial updates. */
  @ApiProperty({ description: 'Contact person', example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  contact?: string;

  /** Contact phone number. Optional for partial updates. */
  @ApiProperty({ description: 'Phone number', example: '+57 320 1234567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  /** Optional email address. */
  @ApiProperty({ description: 'Email address', example: 'contact@techelectronics.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  /** Optional physical address. */
  @ApiProperty({ description: 'Physical address', example: 'Calle 10 #5-50', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}
