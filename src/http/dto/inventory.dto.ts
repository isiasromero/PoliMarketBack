import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsString, IsOptional } from 'class-validator';

/**
 * DTO for stock entry and exit operations.
 *
 * Represents a movement of inventory for a specific product
 * within a warehouse. Used for both stock entries (incoming)
 * and stock exits (outgoing).
 */
export class StockMovementDto {
  /** Product ID for the stock movement. */
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNumber()
  productId!: number;

  /** Warehouse ID where the movement occurs. */
  @ApiProperty({ description: 'Warehouse ID', example: 1 })
  @IsNumber()
  warehouseId!: number;

  /** Quantity to move. Must be at least 1. */
  @ApiProperty({ description: 'Quantity to move', example: 10 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

/**
 * DTO for creating a new product with initial stock.
 */
export class CreateProductDto {
  /** Product name. */
  @ApiProperty({ description: 'Product name', example: 'Laptop Dell' })
  @IsString()
  name!: string;

  /** Product description (optional). */
  @ApiProperty({
    description: 'Product description',
    example: 'High-performance laptop',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  /** Unit price of the product. */
  @ApiProperty({ description: 'Unit price', example: 1500 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  /** Product category (optional). */
  @ApiProperty({
    description: 'Product category',
    example: 'Electronics',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  /** Primary supplier ID (optional). */
  @ApiProperty({
    description: 'Primary supplier ID',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  primarySupplierId?: number;

  /** Warehouse ID for initial stock. */
  @ApiProperty({ description: 'Warehouse ID', example: 1 })
  @IsNumber()
  warehouseId!: number;

  /** Initial quantity in stock. */
  @ApiProperty({ description: 'Initial quantity', example: 50 })
  @IsNumber()
  @Min(0)
  initialQuantity!: number;

  /** Minimum stock threshold. */
  @ApiProperty({ description: 'Minimum stock threshold', example: 10 })
  @IsNumber()
  @Min(1)
  minimumStock!: number;
}

/**
 * DTO for updating an existing product.
 */
export class UpdateProductDto {
  /** Product name (optional). */
  @ApiProperty({
    description: 'Product name',
    example: 'Laptop Dell XPS',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  /** Product description (optional). */
  @ApiProperty({
    description: 'Product description',
    example: 'Updated laptop description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  /** Unit price of the product (optional). */
  @ApiProperty({
    description: 'Unit price',
    example: 1800,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;

  /** Product category (optional). */
  @ApiProperty({
    description: 'Product category',
    example: 'Electronics',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  /** Primary supplier ID (optional). */
  @ApiProperty({
    description: 'Primary supplier ID',
    example: 2,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  primarySupplierId?: number;
}
