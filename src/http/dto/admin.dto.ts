import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for authorizing a seller to access a specific system.
 *
 * Used by the admin controller when an HR employee grants
 * a seller permission to operate within a target system
 * (e.g. "VENTAS", "INVENTARIO").
 */
export class AuthorizeSellerDto {
  /** ID of the seller to authorize. */
  @ApiProperty({ description: 'ID of the seller to authorize', example: 1 })
  @IsNumber()
  sellerId!: number;

  /** ID of the HR employee granting authorization. */
  @ApiProperty({ description: 'ID of the HR employee granting authorization', example: 1 })
  @IsNumber()
  employeeId!: number;

  /** Target system to grant access to (e.g. "VENTAS"). */
  @ApiProperty({ description: 'Target system to grant access to', example: 'VENTAS' })
  @IsString()
  @IsNotEmpty()
  system!: string;
}

/**
 * DTO for validating whether a seller has access to a given system.
 *
 * Used as query parameters when checking seller authorization status.
 */
export class ValidateAccessQueryDto {
  /** ID of the seller whose access is being validated. */
  @ApiProperty({ description: 'ID of the seller', example: 1 })
  @IsNumber()
  sellerId!: number;

  /** Target system to check access for. */
  @ApiProperty({ description: 'Target system', example: 'VENTAS' })
  @IsString()
  system!: string;
}
