import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, ValidateNested, IsNotEmpty, Min, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for a single sale detail line item.
 *
 * Represents one product entry within a sale, including its
 * identifier, quantity, and unit price.
 */
export class SaleDetailItemDto {
  /** Product ID for this line item. */
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNumber()
  productId!: number;

  /** Quantity to sell. Must be at least 1. */
  @ApiProperty({ description: 'Quantity to sell', example: 2 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  /** Unit price for the product. Must be non-negative. */
  @ApiProperty({ description: 'Unit price', example: 1200000 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

/**
 * DTO for registering a new sale.
 *
 * Contains the seller and client identifiers along with an array
 * of detail line items describing the products being sold.
 */
export class RegisterSaleDto {
  /** ID of the seller performing the sale. */
  @ApiProperty({ description: 'ID of the seller', example: 1 })
  @IsNumber()
  sellerId!: number;

  /** ID of the client purchasing the products. */
  @ApiProperty({ description: 'ID of the client', example: 1 })
  @IsNumber()
  clientId!: number;

  /** Sale detail line items. Must contain at least one item. */
  @ApiProperty({ description: 'Sale detail line items', type: [SaleDetailItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleDetailItemDto)
  details!: SaleDetailItemDto[];
}

/**
 * DTO for stock verification queries.
 *
 * Used as query parameters to check whether a given quantity
 * of a product is available in stock before completing a sale.
 */
export class VerifyStockQueryDto {
  /** Product ID to verify stock for. */
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNumber()
  productId!: number;

  /** Required quantity. Must be at least 1. */
  @ApiProperty({ description: 'Required quantity', example: 5 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

/**
 * DTO for creating a new client.
 *
 * Contains the required information to register a new customer
 * in the PoliMarket system.
 */
export class CreateClientDto {
  /** Client's full name */
  @ApiProperty({ description: 'Client full name', example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  /** Client's phone number */
  @ApiProperty({ description: 'Client phone number', example: '+57 311 234 5678' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  /** Client's physical address */
  @ApiProperty({ description: 'Client address', example: 'Calle 45 #12-30, Bogotá' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  /** Client's identification (cédula, NIT, pasaporte, etc.) */
  @ApiProperty({ description: 'Client identification number', example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  identification!: string;
}

/**
 * DTO for updating an existing client.
 *
 * All fields are optional to allow partial updates.
 */
export class UpdateClientDto {
  /** Client's full name (optional) */
  @ApiProperty({ description: 'Client full name', example: 'Juan Pérez', required: false })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name?: string;

  /** Client's phone number (optional) */
  @ApiProperty({ description: 'Client phone number', example: '+57 311 234 5678', required: false })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsNotEmpty({ message: 'El teléfono no puede estar vacío' })
  phone?: string;

  /** Client's physical address (optional) */
  @ApiProperty({ description: 'Client address', example: 'Calle 45 #12-30, Bogotá', required: false })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser un texto' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  address?: string;

  /** Client's identification (optional) */
  @ApiProperty({ description: 'Client identification number', example: '1234567890', required: false })
  @IsOptional()
  @IsString({ message: 'La identificación debe ser un texto' })
  @IsNotEmpty({ message: 'La identificación no puede estar vacía' })
  identification?: string;
}
